import json
import pytest
from datetime import datetime, timezone

FUTURE = int(datetime(2026, 10, 22, 12, tzinfo=timezone.utc).timestamp())
MANDATE = "Produce a research report containing three cited public sources. Do not purchase data, remove citations, or delegate outside this research-only mandate."
DELIVERY = "Completed the requested research report with three public citations and the original scope preserved."


@pytest.fixture
def ctx(direct_deploy, direct_vm, direct_alice, direct_bob, direct_charlie):
    direct_vm.warp("2026-10-15T12:00:00Z")
    return direct_deploy("contracts/Chamber.py"), direct_vm, direct_alice, direct_bob, direct_charlie


def send(vm, account, method, *args, value=0):
    vm.sender = account
    vm.value = value
    try:
        return method(*args)
    finally:
        vm.value = 0


def create(ctx, case_id="CH-001", escrow=1001, bond=100):
    c, vm, owner, lead, child = ctx
    send(vm, owner, c.create_agreement, case_id, "Research mandate", MANDATE, lead, "Research agent", bond, FUTURE, value=escrow)
    return c


def active(ctx, delegated=False, case_id="CH-001"):
    c = create(ctx, case_id)
    _, vm, owner, lead, child = ctx
    send(vm, lead, c.accept_delegation, case_id, "1", value=100)
    if delegated:
        send(vm, lead, c.delegate, case_id, "1", child, "Citation agent", "Verify the three public citations and retain each source attribution.", 401)
        send(vm, child, c.accept_delegation, case_id, "2", value=100)
    return c


def disputed(ctx, delegated=False):
    c = active(ctx, delegated)
    _, vm, owner, lead, child = ctx
    send(vm, lead, c.submit_delivery, "CH-001", DELIVERY)
    send(vm, owner, c.open_dispute, "CH-001", "The recorded delivery omits required source citations and the mandate was materially breached.", "FAILED", value=100)
    return c


def judge(ctx, outcome="FAILED", liable=None):
    c, vm, owner, lead, child = ctx
    vm.warp("2026-10-17T12:00:00Z")
    vm.clear_mocks()
    vm.mock_llm("CHAMBER's independent", json.dumps({"outcome": outcome, "liable_nodes": liable or [], "reason": "Exhibit 1 and the accepted scope establish the recorded result."}))
    send(vm, owner, c.adjudicate, "CH-001")


def account(c, address):
    return int(c.get_account(address)["claimable"])


def conservation(c):
    totals = c.get_court()
    assert int(totals["deposited"]) == int(totals["locked"]) + int(totals["claimable"]) + int(totals["withdrawn"])


def test_starts_empty(ctx):
    c = ctx[0]
    assert json.loads(c.list_cases(0, 20)) == []
    conservation(c)


def test_funding_and_exact_bond_authorization(ctx):
    c = create(ctx)
    _, vm, owner, lead, child = ctx
    with vm.expect_revert("invited agent"):
        send(vm, child, c.accept_delegation, "CH-001", "1", value=100)
    with vm.expect_revert("exact required"):
        send(vm, lead, c.accept_delegation, "CH-001", "1", value=99)
    assert c.get_court()["locked"] == "1001"
    conservation(c)


def test_reward_reallocation_cannot_overpromise(ctx):
    c = active(ctx)
    _, vm, owner, lead, child = ctx
    with vm.expect_revert("unallocated"):
        send(vm, lead, c.delegate, "CH-001", "1", child, "Citation agent", "Verify the three public citations and retain each source attribution.", 1002)
    send(vm, lead, c.delegate, "CH-001", "1", child, "Citation agent", "Verify the three public citations and retain each source attribution.", 401)
    nodes = json.loads(c.get_case("CH-001"))["nodes"]
    assert [int(n["reward"]) for n in nodes] == [600, 401]
    with vm.expect_revert("distinct"):
        send(vm, lead, c.delegate, "CH-001", "1", owner, "Owner agent", MANDATE, 1)
    conservation(c)


def test_cancel_invitation_restores_reward_once(ctx):
    c = active(ctx)
    _, vm, owner, lead, child = ctx
    send(vm, lead, c.delegate, "CH-001", "1", child, "Citation agent", MANDATE, 401)
    send(vm, child, c.cancel_invitation, "CH-001", "2")
    nodes = json.loads(c.get_case("CH-001"))["nodes"]
    assert nodes[0]["reward"] == "1001" and nodes[1]["reward"] == "0"
    with vm.expect_revert("pending child"):
        send(vm, child, c.cancel_invitation, "CH-001", "2")


def test_normal_delivery_pays_all_accepted_shares_and_bonds(ctx):
    c = active(ctx, True)
    _, vm, owner, lead, child = ctx
    send(vm, lead, c.submit_delivery, "CH-001", DELIVERY)
    send(vm, owner, c.accept_delivery, "CH-001")
    assert account(c, lead) == 700
    assert account(c, child) == 501
    assert account(c, owner) == 0
    with vm.expect_revert("Only the owner"):
        send(vm, owner, c.accept_delivery, "CH-001")
    assert c.get_court()["locked"] == "0"
    conservation(c)


def test_accepted_work_cannot_be_cancelled_or_disputed_early(ctx):
    c = active(ctx)
    _, vm, owner, lead, child = ctx
    with vm.expect_revert("unaccepted"):
        send(vm, owner, c.cancel_unaccepted, "CH-001")
    with vm.expect_revert("Wait for delivery"):
        send(vm, owner, c.open_dispute, "CH-001", MANDATE, "FAILED", value=100)
    conservation(c)


def test_pending_child_auto_cancelled_at_delivery(ctx):
    c = active(ctx)
    _, vm, owner, lead, child = ctx
    send(vm, lead, c.delegate, "CH-001", "1", child, "Citation agent", MANDATE, 401)
    send(vm, lead, c.submit_delivery, "CH-001", DELIVERY)
    case = json.loads(c.get_case("CH-001"))
    assert case["nodes"][0]["reward"] == "1001"
    assert case["nodes"][1]["state"] == "CANCELLED"


def test_no_judgment_or_uncontested_settlement_before_windows(ctx):
    c = disputed(ctx)
    _, vm, owner, lead, child = ctx
    with vm.expect_revert("full response"):
        send(vm, owner, c.adjudicate, "CH-001")
    with vm.expect_revert("review window"):
        send(vm, owner, c.settle_uncontested, "CH-001")


def test_unanimous_readiness_is_required_and_new_evidence_resets_it(ctx):
    c = disputed(ctx)
    _, vm, owner, lead, child = ctx
    send(vm, owner, c.mark_ready, "CH-001")
    send(vm, lead, c.record_evidence, "CH-001", "1", "Action receipt", "The signed action receipt records the submitted delivery and its sources.", "")
    assert json.loads(c.get_case("CH-001"))["dispute"]["waivers"] == []
    send(vm, owner, c.mark_ready, "CH-001")
    send(vm, lead, c.mark_ready, "CH-001")
    vm.mock_llm("CHAMBER's independent", '{"outcome":"MET","liable_nodes":[],"reason":"The recorded delivery meets the accepted mandate."}')
    send(vm, owner, c.adjudicate, "CH-001")
    assert json.loads(c.get_case("CH-001"))["ruling"]["outcome"] == "MET"


def test_failed_ruling_slashes_only_liable_agent_and_returns_owner_escrow(ctx):
    c = disputed(ctx, True)
    _, vm, owner, lead, child = ctx
    judge(ctx, "FAILED", ["2"])
    with vm.expect_revert("appeal window"):
        send(vm, owner, c.finalize, "CH-001")
    vm.warp("2026-10-19T12:00:00Z")
    send(vm, child, c.finalize, "CH-001")
    assert account(c, owner) == 1201
    assert account(c, lead) == 100
    assert account(c, child) == 0
    assert c.get_account(child)["adverse_findings"] == "1"
    assert c.get_account(lead)["adverse_findings"] == "0"
    conservation(c)


def test_partial_rounding_is_conservative(ctx):
    c = disputed(ctx, True)
    _, vm, owner, lead, child = ctx
    judge(ctx, "PARTIAL")
    vm.warp("2026-10-19T12:00:00Z")
    send(vm, owner, c.finalize, "CH-001")
    assert account(c, lead) == 500  # 300 reward + 100 bond + rejected claim bond
    assert account(c, child) == 300
    assert account(c, owner) == 501
    conservation(c)


def test_validator_independently_rejects_different_liability(ctx):
    c = disputed(ctx, True)
    _, vm, owner, lead, child = ctx
    judge(ctx, "FAILED", ["2"])
    assert vm.run_validator() is True
    vm.clear_mocks()
    vm.mock_llm("CHAMBER's independent", '{"outcome":"FAILED","liable_nodes":["1"],"reason":"The independent validator attributes responsibility to a different agent."}')
    assert vm.run_validator() is False


def test_malformed_model_output_does_not_create_a_financial_ruling(ctx):
    c = disputed(ctx)
    _, vm, owner, lead, child = ctx
    vm.warp("2026-10-17T12:00:00Z")
    vm.mock_llm("CHAMBER's independent", '{"outcome":"FAILED","liable_nodes":["999"],"reason":"Unsupported agent ID must not receive a judgment."}')
    with vm.expect_revert("Invalid structured judgment"):
        send(vm, owner, c.adjudicate, "CH-001")
    assert json.loads(c.get_case("CH-001"))["state"] == "DISPUTED"
    assert c.get_court()["claimable"] == "0"


def test_timed_out_appeal_preserves_original_liability(ctx):
    c = disputed(ctx, True)
    _, vm, owner, lead, child = ctx
    judge(ctx, "FAILED", ["2"])
    send(vm, child, c.appeal_ruling, "CH-001", "The appeal asks the panel to reconsider the recorded evidence and remove the adverse finding.", "MET", value=200)
    vm.warp("2026-10-25T12:00:00Z")
    send(vm, owner, c.recover_stalled, "CH-001")
    case = json.loads(c.get_case("CH-001"))
    assert case["ruling"]["outcome"] == "FAILED"
    assert case["settlement"]["slashed"] == "100"
    assert account(c, child) == 200  # only its unreviewed appeal bond
    assert account(c, owner) == 1201
    conservation(c)


def test_dispute_timeout_returns_bonds_and_neutral_delivered_share(ctx):
    c = disputed(ctx)
    _, vm, owner, lead, child = ctx
    vm.warp("2026-10-24T12:00:00Z")
    send(vm, child, c.recover_stalled, "CH-001")
    assert account(c, owner) == 601
    assert account(c, lead) == 600
    conservation(c)


def test_expiry_refunds_all_deposits_and_has_no_delivery_boundary_overlap(ctx):
    c = active(ctx, True)
    _, vm, owner, lead, child = ctx
    from datetime import datetime, timezone
    vm.warp(datetime.fromtimestamp(FUTURE, timezone.utc).isoformat())
    with vm.expect_revert("Delivery is not available"):
        send(vm, lead, c.submit_delivery, "CH-001", DELIVERY)
    send(vm, child, c.expire_undelivered, "CH-001")
    assert account(c, owner) == 1001 and account(c, lead) == 100 and account(c, child) == 100
    conservation(c)


def test_cross_case_isolation_and_cancel(ctx):
    c = create(ctx)
    _, vm, owner, lead, child = ctx
    create(ctx, "CH-002", escrow=777)
    send(vm, owner, c.cancel_unaccepted, "CH-001")
    assert c.get_court()["locked"] == "777"
    assert account(c, owner) == 1001
    assert json.loads(c.get_case("CH-002"))["state"] == "OFFERED"
    conservation(c)


def test_withdraw_cannot_repeat_and_preserves_accounting(ctx):
    c = create(ctx)
    _, vm, owner, lead, child = ctx
    send(vm, owner, c.cancel_unaccepted, "CH-001")
    send(vm, owner, c.withdraw)
    assert account(c, owner) == 0
    assert c.get_court()["withdrawn"] == "1001"
    with vm.expect_revert("No GEN available"):
        send(vm, owner, c.withdraw)
    conservation(c)


def test_successful_appeal_replaces_liability_and_settles_both_filing_bonds(ctx):
    c = disputed(ctx, True)
    _, vm, owner, lead, child = ctx
    judge(ctx, "FAILED", ["2"])
    send(vm, child, c.appeal_ruling, "CH-001", "The accepted evidence establishes fulfillment and the panel should reconsider both responsibility and settlement.", "MET", value=200)
    vm.warp("2026-10-19T12:00:00Z")
    vm.clear_mocks()
    vm.mock_llm("CHAMBER's independent", '{"outcome":"MET","liable_nodes":[],"reason":"The independently reconsidered record establishes complete fulfillment without a supported breach."}')
    send(vm, owner, c.adjudicate, "CH-001")
    assert json.loads(c.get_case("CH-001"))["ruling"]["basis"] == "GENLAYER_APPEAL"
    with vm.expect_revert("One application appeal"):
        send(vm, owner, c.appeal_ruling, "CH-001", MANDATE, "FAILED", value=200)
    send(vm, owner, c.finalize, "CH-001")
    assert account(c, lead) == 800
    assert account(c, child) == 701
    assert account(c, owner) == 0
    assert c.get_account(child)["adverse_findings"] == "0"
    conservation(c)


def test_unanimously_closed_evidence_cannot_be_changed_and_strangers_cannot_submit(ctx):
    c = disputed(ctx)
    _, vm, owner, lead, child = ctx
    with vm.expect_revert("Only the owner"):
        send(vm, child, c.record_evidence, "CH-001", "1", "Outsider exhibit", MANDATE, "")
    send(vm, owner, c.mark_ready, "CH-001")
    send(vm, lead, c.mark_ready, "CH-001")
    with vm.expect_revert("closed the evidence"):
        send(vm, lead, c.record_evidence, "CH-001", "1", "Late exhibit", MANDATE, "")
    assert json.loads(c.get_case("CH-001"))["evidence"] == []


def test_wallet_withdrawal_uses_external_evm_transfer_not_genvm_message(ctx):
    c = create(ctx)
    _, vm, owner, lead, child = ctx
    send(vm, owner, c.cancel_unaccepted, "CH-001")
    emissions = []
    def capture(_vm, request):
        emissions.append(request)
        return None
    vm._gl_call_hook = capture
    send(vm, owner, c.withdraw)
    transfers = [r["EthSend"] for r in emissions if "EthSend" in r]
    assert len(transfers) == 1
    assert transfers[0]["value"] == 1001
    assert str(transfers[0]["address"]).lower() == c.get_account(owner)["address"]
    assert transfers[0]["calldata"] == b""
    assert not any("PostMessage" in r for r in emissions)

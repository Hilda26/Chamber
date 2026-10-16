# CHAMBER

A GenLayer application for funded agent mandates, bonded delegation, multi-party accountability, and native GEN settlement.

The contract is authoritative. The web app submits signed transactions, reads finalized state, tracks submitted transaction IDs across reloads, and never generates case records or consensus outcomes locally. Operator wallets represent agents; CHAMBER does not claim to independently identify the software behind a wallet or authenticate off-chain assertions.

[Live application](https://chamber-omega.vercel.app) · [Source repository](https://github.com/Hilda26/Chamber) · [Submission details](SUBMISSION.md)


## Release status

The deployed application is a working **StudioNet development release**. StudioNet executes real GenVM contracts and model consensus, but GenLayer classifies it as a temporary hosted development environment. The token amounts and verified withdrawals in this repository are **StudioNet test GEN**, not mainnet funds. The current release is not a persistent Bradbury or mainnet deployment.

Bradbury RPC access was verified at chain ID 4221. Persistent Bradbury deployment requires a funded signing wallet; the public faucet requires a wallet holding 0.01 ETH on mainnet. No qualifying funded signer was available for this run. Keep private keys in your wallet or process secret manager. Browser signing, Bradbury compatibility, transaction fees, and a complete lifecycle must be checked on Bradbury before presenting that network as supported.

Sources: [GenLayer networks](https://docs.genlayer.com/developers/networks), [official faucet](https://testnet-faucet.genlayer.foundation/).

## Run

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:3014`. The deployed address, network, and contract source digest are in `src/lib/deployment.json`. Network: GenLayer StudioNet, chain 61999, native currency GEN with 18 decimals. StudioNet GEN is a test token. Compatible browser wallet and StudioNet funds are required to submit writes.

## Lifecycle

1. The owner funds immutable instructions and appoints a lead operator.
2. The lead accepts by posting the exact required GEN bond.
3. An accepted agent can delegate a portion of its current reward to a distinct wallet. Each invited operator accepts its own scope and posts its own bond. Maximum eight agents. Reward shares cannot exceed the funded escrow.
4. Participants record signed statements and optional HTTPS evidence snapshots. Public sources are hashed at submission. Hashes preserve recorded content, not the truth of asserted external events. Never submit confidential material: the record is public.
5. The lead delivers. The owner may accept immediately; otherwise the delivery has a 48-hour review period. A bonded dispute can be opened after delivery or after the original deadline, never as an early cancellation of accepted work.
6. A hearing allows 24 hours for responses. Every accepted participant and the owner may explicitly sign readiness to proceed earlier. New evidence and responses reset hearing readiness.
7. GenLayer independently evaluates fulfillment and per-agent responsibility. Outcomes are MET, PARTIAL, FAILED, or INCONCLUSIVE; liable agents are identified by accepted node IDs. Validators independently evaluate and compare these exact financial fields. Explanation wording is not used for equivalence. Malformed output fails execution without applying a financial judgment.
8. One application appeal may be filed within 24 hours, with twice the agent bond. This is distinct from GenLayer protocol appeals and transaction finality.
9. Finalization creates withdrawal credits. Each credited wallet withdraws its own GEN through an external EVM message carrying native GEN, executed on finalization.

## Settlement rules

| Accepted outcome | Provider rewards | Owner escrow refund | Agent bonds |
| --- | --- | --- | --- |
| MET | 100% of allocated shares | Rounding remainder | Returned, except supported liable nodes |
| PARTIAL | 50% of each allocated share | Remaining escrow | Returned, except supported liable nodes |
| FAILED | 0% | All escrow | Returned, except supported liable nodes |
| INCONCLUSIVE with delivery | 50% of each share | Remaining escrow | All returned |
| INCONCLUSIVE without delivery | 0% | All escrow | All returned |

Slashed agent bonds are credited to the owner. A dispute or appeal filing bond returns to its filer when the final outcome matches the requested outcome, or the result is inconclusive. Otherwise it goes to the designated counterparty. No additional platform fee is taken in version 1.0.0; wallet network fees are separate.

Before acceptance the owner can cancel and reclaim escrow. After an undelivered mandate's deadline, anyone can expire it, returning escrow and posted bonds. Initial disputes unresolved after seven days use the agreed inconclusive settlement. A timed-out application appeal preserves the original ruling and returns the unreviewed appeal bond. Funds are credited exactly once.

Accounting invariant: `deposited = locked + claimable + withdrawn`.

## Contract and operator integration

`contracts/Chamber.py` exposes the complete app lifecycle. Read methods: `get_court`, `get_case`, `list_cases`, `get_account`. Write methods cover creation, acceptance, delegation, invitation cancellation, evidence, delivery, disputes, responses, readiness, adjudication, application appeals, settlement, expiry, timeout recovery, and withdrawal.

Agents can use `genlayer-js` directly or the included operator CLI:

```powershell
node scripts/operator.mjs read get_case '["CASE-ID"]'
node scripts/operator.mjs read get_court
# Set CHAMBER_OPERATOR_PRIVATE_KEY through your process secret manager before writes.
node scripts/operator.mjs write accept_delegation '["CASE-ID","1"]' 1
```

Encode Address arguments as `{"address":"0x..."}` and integer base-unit arguments as `{"units":"1000000000000000000"}` in the CLI. Do not put keys in command arguments, source, or committed files.

## Verification

Install the development test tools with `python -m pip install -r requirements-dev.txt`.

```powershell
npm run typecheck
npm run build
python -m pytest tests/direct -q
node --test tests/receipts.test.mjs
genvm-lint check contracts/Chamber.py --json
node scripts/verify-live.mjs
node scripts/verify-delivery.mjs
```

Direct tests use the pinned SDK and controlled LLM responses. They explicitly test independent validator agreement and disagreement. They do not prove real token transfers; the live lifecycle script verifies on-chain deposits, delegation, evidence, multi-party responses, real consensus, finalization, withdrawal balance changes, cancellation, and conservation. Its records are genuine integration transactions using fresh faucet-funded test wallets, not user activity.

`scripts/deploy-contract.mjs` deploys to StudioNet only and records a pending transaction before polling, so deployment can resume without sending another deployment. It uses `CHAMBER_DEPLOYER_PRIVATE_KEY` when supplied, or a fresh in-memory faucet-funded StudioNet account. No privileged contract administrator exists. Keys are not persisted. Public deployment and lifecycle evidence is saved under `artifacts/`.

## Architecture

- Python Intelligent Contract: all agreement state, custody, liability evaluation, settlement accounting, and withdrawal.
- Next.js static web app: courtroom workspace, wallet interaction, public records, evidence, hearings, exports, rules, transaction tracking.
- GenLayer SDK: pinned `genlayer-js@1.1.8` and the stable py-genlayer runner used by the prior apps.
- Vercel: production web hosting; GenLayer remains the application state and settlement system.
- No backend database, fabricated ledger, bundled signing key, or central operator with settlement authority.

Source changes require redeploying the contract and updating the checked-in public deployment manifest before publishing the matching frontend.

Latest live consensus verification: **PASSED**, 30 finalized transactions across contested and owner-accepted delivery flows. See [submission details](SUBMISSION.md) and [public receipts](artifacts/live-lifecycle.json). Hosted on Vercel as a static application; all state and GEN custody remain on GenLayer.

If an RPC connection resets after all lifecycle writes completed, `node scripts/verify-live.mjs --complete` resumes only the recorded read-only checks; it does not create a substitute case. Live test commands submit genuine faucet-funded StudioNet transactions and require network access. Vercel deployments use the CLI; continuous repository integration is not enabled.

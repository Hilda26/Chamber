# CHAMBER — submission parameters

| Field | Value |
| --- | --- |
| Project name | CHAMBER |
| Tagline | Accountability for the agent economy. |
| Category | Agent infrastructure · Intelligent Contracts · Dispute resolution |
| Live application | https://chamber-omega.vercel.app |
| Live consensus case | https://chamber-omega.vercel.app/#case=CH-VERIFY-MVAK3DBM |
| Repository | https://github.com/Hilda26/Chamber |
| Network | GenLayer StudioNet, chain ID 61999 |
| Native currency | GEN, 18 decimals; faucet-funded test GEN on StudioNet |
| Intelligent Contract | `0xDacD15170b31c04aC596106937EA7105e0aeBA33` |
| Deployment transaction | `0xe5878871c4486d38aa610f5ec7059b5e1786ec150568f5671e6b6889643c937a` |
| Source SHA-256 | `c44b0bb9d1fad02af235f1d83bb4e4ee44c95b7d6b9bb8cb298b9208b490465d` |
| Stack | Python Intelligent Contract, Next.js, React, TypeScript, genlayer-js, viem, Vercel |

## Short description

CHAMBER gives agent operators a shared accountability layer: funded mandates, bonded delegation, public evidence, GenLayer consensus judgments, and native GEN settlement in a courtroom workspace.

## Full description

When an agent delegates work, responsibility often disappears between the original instruction, delegated scope, and final delivery. CHAMBER records that chain as an enforceable application agreement. An owner funds the mandate in GEN. Each accepting operator bonds its own scope, and each delegation reserves part of the existing reward rather than creating an unfunded promise.

If a delivery is contested, participants submit signed evidence and responses. GenLayer independently evaluates fulfillment and responsibility for individual accepted participants. Its validated judgment selects a finite outcome and the liable delegation nodes. Deterministic contract rules then allocate the escrow, release or slash bonds, and create credits each recipient can withdraw to its own wallet. One bonded application appeal is available before settlement.

The interface exposes the authority chain, exhibits, hearing, settlement calculation, and public activity record. It reads the deployed contract and signs real network transactions. Agent operators can use the same contract through the included CLI or SDK.

## Why GenLayer is essential

Fulfillment depends on natural-language instructions, evidence, and delegated responsibilities. Fixed arithmetic alone cannot decide whether a report meets those instructions or which accepted operator omitted a required contribution. GenLayer performs that contextual evaluation through independent leader and validator execution. Financial equivalence compares the exact outcome and liable node IDs; arithmetic and custody stay deterministic.

## GEN utility

- Owners deposit the actual mandate reward into the contract.
- Each accepted agent posts its own GEN performance bond.
- Dispute and application appeal filings require GEN bonds.
- Accepted judgments drive rewards, refunds, and selective bond slashing.
- Beneficiaries withdraw actual native GEN from contract custody.

Version 1 takes no additional platform fee. StudioNet deployment uses test GEN; it does not represent a mainnet launch.

## Distinctive angle

CHAMBER adjudicates responsibility across a funded delegation chain, including individual scopes and bonds. It links the original mandate, each accepted subcontract, signed evidence, and the financial consequence of a finding in one public record. The court is the workspace for a usable settlement protocol.

## Reviewer walkthrough

1. Open the deployed app and inspect the public docket without a wallet.
2. Open the live verification case to inspect authority, exhibits, hearing, judgment, settlement, and activity.
3. For a new agreement, use separate StudioNet-funded owner and agent wallets. Connect the owner, establish a mandate, then connect the appointed lead and accept with the displayed exact bond.
4. Deliver and accept for a normal completion, or open a bonded dispute and collect participant responses/readiness before requesting adjudication.
5. Finalize after the application appeal conditions are satisfied, then have each credited wallet withdraw.

All evidence is public. Wallet operators identify their own agents; the application does not authenticate off-chain software identity. CHAMBER judgments govern the application escrow, rather than claiming authority as a state court.

## Verification scope

Direct contract tests cover accounting, authorization, timing, delegation, liability, appeals, malformed model responses, and external native transfer emission. Receipt regressions cover consensus and credited EOA transfers. The completed live integration run used three fresh faucet-funded accounts and genuine GenLayer transactions. The public case `CH-VERIFY-MVAK3DBM` settled after a real consensus judgment of FAILED with liable nodes 1 and 2. Both accepted operator bonds were slashed according to the agreed contract rules.

- 21 submitted transactions finalized successfully.
- 0.01 GEN cancellation refund reached the owner wallet.
- 0.013 GEN settlement withdrawal reached the owner wallet (escrow, two slashed bonds, and returned filing bond).
- After the contested-case verification, deposited and withdrawn totals both equalled 0.043 GEN. After the additional normal-completion run, both equal 0.051 GEN; locked funds and available credits are zero.
- 21 direct contract tests and four receipt regression tests passed.
- GenVM contract validation passed: four view methods and 18 write methods.
- Production compilation and TypeScript validation passed.
- A transient RPC connection reset occurred after the last withdrawal. Read-only completion checked every finalized transaction, credit, settlement record, wallet balance evidence, and accounting total. No financial action was substituted or simulated.

Evidence: [`artifacts/live-lifecycle.json`](artifacts/live-lifecycle.json). Browser signing with an injected wallet has not been independently exercised; live writes were signed through the actual SDK with ephemeral integration wallets. Timing and appeals have direct-test coverage. Application appeals and fetched external evidence were not exercised on the live network.


## Additional live normal-completion test

Case: [CH-DELIVERY-MVAKRX74](https://chamber-omega.vercel.app/#case=CH-DELIVERY-MVAKRX74).

Nine further transactions finalized successfully. The owner accepted the recorded delivery; the lead received 0.004 GEN reward plus its 0.001 GEN bond, and the delegated operator received 0.002 GEN reward plus its 0.001 GEN bond. Both native wallet balance increases were verified. The case required no consensus judgment because the owner accepted it directly. Evidence: [`artifacts/live-delivery.json`](artifacts/live-delivery.json).

Combined completed live verification: **30 finalized transactions**, four verified native withdrawals, two settled mandates, and one tested cancellation/refund lifecycle. Historical diagnostic runs are explicitly separated under `artifacts/history/`.

## Hosted verification

The public Vercel production URL returns HTTP 200 without authentication. The downloadable Python source also returns HTTP 200 and matches the deployed source SHA-256. Browser checks verified finalized docket reads, search, authority chains, signed evidence, consensus rationale, settlement accounting, mandate form fields, public JSON record export, protocol rules, and mobile case layout at 390 × 844 with no horizontal overflow. Browser wallet signing remains a separate manual check; all live financial verification used actual SDK-signed transactions.

## Submission copy

**One-sentence pitch:** CHAMBER makes delegated agent work accountable through funded mandates, individual GEN bonds, GenLayer consensus judgments, and verifiable settlement.

**Problem:** Agent work can pass through multiple operators while instructions, responsibility, and payment expectations become disconnected.

**Solution:** Record each accepted delegation and funded reward share, preserve evidence, resolve contested fulfillment through GenLayer, and settle the corresponding GEN escrow and bonds.

**Target users:** Agent operators, teams commissioning multi-agent work, and platforms that need auditable delegation and settlement.

**GenLayer integration:** Python Intelligent Contract deployed on StudioNet; real network execution, independent leader/validator judgment, public contract reads, wallet-signed writes, native GEN custody, and EVM withdrawal messages.

**Current release:** Working StudioNet application using test GEN. No additional platform fee in v1.0.0. No claim of audited mainnet readiness or state-court legal authority.

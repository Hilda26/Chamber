# CHAMBER — submission parameters

| Field | Value |
| --- | --- |
| Project name | CHAMBER |
| Tagline | Accountability for the agent economy. |
| Category | Agent infrastructure · Intelligent Contracts · Dispute resolution |
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

Direct contract tests cover accounting, authorization, timing, delegation, liability, appeals, malformed model responses, and external native transfer emission. Receipt regressions cover consensus and credited EOA transfers. A separate live integration run uses fresh faucet-funded accounts and genuine GenLayer transactions; its final result and hosted checks are recorded below when completed.

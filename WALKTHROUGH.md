# Chamber House walkthrough

Recorded navigation and form entry in the deployed application, with synthetic voice narration. The hearing and settlement use existing live StudioNet integration cases. New wallet transactions are not signed in this recording.

## 00:00:00 - The court and live accounting

Welcome to Chamber House, the court of agent accountability. This is the working app at chamber house dot vercel dot app.

The court opens with a public docket and live contract accounting. You can inspect records before connecting a wallet.

The five matters shown include completed live integration tests. Two mandates settled, and the remaining matters were cancelled. Their GEN deposits, bonds, and withdrawals were actually executed on GenLayer StudioNet.

This walkthrough uses those public records and the real input form. StudioNet uses test GEN. New financial transactions are not signed during this recording.

## 00:00:47 - Establishing a funded mandate

Select Establish a mandate to define a new agreement. Start with a clear matter title and original instructions that state the deliverable and acceptance criteria.

The lead agent name is a label. The lead operator wallet is the separate address that must accept responsibility and post the bond.

Payment escrow funds all reward shares. Bond per accepted agent is a separate amount each accepting operator must deposit. Here, the example values are zero point zero one GEN for escrow and zero point zero zero one GEN for the bond.

Choose a delivery deadline and review the settlement rules. Funding requires your connected owner wallet and its signature. These example fields are inspected without submitting an agreement.

## 00:01:39 - Finding a recorded matter

Close the form to return to the public court. Search matters by case number, title, or participant information.

Enter the verification case number to isolate the contested mandate. The row shows its settled status, funded escrow, and two accepted agents.

Open the matter to enter the case room. The header preserves the original owner, escrow, required agent bond, delivery deadline, and acceptance count.

The five tabs divide the record into authority, exhibits, hearing, settlement, and activity. These views read the deployed contract rather than creating local case data.

## 00:02:22 - Following the delegation chain

Authority connects the original mandate to each accepted scope. The owner appointed the lead verification operator, which delegated citation checking to a second operator.

Select the child agent to read its specific responsibility. Its accepted scope required preserving the explicit documentation URLs in the contribution.

The child received zero point zero zero four GEN from the funded reward. The lead retained zero point zero zero six GEN. Delegation moved an existing share rather than creating extra escrow.

Select the lead again to compare its original obligations with the child scope. Responsibility is assessed against what each operator actually accepted. A wallet identifies the operator, not independently verified software identity.

## 00:03:17 - Inspecting signed evidence

Open Exhibits to inspect the evidence supporting the case. The signed citation handoff is attributed to the child operator and linked to agent two.

The statement explicitly acknowledges that every source URL was omitted. Its author and recording time remain visible, along with a digest for the recorded exhibit.

An eligible participant can also submit an optional public HTTPS source. The contract fetches its content, records a digest, and preserves an excerpt. That fetched-source branch was not exercised in this particular live case.

The record is public. A content digest establishes the recorded material, while the hearing must still evaluate what that material proves.

## 00:04:07 - Reading the GenLayer hearing

Open Hearing to follow the disagreement. The owner requested a failed outcome because the delivery lacked the three required documentation URLs.

The lead and delegated operator each submitted a signed response acknowledging the missing citations. Every accepted participant and the owner then marked readiness to advance.

The GenLayer consensus section contains the real judgment from the completed integration run. It found the mandate not fulfilled and identified agents one and two as liable for their own accepted responsibilities.

The explanation cites the child exhibit and the lead delivery and response. Independent evaluation determines the financial outcome and liable node IDs. Contract rules then calculate the actual amounts.

## 00:04:58 - Tracing the contested settlement

Open Settlement to trace the financial consequence of that judgment. Failed delivery produces zero provider reward and returns the zero point zero one GEN escrow to the owner.

The two supported liability findings slash two agent bonds, each worth zero point zero zero one GEN. That produces an owner escrow refund plus slashes of zero point zero one two GEN.

The separate dispute bond of zero point zero zero one GEN also returned to the owner because the final outcome matched the requested outcome. Total owner withdrawal was zero point zero one three GEN.

The live test verified that native GEN reached the recipient wallet. Settlement creates a credit first; each credited operator withdraws from its own wallet after successful finalization.

## 00:05:53 - Auditing activity and normal completion

Activity lists the recorded proceedings in order, including funding, accepted responsibilities, evidence, responses, the judgment, and settlement.

Return to the docket and open the accepted delivery verification case. This second live test followed normal completion without a contested judgment.

In its settlement, the full zero point zero zero six GEN reward was divided into zero point zero zero four for the lead and zero point zero zero two for the child.

Each operator also recovered its zero point zero zero one GEN performance bond. The verified wallet withdrawals were zero point zero zero five and zero point zero zero three GEN. Owner acceptance produced the fulfilled outcome directly.

## 00:06:44 - Timing, appeals, and recovery rules

The Protocol explains the rules users accept when funding a mandate. There is a forty eight hour delivery review period, a twenty four hour response window, and one application appeal.

An appeal is available for twenty four hours after the first ruling and requires twice the standard agent bond. It is distinct from GenLayer transaction finality.

Unanimous readiness can advance proceedings early. New evidence or responses reset hearing readiness. Stalled initial disputes have a seven day recovery path. An appeal timeout preserves the original ruling and returns the unreviewed appeal bond.

The network panel identifies StudioNet, chain six one nine nine nine, the deployed address, and the downloadable contract source. StudioNet is a development network whose state can be reset.

## 00:07:42 - Using the app and reviewing the proof

The Settlements view brings completed matters together. To act on your own mandate or withdraw a credit, connect the wallet that owns that role.

An owner funds and reviews work. An appointed operator accepts with the exact bond, then carries out its scope. The interface offers actions according to the connected wallet and current case state.

Across the completed live tests, thirty transactions finalized and four native withdrawals were verified. Contract wide deposits and withdrawals both total zero point zero five one GEN, with no remaining locked funds or available credits.

Chamber House is live at chamber house dot vercel dot app. Use the public cases to inspect the evidence and settlement, then use your own StudioNet funded wallets for new work.


import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createAccount} from 'genlayer-js';
import {TransactionStatus,TransactionHashVariant} from 'genlayer-js/types';
import {clientFor,finalized,successful,addressArg,json,read} from './network.mjs';
if(process.argv.includes("--complete")){await import("./complete-verification.mjs");process.exit(0);}
const deployment=JSON.parse(readFileSync('src/lib/deployment.json','utf8'));
assert.match(deployment.address,/^0x[0-9a-fA-F]{40}$/);
const address=deployment.address;
const people=[createAccount(),createAccount(),createAccount()];
const clients=people.map(clientFor);
const steps=[];
const evidence={network:'GenLayer StudioNet',contract:address,sourceSha256:deployment.sourceSha256,accounts:people.map(p=>p.address),steps,status:'RUNNING'};
mkdirSync('artifacts',{recursive:true});
const save=()=>writeFileSync('artifacts/live-lifecycle.json',json(evidence));
// Intermediate writes advance after an actual accepted decision. Monetary
// completion and all final assertions wait for finalization; nothing simulated.
async function tx(who,fn,args=[],value=0n){
  const client=clients[who];
  const hash=await client.writeContract({address,functionName:fn,args,value,consensusMaxRotations:3});
  const item={function:fn,signer:people[who].address,hash,value:value.toString(),status:'SUBMITTED'};
  steps.push(item);save();console.log(fn,hash);
  const mustFinalize=['finalize','withdraw','cancel_unaccepted'].includes(fn);
  const receipt=mustFinalize?await finalized(client,hash):await client.waitForTransactionReceipt({hash,status:TransactionStatus.ACCEPTED,fullTransaction:true,interval:3000,retries:180});
  successful(receipt);item.status=mustFinalize?'FINALIZED':'DECIDED';item.receipt=receipt;save();
  if(mustFinalize){
    item.triggered=[];
    for(const child of await client.getTriggeredTransactionIds({hash})){
      const result=await finalized(client,child);item.triggered.push({hash:child,receipt:result});save();
    }
  }
  return receipt;
}
async function currentCase(caseId){
  const result=await clients[0].readContract({address,functionName:'get_case',args:[caseId],transactionHashVariant:TransactionHashVariant.LATEST_NONFINAL});
  return JSON.parse(result);
}
async function withdrawal(who){
  const credit=await read(clients[who],address,'get_account',[addressArg(people[who].address)]);
  const available=BigInt(credit.claimable);if(!available)return;
  const before=await clients[who].getBalance({address:people[who].address});
  await tx(who,'withdraw');
  const after=await clients[who].getBalance({address:people[who].address});
  assert.equal((await read(clients[who],address,'get_account',[addressArg(people[who].address)])).claimable,'0');
  assert.ok(after>=before+available,'Finalized GEN withdrawal did not reach the recipient wallet');
  steps.push({verification:'native_balance_increase',account:people[who].address,before:before.toString(),after:after.toString(),credit:available.toString()});save();
  console.log('NATIVE_GEN_WITHDRAWAL_VERIFIED',available.toString());
}
for(let i=0;i<3;i++)await clients[i].request({method:'sim_fundAccount',params:[people[i].address,1000000000000000000]});
const stamp=Date.now().toString(36).toUpperCase();
const deadline=BigInt(Math.floor(Date.now()/1000)+7*86400);
const reward=10000000000000000n,bond=1000000000000000n;
const mandate='Produce a concise written report with three explicit public GenLayer documentation URLs. Preserve source attribution in every delegated contribution. Each accepted operator is responsible for the scope it accepts.';
const refundId=`CH-REFUND-${stamp}`;
await tx(0,'create_agreement',[refundId,'Live verification · unaccepted refund',mandate,addressArg(people[1].address),'Verification operator',bond,deadline],reward);
await tx(0,'cancel_unaccepted',[refundId]);
assert.equal((await read(clients[0],address,'get_case',[refundId])).state,'CANCELLED');
await withdrawal(0);
evidence.refundCaseId=refundId;save();
const caseId=`CH-VERIFY-${stamp}`;evidence.caseId=caseId;save();
await tx(0,'create_agreement',[caseId,'Live verification · delegation accountability',mandate,addressArg(people[1].address),'Lead verification operator',bond,deadline],reward);
await tx(1,'accept_delegation',[caseId,'1'],bond);
await tx(1,'delegate',[caseId,'1',addressArg(people[2].address),'Citation verification operator','Check the three public documentation references. Preserve all explicit source URLs in your submitted contribution.',4000000000000000n]);
await tx(2,'accept_delegation',[caseId,'2'],bond);
await tx(2,'record_evidence',[caseId,'2','Signed citation handoff','This is a live integration-verification record. I completed the delegated check but intentionally omitted every source URL from my contribution. This is my signed acknowledgment as the accepted citation operator.','']);
await tx(1,'submit_delivery',[caseId,'The verification report is delivered without the three required source URLs. It contains only the statement that GenLayer uses Intelligent Contracts. I acknowledge that the original required citations are missing.']);
await tx(0,'open_dispute',[caseId,'The mandate explicitly requires three public documentation URLs. The signed child handoff and lead delivery both acknowledge that all citations are missing. Please assess the accepted responsibilities and refund the unfulfilled mandate.','FAILED'],bond);
await tx(1,'submit_response',[caseId,'I acknowledge the delivery does not satisfy the citation requirement of my accepted original mandate. Please adjudicate the submitted verification record.']);
await tx(2,'submit_response',[caseId,'I acknowledge that I omitted the source URLs despite my accepted delegated scope requiring their preservation. Please adjudicate my recorded contribution.']);
for(let i=0;i<3;i++)await tx(i,'mark_ready',[caseId]);
await tx(0,'adjudicate',[caseId]);
const ruled=await currentCase(caseId);
assert.equal(ruled.state,'RULED');assert.equal(ruled.ruling.basis,'GENLAYER_CONSENSUS');
assert.ok(['MET','PARTIAL','FAILED','INCONCLUSIVE'].includes(ruled.ruling.outcome));
evidence.ruling=ruled.ruling;save();
for(let i=0;i<3;i++)await tx(i,'mark_ready',[caseId]);
await tx(0,'finalize',[caseId]);
const closed=await read(clients[0],address,'get_case',[caseId]);
assert.equal(closed.state,'SETTLED');evidence.settlement=closed.settlement;save();
for(let i=0;i<3;i++)await withdrawal(i);
for(const item of steps.filter(s=>s.hash&&s.status!=='FINALIZED')){
  item.receipt=await finalized(clients[0],item.hash);item.status='FINALIZED';save();
}
const court=await read(clients[0],address,'get_court');
assert.equal(BigInt(court.deposited),BigInt(court.locked)+BigInt(court.claimable)+BigInt(court.withdrawn));
assert.equal(court.locked,'0');assert.equal(court.claimable,'0');
evidence.finalCourt=court;evidence.completedAt=new Date().toISOString();evidence.status='PASSED';save();
console.log('LIVE_LIFECYCLE_PASSED',json({contract:address,caseId,ruling:ruled.ruling.outcome,transactions:steps.filter(s=>s.hash).length,court}));

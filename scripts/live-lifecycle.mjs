import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createAccount } from 'genlayer-js';
import { clientFor, finalized, addressArg, json, read } from './network.mjs';
const deployment=JSON.parse(readFileSync('src/lib/deployment.json','utf8'));
assert.match(deployment.address,/^0x[0-9a-fA-F]{40}$/);
const address=deployment.address;
const people=[createAccount(),createAccount(),createAccount()];
const clients=people.map(clientFor);
const steps=[];
const evidence={network:'GenLayer StudioNet',contract:address,accounts:people.map(p=>p.address),steps};
mkdirSync('artifacts',{recursive:true});
function save(){writeFileSync('artifacts/live-lifecycle.json',json(evidence));}
async function tx(who,fn,args=[],value=0n){
  const client=clients[who];
  const hash=await client.writeContract({address,functionName:fn,args,value,consensusMaxRotations:3});
  const item={function:fn,signer:people[who].address,hash,value:value.toString(),status:'SUBMITTED'};steps.push(item);save();
  console.log(fn,hash);
  const receipt=await finalized(client,hash);item.status='FINALIZED';item.receipt=receipt;save();
  const children=await client.getTriggeredTransactionIds({hash});
  item.triggered=[];
  for(const child of children){const result=await finalized(client,child);item.triggered.push({hash:child,receipt:result});save();}
  return receipt;
}
for(let i=0;i<3;i++){
  await clients[i].request({method:'sim_fundAccount',params:[people[i].address,10]});
  const balance=await clients[i].getBalance({address:people[i].address});
  if(balance<100000000000000000n)await clients[i].request({method:'sim_fundAccount',params:[people[i].address,1000000000000000000]});
}
const stamp=Date.now().toString(36).toUpperCase();
const caseId=`CH-VERIFY-${stamp}`;
evidence.caseId=caseId;save();
const deadline=BigInt(Math.floor(Date.now()/1000)+7*86400);
const reward=10000000000000000n;
const bond=1000000000000000n;
const mandate='Produce a concise written report with three explicit public GenLayer documentation URLs. Preserve source attribution in every delegated contribution. Each accepted operator is responsible for the scope it accepts.';
await tx(0,'create_agreement',[caseId,'Live verification · delegation accountability',mandate,addressArg(people[1].address),'Lead verification operator',bond,deadline],reward);
await tx(1,'accept_delegation',[caseId,'1'],bond);
await tx(1,'delegate',[caseId,'1',addressArg(people[2].address),'Citation verification operator','Check the three public documentation references. Preserve all explicit source URLs in your submitted contribution.',4000000000000000n]);
await tx(2,'accept_delegation',[caseId,'2'],bond);
await tx(2,'record_evidence',[caseId,'2','Signed citation handoff','This is a live integration-verification record. I completed the delegated check but intentionally omitted every source URL from my contribution. This statement is my signed acknowledgment as the accepted citation operator.','']);
await tx(1,'submit_delivery',[caseId,'The verification report is delivered without the three required source URLs. It contains only the statement that GenLayer uses Intelligent Contracts. I acknowledge that the original required citations are missing.']);
await tx(0,'open_dispute',[caseId,'The mandate explicitly requires three public documentation URLs. The signed child handoff and lead delivery both acknowledge that all citations are missing. Please assess the accepted responsibilities and refund the unfulfilled mandate.','FAILED'],bond);
await tx(1,'submit_response',[caseId,'I acknowledge the delivery does not satisfy the citation requirement of my accepted original mandate. Please adjudicate the submitted verification record.']);
await tx(2,'submit_response',[caseId,'I acknowledge that I omitted the source URLs despite my accepted delegated scope requiring their preservation. Please adjudicate my recorded contribution.']);
for(let i=0;i<3;i++)await tx(i,'mark_ready',[caseId]);
await tx(0,'adjudicate',[caseId]);
const ruled=await read(clients[0],address,'get_case',[caseId]);
assert.equal(ruled.state,'RULED');assert.equal(ruled.ruling.basis,'GENLAYER_CONSENSUS');
assert.ok(['MET','PARTIAL','FAILED','INCONCLUSIVE'].includes(ruled.ruling.outcome));
evidence.ruling=ruled.ruling;save();
for(let i=0;i<3;i++)await tx(i,'mark_ready',[caseId]);
await tx(0,'finalize',[caseId]);
const closed=await read(clients[0],address,'get_case',[caseId]);
assert.equal(closed.state,'SETTLED');evidence.settlement=closed.settlement;save();
for(let i=0;i<3;i++){
  const credit=await read(clients[i],address,'get_account',[addressArg(people[i].address)]);
  const available=BigInt(credit.claimable);
  if(available===0n)continue;
  const before=await clients[i].getBalance({address:people[i].address});
  await tx(i,'withdraw');
  const after=await clients[i].getBalance({address:people[i].address});
  const remaining=await read(clients[i],address,'get_account',[addressArg(people[i].address)]);
  assert.equal(remaining.claimable,'0');assert.ok(after>=before+available,'Native GEN payout did not reach recipient wallet');
  steps.push({verification:'native_balance_increase',account:people[i].address,before:before.toString(),after:after.toString(),credit:available.toString()});save();
}
const cancelId=`CH-REFUND-${stamp}`;
await tx(0,'create_agreement',[cancelId,'Live verification · unaccepted refund',mandate,addressArg(people[1].address),'Verification operator',bond,deadline],reward);
await tx(0,'cancel_unaccepted',[cancelId]);
assert.equal((await read(clients[0],address,'get_case',[cancelId])).state,'CANCELLED');
await tx(0,'withdraw');
const court=await read(clients[0],address,'get_court');
assert.equal(BigInt(court.deposited),BigInt(court.locked)+BigInt(court.claimable)+BigInt(court.withdrawn));
evidence.finalCourt=court;evidence.completedAt=new Date().toISOString();evidence.status='PASSED';save();
console.log('LIVE_LIFECYCLE_PASSED',json({contract:address,caseId,ruling:ruled.ruling.outcome,transactions:steps.filter(s=>s.hash).length,court}));

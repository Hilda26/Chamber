// Read-only completion after a transport interruption following monetary writes.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {clientFor,finalized,addressArg,json,read} from './network.mjs';
const file='artifacts/live-lifecycle.json';
const record=JSON.parse(readFileSync(file,'utf8'));
const deployment=JSON.parse(readFileSync('src/lib/deployment.json','utf8'));
assert.equal(record.contract,deployment.address);
assert.equal(record.sourceSha256,deployment.sourceSha256);
const client=clientFor();
const save=()=>writeFileSync(file,json(record));
for(const item of record.steps.filter(s=>s.hash)){
  item.receipt=await finalized(client,item.hash);item.status='FINALIZED';
  for(const child of item.triggered??[])child.receipt=await finalized(client,child.hash);
  save();
}
const refund=await read(client,record.contract,'get_case',[record.refundCaseId]);
assert.equal(refund.state,'CANCELLED');
const settled=await read(client,record.contract,'get_case',[record.caseId]);
assert.equal(settled.state,'SETTLED');
assert.equal(settled.ruling.basis,'GENLAYER_CONSENSUS');
assert.deepEqual(settled.ruling,record.ruling);
assert.deepEqual(settled.settlement,record.settlement);
for(const wallet of record.accounts){
 const account=await read(client,record.contract,'get_account',[addressArg(wallet)]);
 assert.equal(account.claimable,'0','An integration wallet still has an unwithdrawn credit');
}
const increases=record.steps.filter(s=>s.verification==='native_balance_increase');
assert.equal(increases.length,record.steps.filter(s=>s.function==='withdraw').length);
for(const item of increases)assert.ok(BigInt(item.after)>=BigInt(item.before)+BigInt(item.credit));
const court=await read(client,record.contract,'get_court');
assert.equal(BigInt(court.deposited),BigInt(court.locked)+BigInt(court.claimable)+BigInt(court.withdrawn));
assert.equal(court.locked,'0');assert.equal(court.claimable,'0');
assert.equal(await client.getBalance({address:record.contract}),0n);
record.finalCourt=court;record.completedAt=new Date().toISOString();record.status='PASSED';
record.completion='All writes completed; read-only verification resumed after a transient RPC connection reset.';
save();
console.log('LIVE_LIFECYCLE_PASSED',json({contract:record.contract,caseId:record.caseId,ruling:record.ruling.outcome,transactions:record.steps.filter(s=>s.hash).length,court}));

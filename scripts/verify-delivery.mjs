import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createAccount} from 'genlayer-js';
import {TransactionStatus} from 'genlayer-js/types';
import {clientFor,finalized,successful,addressArg,json,read,retryRead} from './network.mjs';
const deployment=JSON.parse(readFileSync('src/lib/deployment.json','utf8'));
const accounts=[createAccount(),createAccount(),createAccount()];
const clients=accounts.map(clientFor);
const caseId='CH-DELIVERY-'+Date.now().toString(36).toUpperCase();
const record={status:'RUNNING',network:'GenLayer StudioNet',contract:deployment.address,caseId,accounts:accounts.map(a=>a.address),steps:[]};
const save=()=>writeFileSync('artifacts/live-delivery.json',json(record));
async function tx(who,method,args=[],value=0n){
 const client=clients[who];
 const hash=await client.writeContract({address:deployment.address,functionName:method,args,value,consensusMaxRotations:3});
 const item={function:method,signer:accounts[who].address,hash,value:String(value)};record.steps.push(item);save();console.log(method,hash);
 item.receipt=await retryRead(()=>client.waitForTransactionReceipt({hash,status:method==='accept_delivery'||method==='withdraw'?TransactionStatus.FINALIZED:TransactionStatus.ACCEPTED,fullTransaction:true,interval:3000,retries:180}));successful(item.receipt);save();
 for(const child of await retryRead(()=>client.getTriggeredTransactionIds({hash}))){
  (item.triggered??=[]).push({hash:child,receipt:await finalized(client,child)});save();
 }
}
try{
 for(let i=0;i<3;i++)await clients[i].request({method:'sim_fundAccount',params:[accounts[i].address,1000000000000000000]});
 await tx(0,'create_agreement',[caseId,'Live verification - accepted delivery','Deliver a concise explanation of the CHAMBER delegation lifecycle, distinguishing the original mandate, accepted child scope, and final owner acceptance. Include the explanation in the delivery statement.',addressArg(accounts[1].address),'Delivery lead',1000000000000000n,BigInt(Math.floor(Date.now()/1000)+7*86400)],6000000000000000n);
 await tx(1,'accept_delegation',[caseId,'1'],1000000000000000n);
 await tx(1,'delegate',[caseId,'1',addressArg(accounts[2].address),'Scope reviewer','Explain how an accepted child scope reserves part of the lead reward and carries its own performance bond.',2000000000000000n]);
 await tx(2,'accept_delegation',[caseId,'2'],1000000000000000n);
 await tx(2,'record_evidence',[caseId,'2','Accepted child scope explanation','The original mandate defines the commissioned work. A child accepts a specific delegated scope, reserves part of the parent reward, and posts its own performance bond. The lead remains responsible for its accepted original instructions.','']);
 await tx(1,'submit_delivery',[caseId,'The owner funds the original mandate. The lead accepts it with a GEN bond and can reserve part of its reward for a child operator. The child accepts a distinct recorded scope with its own bond, as explained in exhibit 1. The owner reviews the final delivery and may accept it, causing full funded reward shares and unslashed bonds to become withdrawable credits.']);
 await tx(0,'accept_delivery',[caseId]);
 const settled=await read(clients[0],deployment.address,'get_case',[caseId]);
 assert.equal(settled.state,'SETTLED');assert.equal(settled.ruling.outcome,'MET');assert.equal(settled.ruling.basis,'OWNER_ACCEPTANCE');
 assert.equal(settled.settlement.provider_total,'6000000000000000');record.settlement=settled.settlement;
 for(const [who,expected] of [[1,5000000000000000n],[2,3000000000000000n]]){
  const credit=await read(clients[who],deployment.address,'get_account',[addressArg(accounts[who].address)]);assert.equal(BigInt(credit.claimable),expected);
  const before=await retryRead(()=>clients[who].getBalance({address:accounts[who].address}));await tx(who,'withdraw');
  const after=await retryRead(()=>clients[who].getBalance({address:accounts[who].address}));assert.ok(after>=before+expected);
  record.steps.push({verification:'native_balance_increase',account:accounts[who].address,before:String(before),after:String(after),credit:String(expected)});save();
 }
 for(const item of record.steps.filter(s=>s.hash)){item.receipt=await finalized(clients[0],item.hash);item.status='FINALIZED';save();}
 for(const account of accounts)assert.equal((await read(clients[0],deployment.address,'get_account',[addressArg(account.address)])).claimable,'0');
 const court=await read(clients[0],deployment.address,'get_court');assert.equal(court.deposited,court.withdrawn);assert.equal(court.locked,'0');assert.equal(court.claimable,'0');
 record.finalCourt=court;record.status='PASSED';record.completedAt=new Date().toISOString();save();console.log('LIVE_DELIVERY_PASSED',json({caseId,transactions:record.steps.filter(s=>s.hash).length,court}));
}catch(error){record.status='FAILED';record.error=error.message;save();throw error;}

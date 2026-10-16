import {readFileSync} from 'node:fs';
import {clientFor,json} from './network.mjs';
const live=JSON.parse(readFileSync('artifacts/live-lifecycle.json','utf8'));
const client=clientFor();
const parent=await client.getTransaction({hash:live.steps.findLast(s=>s.function==='withdraw').hash});
const ids=await client.getTriggeredTransactionIds({hash:parent.hash});
for(const hash of [parent.hash,...ids]){
  const r=await client.getTransaction({hash});
  console.log(json({hash,type:r.type,typeHex:r.typeHex,status:r.status,statusName:r.statusName,result:r.result,result_name:r.result_name,value:r.value,value_credited:r.value_credited,from:r.from_address,to:r.to_address,triggered_by:r.triggered_by,leaders:r.consensus_data?.leader_receipt?.map(x=>({mode:x.mode,execution:x.execution_result,address:x.node_config?.address,stderr:x.genvm_result?.stderr}))}));
}
for(const account of [live.accounts[0],live.contract])console.log('BALANCE',account,String(await client.getBalance({address:account})));

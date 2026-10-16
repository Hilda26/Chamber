import { readFileSync } from 'node:fs';
import { clientFor,json,read } from './network.mjs';
const pending=JSON.parse(readFileSync('artifacts/deployment-pending.json','utf8'));
const client=clientFor();const receipt=await client.getTransaction({hash:process.argv[2]??pending.hash});
console.log(json({keys:Object.keys(receipt),status:receipt.status,result:receipt.result,txExecutionResult:receipt.txExecutionResult,txExecutionResultName:receipt.txExecutionResultName,consensusKeys:Object.keys(receipt.consensus_data??{}),leaders:receipt.consensus_data?.leader_receipt?.map(r=>({execution:r.execution_result,result:r.result,stderr:r.genvm_result?.stderr})),address:receipt.to_address??receipt.recipient}));
try{console.log('COURT_READBACK',json(await read(client,receipt.to_address??receipt.recipient,'get_court')));}catch(e){console.log('READBACK_ERROR',e.message);}

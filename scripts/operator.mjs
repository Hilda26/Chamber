import { createAccount } from 'genlayer-js';
import { readFileSync } from 'node:fs';
import { parseUnits } from 'viem';
import { clientFor, finalized, addressArg, json, read } from './network.mjs';
const deployment=JSON.parse(readFileSync('src/lib/deployment.json','utf8'));
const [mode,method,argsText='[]',value='0']=process.argv.slice(2);
if(!['read','write'].includes(mode)||!method)throw new Error('Usage: node scripts/operator.mjs read|write method \'[args]\' [GEN-value]. Encode Address arguments as {"address":"0x…"}. Set CHAMBER_OPERATOR_PRIVATE_KEY for writes.');
const convert=x=>Array.isArray(x)?x.map(convert):x&&typeof x==='object'&&x.address?addressArg(x.address):x&&typeof x==='object'&&x.units?BigInt(x.units):x;
const args=convert(JSON.parse(argsText));
if(mode==='read'){console.log(json(await read(clientFor(),deployment.address,method,args)));}
else{
  if(!process.env.CHAMBER_OPERATOR_PRIVATE_KEY)throw new Error('Set CHAMBER_OPERATOR_PRIVATE_KEY in the process environment.');
  const account=createAccount(process.env.CHAMBER_OPERATOR_PRIVATE_KEY);const client=clientFor(account);
  const hash=await client.writeContract({address:deployment.address,functionName:method,args,value:parseUnits(value,18),consensusMaxRotations:3});
  console.log('Submitted:',hash);await finalized(client,hash);
  for(const child of await client.getTriggeredTransactionIds({hash})){await finalized(client,child);console.log('Finalized transfer:',child);}
  console.log('Finalized successfully:',hash);
}

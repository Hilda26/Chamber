import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { CalldataAddress, TransactionStatus, TransactionHashVariant } from 'genlayer-js/types';
import {assertSuccessfulReceipt} from '../src/lib/receipt.mjs';
export const endpoint = 'https://studio.genlayer.com/api';
export const clientFor = account => createClient({ chain: studionet, endpoint, account });
export const addressArg = address => new CalldataAddress(Uint8Array.from(Buffer.from(address.slice(2), 'hex')));
export function compactReceipt(receipt){
  if(!receipt||typeof receipt!=='object')return receipt;
  return {hash:receipt.hash,status:receipt.status,statusName:receipt.statusName,result:receipt.result,result_name:receipt.result_name,from_address:receipt.from_address,to_address:receipt.to_address,value:receipt.value,value_credited:receipt.value_credited,triggered_by:receipt.triggered_by,last_leader:receipt.last_leader,triggered_transactions:receipt.triggered_transactions,consensus_data:{votes:receipt.consensus_data?.votes,leader_receipt:receipt.consensus_data?.leader_receipt?.map(r=>({mode:r.mode,execution_result:r.execution_result,address:r.node_config?.address??r.address,result_status:r.result?.status??r.result_status,stderr:r.genvm_result?.stderr??r.stderr}))}};
}
export const json = value => JSON.stringify(value, (key,v) => key==='receipt'?compactReceipt(v):typeof v==='bigint'?v.toString():v, 2);
export const successful=assertSuccessfulReceipt;
export async function finalized(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, fullTransaction: true, interval: 5000, retries: 180 });
  successful(receipt);
  return receipt;
}
export async function read(client, address, functionName, args = []) {
  const result = await client.readContract({ address, functionName, args, transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
  return typeof result === 'string' && /^[\[{]/.test(result) ? JSON.parse(result) : result;
}

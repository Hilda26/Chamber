import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertSuccessfulReceipt} from '../src/lib/receipt.mjs';
test('actual quorum cancellation does not invalidate a successful leader',()=>{
  assert.doesNotThrow(()=>assertSuccessfulReceipt({status:7,result_name:'MAJORITY_AGREE',last_leader:'0x123',consensus_data:{leader_receipt:[{mode:'leader',node_config:{address:'0x123'},execution_result:'SUCCESS'},{mode:'validator',node_config:{address:'0x123'},execution_result:'ERROR',genvm_result:{stderr:'Validator execution cancelled after quorum'}}]}}));
});
test('credited finalized EOA transfer needs no consensus verdict',()=>{
  assert.doesNotThrow(()=>assertSuccessfulReceipt({status:7,result_name:'NO_MAJORITY',value:'10000000000000000',value_credited:true,triggered_by:'0xParent',consensus_data:{leader_receipt:[]}}));
});
test('failed GenVM call to a non-contract recipient remains a failure',()=>{
  assert.throws(()=>assertSuccessfulReceipt({status:7,result_name:'NO_MAJORITY',value:'100',value_credited:true,triggered_by:'0xParent',consensus_data:{leader_receipt:[{mode:'leader',execution_result:'ERROR',node_config:{address:'contract_not_found_handler'}}]}}));
});
test('finalized status without credited value or successful execution is insufficient',()=>{
  assert.throws(()=>assertSuccessfulReceipt({status:7,result_name:'NO_MAJORITY',value:'100',triggered_by:'0xParent',consensus_data:{leader_receipt:[]}}));
});

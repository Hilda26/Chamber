import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { CalldataAddress, TransactionHashVariant, TransactionStatus, type CalldataEncodable, type GenLayerTransaction, type TransactionHash } from 'genlayer-js/types';
import { formatUnits, isAddress, parseUnits } from 'viem';
import deployment from './deployment.json';
import type { Address } from './types';
import {assertSuccessfulReceipt} from './receipt.mjs';
export { deployment };
export const configured = isAddress(deployment.address) && !/^0x0{40}$/i.test(deployment.address);
export const short = (s: string) => s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—';
export const explorerAddress = (s: string) => `${deployment.explorer}/address/${s}`;
export const explorerTx = (s: string) => `${deployment.explorer}/tx/${s}`;
export const gen = (s: string | bigint, precision = 4) => { const units=BigInt(s||'0');const [whole,fraction='']=formatUnits(units,18).split('.');const decimals=fraction.slice(0,precision).replace(/0+$/,'');if(units>0n&&whole==='0'&&!decimals)return `<${'0.'+'0'.repeat(precision-1)+'1'}`;return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')}${decimals?'.'+decimals:''}`; };
export function amount(value: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(value.trim())) throw new Error('Enter a GEN amount with up to 18 decimal places.');
  const parsed = parseUnits(value.trim(), 18);
  if (parsed <= 0n) throw new Error('The GEN amount must be greater than zero.');
  return parsed;
}
export function addressArg(value: string) {
  if (!isAddress(value) || /^0x0{40}$/i.test(value)) throw new Error('Enter a valid nonzero wallet address.');
  return new CalldataAddress(Uint8Array.from(value.slice(2).match(/.{2}/g)!.map(n => parseInt(n, 16))));
}
export const publicClient = () => createClient({ chain: studionet, endpoint: deployment.rpc });
export async function read<T>(functionName: string, args: CalldataEncodable[] = []): Promise<T> {
  if (!configured) throw new Error('The CHAMBER contract has not been deployed yet.');
  const result = await publicClient().readContract({ address: deployment.address as Address, functionName, args, transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
  return (typeof result === 'string' && /^[\[{]/.test(result) ? JSON.parse(result) : result) as T;
}
export async function connectWallet(): Promise<Address> {
  if (!window.ethereum) throw new Error('Install a compatible browser wallet, then open CHAMBER in that browser to connect.');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as Address[];
  if (!accounts[0] || !isAddress(accounts[0])) throw new Error('Your wallet did not return an account.');
  return accounts[0];
}
export async function submit(account: Address, functionName: string, args: CalldataEncodable[], value: bigint): Promise<Address> {
  if (!configured) throw new Error('The CHAMBER contract is unavailable.');
  if (!window.ethereum) throw new Error('Connect a compatible browser wallet.');
  const current = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
  if (current[0]?.toLowerCase() !== account.toLowerCase()) throw new Error('Your wallet account changed. Reconnect before submitting.');
  const writer = createClient({ chain: studionet, endpoint: deployment.rpc, account, provider: window.ethereum });
  await writer.connect('studionet');
  return await writer.writeContract({ address: deployment.address as Address, functionName, args, value, consensusMaxRotations: 3 }) as Address;
}
export function assertSuccessful(receipt: GenLayerTransaction) {
  assertSuccessfulReceipt(receipt);
}
export async function wait(hash: Address) {
  const client = publicClient();
  const transactionHash = hash as TransactionHash;
  await client.waitForTransactionReceipt({ hash: transactionHash, status: TransactionStatus.FINALIZED, interval: 5000, retries: 180 });
  // Fetch complete fields: the SDK simplified receipt omits triggered_by.
  const receipt = await client.getTransaction({ hash: transactionHash });
  assertSuccessful(receipt);
  const children = await client.getTriggeredTransactionIds({ hash: transactionHash });
  for (const child of children) {
    await client.waitForTransactionReceipt({ hash: child, status: TransactionStatus.FINALIZED, interval: 5000, retries: 180 });
    const result = await client.getTransaction({ hash: child });
    assertSuccessful(result);
  }
  return receipt;
}
export function explain(error: unknown) { const message = error instanceof Error ? error.message : String(error);const code=error&&typeof error==='object'&&'code' in error?error.code:undefined;return code===4001||/user (rejected|denied)|user rejected the request/i.test(message)?'The signature was declined. No new transaction was submitted.':message.slice(0,650); }
declare global {
  interface Window { ethereum?: { request: (args: {method: string; params?: unknown[]}) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void; }; }
}

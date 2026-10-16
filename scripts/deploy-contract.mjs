import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createAccount } from 'genlayer-js';
import { clientFor, finalized, json, read } from './network.mjs';
const source = readFileSync('contracts/Chamber.py', 'utf8');
const sourceSha256 = createHash('sha256').update(source).digest('hex');
mkdirSync('artifacts', { recursive: true });
const pendingPath = 'artifacts/deployment-pending.json';
let pending = existsSync(pendingPath) ? JSON.parse(readFileSync(pendingPath, 'utf8')) : null;
if(pending&&pending.sourceSha256!==sourceSha256&&process.argv.includes('--new-version')){
  writeFileSync(`artifacts/deployment-${pending.sourceSha256.slice(0,12)}.json`,readFileSync('artifacts/deployment.json','utf8'));
  writeFileSync(`artifacts/deployment-pending-${pending.sourceSha256.slice(0,12)}.json`,json(pending));
  pending=null;
}
if (pending && pending.sourceSha256 !== sourceSha256) throw new Error('A deployment of different source is recorded. Inspect it and use --new-version for an intentional replacement.');
const signer = createAccount(process.env.CHAMBER_DEPLOYER_PRIVATE_KEY);
const client = clientFor(signer);
if (!pending) {
  if (!process.env.CHAMBER_DEPLOYER_PRIVATE_KEY) await client.request({ method: 'sim_fundAccount', params: [signer.address, 10] });
  const hash = await client.deployContract({ code: source, args: [], consensusMaxRotations: 3 });
  pending = { hash, signer: signer.address, sourceSha256 };
  writeFileSync(pendingPath, json(pending));
  console.log('Deployment submitted:', hash);
} else console.log('Resuming recorded deployment:', pending.hash);
const receipt = await finalized(client, pending.hash);
const address = receipt.recipient ?? receipt.to_address ?? receipt.txDataDecoded?.contractAddress ?? receipt.data?.contract_address;
if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error('Finalized deployment has no valid contract address');
const court = await read(client, address, 'get_court');
if (court.version !== '1.0.0') throw new Error('Contract readback does not match CHAMBER');
const deployment = { address, chainId: 61999, rpc: 'https://studio.genlayer.com/api', explorer: 'https://explorer-studio.genlayer.com', deploymentTransaction: pending.hash, sourceSha256 };
writeFileSync('src/lib/deployment.json', json(deployment));
writeFileSync('artifacts/deployment.json', json({ ...deployment, signer: pending.signer, receipt, court }));
console.log('CHAMBER deployed and verified:', address);

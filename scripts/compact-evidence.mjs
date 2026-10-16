import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {json} from './network.mjs';
for(const file of readdirSync('artifacts').filter(f=>f.endsWith('.json'))){
  const path='artifacts/'+file;
  writeFileSync(path,json(JSON.parse(readFileSync(path,'utf8'))));
}
console.log('Public receipts compacted to transaction and execution evidence.');

import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('out');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain; charset=utf-8','.py':'text/plain; charset=utf-8','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
createServer(async(req,res)=>{
  try{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(3014,'127.0.0.1',()=>console.log('CHAMBER production preview: http://127.0.0.1:3014'));

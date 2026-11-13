import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));const target=file===root?path.join(root,'index.html'):file;if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);res.end();return}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(data)})});
server.listen(Number(process.env.PORT||4175),'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+server.address().port));

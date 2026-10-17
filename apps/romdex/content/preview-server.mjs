import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';
import {projectNPCDex} from './projection.mjs';
import {requireThat,parseJSON} from './contracts.mjs';

export async function createContentPreview({reader,publicDir=path.resolve(import.meta.dirname,'../public'),port=0}){
 const htmlSource=await fs.readFile(path.join(publicDir,'addons/npcdex/index.html'),'utf8'),source=await fs.readFile(path.join(publicDir,'addons/npcdex/workspace.js'),'utf8');
 const start=source.indexOf('\nlet data=structuredClone(ORIGINAL)');requireThat(start>0&&source.indexOf('const startupReady=start();',start)>0,'NPCDex Preview Adapter Needs Review.');
 const runtime='const ORIGINAL=window.romdexContentSnapshot;\n'+source.slice(start).replace('const startupReady=start();','const startupReady=Promise.resolve();');
 requireThat(!runtime.includes('const ORIGINAL={'),'An Embedded Baseline Entered the Preview Runtime.');
 const controller=await fs.readFile(new URL('./preview.js',import.meta.url));
 let automatic=reader.cache.get('preview-auto-sync')!==false;reader.enabled=()=>automatic;
 const view=gender=>{const result=reader.view();if(result.active&&['male','female'].includes(gender)){const domain=reader.cache.get('domain:'+result.head);result.snapshot=projectNPCDex(domain,{revision:result.snapshot.revision,gender,assetBytes:hash=>reader.cache.object(hash)});}return result;};
 let origin;
 const server=http.createServer(async(req,res)=>{
  try{
   requireThat(req.headers.host===new URL(origin).host,'Untrusted Preview Host.');requireThat(!req.headers.origin||req.headers.origin===origin,'Untrusted Preview Origin.');requireThat(req.headers['sec-fetch-site']!=='cross-site','Cross-Site Preview Access Is Not Allowed.');
   const url=new URL(req.url,origin),send=(status,body,type='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'"});res.end(body);};
   if(req.method==='GET'&&url.pathname==='/api/view')return send(200,JSON.stringify(view(url.searchParams.get('gender'))));
   if(req.method==='POST'&&['/api/sync','/api/auto'].includes(url.pathname)){
    const parts=[];let size=0;for await(const part of req){size+=part.length;requireThat(size<=128,'Preview Control Request Is Too Large.');parts.push(part);}const input=parts.length?parseJSON(Buffer.concat(parts),{maxBytes:128}):{};
    if(url.pathname==='/api/auto'){requireThat(Object.keys(input).length===1&&typeof input.enabled==='boolean','Invalid Auto-Sync Setting.');automatic=input.enabled;reader.cache.set('preview-auto-sync',automatic);if(automatic)reader.start();else await reader.stop();return send(200,JSON.stringify(view()));}
    requireThat(Object.keys(input).length===0,'Preview Save Has No Write Payload.');return send(200,JSON.stringify(await reader.cycle(true)));
   }
   if(req.method!=='GET')return send(405,JSON.stringify({error:'This Is a Read-Only Preview.'}));
   if(url.pathname==='/'){
    if(!reader.view().active)return send(503,'<h1>No Verified Content Yet</h1><p>The isolated reader has not accepted its pinned initial publication. The original workspace is unchanged.</p>','text/html; charset=utf-8');
    let html=htmlSource.replace('<script src="workspace.js"></script><script src="coordination.js"></script>','<script src="/bootstrap.js"></script><script src="/runtime.js"></script><script src="/preview.js"></script>');
    requireThat(html!==htmlSource,'NPCDex Preview Script References Changed.');
    html=html.replace('</head>','<style>.device{height:100dvh;grid-template-rows:100px minmax(0,1fr);padding:16px 20px;gap:12px}.device>.header{display:flex;min-height:0}.header-right{gap:10px;position:relative;padding-bottom:20px}.header-actions{display:flex;align-items:center;gap:12px}.header-actions>#save,.header-actions>#content-auto{height:42px;box-sizing:border-box}#content-auto{font-weight:700}#save-status{position:absolute;bottom:0;right:0;width:auto;height:auto;max-width:480px;margin:0;overflow:visible;clip-path:none;white-space:normal;text-align:right;font-size:10px}.content-preview-notes{margin:14px 0;padding:12px;border:1px solid var(--line);border-radius:8px}.content-preview-notes p{white-space:pre-wrap;overflow-wrap:anywhere}.preview-badge{font-size:11px;color:var(--muted)}[data-settings-type],[data-area-settings],[data-legacy-settings]{opacity:.4;cursor:default}.content-review{color:var(--yellow)}</style></head>');
    html=html.replace('<div class="header-actions">','<div class="header-actions"><button id="content-auto" type="button">Auto-Sync Data · On</button>');return send(200,html,'text/html; charset=utf-8');
   }
   if(url.pathname==='/bootstrap.js'){const snapshot=view('male').snapshot;requireThat(snapshot,'No Verified Snapshot Is Available.');return send(200,'window.romdexContentSnapshot='+JSON.stringify(snapshot).replace(/</g,'\\u003c')+';','text/javascript; charset=utf-8');}
   if(url.pathname==='/runtime.js')return send(200,runtime,'text/javascript; charset=utf-8');
   if(url.pathname==='/preview.js')return send(200,controller,'text/javascript; charset=utf-8');
   // Only shared presentation assets; there is no proxy, arbitrary file route or save API.
   const allowed=/^\/(shared-ui\/[a-zA-Z0-9._/-]+|favicon\.(ico|png|svg))$/.test(url.pathname);if(allowed&&!url.pathname.split('/').includes('..')){const target=path.resolve(publicDir,'.'+decodeURIComponent(url.pathname));requireThat(target.startsWith(publicDir+path.sep),'Invalid Preview Asset.');const bytes=await fs.readFile(target);const type=target.endsWith('.css')?'text/css':target.endsWith('.svg')?'image/svg+xml':target.endsWith('.png')?'image/png':target.endsWith('.woff2')?'font/woff2':'application/octet-stream';return send(200,bytes,type);}
   return send(404,JSON.stringify({error:'Unknown Preview Route.'}));
  }catch(error){if(!res.headersSent){res.writeHead(400,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:error.message}));}else res.end();}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;reader.start();
 return {origin,server,async close(){await reader.stop();await new Promise(resolve=>server.close(resolve));}};
}

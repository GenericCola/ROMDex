import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {YouTrack} from './youtrack.mjs';
import {AssignedStatuses} from './assigned-statuses.mjs';
import {SyncSettings} from './sync-settings.mjs';
import {prepareProfile,buildIdentity,saveProtectedConnection} from './runtime-profile.mjs';
import {reconcile,remapOperation,same,indexTree,descendants,FIELDS,STATES} from './public/core.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),publicDir=path.join(root,'public');
const profile=await prepareProfile({root}),dataDir=profile.dataDir,identity=await buildIdentity(root);
await fs.mkdir(dataDir,{recursive:true});
async function readJSON(file,fallback){try{return JSON.parse(await fs.readFile(path.join(dataDir,file),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
async function writeJSON(file,value){const temp=path.join(dataDir,file+'.tmp');await fs.writeFile(temp,JSON.stringify(value));await fs.rename(temp,path.join(dataDir,file));}
let journal=await readJSON('journal.json',{}),client=null,connection=null,queue=Promise.resolve();
let rememberedConnection=false;
try{rememberedConnection=(await fs.stat(path.join(dataDir,'connection.encrypted'))).isFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const syncSettings=new SyncSettings(await readJSON('sync-settings.json',{}),value=>writeJSON('sync-settings.json',value));
let assignedRecords=await readJSON('assigned-statuses.json',null);
if(!assignedRecords){const backup=await readJSON('workspace.json',null),remote=backup?.remote||[],tree=indexTree(remote);assignedRecords=Object.fromEntries(remote.filter(x=>typeof x.assignedState==='string').map(x=>[x.id,{assignedState:x.assignedState,lastState:x.state,lastUpdated:x.updated,hasChildren:(tree.children.get(x.id)||[]).length>0,pendingState:null}]));}
const assignedStatuses=new AssignedStatuses(assignedRecords,records=>writeJSON('assigned-statuses.json',records));
async function protectCredential(value,decrypt=false){
 if(process.platform!=='win32')throw new Error('Remembering the connection is supported on Windows only.');
 const script=decrypt?"Add-Type -AssemblyName System.Security; $romdexBytes=[Convert]::FromBase64String([Console]::In.ReadToEnd()); [Console]::Out.Write([Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect($romdexBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)))":"Add-Type -AssemblyName System.Security; $romdexBytes=[Text.Encoding]::UTF8.GetBytes([Console]::In.ReadToEnd()); [Console]::Out.Write([Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect($romdexBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)))";
 return new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,stdio:['pipe','pipe','pipe']});let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.resume();child.on('error',()=>reject(new Error('Windows could not protect the connection token.')));child.on('close',code=>code===0?resolve(output):reject(new Error('Windows could not protect or restore the connection token.')));child.stdin.end(value);});
}
function serialized(fn){const result=queue.then(fn);queue=result.catch(()=>{});return result;}
const port=Number(process.env.ROMDEX_PORT||4322),origin=`http://127.0.0.1:${port}`;
if(profile.shared&&port!==4322)throw new Error('The shared ROMDex profile uses port 4322. Set ROMDEX_DATA_DIR for an isolated service on another port.');
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(text.length>16*1024*1024)throw new Error('Request too large.');}return text?JSON.parse(text):{};}
function requireClient(){if(!client){const e=new Error('Connect ROMDex to YouTrack first.');e.status=401;throw e;}return client;}
function syncStatus(){return {connected:!!client,connection,rememberedConnection,automaticSyncEnabled:syncSettings.enabled,syncControl:true,youtrackAvailable:client?.ready===true&&client.healthy===true};}
async function readyClient(){const yt=requireClient();if(!yt.ready)connection=await yt.connect();return yt;}
function skipAutomatic(res){if(syncSettings.enabled)return false;send(res,200,{...syncStatus(),syncDisabled:true});return true;}
function validOp(op){if(!op||!/^[-\w]{1,100}$/.test(op.opId||''))throw new Error('Invalid operation ID.');if(!['edit','create','comment','delete'].includes(op.type))throw new Error('Invalid operation.');if(op.type==='edit'){if(!op.base||!op.patch||Object.keys(op.patch).some(k=>!FIELDS.includes(k)))throw new Error('Invalid edit.');if('summary'in op.patch&&!op.patch.summary.trim())throw new Error('Title cannot be blank.');}if(op.type==='create'&&!op.item?.summary?.trim())throw new Error('Title cannot be blank.');if(op.type==='comment'&&!op.text?.trim())throw new Error('Comment cannot be blank.');}
async function processOp(original,mapping){
 validOp(original);const op=remapOperation(original,mapping),record=journal[op.opId];
 if(op.patch&&'assignedState'in op.patch&&!Object.values(STATES).includes(op.patch.assignedState))throw new Error('Choose a supported assigned status.');
 if(op.item&&'assignedState'in op.item&&!Object.values(STATES).includes(op.item.assignedState))throw new Error('Choose a supported assigned status.');
 if(record?.status==='done')return record.result;
 const yt=requireClient();
 if(op.type==='edit'){
  const remote=await yt.get(op.issueId);let base=op.base;
  if(record?.phase==='parent-detached'&&remote&&remote.parentId===null)base={...base,parentId:null};
  const merged=reconcile(base,op.patch,remote);
  if(merged.conflicts.length)return {conflicts:merged.conflicts,remote};
  const patch={...merged.patch};
  if('parentId'in patch){journal[op.opId]={status:'running',phase:record?.phase||'parent'};await writeJSON('journal.json',journal);await yt.setParent(op.issueId,patch.parentId,async()=>{journal[op.opId]={status:'running',phase:'parent-detached'};await writeJSON('journal.json',journal);});delete patch.parentId;}
  if('assignedState'in op.patch){try{await yt.setAssignedState(op.issueId,op.patch.assignedState,remote.assignedState);}catch(error){if(error.conflicts)return {conflicts:error.conflicts,remote:error.remote};throw error;}delete patch.assignedState;}
  await yt.update(op.issueId,patch);
  const after=await yt.get(op.issueId);if(Object.entries(op.patch).some(([k,v])=>!same(after?.[k],v)))return {conflicts:[{field:'__verify__',local:op.patch,remote:after,base:op.base}],remote:after};
 }
 if(op.type==='create'){
  let issue;
  if(record?.createdId)issue=await yt.require(record.createdId);
  else if(record?.status==='running')return {uncertain:true,message:'The previous creation may have reached YouTrack. Review recent issues before retrying.',operation:op};
  else{
   journal[op.opId]={status:'running'};await writeJSON('journal.json',journal);
   issue=await yt.create(op.item);journal[op.opId]={status:'running',createdId:issue.id};await writeJSON('journal.json',journal);
  }
  if(op.item.parentId)await yt.setParent(issue.id,op.item.parentId);
  const result={mapping:{[original.issueId]:issue.id}};journal[op.opId]={status:'done',result};await writeJSON('journal.json',journal);return result;
 }
 if(op.type==='comment'){
  if(record?.status==='running')return {uncertain:true,message:'The comment may already have been posted. Review the comments before retrying.',operation:op};
  journal[op.opId]={status:'running'};await writeJSON('journal.json',journal);await yt.addComment(op.issueId,op.text);
 }
 if(op.type==='delete'){
  const all=await yt.all(),tree=indexTree(all),remaining=op.ids.filter(id=>tree.byId.has(id));
  const conflicts=[];
  for(const id of remaining){const item=tree.byId.get(id),base=op.bases[id];if(!base||item.updated!==base.updated)conflicts.push({field:'__delete__',id,base,local:'Delete',remote:item});const extra=descendants(all,id).filter(x=>!op.ids.includes(x));if(extra.length)conflicts.push({field:'__children__',id,local:op.ids,remote:extra});}
  if(conflicts.length)return {conflicts};
  for(const id of remaining.sort((a,b)=>tree.depths.get(b)-tree.depths.get(a))){await yt.delete(id);}
 }
 const result={};journal[op.opId]={status:'done',result};await writeJSON('journal.json',journal);return result;
}
async function api(req,res,url){
 if(req.method==='GET'&&url.pathname==='/api/status')return send(res,200,{app:'ROMDex',...identity,...syncStatus(),origin,sharedProfile:profile.shared,canRemember:process.platform==='win32'});
 if(req.method==='POST'&&url.pathname==='/api/sync-settings'){const {enabled}=await body(req);await syncSettings.set(enabled);return send(res,200,syncStatus());}
 if(req.method==='POST'&&url.pathname==='/api/complexity-setup'){connection=await (await readyClient()).setupComplexity();return send(res,200,syncStatus());}
 if(req.method==='GET'&&url.pathname==='/api/snapshot'){if(skipAutomatic(res))return;const items=await (await readyClient()).all();return send(res,200,{items,at:Date.now(),...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/comments'){if(skipAutomatic(res))return;const comments=await (await readyClient()).comments(url.searchParams.get('id'));return send(res,200,{comments,...syncStatus()});}
 if(req.method==='POST'&&url.pathname==='/api/connect'){
  const input=await body(req);if(typeof input.token!=='string'||input.token.length<10)throw new Error('Enter your YouTrack permanent token.');
  const next=new YouTrack(input.token.trim(),assignedStatuses),info=await next.connect();
  if(input.remember===true)await saveProtectedConnection(dataDir,await protectCredential(next.token));
  else await fs.rm(path.join(dataDir,'connection.encrypted'),{force:true});
  rememberedConnection=input.remember===true;client=next;connection=info;return send(res,200,syncStatus());
 }
 if(req.method==='POST'&&url.pathname==='/api/prepare'){const input=await body(req);if(!syncSettings.allows(input.manual)){skipAutomatic(res);return;}await (await readyClient()).ensureStates();connection={...connection,missingStates:[]};return send(res,200,{ok:true,...syncStatus()});}
 if(req.method==='POST'&&url.pathname==='/api/stop'){send(res,200,{ok:true});server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),2000).unref();return;}
 if(req.method==='POST'&&url.pathname==='/api/backup'){const input=await body(req);await writeJSON('workspace.json',input);return send(res,200,{ok:true});}
 if(req.method==='GET'&&url.pathname==='/api/backup')return send(res,200,await readJSON('workspace.json',null));
 if(req.method==='POST'&&url.pathname==='/api/sync'){
  const input=await body(req);if(!syncSettings.allows(input.manual)){skipAutomatic(res);return;}await readyClient();
  const operations=input.operations;if(!Array.isArray(operations)||operations.length>1000)throw new Error('Invalid queue.');
  const completed=[],mapping={};let blocked=null;
  for(const op of operations){try{const result=await processOp(op,mapping);if(result.conflicts||result.uncertain){blocked={opId:op.opId,...result};break;}completed.push(op.opId);Object.assign(mapping,result.mapping||{});}catch(e){blocked={opId:op.opId,error:e.message};break;}}
  let items=null,error=null;
  try{if(!blocked)await requireClient().derivedStatuses();items=await requireClient().all();}catch(e){error=e.message;}
  return send(res,200,{completed,mapping,blocked,items,error,at:Date.now(),...syncStatus()});
 }
 if(req.method==='POST'&&url.pathname==='/api/acknowledge'){
  const {opId,action,issueId,manual}=await body(req);if(!syncSettings.allows(manual)){skipAutomatic(res);return;}
  await readyClient();const entry=journal[opId];if(!entry||entry.status!=='running')throw new Error('No uncertain operation to resolve.');
  if(action==='retry'){delete journal[opId];}else if(action==='created'){const issue=await requireClient().require(issueId);journal[opId]={status:'running',createdId:issue.id};}else if(action==='posted'){journal[opId]={status:'done',result:{}};}else throw new Error('Invalid resolution.');
  await writeJSON('journal.json',journal);return send(res,200,{ok:true});
 }
 send(res,404,{error:'Not found.'});
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==`127.0.0.1:${port}`&&req.headers.host!==`localhost:${port}`)return send(res,403,{error:'Local access only.'});
  const url=new URL(req.url,origin);
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  if(url.pathname.startsWith('/api/')){
   if(req.method!=='GET'&&(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json')))return send(res,403,{error:'Open ROMDex from '+origin});
   if(req.method==='GET'&&req.headers['sec-fetch-site']==='cross-site')return send(res,403,{error:'Local access only.'});
   if(req.method==='POST'||['/api/snapshot','/api/comments'].includes(url.pathname))await serialized(()=>api(req,res,url));else await api(req,res,url);return;
  }
  const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));const target=path.resolve(publicDir,relative);
  if(!target.startsWith(publicDir+path.sep))return send(res,403,{error:'Not allowed.'});
  const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch(e){send(res,e.status||500,{error:e.code==='ENOENT'?'File not found.':e.message,...syncStatus()});}
});
let startupToken=process.env.YOUTRACK_TOKEN;
if(!startupToken)try{startupToken=await protectCredential(await fs.readFile(path.join(dataDir,'connection.encrypted'),'utf8'),true);}catch(e){if(e.code!=='ENOENT')console.error('Remembered connection could not be restored. Connect again in ROMDex.');}
if(startupToken){client=new YouTrack(startupToken,assignedStatuses);connection={project:'PMON',localAssignedStatus:true,missingStates:[],unverified:true};if(syncSettings.enabled)try{connection=await client.connect();}catch(e){console.error('YouTrack connection unavailable:',e.message);}}
startupToken=null;
server.listen(port,'127.0.0.1',()=>console.log(`ROMDex ready: ${origin}`));
export {server,protectCredential};

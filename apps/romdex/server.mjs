import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';
import {protectCredential} from './credential-protection.mjs';
import {DurableJSONStorage} from './durable-json-storage.mjs';
import {Readable} from 'node:stream';
import {YouTrack,BASE} from './youtrack.mjs';
import {AssignedStatuses} from './assigned-statuses.mjs';
import {SyncSettings} from './sync-settings.mjs';
import {UploadStorage,multipartFile} from './attachment-storage.mjs';
import {AttachmentService} from './attachment-service.mjs';
import {ReturnReader} from './rdx/return-reader.mjs';
import {attachmentMetadata,MAX_FILE_BYTES,isRaster,validateUpload,validateAttachmentDelete} from './public/attachment-core.mjs';
import {prepareProfile,buildIdentity,saveProtectedConnection} from './runtime-profile.mjs';
import {reconcile,remapOperation,same,indexTree,descendants,validateMove,isEditableField,FIELDS,STATES} from './public/core.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),publicDir=path.join(root,'public');
const profile=await prepareProfile({root}),dataDir=profile.dataDir,identity=await buildIdentity(root);
await fs.mkdir(dataDir,{recursive:true});
async function readJSON(file,fallback){try{return JSON.parse(await fs.readFile(path.join(dataDir,file),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
const jsonStores=new Map();
async function writeJSON(file,value){if(!jsonStores.has(file))jsonStores.set(file,new DurableJSONStorage(path.join(dataDir,file)));return jsonStores.get(file).save(value);}
let journal=await readJSON('journal.json',{}),client=null,connection=null,queue=Promise.resolve();
const uploads=new UploadStorage(dataDir),attachmentService=new AttachmentService({storage:uploads,client:()=>requireClient(),journal,persist:()=>writeJSON('journal.json',journal)});
let rememberedConnection=false;
try{rememberedConnection=(await fs.stat(path.join(dataDir,'connection.encrypted'))).isFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const syncSettings=new SyncSettings(await readJSON('sync-settings.json',{}),value=>writeJSON('sync-settings.json',value));
let assignedRecords=await readJSON('assigned-statuses.json',null);
if(!assignedRecords){const backup=await readJSON('workspace.json',null),remote=backup?.remote||[],tree=indexTree(remote);assignedRecords=Object.fromEntries(remote.filter(x=>typeof x.assignedState==='string').map(x=>[x.id,{assignedState:x.assignedState,lastState:x.state,lastUpdated:x.updated,hasChildren:(tree.children.get(x.id)||[]).length>0,pendingState:null}]));}
const assignedStatuses=new AssignedStatuses(assignedRecords,records=>writeJSON('assigned-statuses.json',records));
// Desktop-only metadata plumbing. No endpoint, raw IPC or YouTrack field write is exposed.
export function desktopAssignedRecords(){return structuredClone(assignedStatuses.records);}
export function applyDesktopAssignedMetadata(values,expected,removed=[]){return serialized(async()=>{
 const next=structuredClone(assignedStatuses.records);for(const [id,value]of Object.entries(values)){
  if(!/^PMON-[1-9]\d*$/.test(id)||typeof value!=='string'||!value.trim()||value.length>256||/[\u0000-\u001f]/.test(value))throw Error('Invalid Cloud Assigned Status.');
  if(!next[id])continue;if(!same(next[id].assignedState,expected[id]?.assignedState)&&!same(next[id].assignedState,value))throw Error('A Native Status Changed While Applying Metadata. Retry Is Required.');
  next[id]={...next[id],assignedState:value,cloudManaged:true};
 }for(const id of removed){if(!/^PMON-[1-9]\d*$/.test(id))throw Error('Invalid Removed Metadata Identity.');if(!next[id])continue;if(!same(next[id].assignedState,expected[id]?.assignedState))throw Error('A Native Status Changed While Removing Metadata. Retry Is Required.');next[id]={...next[id],assignedState:next[id].lastState,explicitAssigned:false,cloudManaged:false};}
 if(!same(next,assignedStatuses.records))await assignedStatuses.commit(next);return desktopAssignedRecords();
});}

function serialized(fn){const result=queue.then(fn);queue=result.catch(()=>{});return result;}
const port=Number(process.env.ROMDEX_PORT||4322),origin=`http://127.0.0.1:${port}`;
if(profile.shared&&port!==4322)throw new Error('The shared ROMDex profile uses port 4322. Set ROMDEX_DATA_DIR for an isolated service on another port.');
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(text.length>16*1024*1024)throw new Error('Request too large.');}return text?JSON.parse(text):{};}
function requireClient(){if(!client){const e=new Error('Connect ROMDex to YouTrack first.');e.status=401;throw e;}return client;}
function syncStatus(){return {connected:!!client,connection,rememberedConnection,automaticSyncEnabled:syncSettings.enabled,syncControl:true,youtrackAvailable:client?.ready===true&&client.healthy===true};}
async function readyClient(){const yt=requireClient();if(!yt.ready)connection=await yt.connect();return yt;}
function skipAutomatic(res){if(syncSettings.enabled)return false;send(res,200,{...syncStatus(),syncDisabled:true});return true;}
function validOp(op){if(!op||!/^[-\w]{1,100}$/.test(op.opId||''))throw new Error('Invalid operation ID.');if(!['edit','create','comment','delete','attachment','attachment-delete'].includes(op.type))throw new Error('Invalid operation.');if(op.type==='attachment')validateUpload(op);if(op.type==='attachment-delete')validateAttachmentDelete(op);if(op.type==='edit'){if(!op.base||!op.patch||Object.keys(op.patch).some(k=>!isEditableField(k)))throw new Error('Invalid edit.');if('summary'in op.patch&&!op.patch.summary.trim())throw new Error('Title cannot be blank.');}if(op.type==='create'&&!op.item?.summary?.trim())throw new Error('Title cannot be blank.');if(op.type==='comment'&&!op.text?.trim())throw new Error('Comment cannot be blank.');}
async function processOp(original,mapping){
 validOp(original);const op=remapOperation(original,mapping),record=journal[op.opId];
 if(op.patch&&'assignedState'in op.patch&&!Object.values(STATES).includes(op.patch.assignedState))throw new Error('Choose a supported assigned status.');
 if(op.item&&'assignedState'in op.item&&!Object.values(STATES).includes(op.item.assignedState))throw new Error('Choose a supported assigned status.');
 if(op.type==='attachment-delete')return attachmentService.delete(op);
 if(record?.status==='done')return record.result;
 const yt=requireClient();
 if(op.type==='attachment')return attachmentService.process(op);
 if(op.group){
  const g=op.group,key='bulk-'+g.id;
  if(!/^[-\w]{1,100}$/.test(g.id||'')||!['group','move'].includes(g.kind)||!Array.isArray(g.members)||g.members.length<2||g.members.length>1000||new Set(g.members).size!==g.members.length)throw new Error('Invalid Bulk Group.');
  if(op.type==='edit'&&(!g.members.includes(op.issueId)||op.patch.parentId!==g.destinationParentId)||op.type==='create'&&(g.kind!=='group'||op.issueId!==g.destinationParentId))throw new Error('Invalid Bulk Group Action.');
  if(!journal[key]){
   const all=await yt.all(),byId=new Map(all.map(x=>[x.id,x]));
   if(g.members.some(id=>!byId.has(id)||(byId.get(id).parentId??null)!==(g.originParentId??null)))return {conflicts:[{field:'__group__',local:g.members,remote:g.members.map(id=>({id,parentId:byId.get(id)?.parentId??null,exists:byId.has(id)})),base:g.originParentId}],message:'The Selected Items Changed Parents or Were Removed in YouTrack. Cancel This Pending Group and Select Them Again.'};
   if(g.kind==='move')for(const id of g.members)validateMove(all,id,g.destinationParentId);
   else if(g.originParentId&&!byId.has(g.originParentId))throw new Error('The Group Parent No Longer Exists.');
   journal[key]={status:'started',kind:g.kind,members:g.members};await writeJSON('journal.json',journal);
  }
 }
 if(op.type==='edit'){
  const remote=await yt.get(op.issueId);let base=op.base; if(record?.tagsApplied){const tags=new Set(base.tags||[]);for(const action of record.tagsApplied)action.present?tags.add(action.id):tags.delete(action.id);base={...base,tags:[...tags].sort()};}
  if(record?.phase==='parent-detached'&&remote&&remote.parentId===null)base={...base,parentId:null};
  const merged=reconcile(base,op.patch,remote);
  if(merged.conflicts.length)return {conflicts:merged.conflicts,remote};
  const patch={...merged.patch};await yt.validateEdit(patch,remote);
  if('parentId'in patch){journal[op.opId]={status:'running',phase:record?.phase||'parent'};await writeJSON('journal.json',journal);await yt.setParent(op.issueId,patch.parentId,async()=>{journal[op.opId]={status:'running',phase:'parent-detached'};await writeJSON('journal.json',journal);});delete patch.parentId;}
  if('assignedState'in op.patch){try{await yt.setAssignedState(op.issueId,op.patch.assignedState,remote.assignedState);}catch(error){if(error.conflicts)return {conflicts:error.conflicts,remote:error.remote};throw error;}delete patch.assignedState;}
  await yt.update(op.issueId,patch,true);if('tags'in patch){const prior=journal[op.opId]||{};journal[op.opId]={...prior,status:'running',confirmedFields:[...new Set([...(prior.confirmedFields||[]),...Object.keys(patch).filter(key=>key!=='tags')])]};await writeJSON('journal.json',journal);}if('tags'in patch)await yt.setTags(op.issueId,patch.tags,async(id,present)=>{const prior=journal[op.opId]||{};journal[op.opId]={...prior,status:'running',tagsApplied:[...(prior.tagsApplied||[]),{id,present}]};await writeJSON('journal.json',journal);});
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
  if(op.item.parentId)await yt.setParent(issue.id,op.item.parentId);if('tags'in op.item)await yt.setTags(issue.id,op.item.tags);
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
 if(req.method==='POST'&&url.pathname==='/api/attachment-deletes/cancel'){const op=await body(req);return send(res,200,{...await attachmentService.cancelDeletion(op),...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/status')return send(res,200,{app:'ROMDex',...identity,...syncStatus(),origin,sharedProfile:profile.shared,canRemember:process.platform==='win32'});
 if(req.method==='GET'&&url.pathname==='/api/edit-options'){const yt=await readyClient(),options=await yt.editOptions(),issueId=url.searchParams.get('id'),item=issueId?await yt.require(issueId):null;return send(res,200,{options,item,...syncStatus()});}
 if(req.method==='POST'&&url.pathname==='/api/uploads'){const file=await multipartFile(req);if(journal[file.uploadId]?.status==='done')return send(res,200,{completed:true,...syncStatus()});return send(res,200,{file:await uploads.stage(file.uploadId,file.metadata,file.bytes),...syncStatus()});}
 if(req.method==='POST'&&url.pathname==='/api/uploads/cancel'){const {uploadId}=await body(req);await uploads.get(uploadId);const entry=journal[uploadId];if(entry&&entry.kind!=='attachment'&&!entry.result?.attachment&&!entry.result?.cancelledUpload)throw Error('This Operation Is Not an Upload.');if(entry?.status!=='done'){journal[uploadId]={status:'done',result:{cancelledUpload:true}};await writeJSON('journal.json',journal);}await uploads.release(uploadId);return send(res,200,{ok:true,...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/uploads'){const id=url.searchParams.get('uploadId');return send(res,200,{file:await uploads.get(id),completed:journal[id]?.status==='done'&&!!(journal[id].result?.attachment||journal[id].result?.cancelledUpload),...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/attachments'){if(url.searchParams.get('manual')!=='true'&&skipAutomatic(res))return;const files=await (await readyClient()).attachments(url.searchParams.get('id'));return send(res,200,{attachments:files.map(attachmentMetadata),...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/attachment-review'){await readyClient();return send(res,200,{...await attachmentService.review(url.searchParams.get('opId')),...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/attachment-content'){
  const file=url.searchParams.has('uploadId')?await uploads.read(url.searchParams.get('uploadId')):await (await readyClient()).attachmentBytes(url.searchParams.get('id'),url.searchParams.get('attachmentId'));
  const preview=url.searchParams.get('preview')==='true';if(preview&&!isRaster(file.metadata.mimeType))throw Object.assign(Error('This File Type Has No Inline Preview. Download It Instead.'),{status:415});
  res.writeHead(200,{'Content-Type':preview?file.metadata.mimeType:'application/octet-stream','Content-Length':file.bytes.length,'Content-Disposition':(preview?'inline':'attachment')+"; filename*=UTF-8''"+encodeURIComponent(file.metadata.name),'Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; sandbox"});res.end(file.bytes);return;
 }
 if(req.method==='POST'&&url.pathname==='/api/sync-settings'){const {enabled}=await body(req);await syncSettings.set(enabled);return send(res,200,syncStatus());}
 if(req.method==='POST'&&url.pathname==='/api/complexity-setup'){connection=await (await readyClient()).setupComplexity();return send(res,200,syncStatus());}
 if(req.method==='GET'&&url.pathname==='/api/snapshot'){if(skipAutomatic(res))return;const items=await (await readyClient()).all();return send(res,200,{items,at:Date.now(),...syncStatus()});}
 if(req.method==='GET'&&url.pathname==='/api/comments'){if(url.searchParams.get('manual')!=='true'&&skipAutomatic(res))return;const comments=await (await readyClient()).comments(url.searchParams.get('id'));return send(res,200,{comments,...syncStatus()});}
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
  const completed=[],mapping={},deletedAttachments=[],attachmentResults={};let blocked=null;
  for(const op of operations){try{const result=await processOp(op,mapping);if(result.conflicts||result.uncertain){blocked={opId:op.opId,...result};break;}completed.push(op.opId);if(result.attachment)attachmentResults[op.opId]=result.attachment;if(result.deletedAttachment)deletedAttachments.push(result.deletedAttachment);Object.assign(mapping,result.mapping||{});}catch(e){blocked={opId:op.opId,error:e.message,confirmedFields:journal[op.opId]?.confirmedFields||[],tagProgress:journal[op.opId]?.tagsApplied||[]};break;}}
  let items=null,error=null;
  try{if(!blocked)await requireClient().derivedStatuses();items=await requireClient().all();}catch(e){error=e.message;}
  return send(res,200,{completed,mapping,blocked,items,error,deletedAttachments,attachmentResults,at:Date.now(),...syncStatus()});
 }
 if(req.method==='POST'&&url.pathname==='/api/acknowledge'){
  const {opId,action,issueId,manual}=await body(req);if(!syncSettings.allows(manual)){skipAutomatic(res);return;}
  await readyClient();const entry=journal[opId];if(!entry||entry.status!=='running')throw new Error('No uncertain operation to resolve.');
  if(entry.kind==='attachment'){await attachmentService.acknowledge(opId,action,issueId);return send(res,200,{ok:true});}
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
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src "+(url.pathname==='/addons/npcdex/index.html'?"'self' http: https:":"'self'")+"; frame-ancestors "+(['/tasks.html','/addons/npcdex/index.html'].includes(url.pathname)?"'self'":"'none'")+"; base-uri 'none'; form-action 'self'");
  if(url.pathname.startsWith('/api/')){
   const upload=url.pathname==='/api/uploads'&&req.method==='POST';
   if(req.method!=='GET'&&(req.headers.origin!==origin||!(req.headers['content-type']?.startsWith(upload?'multipart/form-data':'application/json'))))return send(res,403,{error:'Open ROMDex from '+origin});
   if(req.method==='GET'&&req.headers['sec-fetch-site']==='cross-site')return send(res,403,{error:'Local access only.'});
   if(req.method==='POST'||['/api/snapshot','/api/comments','/api/edit-options','/api/attachments','/api/attachment-content','/api/attachment-review'].includes(url.pathname))await serialized(()=>api(req,res,url));else await api(req,res,url);return;
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
if(process.env.ROMDEX_DESKTOP!=='1')server.listen(port,'127.0.0.1',()=>console.log(`ROMDex ready: ${origin}`));
// Privileged desktop adapter: reuse the tested API/journal without opening an HTTP port.
// This function is not exposed to a renderer; the desktop dispatcher restricts callers/routes.
async function dispatchLocal(route,{method='GET',bytes,headers={}}={}){
 const req=Readable.from(bytes?[Buffer.from(bytes)]:[]);req.method=method;req.headers=headers;
 const url=new URL(route,'http://127.0.0.1');let status=200,responseHeaders={},result=Buffer.alloc(0);
 const res={writeHead(code,h){status=code;responseHeaders={...responseHeaders,...h};},setHeader(k,v){responseHeaders[k]=v;},end(value){result=Buffer.isBuffer(value)?value:Buffer.from(value||'');}};
 try{await serialized(()=>api(req,res,url));}catch(error){send(res,error.status||500,{error:error.message,...syncStatus()});}
 return {status,headers:responseHeaders,bytes:result};
}
async function verifyDesktopConnection(){const items=await (await readyClient()).all();return {items,...syncStatus()};}
async function releaseDeliverySettings(){const yt=await readyClient(),healthy=yt.healthy;try{const value=await yt.request('admin/globalSettings/systemSettings?fields=maxUploadFileSize');return {maxUploadFileSize:Number.isSafeInteger(value?.maxUploadFileSize)?value.maxUploadFileSize:null,storageCapacityVerified:false};}catch(error){return {maxUploadFileSize:null,status:error.status||null,reason:'The Current Connection Cannot Read the Server Upload Setting.',storageCapacityVerified:false};}finally{yt.healthy=healthy;}}
async function desktopPackageTarget(id){return serialized(async()=>{const yt=await readyClient();const item=await yt.require(id);return {instanceOrigin:BASE,projectId:yt.projectId,issueId:item.dbId,issueKey:item.id,actor:{id:yt.user.id,login:yt.user.login}};});}
async function desktopReturnInventory(entry,signal){return serialized(async()=>new ReturnReader(await readyClient()).inventory(entry,signal));}
async function desktopReturnBytes(entry,metadata,signal){return serialized(async()=>new ReturnReader(await readyClient()).bytes(entry,metadata,signal));}
export {server,protectCredential,dispatchLocal,verifyDesktopConnection,releaseDeliverySettings,desktopPackageTarget,desktopReturnInventory,desktopReturnBytes};

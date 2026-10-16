import {clone,materialize,remapOperation,reconcile,indexTree,validateMove,mergeIncoming,applySyncResult,STATES} from './core.mjs';
import {stageBulk} from './bulk-hierarchy.mjs';
import {FileStorage,uploadRequest} from './attachment-files.mjs';
import {validateFile,MAX_FILES} from './attachment-core.mjs';
export async function request(path,body){
 const response=await fetch(path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(180000)});
 const data=await response.json();if(!response.ok){const error=new Error(data.error||'Request failed.');error.syncStatus=data;throw error;}return data;
}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('romdex-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('workspace');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function read(db){return new Promise((resolve,reject)=>{const tx=db.transaction('workspace'),req=tx.objectStore('workspace').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function write(db,state){return new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(state,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Local storage was interrupted.'));});}
function cachedSyncPreference(state){try{const saved=localStorage.getItem('romdex-auto-sync-enabled');if(saved!==null)return saved!=='false';}catch{}return state.automaticSyncEnabled!==false;}
function cacheSyncPreference(enabled){try{localStorage.setItem('romdex-auto-sync-enabled',String(enabled));}catch{}}
export class Workspace extends EventTarget {
 constructor({transport=request,storage=null,files=new FileStorage(),upload=uploadRequest}={}){super();this.request=transport;this.storage=storage;this.files=files;this.upload=upload;this.staging=null;this.state=null;this.db=null;this.busy=false;this.refreshing=false;this.connected=false;this.mode='offline';this.message='Connect to YouTrack';this.failures=0;this.lock=Promise.resolve();this.timer=null;this.backupTimer=null;this.pendingWrites=0;this.inflight=new Set();this.automaticSyncEnabled=true;this.youtrackAvailable=false;this.serviceAvailable=false;this.syncControl=false;this.settingBusy=false;this.statusGeneration=0;this.statusTask=null;this.manualSyncActive=false;this.lastAttempt=0;}
 get items(){return materialize(this.state.remote,this.state.operations);}
 emit(){this.dispatchEvent(new Event('change'));}
 async init(){
  let state;if(this.storage)state=await this.storage.load();else{this.db=await openDB();state=await read(this.db);}
  if(!state){try{state=await this.request('/api/backup');}catch{}}
  if(!state){const seed=await this.request('/seed.json');state={version:1,remote:seed.items,operations:[],order:{},images:{},expanded:[],selectorExpanded:[],selected:null,blocked:null,lastSync:null,importedAt:seed.importedAt};}
  this.state=state;this.automaticSyncEnabled=cachedSyncPreference(state);await this.persist(state);
  await this.checkStatus();this.resting();this.emit();if(this.connected&&this.automaticSyncEnabled)this.sync();
  this.interval=setInterval(()=>this.tick(),5000);
  window.addEventListener('online',()=>this.tick(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.tick(true);});
 }
 async persist(state){return this.storage?this.storage.save(state):write(this.db,state);}
 applyStatus(status){
  this.serviceAvailable=true;
  if(typeof status.rememberedConnection==='boolean')this.rememberedConnection=status.rememberedConnection;
  if(typeof status.connected==='boolean')this.connected=status.connected;
  if('connection'in status)this.connection=status.connection;
  if(typeof status.automaticSyncEnabled==='boolean'){this.automaticSyncEnabled=status.automaticSyncEnabled;cacheSyncPreference(this.automaticSyncEnabled);}
  if(typeof status.youtrackAvailable==='boolean')this.youtrackAvailable=status.youtrackAvailable;
  else if(status.connected!==undefined)this.youtrackAvailable=!!status.connected&&!status.connection?.unverified;
  if('syncControl'in status)this.syncControl=status.syncControl===true;
  if(!this.automaticSyncEnabled)clearTimeout(this.timer);
 }
 connectionFailure(error){if(error.syncStatus?.syncControl)this.applyStatus(error.syncStatus);else{this.serviceAvailable=false;this.youtrackAvailable=false;}}
 resting(){
  if(!this.automaticSyncEnabled){this.mode='paused';this.message=this.state.blocked?'Review Conflicting Changes · Auto-Sync Data Is Off':this.state.operations.length?'Manual Save Required · Auto-Sync Data Is Off':'Auto-Sync Data Is Off · All Changes Saved';}
  else if(!this.connected){this.mode='manual';this.message='Imported Copy · Connect to YouTrack';}
  else if(this.state.blocked){this.mode='manual';this.message=this.state.blocked.conflicts?'Review Conflicting Changes':this.state.blocked.error||this.state.blocked.message||'Manual Save Required';}
  else if(this.failures){this.mode='manual';this.message='Connection Interrupted · Changes Kept Locally';}
  else{this.mode=this.state.operations.length?'syncing':'synced';this.message=this.state.operations.length?'Saving Changes…':'All Changes Saved to YouTrack';}
 }
 async checkStatus(){
  if(this.statusTask)return this.statusTask;
  const generation=this.statusGeneration;
  this.statusTask=(async()=>{try{const status=await this.request('/api/status');if(generation===this.statusGeneration){this.applyStatus(status);if(!this.busy&&!this.refreshing)this.resting();this.emit();}return true;}catch{if(generation===this.statusGeneration){this.serviceAvailable=false;this.youtrackAvailable=false;this.failures=Math.max(1,this.failures);if(!this.busy)this.resting();this.emit();}return false;}finally{this.statusTask=null;}})();
  return this.statusTask;
 }
 async tick(force=false){
  const wasEnabled=this.automaticSyncEnabled;if(!await this.checkStatus())return;
  await this.cleanupUploads().catch(()=>{});
  if(!this.busy&&this.state.operations.some(x=>x.type==='attachment'))await this.stageUploads(this.state.operations).catch(()=>{});
  if(this.settingBusy||!this.automaticSyncEnabled||!this.connected||this.busy||this.refreshing)return;
  if(!force&&wasEnabled&&Date.now()-this.lastAttempt<15000)return;
  if(this.state.blocked)await this.refresh();else await this.sync();
 }
 async setAutomaticSync(enabled){
  if(this.settingBusy)return;this.settingBusy=true;this.statusGeneration++;clearTimeout(this.timer);this.emit();
  try{const result=await this.request('/api/sync-settings',{enabled});this.applyStatus(result);this.resting();}
  finally{this.settingBusy=false;this.emit();}
  if(this.automaticSyncEnabled&&this.connected)await this.sync();
 }
 async transaction(fn){
  this.pendingWrites++;
  const run=this.lock.then(async()=>{const next=clone(this.state);await fn(next);await this.persist(next);this.state=next;this.emit();clearTimeout(this.backupTimer);this.backupTimer=setTimeout(()=>this.request('/api/backup',this.state).catch(()=>{}),1000);});
  this.lock=run.catch(()=>{});try{return await run;}finally{this.pendingWrites--;}
 }
 schedule(){clearTimeout(this.timer);if(!this.automaticSyncEnabled||!this.connected){this.resting();this.emit();return;}if(this.settingBusy||this.state.blocked||this.mode==='manual')return;this.mode='syncing';this.message='Saving Changes…';this.emit();this.timer=setTimeout(()=>this.sync(),800);}
 async edit(id,patch,baseOverride={}){
  await this.transaction(s=>{
   const item=materialize(s.remote,s.operations).find(x=>x.id===id);if(!item)throw new Error('The item no longer exists.');
   const last=[...s.operations].reverse().find(x=>x.issueId===id);
   if(last?.type==='create'&&!this.inflight.has(last.opId)){Object.assign(last.item,patch);return;}
   if(last?.type==='edit'&&!last.group&&!this.inflight.has(last.opId)&&s.blocked?.opId!==last.opId){for(const key of Object.keys(patch))if(!(key in last.patch))last.base[key]=Object.prototype.hasOwnProperty.call(baseOverride,key)?baseOverride[key]:item[key];Object.assign(last.patch,patch);return;}
   s.operations.push({opId:crypto.randomUUID(),type:'edit',issueId:id,base:{...clone(item),...baseOverride},patch});
  });this.schedule();
 }
 async create(parentId,summary,type='Task'){
  const id='local-'+crypto.randomUUID(),item={id,summary:summary.trim(),description:'',parentId,state:'To do',priority:'Normal',type,updated:null,comments:[],commentCount:0,dependencies:0,fields:{}};
  if(!item.summary)throw new Error('Enter a title.');
  await this.transaction(s=>s.operations.push({opId:crypto.randomUUID(),type:'create',issueId:id,item}));this.schedule();return id;
 }
 async comment(id,text){await this.transaction(s=>s.operations.push({opId:crypto.randomUUID(),type:'comment',issueId:id,text:text.trim()}));this.schedule();}
 async attach(id,files){
  if(!files.length||files.length>MAX_FILES)throw Error('Choose 1 to '+MAX_FILES+' Files at a Time.');for(const file of files)validateFile(file);
  const operations=[];
  try{for(const file of files){const uploadId=crypto.randomUUID(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');await this.files.set(uploadId,file);operations.push({opId:uploadId,type:'attachment',issueId:id,uploadId,file:{name:file.name,size:file.size,mimeType:file.type||'application/octet-stream',hash}});}
   await this.transaction(s=>{if(!materialize(s.remote,s.operations).some(x=>x.id===id))throw Error('This Item No Longer Exists.');s.operations.push(...operations);});
  }catch(error){for(const op of operations)await this.files.remove(op.uploadId).catch(()=>{});throw error;}
  await this.stageUploads(operations).catch(()=>{});this.schedule();return operations;
 }
 async stageUploads(operations){
  if(this.staging)await this.staging;
  const selected=operations.filter(x=>x.type==='attachment');if(!selected.length)return;
  const task=(async()=>{for(const op of selected){const existing=await this.request('/api/uploads?uploadId='+encodeURIComponent(op.uploadId));if(existing.completed)continue;
   let file=existing.file;if(!file){const blob=await this.files.get(op.uploadId);if(!blob)throw Error('The Queued File Is Missing. Cancel This Upload and Reattach It.');file=(await this.upload(op.uploadId,blob,op.file.name)).file;}
   if(file.hash!==op.file.hash||file.name!==op.file.name||file.size!==op.file.size)throw Error('The Staged File Does Not Match the Queued Upload.');
  }})();this.staging=task;try{await task;}finally{if(this.staging===task)this.staging=null;}
 }
 async cleanupUploads(){for(const id of [...(this.state.uploadCleanup||[])]){await this.request('/api/uploads/cancel',{uploadId:id});await this.files.remove(id).catch(()=>{});await this.transaction(s=>s.uploadCleanup=s.uploadCleanup.filter(x=>x!==id));}}
 async cancelAttachment(opId){if(this.inflight.has(opId))throw Error('Wait for This Upload to Finish.');await this.transaction(s=>{const op=s.operations.find(x=>x.opId===opId&&x.type==='attachment');if(!op)return;s.uploadCleanup=[...new Set([...(s.uploadCleanup||[]),op.uploadId])];s.operations=s.operations.filter(x=>x.opId!==opId);if(s.blocked?.opId===opId)s.blocked=null;});await this.cleanupUploads().catch(()=>{});this.resting();this.emit();}
 async remove(ids){
  await this.transaction(s=>{
   if(s.operations.some(op=>op.type==='attachment'&&ids.includes(op.issueId)&&this.inflight.has(op.opId)))throw Error('Wait for the Current Upload Before Deleting This Item.');
   const items=materialize(s.remote,s.operations),bases=Object.fromEntries(items.filter(x=>ids.includes(x.id)).map(x=>[x.id,clone(x)]));
   for(const group of Object.values(s.bulkGroups||{}))if(['pending','blocked'].includes(group.status)&&[...group.members,group.createdParentId].some(id=>ids.includes(id))){
    if(group.opIds.some(id=>this.inflight.has(id)))throw new Error('Wait for the Current Group Sync Before Deleting These Items.');
    s.operations=s.operations.filter(op=>!group.opIds.includes(op.opId));group.status='cancelled';if(group.opIds.includes(s.blocked?.opId))s.blocked=null;
   }
   const local=ids.filter(id=>id.startsWith('local-'));
   s.uploadCleanup=[...new Set([...(s.uploadCleanup||[]),...s.operations.filter(op=>op.type==='attachment'&&ids.includes(op.issueId)).map(x=>x.uploadId)])];
   s.operations=s.operations.filter(op=>!local.includes(op.issueId)&&!(op.type==='attachment'&&ids.includes(op.issueId)));
   const live=ids.filter(id=>!local.includes(id));if(live.length)s.operations.push({opId:crypto.randomUUID(),type:'delete',issueId:live[0],ids:live,bases});
  });await this.cleanupUploads().catch(()=>{});this.schedule();
 }
 async preferences(values){await this.transaction(s=>Object.assign(s,values));}
 async moveMany(ids,parentId,beforeId=null){
  let group;await this.transaction(s=>{group=stageBulk(s,ids,{parentId,beforeId,groupId:crypto.randomUUID(),makeOpId:()=>crypto.randomUUID()});});this.schedule();return group;
 }
 async groupItems(ids,title,type='Task'){
  let group;await this.transaction(s=>{group=stageBulk(s,ids,{title,type,groupId:crypto.randomUUID(),newId:'local-'+crypto.randomUUID(),makeOpId:()=>crypto.randomUUID()});});this.schedule();return group;
 }
 async move(id,parentId,beforeId=null){
  await this.transaction(s=>{
   const items=materialize(s.remote,s.operations);validateMove(items,id,parentId);
   const item=items.find(x=>x.id===id);
   if(item.parentId!==parentId)s.operations.push({opId:crypto.randomUUID(),type:'edit',issueId:id,base:clone(item),patch:{parentId}});
   const siblings=(indexTree(items,s.order).children.get(parentId)||[]).map(x=>x.id).filter(x=>x!==id);
   const at=beforeId?siblings.indexOf(beforeId):-1;siblings.splice(at<0?siblings.length:at,0,id);
   siblings.forEach((key,i)=>s.order[key]=i);
  });this.schedule();
 }
 async connect(token,remember=false){const result=await this.request('/api/connect',{token,remember});this.applyStatus(result);this.failures=0;this.resting();this.emit();return result;}
 async refresh(){
  if(!this.automaticSyncEnabled||!this.connected||this.refreshing||this.busy)return;this.refreshing=true;this.lastAttempt=Date.now();
  try{const result=await this.request('/api/snapshot');this.applyStatus(result);if(result.syncDisabled){this.resting();return;}await this.transaction(s=>{mergeIncoming(s,result.items);s.lastRead=result.at;});this.failures=0;this.resting();this.dispatchEvent(new Event('refreshed'));}
  catch(e){this.connectionFailure(e);this.failures++;this.mode='manual';this.message='Cannot Refresh YouTrack · '+e.message;}
  finally{this.refreshing=false;this.emit();}
 }
 async comments(id){if(!this.automaticSyncEnabled)return null;try{const result=await this.request('/api/comments?id='+encodeURIComponent(id));this.applyStatus(result);if(result.syncDisabled){this.resting();this.emit();return null;}return result;}catch(error){this.connectionFailure(error);this.emit();throw error;}}
 async prepare(){const result=await this.request('/api/prepare',{manual:true});this.applyStatus(result);this.connection.missingStates=[];await this.sync(true);}
 async sync(manual=false){
  if(this.busy||this.settingBusy||(!manual&&!this.automaticSyncEnabled))return;
  if(!this.connected){this.dispatchEvent(new Event('connectneeded'));return;}
  if(this.connection?.missingStates?.length){this.dispatchEvent(new Event('connectneeded'));return;}
  if(this.state.blocked?.conflicts||this.state.blocked?.uncertain){this.dispatchEvent(new Event('reviewneeded'));return;}
  this.busy=true;this.manualSyncActive=manual;this.lastAttempt=Date.now();this.mode='syncing';this.message='Synchronizing with YouTrack…';this.emit();
  try{
   if(!manual){if(!await this.checkStatus()||!this.automaticSyncEnabled)return;}
   await this.lock;const sent=clone(this.state.operations.slice(0,1000));this.inflight=new Set(sent.map(x=>x.opId));
   await this.stageUploads(sent);
   const result=await this.request('/api/sync',{operations:sent,manual});this.applyStatus(result);
   if(result.syncDisabled){this.resting();return;}
   this.dispatchEvent(new CustomEvent('mapping',{detail:result.mapping||{}}));
   await this.transaction(s=>applySyncResult(s,result));for(const op of sent.filter(x=>x.type==='attachment'&&result.completed.includes(x.opId)))await this.files.remove(op.uploadId).catch(()=>{});this.dispatchEvent(new Event('refreshed'));
   if(result.blocked||result.error){this.mode='manual';this.message=result.blocked?.conflicts?'Review Conflicting Changes':result.blocked?.message||result.blocked?.error||result.error;if(manual&&this.state.blocked)this.dispatchEvent(new Event('reviewneeded'));}
   else{this.failures=0;this.resting();}
  }catch(e){this.connectionFailure(e);this.failures++;this.mode=manual||this.failures>=2?'manual':'syncing';this.message=this.mode==='manual'?'Save Needed · '+e.message:'Connection Interrupted · Retrying';}
  finally{this.busy=false;this.manualSyncActive=false;this.inflight.clear();if(!this.automaticSyncEnabled)this.resting();this.emit();if(this.automaticSyncEnabled&&this.state.operations.length&&this.mode==='syncing')this.timer=setTimeout(()=>this.sync(),1500);}
 }
 async resolve(choices){
  await this.transaction(s=>{
   const block=s.blocked,op=s.operations.find(x=>x.opId===block.opId);if(!op)throw new Error('This conflict has already been resolved.');
   if(choices.discard){
    if(op.type==='attachment')s.uploadCleanup=[...new Set([...(s.uploadCleanup||[]),op.uploadId])];
    if(op.group&&s.bulkGroups?.[op.group.id]){const group=s.bulkGroups[op.group.id];s.operations=s.operations.filter(x=>!group.opIds.includes(x.opId));group.status='cancelled';}
    else s.operations=s.operations.filter(x=>x.opId!==op.opId);
   }
   else if(block.error){throw new Error('Retry this action or cancel it.');}
   else if(op.type==='edit'){
    if(block.conflicts.some(x=>x.field==='__missing__'))throw new Error('The item was deleted in YouTrack. Discard the pending edit or copy its contents to a new task.');
    for(const c of block.conflicts){if(c.field.startsWith('__'))throw new Error('Review the latest item before retrying.');const choice=choices[c.field];if(choice?.mode==='remote')delete op.patch[c.field];else if(choice?.mode==='merge')op.patch[c.field]=choice.value;op.base[c.field]=c.remote;}
    if(!Object.keys(op.patch).length)s.operations=s.operations.filter(x=>x.opId!==op.opId);
   }else if(op.type==='delete'){
    if(block.conflicts.some(x=>x.field==='__children__'))throw new Error('The subtree changed. Cancel this deletion and select it again to review all affected items.');
    for(const c of block.conflicts)op.bases[c.id]=c.remote;
   }
   s.blocked=null;
  });await this.cleanupUploads().catch(()=>{});this.mode='syncing';await this.sync(true);
 }
}

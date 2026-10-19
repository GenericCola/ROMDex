import {randomUUID} from 'node:crypto';
import {canonical,sha,seal,same} from '../content/contracts.mjs';
import {inspectMapPackage,buildMapPackage,packageName} from './map-package.mjs';
import {validateShape} from './schema.mjs';
import {ensure,LIMITS} from './limits.mjs';
import {MAX_FILE_BYTES} from '../public/attachment-core.mjs';
import {packageSummary,packageProgress} from '../public/package-progress.mjs';

const BASE='https://thegobindsingh.youtrack.cloud',CHUNK=512*1024;
const cleanDestination=(input,items)=>{
 ensure(input&&['existing','new'].includes(input.kind),'INVALID','Choose an Existing Task or Create a New Task.');
 const available=id=>/^PMON-\d+$/.test(id||'')&&items.some(i=>i.id===id);
 if(input.kind==='existing'){ensure(available(input.issueId),'NOT_FOUND','Choose a Published PMON Task.');return {kind:'existing',issueId:input.issueId};}
 ensure(typeof input.title==='string'&&input.title.trim().length>0&&input.title.length<=240&&!/[\r\n\0]/.test(input.title),'INVALID','Enter a New Task Name of 240 Characters or Fewer.');
 ensure(input.parentId===null||available(input.parentId),'NOT_FOUND','Choose an Existing PMON Parent or the Project Root.');return {kind:'new',title:input.title.trim(),parentId:input.parentId};
};
const fileInfo=(assetId,hash,bytes,mime,name,role)=>({assetId,assetIds:assetId?[assetId]:[],hash,bytes,mime,name,role});
export class MapPackageWorkspace{
 constructor({maps,engine,target,attachmentBytes,changed=()=>{}}){Object.assign(this,{maps,engine,target,attachmentBytes,changed,paused:false,running:null,download:null});}
 entries(){return Object.values(this.engine.state?.mapPackages||{});}
 pause(){this.paused=true;}
 resume(){this.paused=false;}
 async stop(){this.pause();await this.running;}
 async capture(input){
  await this.maps.open();let key=this.maps.active;
  if(!key){ensure(this.maps.adoption,'NOT_FOUND','Import or Open a Managed Physical Map First.');key=(await this.maps.adoption.export(input)).key;}
  const value=await this.maps.store.view(key);ensure(value.status.saved,'RECOVERY','Finish the Map RDX Checkpoint Before Packaging.');
  return {key,value};
 }
 status(){return this.entries().map(e=>({...packageSummary(e,this.engine.state.blocked),newerDrafts:this.maps.store?.row(e.key).head!==e.revision,binding:e.binding||null,packageHash:e.packageHash||null,uploads:e.uploads.map(f=>({role:f.role,name:f.name,complete:!!f.completed,verified:!!f.verified,error:f.error||null}))}));}
 frozen(id){const entry=this.engine.state.mapPackages?.[id];ensure(entry,'NOT_FOUND','This Fixed Package Is No Longer Available.');const value=this.maps.store.load(entry.key,entry.revision);ensure(sha(value.documentBytes)===entry.baseDocumentHash,'INTEGRITY','The Frozen Package Baseline Changed.');return {entry,prepared:inspectMapPackage(value,{selection:entry.selection})};}
 details(id){const {entry,prepared}=this.frozen(id);return {...packageProgress(entry,prepared,this.engine.state.blocked),binding:entry.binding||null,packageHash:entry.packageHash||null,taskName:this.engine.items.find(t=>t.id===entry.issueId)?.summary||null,newerDrafts:this.maps.store.row(entry.key).head!==entry.revision};}
 navigation(input){const {entry,prepared}=this.frozen(input.id),row=input.targetKey?prepared.rows.find(r=>r.selected&&r.key===input.targetKey):null;ensure(!input.targetKey||row,'NOT_FOUND','The Target Is Not in This Fixed Package.');const artifact=row&&(row.key.startsWith('plan:')?prepared.requests.find(p=>p.digest===row.key.slice(5)):prepared.observations.find(r=>r.digest===row.key.slice(7)));return {id:entry.id,issueId:entry.issueId,key:entry.key,context:this.maps.adoption?.owns(entry.key)?null:entry.key,mapRecordId:prepared.document.scope.mapRecordId,target:artifact?structuredClone(artifact.target):null};}
 async preview(input){
  ensure(this.engine.state,'NOT_READY','Wait for the Task Workspace to Load.');await this.engine.lock;
  const captured=await this.capture(input),p=inspectMapPackage(captured.value,{selection:input.selection??null}),dest=input.destination?cleanDestination(input.destination,this.engine.items):null;
  const packageId='package:map-'+captured.key,existing=this.entries().filter(e=>e.key===captured.key),version=1+Math.max(0,...existing.map(e=>e.version));
  const assets=p.assets.map(a=>fileInfo(a.assetId,a.sha256,a.bytes,a.mime,'NPCDex-asset-'+a.sha256+(a.mime==='image/png'?'.png':a.mime==='image/jpeg'?'.jpg':a.mime==='image/gif'?'.gif':a.mime==='image/webp'?'.webp':'.bin'),'asset'));
  const aliases=new Map();for(const asset of assets){const key=asset.hash+'|'+asset.mime,prior=aliases.get(key);if(prior)prior.assetIds.push(asset.assetId);else aliases.set(key,asset);}assets.splice(0,assets.length,...aliases.values());
  ensure(assets.length<=64&&assets.every(a=>a.bytes<=MAX_FILE_BYTES)&&assets.reduce((n,a)=>n+a.bytes,0)<=128*1024*1024,'LIMIT','Required Files Exceed 64 Files, 50 MiB per File or 128 MiB Total. Nothing Was Dropped.');
  if(!p.blockers.length)try{buildMapPackage(p,{packageId,version,assets:p.assets.map(a=>({assetId:a.assetId,sha256:a.sha256,bytes:a.bytes,mime:a.mime,location:{instanceOrigin:BASE,projectId:'pending',issueId:'0-0',attachmentId:'pending-'+a.sha256}}))});}catch(error){p.blockers.push(error.message);}
  const fingerprint=sha(canonical({key:captured.key,revision:p.document.revision,selection:p.selection,destination:dest,assets}));
  const previous=existing.find(e=>e.fingerprint===fingerprint),token=sha(canonical({fingerprint,version,packageId}));
  const response={key:captured.key,mapName:p.mapName,revision:p.document.revision,packageId,version,token,fingerprint,rows:p.rows,selection:p.selection,contextOnly:p.contextOnly,executableCount:p.executable.length,observationCount:p.observations.length,finalCount:p.requests.length-p.executable.length,groupCount:p.groups.filter(g=>g.writeRecordIds.length).length,warnings:p.warnings,blockers:p.blockers,files:assets.map(a=>({name:a.name,bytes:a.bytes,mime:a.mime,role:a.role})),destination:dest,previous:previous?{id:previous.id,status:previous.status,version:previous.version}:null,tasks:this.engine.items.filter(t=>/^PMON-\d+$/.test(t.id)).map(t=>({id:t.id,name:t.summary,parentId:t.parentId})),notice:p.contextOnly?'No ROM Changes Requested. FINAL Decisions, Flags and Notes Are Context Only.':'Only the Selected Changes Are Packaged. Attaching Does Not Dispatch an Agent.'};
  return {response,captured,prepared:p,assets,destination:dest};
 }
 blob(hash){const row=this.maps.store.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(hash);ensure(row,'RECOVERY','Frozen Package Bytes Are Missing.');const bytes=Buffer.from(row.bytes);ensure(sha(bytes)===hash,'INTEGRITY','Frozen Package Bytes Changed.');return bytes;}
 async retain(bytes){ensure(bytes.length<=MAX_FILE_BYTES,'LIMIT','A Required File Exceeds 50 MiB.');const hash=sha(bytes);await this.maps.store.capacity(bytes.length*2);const old=this.maps.store.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(hash);ensure(!old||Buffer.from(old.bytes).equals(bytes),'INTEGRITY','An Existing Frozen Blob Changed.');this.maps.store.db.prepare('INSERT OR IGNORE INTO blobs VALUES(?,?)').run(hash,bytes);return hash;}
 async enqueue(files,entry,makeState){
  const staged=[];try{
   for(const f of files){await this.engine.files.set(f.opId,new File([this.blob(f.hash)],f.name,{type:f.mime}));staged.push(f.opId);}
   ensure(!this.paused,'NOT_READY','Package Delivery Is Paused for Desktop Lifecycle Work.');
   await this.engine.transaction(s=>{
    ensure(!this.paused,'NOT_READY','Package Delivery Is Paused.');makeState?.(s);const e=s.mapPackages[entry.id];ensure(e&&e.fingerprint===entry.fingerprint,'CONFLICT','The Package Queue Changed.');
    for(const f of files){ensure(!e.uploads.some(a=>a.opId===f.opId)&&!s.operations.some(o=>o.opId===f.opId),'CONFLICT','This Frozen Upload Was Already Queued.');e.uploads.push(f);s.operations.push({opId:f.opId,uploadId:f.opId,type:'attachment',issueId:e.issueId,file:{name:f.name,size:f.bytes,mimeType:f.mime,hash:f.hash}});}
   });
  }catch(error){for(const id of staged)if(!this.engine.state.operations.some(o=>o.uploadId===id))await this.engine.files.remove(id).catch(()=>{});throw error;}
 }
 async stage(input){
  ensure(input.approved===true,'REVIEW_REQUIRED','Review the Selected Changes and Destination, Then Confirm Attachment.');
  const repeated=this.entries().find(e=>e.previewToken===input.token);if(repeated)return {id:repeated.id,alreadyQueued:true};
  ensure(this.entries().length<1000,'LIMIT','The Local Package Ledger Requires Retention Review Before Adding More Versions.');
  const p=await this.preview(input);ensure(p.destination,'INVALID','Choose the Task Destination.');ensure(input.token===p.response.token,'CONFLICT','The Map, Selection or Destination Changed. Preview Again.');ensure(!p.prepared.blockers.length,'REVIEW_REQUIRED',p.prepared.blockers.join('\n'));
  if(p.response.previous)return {id:p.response.previous.id,alreadyQueued:true};
  const d=p.captured.value.document,id=randomUUID(),issueId=p.destination.kind==='new'?'local-'+randomUUID():p.destination.issueId,createOpId=p.destination.kind==='new'?randomUUID():null;
  const entry={id,key:p.captured.key,revision:d.revision,mapName:p.prepared.mapName,packageId:p.response.packageId,version:p.response.version,previewToken:p.response.token,fingerprint:p.response.fingerprint,selection:p.prepared.selection,baseDocumentHash:sha(p.captured.value.documentBytes),contextOnly:p.prepared.contextOnly,issueId,parentId:p.destination.parentId??null,createOpId,status:'assets',uploads:[],createdAt:new Date().toISOString(),approved:true};
  for(const a of p.prepared.assets)await this.retain(p.captured.value.blobs.get(a.sha256));
  const files=p.assets.map(a=>({...a,opId:randomUUID()}));
  // Frozen bytes precede this transaction; the package ledger, task creation and
  // complete asset queue are committed together. No cross-store remap is needed.
  await this.enqueue(files,entry,s=>{s.mapPackages??={};ensure(!Object.values(s.mapPackages).some(e=>e.key===entry.key&&e.version===entry.version),'CONFLICT','A Newer Package Version Was Queued. Preview Again.');ensure(!p.destination.issueId||s.remote.some(t=>t.id===p.destination.issueId),'CONFLICT','The Selected Task Is No Longer Available.');s.mapPackages[id]=structuredClone(entry);if(createOpId)s.operations.push({opId:createOpId,type:'create',issueId,item:{id:issueId,summary:p.destination.title,description:'NPCDex Map Package '+entry.packageId+' v'+entry.version+'. Planning and staging only; agent handoff is a separate human action.',parentId:entry.parentId,state:'To do',priority:'Normal',type:'Task',updated:null,comments:[],commentCount:0,dependencies:0,fields:{}}});});
  this.engine.schedule();this.changed();return {id,queued:true,automaticSyncEnabled:this.engine.automaticSyncEnabled};
 }
 async update(id,fn){await this.engine.transaction(s=>{const e=s.mapPackages?.[id];ensure(e,'NOT_FOUND','Map Package Not Found.');fn(e);});}
 async verifyFiles(entry,files,budget){
  for(const file of files){if(this.paused||!budget.manual&&!this.engine.automaticSyncEnabled)return false;ensure(!file.error,'REVIEW_REQUIRED',file.error);if(!file.completed){ensure(this.engine.state.operations.some(o=>o.opId===file.opId),'REVIEW_REQUIRED','A Frozen Upload Was Cancelled or Lost. Review This Package Before Continuing.');return false;}if(file.verified)continue;
   ensure(file.receipt?.name===file.name&&file.receipt.size===file.bytes,'INTEGRITY','The Attachment Receipt Differs From Its Frozen File.');
   if(budget.bytes+file.bytes>64*1024*1024)return false;
   const bytes=await this.attachmentBytes(entry.issueId,file.receipt.id);budget.bytes+=bytes.length;ensure(bytes.length===file.bytes&&sha(bytes)===file.hash,'INTEGRITY','Downloaded Task Attachment Bytes Differ From the Frozen File.');
   ensure(!this.paused,'NOT_READY','Package Verification Is Paused.');await this.update(entry.id,e=>{const f=e.uploads.find(a=>a.opId===file.opId);ensure(f?.receipt.id===file.receipt.id,'CONFLICT','The Upload Receipt Changed.');f.verified=true;});
  }return true;
 }
 async finalInventory(entry){const result=await this.engine.request('/api/attachments?id='+encodeURIComponent(entry.issueId)+'&manual=true');for(const file of entry.uploads){const actual=result.attachments.find(a=>a.id===file.receipt?.id);ensure(actual&&actual.name===file.name&&actual.size===file.bytes,'REVIEW_REQUIRED','A Frozen Package Attachment Was Removed or Renamed. Review the Task.');if(actual.updated!==file.receipt.updated){const bytes=await this.attachmentBytes(entry.issueId,actual.id);ensure(sha(bytes)===file.hash,'INTEGRITY','A Previously Verified Package Attachment Changed.');}}}
 async cycle(manual=false){
  if(this.running){const prior=this.running;await prior;if(!manual)return;if(this.running&&this.running!==prior)return this.cycle(manual);}
  if(this.paused||!this.engine.state||!manual&&!this.engine.automaticSyncEnabled)return;
  const run=()=>this.maps.execute(async()=>{const budget={bytes:0,manual};for(const id of this.entries().map(e=>e.id)){
   let entry=this.engine.state.mapPackages[id];if(entry.status==='attached'||entry.error&&!manual)continue;
   try{if(entry.error)await this.update(id,e=>{delete e.error;});
    for(let phase=0;phase<4&&!this.paused&&(manual||this.engine.automaticSyncEnabled);phase++){
     entry=this.engine.state.mapPackages[id];if(this.engine.state.blocked)break;
     for(const file of entry.uploads)ensure(file.completed||this.engine.state.operations.some(o=>o.opId===file.opId),'REVIEW_REQUIRED','A Frozen Upload Was Cancelled or Lost. Review This Package Before Continuing.');
     if(entry.issueId.startsWith('local-'))ensure(this.engine.state.operations.some(o=>o.opId===entry.createOpId),'REVIEW_REQUIRED','The Frozen Task Creation Was Cancelled or Lost. Review This Package Before Continuing.');
     if(entry.uploads.some(f=>!f.completed)||entry.issueId.startsWith('local-')){
      if(manual)await this.engine.sync(true);entry=this.engine.state.mapPackages[id];if(entry.uploads.some(f=>!f.completed)||entry.issueId.startsWith('local-'))break;
     }
     ensure(/^PMON-\d+$/.test(entry.issueId),'NOT_READY','The New Task Is Waiting for Confirmed Creation.');
     const verified=await this.target(entry.issueId);ensure(verified.instanceOrigin===BASE&&verified.issueKey===entry.issueId&&/^\d+-\d+$/.test(verified.issueId)&&typeof verified.projectId==='string'&&verified.projectId,'AUTH','The Verified PMON Task Binding Changed.');const target={instanceOrigin:verified.instanceOrigin,projectId:verified.projectId,issueId:verified.issueId};
     if(!manual&&!this.engine.automaticSyncEnabled)break;
     if(!await this.verifyFiles(entry,entry.uploads,budget))break;
     entry=this.engine.state.mapPackages[id];
     if(entry.status==='assets'){
      const baseline=this.maps.store.load(entry.key,entry.revision);ensure(sha(baseline.documentBytes)===entry.baseDocumentHash,'INTEGRITY','The Frozen Package Baseline Changed.');const prepared=inspectMapPackage(baseline,{selection:entry.selection});
      const assets=entry.uploads.filter(f=>['asset','baseline'].includes(f.role)).flatMap(f=>f.assetIds.map(assetId=>({assetId,sha256:f.hash,bytes:f.bytes,mime:f.mime,location:{...target,attachmentId:f.receipt.id}})));
      const built=buildMapPackage(prepared,{packageId:entry.packageId,version:entry.version,assets}),hash=await this.retain(built.bytes),file={...fileInfo(null,hash,built.bytes.length,'application/json',built.name,'package'),opId:randomUUID()};
      await this.enqueue([file],entry,s=>{const e=s.mapPackages[id];ensure(e.status==='assets','CONFLICT','The Package Phase Changed.');e.status='package';e.packageHash=hash;e.target=target;});if(this.engine.automaticSyncEnabled)this.engine.schedule();
     }else if(entry.status==='package'){
      ensure(same(entry.target,target),'AUTH','The Bound Task or Project Changed.');const file=entry.uploads.find(f=>f.role==='package');
      const binding=seal({format:'RDXTaskBinding/1',bindingId:'package:binding-'+id,package:{packageId:entry.packageId,version:entry.version,sha256:entry.packageHash},task:{...target,attachmentId:file.receipt.id},dispatch:'none'});validateShape(binding,'binding');
      const bytes=Buffer.from(JSON.stringify(binding,null,2)+'\n'),hash=await this.retain(bytes),upload={...fileInfo(null,hash,bytes.length,'application/json',packageName(entry.packageId,entry.version,'binding.json'),'binding'),opId:randomUUID()};
      await this.enqueue([upload],entry,s=>{const e=s.mapPackages[id];ensure(e.status==='package','CONFLICT','The Binding Phase Changed.');e.status='binding';e.binding=binding;});if(this.engine.automaticSyncEnabled)this.engine.schedule();
     }else if(entry.status==='binding'){
      ensure(same(entry.target,target),'AUTH','The Bound Task or Project Changed.');await this.finalInventory(entry);await this.update(id,e=>{e.status='attached';e.attachedAt=new Date().toISOString();delete e.error;});this.changed();break;
     }else ensure(false,'RECOVERY','Unknown Package Delivery Phase.');
    }
   }catch(error){if(!this.paused)await this.update(id,e=>{e.error=error.message;});}
  }});
  const task=run();this.running=task;try{await task;}finally{if(this.running===task)this.running=null;}return this.status();
 }
 async dispatch(route,input={},context=null){
  ensure(typeof route==='string'&&route.startsWith('/api/packages/')&&input&&JSON.stringify(input).length<=1024*1024,'INVALID','Invalid Map Package Request.');
  ensure(context===this.maps.active,'CONFLICT','The Open Map Changed. Reopen Package Map Changes.');
  if(route.endsWith('/status'))return {entries:this.status()};
  if(route.endsWith('/deliver')){ensure(input.approved===true,'REVIEW_REQUIRED','Confirm the One-Time Package Delivery Attempt.');await this.cycle(true);return {entries:this.status()};}
  return this.maps.execute(async()=>{
   ensure(!this.paused,'NOT_READY','Map Packages Are Paused for Desktop Lifecycle Work.');
   if(route.endsWith('/details'))return this.details(input.id);
   if(route.endsWith('/navigation'))return this.navigation(input);
   if(route.endsWith('/preview'))return (await this.preview(input)).response;
   if(route.endsWith('/stage'))return this.stage(input);
   if(route.endsWith('/download')){const entry=this.engine.state.mapPackages?.[input.id];ensure(entry?.packageHash,'NOT_READY','The Exact JSON Package Is Available After Its Assets Are Verified.');const bytes=this.blob(entry.packageHash);this.download={id:randomUUID(),bytes,expires:Date.now()+15*60*1000};return {id:this.download.id,bytes:bytes.length,sha256:sha(bytes),name:packageName(entry.packageId,entry.version)};}
   if(route.endsWith('/download-chunk')){const d=this.download;ensure(d&&Date.now()<d.expires&&input.id===d.id&&Number.isSafeInteger(input.offset)&&input.offset>=0&&input.offset<d.bytes.length,'INVALID','Invalid Package Download Offset.');return {base64:d.bytes.subarray(input.offset,input.offset+CHUNK).toString('base64')};}
   if(route.endsWith('/download-end')){ensure(this.download?.id===input.id,'INVALID','Unknown Package Download.');this.download=null;return true;}
   ensure(false,'UNSUPPORTED','Unknown Map Package Command.');
  });
 }
}

import {canonical,sha,same,parseJSON} from '../content/contracts.mjs';
import {unpackRdx} from './container.mjs';
import {validateMapPackage} from './map-package.mjs';
import {ensure} from './limits.mjs';
import {returnMetadata} from './return-reader.mjs';

const FILE=50*1024*1024,CYCLE=64*1024*1024,MAX_ROWS=4096;
const taskKey=e=>{const task={...e.binding.task};delete task.attachmentId;return sha(canonical(task));},observation=(task,meta)=>sha(canonical({task,meta}));
const candidate=a=>/\.rdx$/i.test(a.name)||a.mimeType.toLowerCase()==='application/x-rdx';
const cleanError=e=>({NETWORK:'YouTrack Return Discovery Is Unavailable. Retry When Connected.',AUTH:'The Linked Task or Return Identity Needs Review.',CONFLICT:'The Returned Attachment Changed. Check Again.',LIMIT:'Returned File Discovery Reached Its Safety Limit.',INTEGRITY:'The Returned File Could Not Be Verified.'}[e.code]||'Returned File Discovery Was Interrupted. Check Again; Saved Files Are Retained.');

// This journal stages bytes and evidence only. It has no map/plan mutation,
// YouTrack write, task-status or human-verification API. U25 owns application.
export class ReturnDiscovery{
 constructor({maps,packages,inventory,bytes,enabled=()=>true,changed=()=>{},now=()=>Date.now(),fault=()=>{}}){Object.assign(this,{maps,packages,inventory,bytes,enabled,changed,now,fault,paused:false,running:null,opened:false});}
 async open(){
  await this.maps.open();if(this.opened)return;this.maps.store.db.exec(`
   CREATE TABLE IF NOT EXISTS return_tasks(key TEXT PRIMARY KEY,value BLOB NOT NULL);
   CREATE TABLE IF NOT EXISTS return_files(id TEXT PRIMARY KEY,task TEXT NOT NULL,value BLOB NOT NULL);
   CREATE TABLE IF NOT EXISTS return_versions(file TEXT NOT NULL,hash TEXT NOT NULL,value BLOB NOT NULL,PRIMARY KEY(file,hash));
   CREATE TABLE IF NOT EXISTS return_assessments(file TEXT NOT NULL,hash TEXT NOT NULL,digest TEXT NOT NULL,value BLOB NOT NULL,PRIMARY KEY(file,hash,digest));`);this.opened=true;
 }
 get(table,id){const row=this.maps.store.db.prepare('SELECT value FROM '+table+' WHERE '+(table==='return_files'?'id':'key')+'=?').get(id);return row?parseJSON(Buffer.from(row.value)):null;}
 put(table,id,value,task){this.dirty=true;const query=table==='return_files'?'INSERT OR REPLACE INTO return_files VALUES(?,?,?)':'INSERT OR REPLACE INTO return_tasks VALUES(?,?)';this.maps.store.db.prepare(query).run(...(task?[id,task,Buffer.from(canonical(value))]:[id,Buffer.from(canonical(value))]));}
 files(task){return this.maps.store.db.prepare('SELECT id,value FROM return_files WHERE task=? ORDER BY id').all(task).map(r=>({id:r.id,...parseJSON(Buffer.from(r.value))}));}
 versions(){return this.maps.store.db.prepare('SELECT file,hash,value FROM return_versions ORDER BY file,hash').all().map(r=>({file:r.file,hash:r.hash,...parseJSON(Buffer.from(r.value))}));}
 pause(){this.paused=true;this.controller?.abort();}
 resume(){this.paused=false;}
 async stop(){this.pause();await this.running;}
 check(manual){this.controller.signal.throwIfAborted();ensure(!this.paused&&(manual||this.enabled()),'CANCELLED','Return Discovery Is Paused.');}
 async cycle(manual=false){
  if(this.paused||!manual&&!this.enabled())return {skipped:true};if(this.running)return this.running;
  const run=async()=>{
   this.dirty=false;const linked=this.packages.entries().filter(e=>e.binding&&e.issueId);if(!linked.length)return {checked:0,downloaded:0};await this.open();this.controller=new AbortController();
   const tasks=new Map();for(const e of linked){const key=taskKey(e);if(!tasks.has(key))tasks.set(key,e);}
   const queue=[...tasks].filter(([key])=>manual||(this.get('return_tasks',key)?.nextAt||0)<=this.now()).sort(([a],[b])=>(this.get('return_tasks',a)?.checkedAt||0)-(this.get('return_tasks',b)?.checkedAt||0)||a.localeCompare(b));
   let checked=0,downloaded=0,budget=CYCLE;for(const [key,entry]of queue.slice(0,4)){
    this.check(manual);const previous=this.get('return_tasks',key)||{checkedAt:0,attempts:0};this.put('return_tasks',key,{...previous,status:'checking',attempts:previous.attempts+1});
    try{
     let list=await this.inventory(entry,this.controller.signal);this.check(manual);
     const expected={...entry.binding.task};delete expected.attachmentId;ensure(same(list.target,expected),'AUTH','Linked Task Identity Changed.');
     ensure(Array.isArray(list.attachments)&&list.attachments.length<=10000,'INTEGRITY','Incomplete Return Inventory.');let all=list.attachments.map(returnMetadata);const taskEntries=linked.filter(e=>taskKey(e)===key),pins=taskEntries.flatMap(e=>e.uploads||[]).filter(f=>f.verified),match=f=>all.find(a=>a.id===f.receipt?.id);
     // YouTrack may finish image metadata after the original upload response.
     // Re-pin only identical, hash-verified bytes via the package owner; missing,
     // renamed or resized files retain their ordinary hard review boundary.
     if(typeof this.packages.finalInventory==='function'&&pins.every(f=>{const a=match(f);return a&&a.name===f.name&&a.size===f.bytes;})&&pins.some(f=>Number.isSafeInteger((f.verifiedReceipt||f.receipt).updated)&&match(f).updated!==(f.verifiedReceipt||f.receipt).updated)){
      for(const e of taskEntries)await this.packages.finalInventory(e);this.check(manual);const fresh=await this.inventory(entry,this.controller.signal);ensure(same(fresh.target,expected)&&fresh.actor?.id===list.actor?.id&&Array.isArray(fresh.attachments)&&fresh.attachments.length<=10000,'AUTH','The Task Changed During Pinned File Verification.');list=fresh;all=fresh.attachments.map(returnMetadata);
     }
     const ids=new Set();for(const a of all){ensure(!ids.has(a.id),'INTEGRITY','Repeated Return Inventory Entry.');ids.add(a.id);}
     const selected=all.filter(candidate);ensure(selected.length<=512,'LIMIT','Too Many Returned File Candidates on This Task.');const present=new Set(selected.map(m=>observation(key,m))),prior=this.files(key),newCount=selected.filter(m=>!prior.some(r=>r.id===observation(key,m))).length;
     ensure(this.maps.store.db.prepare('SELECT count(*) AS n FROM return_files').get().n+newCount<=MAX_ROWS,'LIMIT','Return Discovery Journal Is Full; No Evidence Was Discarded.');
     this.maps.store.transaction(()=>{
      for(const row of prior)if(!present.has(row.id))this.put('return_files',row.id,{...row,present:false,missingAt:row.missingAt||this.now()},key);
      for(const meta of selected){const id=observation(key,meta),old=this.get('return_files',id);this.put('return_files',id,{...old,meta,present:true,missingAt:old?.missingAt||null,firstSeen:old?.firstSeen||this.now(),status:old?.status||'pending',nextAt:old?.nextAt||0,actor:list.actor?.id||null},key);}
      const pinIssues={};for(const original of linked.filter(e=>taskKey(e)===key)){const e=this.packages.entries().find(e=>e.id===original.id)||original;for(const file of e.uploads||[]){if(!file.verified)continue;const actual=all.find(a=>a.id===file.receipt?.id),pin=file.verifiedReceipt||file.receipt;if(!actual||actual.size!==file.bytes||actual.name!==file.name||Number.isSafeInteger(pin.updated)&&actual.updated!==pin.updated)pinIssues[e.id]='A Pinned Package, Context or Asset Attachment Is Missing or Changed.';}}
      this.put('return_tasks',key,{checkedAt:this.now(),nextAt:this.now()+60000,status:'checked',attempts:0,candidates:selected.length,pinIssues,error:null});
     });checked++;
     // Oldest unfinished/recheck-due observations run first, so a large task
     // cannot starve its later files. Failed downloads back off independently.
     const work=this.files(key).filter(r=>r.present&&(manual||r.nextAt<=this.now())).sort((a,b)=>(a.checkedAt||0)-(b.checkedAt||0)||a.id.localeCompare(b.id));
     for(const row of work){
      this.check(manual);if(downloaded>=8)break;
      if(row.meta.size>FILE){this.put('return_files',row.id,{...row,status:'oversized',error:'Returned RDX Exceeds 50 MiB. Retained on YouTrack for Review.',checkedAt:this.now(),nextAt:this.now()+86400000},key);continue;}
      if(row.meta.size>budget)continue;budget-=row.meta.size;downloaded++;
      try{
       await this.maps.store.capacity(row.meta.size*2+65536);this.put('return_files',row.id,{...row,status:'downloading',attempts:(row.attempts||0)+1,nextAt:this.now()+60000},key);this.fault('before-download');
       const raw=await this.bytes(entry,row.meta,this.controller.signal);this.check(manual);ensure(Buffer.isBuffer(raw)&&raw.length===row.meta.size&&raw.length<=FILE,'INTEGRITY','Returned Bytes Differ From the Inventory.');
       const hash=sha(raw);let facts;try{facts=await this.validate(raw,linked.filter(e=>taskKey(e)===key));}catch(e){facts={validationError:e.code==='AUTH'?'Returned Map Does Not Match a Local Fixed Package or Its Authorized Scope.':'Returned RDX Failed Format, Integrity or Resource Validation. Retained for Review.'};}this.check(manual);this.fault('before-stage');
       this.maps.store.transaction(()=>{
        const blob=this.maps.store.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(hash);ensure(!blob||Buffer.from(blob.bytes).equals(raw),'INTEGRITY','Retained Return Bytes Changed.');if(!blob)this.maps.store.db.prepare('INSERT INTO blobs VALUES(?,?)').run(hash,raw);
        const old=this.maps.store.db.prepare('SELECT value FROM return_versions WHERE file=? AND hash=?').get(row.id,hash),digest=sha(canonical(facts));
        ensure(old||this.maps.store.db.prepare('SELECT count(*) AS n FROM return_versions').get().n<8192,'LIMIT','Retained Return Version Limit Reached.');
        if(!this.maps.store.db.prepare('SELECT 1 FROM return_assessments WHERE file=? AND hash=? AND digest=?').get(row.id,hash,digest)){
         ensure(this.maps.store.db.prepare('SELECT count(*) AS n FROM return_assessments').get().n<16384,'LIMIT','Return Validation History Limit Reached.');
         this.maps.store.db.prepare('INSERT INTO return_assessments VALUES(?,?,?,?)').run(row.id,hash,digest,Buffer.from(canonical({...facts,at:this.now()})));
        }
        this.maps.store.db.prepare('INSERT OR REPLACE INTO return_versions VALUES(?,?,?)').run(row.id,hash,Buffer.from(canonical({...facts,stagedAt:old?parseJSON(Buffer.from(old.value)).stagedAt:this.now(),bytes:raw.length})));
        this.put('return_files',row.id,{...row,status:'retained',hash,checkedAt:this.now(),nextAt:this.now()+86400000,attempts:0,error:null},key);this.fault('before-stage-commit');
       });this.fault('after-stage');
      }catch(e){if(this.controller.signal.aborted)throw e;this.put('return_files',row.id,{...this.get('return_files',row.id),status:'retry',error:cleanError(e),checkedAt:this.now(),nextAt:this.now()+Math.min(3600000,60000*2**Math.min(row.attempts||0,6))},key);}
     }
    }catch(e){if(this.controller.signal.aborted)throw e;this.put('return_tasks',key,{...previous,status:'retry',checkedAt:this.now(),attempts:previous.attempts+1,error:cleanError(e),nextAt:this.now()+Math.min(3600000,60000*2**Math.min(previous.attempts,6))});}
   }return {checked,downloaded,remainingTasks:Math.max(0,queue.length-checked)};
  };
  const task=run().catch(e=>{if(e.name==='AbortError'||e.code==='CANCELLED')return {paused:true};throw e;});this.running=task;try{return await task;}finally{if(this.running===task)this.running=null;this.controller=null;if(this.dirty)this.changed();}
 }
 async validate(raw,entries){
  const value=await unpackRdx(raw,{signal:this.controller.signal,limits:{stored:FILE,decoded:128*1024*1024,entries:2048}}),d=value.document,r=d.result;
  ensure(d.kind==='map'&&d.origin.role==='agent-result'&&r?.requiresHumanTesting===true,'AUTH','This Is Not an Agent-Returned Map.');
  const entry=entries.find(e=>same(e.binding,r.taskBinding));ensure(entry,'AUTH','No Local Fixed Package Matches This Return.');
  const {prepared}=this.packages.frozen(entry.id),file=entry.uploads.find(f=>f.role==='package'),packet=this.packages.blob(file.hash);ensure(sha(packet)===entry.packageHash,'INTEGRITY','Pinned Package Bytes Changed.');const pkg=validateMapPackage(parseJSON(packet));
  ensure(d.datasetId===entry.datasetId&&d.documentId===prepared.document.documentId&&d.scope.mapRecordId===entry.mapRecordId&&same(r.baseDocument,pkg.baseDocument),'AUTH','Returned Map or Base Differs From the Fixed Package.');
  ensure(!entry.contextOnly,'AUTH','A Context-Only Package Does Not Authorize ROM Changes.');
  for(const g of r.groups){const expected=pkg.groups.find(x=>x.groupId===g.groupId);ensure(expected&&g.outcomes.every(o=>expected.planDigests.includes(o.planDigest)&&pkg.requests.some(p=>p.digest===o.planDigest&&p.planId===o.planId)),'AUTH','Returned Outcomes Exceed This Fixed Package.');}
  return {entryId:entry.id,resultId:r.resultId,revision:d.revision,requiresHumanTesting:true,groups:r.groups.length};
 }
 status(entry){
  if(!this.opened||!entry.binding)return {checkedAt:null,error:null,files:[],application:'not-enabled'};const key=taskKey(entry),task=this.get('return_tasks',key),files=this.files(key),versions=this.versions(),output=[];
  for(const row of files){const own=versions.filter(v=>v.file===row.id);if(!own.length){output.push({name:row.meta.name,attachmentId:row.meta.id,state:row.status==='oversized'?'needs-review':'pending',reason:row.error||'Waiting for a Complete Download.',present:row.present});continue;}
   for(const v of own){if(v.entryId&&v.entryId!==entry.id)continue;let state='staged',reason='Validated and Retained; Awaiting Application Checks.';
    const a=this.packages.authorization(entry),other=files.some(f=>f.id!==row.id&&f.meta.id===row.meta.id),variants=versions.filter(x=>x.file===row.id),conflict=v.resultId&&versions.some(x=>x.resultId===v.resultId&&x.revision!==v.revision);
    if(v.validationError){state='needs-review';reason=v.validationError;}
    else if(!row.present||row.missingAt||other||variants.length>1){state='needs-review';reason='The Attachment Was Removed, Replaced or Changed; Retained Bytes Are Preserved.';}
    else if(conflict){state='needs-review';reason='This Result Identity Has Conflicting Versions. Both Are Retained.';}
    else if(task?.pinIssues?.[entry.id]){state='needs-review';reason=task.pinIssues[entry.id];}
    else if(a.state!=='authorized'){state='needs-review';reason='The Exact Package Is '+a.state+'. Returned Work Is Held for Review.';}
    else if(a.event.observedAttachments.includes(row.meta.id)){state='needs-review';reason='This File Already Existed When Work Was Authorized. Review Is Required.';}
    else if(!row.meta.author?.id||row.meta.author.id!==a.event.actor.id||row.actor!==a.event.actor.id){state='needs-review';reason='The Server-Reported Account Attribution Differs or Is Unavailable.';}
    else if(!a.ready||a.cloudPending||a.localOnly){state='deferred';reason='Waiting for Current, Conflict-Free Authorization Metadata.';}
    else if(task?.status!=='checked'||row.status==='retry'||row.status==='downloading'){state='deferred';reason='A Fresh Task or Attachment Check Is Pending; Retained Bytes Are Preserved.';}
    output.push({name:row.meta.name,attachmentId:row.meta.id,sha256:v.hash,resultId:v.resultId||null,revision:v.revision||null,state,reason,present:row.present,requiresHumanTesting:v.requiresHumanTesting===true,stagedAt:v.stagedAt});
   }
  }
  const unique=new Map(),rank={staged:0,pending:1,deferred:2,'needs-review':3};
  for(const row of output){const id=row.sha256||'pending:'+row.attachmentId,old=unique.get(id);if(!old){unique.set(id,{...row,attachmentIds:[row.attachmentId],copies:1});continue;}old.copies++;if(!old.attachmentIds.includes(row.attachmentId))old.attachmentIds.push(row.attachmentId);if(rank[row.state]>rank[old.state]){old.state=row.state;old.reason=row.reason;}}
  return {checkedAt:task?.checkedAt||null,error:task?.error||null,files:[...unique.values()],application:'not-enabled'};
 }
}

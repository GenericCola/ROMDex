import fs from 'node:fs/promises';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {canonical,parseJSON,sha,same} from '../content/contracts.mjs';
import {packRdx,unpackRdx,readRdxFile,readBoundedFile} from './container.mjs';
import {documentRevision,validateDocument} from './document.mjs';
import {ensure,LIMITS} from './limits.mjs';
import {directory,regular,takeLock,releaseLock,writeDurable,flushDirectory,inside} from './managed-files.mjs';

const APPLICATION_ID=0x52445831;
export const documentKey=doc=>sha(canonical({datasetId:doc.datasetId,documentId:doc.documentId}));
const validKey=key=>ensure(typeof key==='string'&&/^[a-f0-9]{64}$/.test(key),'INVALID','Invalid Managed RDX Key.');

// A local document checkpoint journal, with no transport, credentials or backend
// binding authority. The desktop service will own one instance when integrated.
export class ManagedDocuments{
 static async open({dataDirectory,maxBytes=2*1024*1024*1024,fault=()=>{},autoRecover=true}={}){
  ensure(typeof dataDirectory==='string'&&dataDirectory.length>0,'PATH','Choose the Application Data Folder.');
  ensure(Number.isSafeInteger(maxBytes)&&maxBytes>0&&maxBytes<=4*1024*1024*1024,'LIMIT','Invalid Managed RDX Storage Limit.');
  const root=await directory(path.join(path.resolve(dataDirectory),'RDX')),marker=path.join(root,'store.json');
  if(!await regular(marker,{optional:true})){
   ensure((await fs.readdir(root)).length===0,'PATH','Unrecognized RDX Data Folder; Nothing Was Replaced.');
   await writeDurable(marker,Buffer.from('{"format":"RDXManagedStore/1"}'));await flushDirectory(root);
  }else ensure(same(parseJSON(await readBoundedFile(marker,1024)),{format:'RDXManagedStore/1'}),'UNSUPPORTED','Unsupported RDX Store.');
  let lock,db;try{
   lock=await takeLock(root);await directory(path.join(root,'working'));await directory(path.join(root,'previous'));await directory(path.join(root,'recovery'));
   const file=path.join(root,'documents.sqlite'),prior=await regular(file,{optional:true});
   for(const suffix of ['-wal','-shm','-journal'])await regular(file+suffix,{optional:true});
   db=new DatabaseSync(file);
   if(prior){ensure(db.prepare('PRAGMA application_id').get().application_id===APPLICATION_ID&&db.prepare('PRAGMA user_version').get().user_version===1,'UNSUPPORTED','Unknown RDX Journal; Nothing Was Migrated.');const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(v=>v.name);ensure(['blobs','versions','documents','journal'].every(t=>tables.includes(t)),'RECOVERY','The Established RDX Journal Schema Is Incomplete.');}
   else db.exec('PRAGMA application_id=1380210737; PRAGMA user_version=1;');
   db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=2000;');
   ensure(db.prepare('PRAGMA quick_check').get().quick_check==='ok','RECOVERY','The RDX Journal Needs Recovery.');
   db.exec(`CREATE TABLE IF NOT EXISTS blobs(hash TEXT PRIMARY KEY, bytes BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS versions(key TEXT NOT NULL, revision TEXT NOT NULL, document BLOB NOT NULL, byte_hash TEXT NOT NULL, PRIMARY KEY(key,revision));
    CREATE TABLE IF NOT EXISTS documents(key TEXT PRIMARY KEY, dataset_id TEXT NOT NULL, document_id TEXT NOT NULL, namespace TEXT NOT NULL, kind TEXT NOT NULL, head TEXT NOT NULL, checkpoint_revision TEXT, checkpoint_hash TEXT, needs_testing INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS journal(id TEXT PRIMARY KEY, key TEXT NOT NULL, prior_revision TEXT, next_revision TEXT NOT NULL, reason TEXT NOT NULL, source_hash TEXT, delta BLOB NOT NULL, state TEXT NOT NULL, candidate_hash TEXT, error TEXT);
    CREATE UNIQUE INDEX IF NOT EXISTS one_pending_checkpoint ON journal(key) WHERE state='pending';`);
   const store=new ManagedDocuments({root,db,lock,maxBytes,fault});if(autoRecover)await store.recover();return store;
  }catch(error){db?.close();if(lock)await releaseLock(lock);throw error;}
 }
 constructor({root,db,lock,maxBytes,fault}){Object.assign(this,{root,db,lock,maxBytes,fault,busy:false,closed:false});}
 row(key){ensure(!this.closed,'CLOSED','The RDX Store Is Closed.');validKey(key);const row=this.db.prepare('SELECT * FROM documents WHERE key=?').get(key);ensure(row,'NOT_FOUND','Managed RDX Document Not Found.');return row;}
 file(key){validKey(key);return path.join(this.root,'working',key+'.rdx');}
 transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const result=fn();this.db.exec('COMMIT');return result;}catch(e){try{this.db.exec('ROLLBACK');}catch{}throw e;}}
 async exclusive(fn){ensure(!this.closed,'CLOSED','The RDX Store Is Closed.');ensure(!this.busy,'BUSY','Another Managed RDX Operation Is Active.');this.busy=true;try{return await fn();}finally{this.busy=false;}}
 load(key,revision){
  const v=this.db.prepare('SELECT * FROM versions WHERE key=? AND revision=?').get(key,revision);ensure(v,'RECOVERY','A Journaled RDX Revision Is Missing.');
  const documentBytes=Buffer.from(v.document);ensure(sha(documentBytes)===v.byte_hash,'RECOVERY','Journaled RDX Document Failed Verification.');const doc=parseJSON(documentBytes),blobs=new Map();
  ensure(doc.revision===revision&&documentRevision(doc)===revision&&documentKey(doc)===key,'RECOVERY','Journaled RDX Identity Differs.');
  for(const a of doc.assetInventory){if(blobs.has(a.sha256))continue;const row=this.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(a.sha256);ensure(row,'RECOVERY','A Journaled RDX Asset Is Missing.');const bytes=Buffer.from(row.bytes);ensure(sha(bytes)===a.sha256,'RECOVERY','Journaled RDX Asset Failed Verification.');blobs.set(a.sha256,bytes);}
  return {document:doc,documentBytes,blobs};
 }
 async capacity(additional){
  let bytes=additional,count=0;const walk=async dir=>{for(const entry of await fs.readdir(dir,{withFileTypes:true})){
   ensure(++count<=30000,'LIMIT','Managed RDX File Count Limit Exceeded.');const file=path.join(dir,entry.name),stat=await fs.lstat(file);ensure(!stat.isSymbolicLink(),'PATH','RDX Data Cannot Contain Links.');
   if(stat.isDirectory())await walk(file);else{ensure(stat.isFile(),'PATH','Unexpected RDX Data Entry.');bytes+=stat.size;}ensure(bytes<=this.maxBytes,'LIMIT','Managed RDX Storage Limit Reached; No History Was Discarded.');
  }};await walk(this.root);ensure(bytes<=this.maxBytes,'LIMIT','Managed RDX Storage Limit Reached.');
 }
 pending(key){return this.db.prepare("SELECT * FROM journal WHERE key=? AND state='pending'").get(key);}
 knownPrior(row,revision){
  let cursor=row.head;const seen=new Set();while(cursor&&!seen.has(cursor)&&seen.size<=10000){
   if(cursor===revision)return true;seen.add(cursor);cursor=this.db.prepare("SELECT prior_revision FROM journal WHERE key=? AND next_revision=? AND reason='local-edit'").get(row.key,cursor)?.prior_revision;
  }return false;
 }
 async status(key){
  const row=this.row(key),pending=this.pending(key);let saved=false,error=pending?.error||null;
  if(!pending&&row.checkpoint_revision===row.head)try{const actual=await this.checkpointValue(row);saved=actual.document.revision===row.head&&actual.containerSha256===row.checkpoint_hash;}catch(e){error=e.message;}
  return {key,datasetId:row.dataset_id,documentId:row.document_id,namespace:row.namespace,kind:row.kind,revision:row.head,checkpointRevision:row.checkpoint_revision,path:this.file(key),saved,checkpointPending:!saved,error,requiresHumanTesting:!!row.needs_testing,humanVerification:'not-established',sync:'unbound-local'};
 }
 async checkpointValue(row){await regular(this.file(row.key));const value=await readRdxFile(this.file(row.key));ensure(documentKey(value.document)===row.key,'REVIEW_REQUIRED','Managed RDX File Identity Changed.');return value;}
 async view(key){const row=this.row(key),loaded=this.load(key,row.head);return {...loaded,status:await this.status(key)};}
 async list(){const result=[];for(const row of this.db.prepare('SELECT key FROM documents ORDER BY key').all())result.push(await this.status(row.key));return result;}
 async ingest(file,options={}){return this.exclusive(async()=>{
  const value=await readRdxFile(file,options),key=documentKey(value.document),existing=this.db.prepare('SELECT * FROM documents WHERE key=?').get(key);
  if(existing){ensure(existing.head===value.document.revision,'REVIEW_REQUIRED','An Existing Document Needs an Update Preview; It Was Not Replaced.');return {...await this.status(key),alreadyPresent:true};}
  return this.commit(value,{key,reason:'local-import',prior:null,sourceHash:value.containerSha256,options});
 });}
 async save(key,{documentBytes,blobs,expectedRevision,...options}={}){return this.exclusive(async()=>{
  const row=this.row(key);ensure(row.head===expectedRevision,'CONFLICT','The Managed RDX Baseline Changed. Reload Before Saving.');ensure(!this.pending(key),'RECOVERY','Finish the Pending RDX Checkpoint Before Editing Again.');
  // Draft bytes come from an explicit local edit, not the untrusted RDX import
  // path. Only the outer revision is recomputed; nested artifact seals must pass.
  const before=this.load(key,row.head),doc=parseJSON(documentBytes),nextBlobs=new Map(blobs||[]);
  ensure(documentKey(doc)===key&&doc.namespace===row.namespace&&doc.kind===row.kind,'CONFLICT','A Local Save Cannot Change RDX Identity or Workspace.');
  ensure(doc.kind!=='map'||doc.scope?.mapRecordId===before.document.scope.mapRecordId,'CONFLICT','A Local Save Cannot Replace the Primary Map Identity.');
  if(row.needs_testing)ensure(doc.origin?.role==='agent-result'&&same(doc.result,before.document.result),'REVIEW_REQUIRED','Pending Agent Result Evidence and Human Testing Cannot Be Cleared by Editing or Export.');
  ensure(Array.isArray(doc.assetInventory)&&Array.isArray(doc.content?.history)&&Array.isArray(doc.parents),'INVALID','Incomplete Local RDX Draft.');
  const assets=new Map(doc.assetInventory.map(a=>[a.assetId,a]));ensure(assets.size===doc.assetInventory.length,'INVALID','Duplicate RDX Asset Identity.');
  for(const a of before.document.assetInventory){if(assets.has(a.assetId))ensure(same(assets.get(a.assetId),a),'CONFLICT','An Existing RDX Asset Identity Has Different Bytes.');else{doc.assetInventory.push(a);assets.set(a.assetId,a);}if(!nextBlobs.has(a.sha256))nextBlobs.set(a.sha256,before.blobs.get(a.sha256));}
  for(const h of before.document.content.history)if(!doc.content.history.some(v=>same(v,h)))doc.content.history.push(h);
  const unchanged={...doc,revision:before.document.revision};if(same(unchanged,before.document)){validateDocument(Buffer.from(canonical(unchanged)),{blobs:nextBlobs});return {...await this.status(key),unchanged:true};}
  if(!row.needs_testing)doc.origin={...doc.origin,role:'user',generator:'ROMDex Managed Documents/1'};
  const baseHash=sha(before.documentBytes),assetId='history:rdx-'+baseHash;
  if(!assets.has(assetId))doc.assetInventory.push({assetId,sha256:baseHash,bytes:before.documentBytes.length,mime:'application/json',purpose:'history'});
  nextBlobs.set(baseHash,before.documentBytes);
  if(!doc.content.history.some(h=>h.sha256===baseHash))doc.content.history.push({sha256:baseHash,mediaType:'application/json',schema:'RDXDocument/1',purpose:'Exact Prior Managed Document'});
  doc.parents=[...new Set([...doc.parents,row.head])];doc.revision=documentRevision(doc);
  const packed=await packRdx(Buffer.from(canonical(doc)),nextBlobs,options),value=await unpackRdx(packed,options);
  return this.commit(value,{key,reason:'local-edit',prior:row.head,sourceHash:null,options});
 });}
 async commit(value,{key,reason,prior,sourceHash,options}){
  const d=value.document,id=randomUUID(),before=prior?this.load(key,prior).document:null;
  const delta={beforeRevision:prior,afterRevision:d.revision,changedRoots:Object.keys(d).filter(k=>!before||!same(d[k],before[k])),assetHashes:d.assetInventory.map(a=>a.sha256),publishState:'unbound-local'};
  await this.capacity(value.documentBytes.length+value.manifest.entries.reduce((n,e)=>n+e.storedBytes,0)*2+[...value.blobs.values()].reduce((n,b)=>n+b.length,0));this.fault('before-journal',{key});
  this.transaction(()=>{
   for(const [hash,bytes]of value.blobs){const existing=this.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(hash);if(existing)ensure(Buffer.from(existing.bytes).equals(bytes),'RECOVERY','A Retained RDX Blob Changed.');else this.db.prepare('INSERT INTO blobs VALUES(?,?)').run(hash,bytes);}
   this.db.prepare('INSERT INTO versions VALUES(?,?,?,?)').run(key,d.revision,value.documentBytes,sha(value.documentBytes));
   if(prior){const result=this.db.prepare('UPDATE documents SET head=?,needs_testing=max(needs_testing,?) WHERE key=? AND head=?').run(d.revision,value.requiresHumanTesting?1:0,key,prior);ensure(result.changes===1,'CONFLICT','The RDX Baseline Changed.');}
   else this.db.prepare('INSERT INTO documents VALUES(?,?,?,?,?,?,NULL,NULL,?)').run(key,d.datasetId,d.documentId,d.namespace,d.kind,d.revision,value.requiresHumanTesting?1:0);
   this.db.prepare("INSERT INTO journal VALUES(?,?,?,?,?,?,?,'pending',NULL,NULL)").run(id,key,prior,d.revision,reason,sourceHash,Buffer.from(canonical(delta)));
   this.fault('before-journal-commit',{key,id});
  });
  try{this.fault('after-journal',{key,id});await this.checkpoint(key,options);}catch(error){this.recordError(key,error);throw error;}
  return this.status(key);
 }
 recordError(key,error){try{this.db.prepare("UPDATE journal SET error=? WHERE key=? AND state='pending'").run(String(error.message).slice(0,4096),key);}catch{} }
 async checkpoint(key,options={}){
  const row=this.row(key),intent=this.pending(key);ensure(intent&&intent.next_revision===row.head,'RECOVERY','The RDX Checkpoint Intent Differs From the Journal.');
  const target=this.file(key),existing=await regular(target,{optional:true});let previousRevision;
  if(existing){
   const actual=await this.checkpointValue(row);
   if(actual.document.revision===row.head){this.finishCheckpoint(key,intent,actual.containerSha256);return;}
   ensure(this.knownPrior(row,actual.document.revision),'REVIEW_REQUIRED','The Working RDX Was Changed Outside the Journal. Both Versions Are Retained.');previousRevision=actual.document.revision;
  }
  const stage=path.join(this.root,'working',key+'.pending-'+intent.id+'.rdx');let candidate;
  if(await regular(stage,{optional:true}))try{candidate=await readRdxFile(stage,options);ensure(candidate.document.revision===row.head&&documentKey(candidate.document)===key,'RECOVERY','The RDX Staging Identity Differs.');}catch(error){
   if(options.signal?.aborted)throw error;
   await fs.rename(stage,path.join(this.root,'recovery',key+'.incomplete-'+randomUUID()+'.rdx'));candidate=null;
  }
  if(!candidate){
   const loaded=this.load(key,row.head),bytes=await packRdx(loaded.documentBytes,loaded.blobs,options);await this.capacity(bytes.length*2);
   await writeDurable(stage,bytes,{fault:this.fault,signal:options.signal});this.fault('after-stage-write',{key});candidate=await readRdxFile(stage,options);
  }
  ensure(candidate.document.revision===row.head&&documentKey(candidate.document)===key,'RECOVERY','Staged RDX Failed Identity Verification.');
  const stagedHandle=await fs.open(stage,'r+');try{await stagedHandle.sync();}finally{await stagedHandle.close();}
  this.db.prepare('UPDATE journal SET candidate_hash=?,error=NULL WHERE id=?').run(candidate.containerSha256,intent.id);this.fault('after-stage-verify',{key});
  if(existing){
   const actual=await this.checkpointValue(row);ensure(actual.document.revision===previousRevision,'REVIEW_REQUIRED','The Previous RDX Checkpoint Changed.');
   const previous=path.join(this.root,'previous',key+'-'+actual.containerSha256+'.rdx');
   if(await regular(previous,{optional:true}))if(sha(await readBoundedFile(previous,LIMITS.stored))!==actual.containerSha256)await fs.rename(previous,path.join(this.root,'recovery',key+'.incomplete-previous-'+randomUUID()+'.rdx'));
   if(!await regular(previous,{optional:true})){const oldBytes=await readBoundedFile(target,LIMITS.stored);ensure(sha(oldBytes)===actual.containerSha256,'REVIEW_REQUIRED','The Previous RDX Changed While Being Retained.');await writeDurable(previous,oldBytes);}
   ensure(sha(await readBoundedFile(previous,LIMITS.stored))===actual.containerSha256,'RECOVERY','Previous RDX Checkpoint Failed Verification.');
  }
  this.fault('after-previous',{key});
  if(existing){const last=await this.checkpointValue(row);ensure(last.document.revision===previousRevision,'REVIEW_REQUIRED','The Working RDX Changed Before Replacement.');}
  await fs.rename(stage,target);await flushDirectory(path.dirname(target));this.fault('after-replace',{key});
  const verified=await this.checkpointValue(row);ensure(verified.document.revision===row.head&&verified.containerSha256===candidate.containerSha256,'RECOVERY','Replaced RDX Checkpoint Failed Verification.');this.finishCheckpoint(key,intent,verified.containerSha256);
 }
 finishCheckpoint(key,intent,hash){
  this.fault('before-checkpoint-commit',{key});this.transaction(()=>{
   const r=this.db.prepare('UPDATE documents SET checkpoint_revision=head,checkpoint_hash=? WHERE key=? AND head=?').run(hash,key,intent.next_revision);ensure(r.changes===1,'CONFLICT','Checkpoint Head Changed.');
   this.db.prepare("UPDATE journal SET state='complete',candidate_hash=?,error=NULL WHERE id=?").run(hash,intent.id);
  });this.fault('after-checkpoint-commit',{key});
 }
 async recover(key){return this.exclusive(async()=>{
  const rows=key?[this.row(key)]:this.db.prepare('SELECT * FROM documents ORDER BY key').all(),results=[];
  for(const row of rows)try{
   if(!this.pending(row.key)){
    const state=await this.status(row.key);if(state.saved){results.push(state);continue;}
    // Missing or known older checkpoints can be rebuilt from the durable head;
    // unexpected external edits remain a review, never an automatic overwrite.
    this.db.prepare("INSERT INTO journal VALUES(?,?,?,?,?,?,?,'pending',NULL,NULL)").run(randomUUID(),row.key,row.checkpoint_revision,row.head,'checkpoint-repair',null,Buffer.from('{}'));
   }
   await this.checkpoint(row.key);results.push(await this.status(row.key));
  }catch(error){this.recordError(row.key,error);results.push({...await this.status(row.key),error:error.message});}
  return results;
 });}
 async exportFile(key,output,options={}){return this.exclusive(async()=>{
  const row=this.row(key),state=await this.status(key);ensure(state.saved,'RECOVERY','The Latest RDX Checkpoint Is Pending or Changed. Recover It Before Exporting.');
  const destination=path.resolve(output);ensure(!inside(this.root,destination),'PATH','Choose an Export Location Outside Managed RDX Data.');
  const parent=path.dirname(destination);await directory(parent);ensure(!await regular(destination,{optional:true}),'EEXIST','Export Destination Already Exists.');
  const stage=path.join(parent,'.rdx-export-'+randomUUID()+'.pending'),bytes=await readBoundedFile(this.file(key),LIMITS.stored,options.signal);
  const value=await unpackRdx(bytes,options);ensure(value.document.revision===row.head,'CONFLICT','RDX Changed Before Export.');
  this.fault('before-export-write',{key});await writeDurable(stage,bytes,{fault:this.fault,signal:options.signal});
  const checked=await readRdxFile(stage,options);ensure(checked.containerSha256===value.containerSha256&&this.row(key).head===row.head,'CONFLICT','RDX Changed During Export.');
  this.fault('after-export-verify',{key});
  // Exclusive creation also works on filesystems/sandboxes without hard links.
  // Keep the verified stage until destination fsync and readback succeed. A
  // crashed export can leave a partial new file, never a reported successful one.
  await writeDurable(destination,bytes,{fault:this.fault,signal:options.signal});
  const delivered=await readRdxFile(destination,options);ensure(delivered.containerSha256===checked.containerSha256&&this.row(key).head===row.head,'CONFLICT','Export Readback or Current Revision Changed.');
  await fs.unlink(stage);await flushDirectory(parent);
  return {path:destination,revision:row.head,sha256:checked.containerSha256,requiresHumanTesting:!!row.needs_testing,backendWrites:false};
 });}
 async close(){ensure(!this.busy,'BUSY','Wait for the Managed RDX Operation Before Closing.');if(this.closed)return;this.db.exec('PRAGMA wal_checkpoint(FULL)');this.db.close();this.closed=true;await releaseLock(this.lock);}
}

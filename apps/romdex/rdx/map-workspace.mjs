import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {canonical,sha,same,parseJSON} from '../content/contracts.mjs';
import {buildEdit} from '../content/edits.mjs';
import {localDocumentAuthority} from '../content/authorization.mjs';
import {projectNPCDex} from '../content/projection.mjs';
import {viewHeads} from '../content/view-contract.mjs';
import {ManagedDocuments,documentKey} from './managed-store.mjs';
import {mapDomain,previewMapImport} from './map-import.mjs';
import {readRdxFile,readBoundedFile,unpackRdx} from './container.mjs';
import {documentRevision} from './document.mjs';
import {directory,regular} from './managed-files.mjs';
import {ensure,LIMITS} from './limits.mjs';

const CHUNK=512*1024;
export function emptyMapView(){return {active:true,provider:'rdx-local',head:'local:empty',snapshot:{version:2,revision:0,towns:[{id:'local:empty',name:'Import a Map',areas:[],locations:[],characters:[]}],stages:Array.from({length:10},(_,i)=>({id:String.fromCharCode(65+i),name:'Stage '+String.fromCharCode(65+i),event:''})),annotations:{},changePlans:{},history:[],preferences:{gender:'male'},characterImages:{},characterNames:{},contentPreview:{records:[],plans:[],reviews:[],reviewStates:[]}},status:{label:'NPCDex',cloud:false,localCheckpoint:true,connection:'local',automaticRemote:false,pendingWrites:0,attention:false,message:'Import an RDX Map to Work Locally. Existing Synced Content Is Unchanged.'},documentKey:null};}

// Local map owner. All file paths are host-generated; no renderer path, token or
// backend transport is accepted. The cloud provider continues independently.
export class MapWorkspace{
 constructor({dataDirectory,fallback=null,changed=()=>{}}){Object.assign(this,{dataDirectory,fallback,changed,store:null,active:null,upload:null,download:null,busy:false});}
 async open(){if(this.store)return this.store;this.store=await ManagedDocuments.open({dataDirectory:this.dataDirectory});this.store.db.exec('CREATE TABLE IF NOT EXISTS map_ui(key TEXT PRIMARY KEY,value BLOB NOT NULL)');this.active=this.get('active')||null;return this.store;}
 get(key){const row=this.store.db.prepare('SELECT value FROM map_ui WHERE key=?').get(key);return row?parseJSON(Buffer.from(row.value)):null;}
 set(key,value){this.store.db.prepare('INSERT OR REPLACE INTO map_ui VALUES(?,?)').run(key,Buffer.from(canonical(value)));}
 async initialize(){try{await fs.access(path.join(this.dataDirectory,'RDX/store.json'));await this.open();}catch(e){if(e.code!=='ENOENT')throw e;}}
 async close(){await this.task?.catch(()=>{});await this.cancelUpload();this.download=null;if(this.store){await this.store.close();this.store=null;}}
 async view(gender='male'){
  if(!this.active)return {...(this.fallback?await this.fallback.view(gender):emptyMapView()),documentKey:null,position:this.store?this.get('position:native'):null};
  const value=await this.store.view(this.active),domain=mapDomain(value),trusted=new Set(this.get('testing:'+this.active)||[]);
  // Portable claims never establish authenticated human verification.
  domain.reviews=domain.reviews.map(r=>trusted.has(r.digest)?r:{...r,testStatus:'unreviewed'});
  const status=value.status,snapshot={...emptyMapView().snapshot,...projectNPCDex(domain,{revision:this.store.db.prepare('SELECT count(*) AS n FROM journal WHERE key=?').get(this.active).n,gender,assetBytes:h=>value.blobs.get(h)})};
  this.displayShape(snapshot);
  for(const annotation of Object.values(snapshot.annotations))annotation.testStatus='unreviewed';
  for(const binding of snapshot.contentPreview.reviewBindings||[]){const review=viewHeads(domain.reviews).find(r=>r.reviewId===binding.reviewId&&trusted.has(r.digest));if(review&&snapshot.annotations[binding.legacyKey]&&domain.records.find(r=>r.recordId===review.target.recordId)?.revisionId===review.baseline.revisionId)snapshot.annotations[binding.legacyKey].testStatus=review.testStatus;}
  if(!snapshot.contentPreview.nativeTree)for(const v of viewHeads(domain.views)){const record=domain.records.find(r=>r.recordId===v.recordId),field=v.payload.fields?.image,assetId=field?.format==='NPCDexViewImage/1'?field.assetId:field?.dataUrl?.format==='NPCDexViewImage/1'?field.dataUrl.assetId:null;if(!assetId||v.source.recordRevision!==record?.revisionId)continue;const a=domain.assets.find(a=>a.assetId===assetId),image={dataUrl:'data:'+a.mime+';base64,'+value.blobs.get(a.sha256).toString('base64'),name:assetId};for(const town of snapshot.towns)for(const item of [town,...town.locations,...town.areas,...town.areas.flatMap(a=>a.elements),...town.characters])if(item.id===v.recordId&&!item.image)item.image=image;}
  return {active:true,provider:'rdx-local',head:value.document.revision,snapshot,documentKey:this.active,position:this.get('position:'+this.active),readOnly:false,status:{label:'NPCDex · Local RDX',cloud:false,localCheckpoint:status.saved,connection:'local',automaticRemote:false,pendingWrites:0,pending:!status.saved,attention:!status.saved,review:[],message:status.saved?'Saved to the Managed RDX. Not Published to YouTrack.':status.error||'The RDX Checkpoint Needs Recovery.',requiresHumanTesting:true}};
 }
 async dispatch(route,input,context=null){
  ensure(typeof route==='string'&&JSON.stringify(input??null).length<=1024*1024,'INVALID','Invalid RDX Workspace Request.');
  return this.execute(()=>{const writes=input!==undefined&&input!==null;if(writes)ensure(context===this.active,'CONFLICT','The Open Map Changed. Reopen NPCDex Before Editing.');return this.api(route,input);});
 }
 execute(fn){const task=(this.task||Promise.resolve()).catch(()=>{}).then(fn);this.task=task;return task;}
 async checkpoint(){await this.task?.catch(()=>{});if(this.store)this.store.db.exec('PRAGMA wal_checkpoint(FULL)');}
 async api(route,input){
  if(route==='/api/rdx/status'){const documents=this.store?await this.store.list():[];return {active:this.active,documents:documents.filter(d=>d.kind==='map').map(d=>({...d,name:mapDomain(this.store.load(d.key,d.revision)).records.find(r=>r.kind==='map').current.payload.name})),hasSyncedContent:!!this.fallback};}
  if(route==='/api/rdx/position'){await this.open();ensure(input?.position&&Buffer.byteLength(canonical(input.position))<65536,'INVALID','Invalid Map View Position.');this.set('position:'+(this.active||'native'),input.position);return true;}
  if(route==='/api/rdx/open'){await this.open();if(input?.key!==null)ensure((await this.store.list()).some(d=>d.key===input?.key&&d.kind==='map'),'NOT_FOUND','Local Map Not Found.');this.active=input.key;this.set('active',this.active);return {reload:true};}
  if(route==='/api/rdx/begin'){
   ensure(Number.isSafeInteger(input?.bytes)&&input.bytes>0&&input.bytes<=LIMITS.stored,'LIMIT','RDX File Size Limit Exceeded.');await this.open();await this.cancelUpload();await this.store.capacity(input.bytes);
   const root=await directory(path.join(this.store.root,'transfers')),id=randomUUID(),file=path.join(root,id+'.rdx'),handle=await fs.open(file,'wx');this.upload={id,file,handle,bytes:input.bytes,offset:0,expires:Date.now()+15*60*1000};return {id,chunkBytes:CHUNK};
  }
  if(route==='/api/rdx/chunk'){const u=this.transfer(input);ensure(u.handle&&input.offset===u.offset&&typeof input.base64==='string'&&input.base64.length<=Math.ceil(CHUNK/3)*4,'INVALID','Invalid RDX Transfer Offset or Chunk.');const bytes=Buffer.from(input.base64,'base64');ensure(bytes.length>0&&bytes.length<=CHUNK&&bytes.toString('base64')===input.base64&&u.offset+bytes.length<=u.bytes,'INVALID','Invalid RDX Chunk.');let offset=0;while(offset<bytes.length){const written=await u.handle.write(bytes,offset,bytes.length-offset,u.offset+offset);ensure(written.bytesWritten>0,'IO','RDX Transfer Write Stopped.');offset+=written.bytesWritten;}u.offset+=bytes.length;return {offset:u.offset};}
  if(route==='/api/rdx/cancel'){await this.cancelUpload();return true;}
  if(route==='/api/rdx/preview'||route==='/api/rdx/commit'){
   const u=this.transfer(input);ensure(u.offset===u.bytes,'INVALID','The RDX Transfer Is Incomplete.');if(u.handle){await u.handle.sync();await u.handle.close();u.handle=null;}
   const incoming=await readRdxFile(u.file),key=documentKey(incoming.document),existing=this.store.db.prepare('SELECT * FROM documents WHERE key=?').get(key);
   const collision=this.store.db.prepare("SELECT key,head FROM documents WHERE dataset_id=? AND kind='map' AND key<>?").all(incoming.document.datasetId,key).some(r=>this.store.load(r.key,r.head).document.scope.mapRecordId===incoming.document.scope?.mapRecordId);
   ensure(!collision,'CONFLICT','This Map Identity Already Belongs to Another Managed Document.');
   const local=existing?await this.store.view(key):null;
   if(local)ensure(local.status.saved,'RECOVERY','Recover the Existing Map Checkpoint Before Updating.');
   const result=previewMapImport(incoming,local,{choices:input.choices||{},archive:input.archive||[]});
   // Reject unusable optional presentation metadata before changing the active
   // document. A valid container must also be displayable by this NPCDex build.
   for(const gender of ['male','female'])this.displayShape({...emptyMapView().snapshot,...projectNPCDex(mapDomain(result),{gender,assetBytes:h=>result.blobs.get(h)})});
   // Protect shared context held by other local maps. RD07 owns backend/global binding.
   for(const row of this.store.db.prepare("SELECT key,head FROM documents WHERE dataset_id=? AND kind='map' AND key<>?").all(incoming.document.datasetId,key)){
    const other=mapDomain(this.store.load(row.key,row.head));for(const record of mapDomain(incoming).records.filter(r=>incoming.document.scope.contextRecordIds.includes(r.recordId))){const prior=other.records.find(r=>r.recordId===record.recordId);ensure(!prior||prior.revisionId===record.revisionId,'REVIEW_REQUIRED','Shared Context Differs From Another Local Map. Review It Before Importing: '+record.recordId);}
   }
   if(route.endsWith('/preview'))return {...result.preview,key};
   ensure(input.approved===true&&input.token===result.preview.token,'CONFLICT','The Import Baseline or Choices Changed. Preview Again.');ensure(result.preview.conflicts.every(c=>c.choice),'REVIEW_REQUIRED','Choose Every Conflict Alternative Before Importing.');
   if(!existing)await this.store.ingest(u.file);
   else if(incoming.document.revision!==existing.head)await this.store.save(key,{documentBytes:Buffer.from(canonical(result.document)),blobs:result.blobs,expectedRevision:existing.head});
   this.active=key;this.set('active',key);await this.cancelUpload();this.changed();return {saved:true,key,unbound:true,reload:true};
  }
  if(route==='/api/rdx/export'){ensure(this.active,'NOT_FOUND','Open a Local RDX Map First.');const status=await this.store.status(this.active);ensure(status.saved,'RECOVERY','Finish the RDX Checkpoint Before Exporting.');await regular(status.path);const bytes=await readBoundedFile(status.path,LIMITS.stored),value=await unpackRdx(bytes);ensure(value.containerSha256===this.store.row(this.active).checkpoint_hash&&value.document.revision===status.revision,'RECOVERY','The Working File Changed During Export.');this.download={id:randomUUID(),bytes,expires:Date.now()+15*60*1000};return {id:this.download.id,bytes:bytes.length,sha256:sha(bytes),chunkBytes:CHUNK};}
  if(route==='/api/rdx/export-chunk'){const d=this.download;ensure(d&&input?.id===d.id&&Date.now()<=d.expires&&Number.isSafeInteger(input.offset)&&input.offset>=0&&input.offset<d.bytes.length,'INVALID','Invalid RDX Export Offset.');return {base64:d.bytes.subarray(input.offset,input.offset+CHUNK).toString('base64')};}
  if(route==='/api/rdx/export-end'){ensure(this.download?.id===input?.id,'INVALID','Unknown RDX Export.');this.download=null;return true;}
  if(route.startsWith('/api/view'))return this.view(new URL(route,'https://local.invalid').searchParams.get('gender')||'male');
  if(!this.active){if(this.fallback)return this.fallback.api(route,input);if(route==='/api/editor')return {head:'local:empty',records:[],plans:[],reviews:[],draft:null,operations:[],conflicts:[],review:[],deliveryProgress:{pending:0}};if(route==='/api/sync')return this.view();ensure(false,'NOT_FOUND','Import an RDX Map First.');}
  const value=await this.store.view(this.active),d=value.document,domain=mapDomain(value);
  if(route==='/api/editor'){const trusted=new Set(this.get('testing:'+this.active)||[]);return {head:d.revision,records:domain.records,plans:domain.plans,reviews:domain.reviews.map(r=>trusted.has(r.digest)?r:{...r,testStatus:'unreviewed'}),draft:this.get('draft:'+this.active),operations:[],conflicts:[],review:[],deliveryProgress:{pending:0}};}
  if(route==='/api/draft'){ensure(input&&Number.isSafeInteger(input.version)&&input.version>0&&(input.draft===null||input.draft&&typeof input.draft==='object'),'INVALID','Invalid Local Editor Draft.');const prior=this.get('draft:'+this.active);ensure(!prior||input.version>prior.version||same(input,prior),'CONFLICT','A Newer Local Draft Exists.');this.set('draft:'+this.active,input);return input;}
  if(route==='/api/edit'){
   ensure(input?.expectedHead===d.revision,'CONFLICT','The Local Map Changed. Review the Latest Version.');const ctx={workspace:d.datasetId,authorization:localDocumentAuthority(d.datasetId),operationId:'content:local-'+randomUUID(),createdAt:new Date().toISOString(),head:d.revision};
   const edit=buildEdit(domain,input.command,ctx),next=structuredClone(d),c=next.content;
   c.records=edit.preview.revisions;c.recordHeads=edit.preview.records.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));for(const key of ['plans','reviews','mappings','views'])c[key]=edit.preview[key]||[];
   // The helper's transient publication is not a YouTrack publication. RDX
   // ancestry journals the edit; retain its typed artifacts and correction
   // evidence without inventing a backend publication lineage.
   for(const artifact of edit.artifacts){const bytes=Buffer.from(canonical(artifact)),digest=sha(bytes),assetId='history:artifact-'+digest;if(!next.assetInventory.some(a=>a.assetId===assetId)){next.assetInventory.push({assetId,sha256:digest,bytes:bytes.length,mime:'application/json',purpose:'history'});c.history.push({sha256:digest,mediaType:'application/json',schema:artifact.schema,purpose:'Exact Local Edit Evidence'});value.blobs.set(digest,bytes);}}
   for(const asset of edit.assets){const {base64,...metadata}=asset,entry={...metadata,purpose:'image'},prior=next.assetInventory.find(a=>a.assetId===asset.assetId);ensure(!prior||same(prior,entry),'CONFLICT','An Existing Image Identity Has Different Bytes.');if(!prior)next.assetInventory.push(entry);value.blobs.set(asset.sha256,Buffer.from(base64,'base64'));}
   next.scope.ownedRecordIds=edit.preview.records.filter(r=>!['region','profile','shared'].includes(r.kind)).map(r=>r.recordId);next.scope.contextRecordIds=edit.preview.records.filter(r=>['region','profile','shared'].includes(r.kind)).map(r=>r.recordId);next.revision=documentRevision(next);
   await this.store.save(this.active,{documentBytes:Buffer.from(canonical(next)),blobs:value.blobs,expectedRevision:d.revision});
   const trusted=new Set(this.get('testing:'+this.active)||[]);for(const artifact of edit.artifacts)if(artifact.schema==='NPCDexReviewRevision/1')trusted.add(artifact.digest);this.set('testing:'+this.active,[...trusted]);this.changed();return {saved:true,head:this.store.row(this.active).head};
  }
  if(route==='/api/sync'){await this.store.recover(this.active);return this.view();}
  if(route==='/api/catalog/status')return {localRDX:true,nativeTree:true,head:d.revision};
  ensure(false,'UNSUPPORTED','This Action Is Unavailable for an Unpublished Local RDX Map.');
 }
 transfer(input){const u=this.upload;ensure(u&&input?.id===u.id&&Date.now()<=u.expires,'INVALID','RDX Import Session Expired. Choose the File Again.');return u;}
 displayShape(snapshot){const object=v=>v&&typeof v==='object'&&!Array.isArray(v);ensure(snapshot.version===2&&Number.isSafeInteger(snapshot.revision)&&snapshot.revision>=0&&Array.isArray(snapshot.stages)&&snapshot.stages.length===10&&object(snapshot.annotations)&&object(snapshot.changePlans)&&object(snapshot.preferences),'UNSUPPORTED','The RDX Presentation Metadata Is Not Supported by This NPCDex Build.');for(const a of Object.values(snapshot.annotations))ensure(object(a)&&typeof a.note==='string'&&typeof a.flag==='boolean','INVALID','Invalid RDX Flag or Note Presentation.');return snapshot;}
 async cancelUpload(){const u=this.upload;if(!u)return;await u.handle?.close();await regular(u.file);await fs.unlink(u.file);this.upload=null;}
}

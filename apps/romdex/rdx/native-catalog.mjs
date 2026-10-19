import fs from 'node:fs/promises';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {canonical,sha,same} from '../content/contracts.mjs';
import {projectNPCDex} from '../content/projection.mjs';
import {viewHeads} from '../content/view-contract.mjs';
import {nativeMapDocument,joinNativeMaps,nativeSourceEvidence,ADOPTION_EXTENSION} from './native-adoption.mjs';
import {documentKey} from './managed-store.mjs';import {packRdx} from './container.mjs';import {ensure} from './limits.mjs';

// One existing publication/queue owner remains the YouTrack adapter. Managed
// documents supply the catalog projection and portable checkpoints. A single
// ledger commit selects a complete generation; partial file saves never expose
// a catalog assembled from different source heads. Old generations stay intact.
export class NativeCatalog{
 constructor({maps,provider,changed=()=>{}}){Object.assign(this,{maps,provider,changed,ledger:null,domain:null,error:null,timer:null,closed:false});}
 async initialize(){this.ledger=this.maps.get('native-catalog');if(!this.ledger)return false;
  ensure(this.ledger.format==='ROMDexNativeCatalog/1'&&this.ledger.acceptance?.approved===true&&this.provider?.kind==='youtrack-content','RECOVERY','The Adopted Catalog Needs Its Original Native Provider.');
  ensure(this.provider.reader.workspace===this.ledger.workspace,'RECOVERY','The Adopted Catalog Workspace Changed.');if(this.ledger.sourceHead)this.load();try{await this.refresh();}catch(error){if(!this.domain)throw error;this.error=error.message;this.changed();}return true;}
 load(){const values=this.ledger.maps.map(m=>this.maps.store.load(m.key,m.revision)),sharedDomain=this.provider.cache.unpackDomain(this.ledger.nativeSourceRefs);this.domain=joinNativeMaps(values,{source:this.ledger.sourceEvidence,sharedDomain});ensure(sha(canonical(this.domain))===this.ledger.domainSHA256,'RECOVERY','The Adopted Catalog Generation Failed Verification.');return this.domain;}
 owns(key){return !!this.ledger?.maps.some(m=>m.key===key);}
 source(){const work=this.provider.editor.working();ensure(work.domain,'RECOVERY','The Native Content Source Is Unavailable.');const publication=this.provider.cache.get('publication:'+work.remote.head);ensure(publication?.carrier?.bindings,'RECOVERY','The Verified Native Issue Bindings Are Missing.');return {...work,bindings:publication.carrier.bindings};}
 async activate(acceptance){ensure(!this.ledger,'CONFLICT','The Native Catalog Was Already Adopted.');const work=this.source();
  ensure(acceptance?.format==='ROMDexNativeAdoptionAcceptance/1'&&acceptance.approved===true&&acceptance.portableScope==='one-map-v2'&&acceptance.head===work.head&&acceptance.domainSHA256===sha(canonical(work.domain)),'CONFLICT','The Accepted Adoption Baseline or File Scope Changed. Preview the Latest Content.');
  ensure(!work.remote.review.length&&!this.provider.editor.operations().some(o=>!['committed','cancelled'].includes(o.state)),'REVIEW_REQUIRED','Finish Native Content Sync and Review Before Adoption.');
  const maps=work.domain.records.filter(r=>r.kind==='map').map(r=>({mapRecordId:r.recordId,key:sha(canonical({datasetId:r.workspaceId,documentId:'content:rdx-map-'+sha(canonical({datasetId:r.workspaceId,mapRecordId:r.recordId}))})),revision:null,name:r.current.payload.name}));
  ensure(maps.every(m=>!this.maps.store.db.prepare('SELECT 1 FROM documents WHERE key=?').get(m.key)),'CONFLICT','An Existing RDX Document Must Be Reviewed Before Native Adoption.');
  this.ledger={format:'ROMDexNativeCatalog/1',workspace:this.provider.reader.workspace,acceptance:structuredClone(acceptance),sourceHead:null,maps,domainSHA256:null};
  this.maps.set('native-catalog',this.ledger);await this.refresh();return this.ledger;}
 applicationHistory(head){
  const pending=new Map(this.provider.editor.operations().filter(o=>o.publication).map(o=>[o.publication.digest,o])),todo=[head],seen=new Set(),artifacts=[];
  while(todo.length){const digest=todo.pop();if(seen.has(digest))continue;ensure(seen.size<10000,'LIMIT','Native Application History Needs Coordinated Review.');seen.add(digest);const cached=this.provider.cache.get('publication:'+digest),op=pending.get(digest),publication=cached?.publication||op?.publication;if(!publication)continue;
   if(publication.kind==='implementation'){const ref=cached?.carrier?.artifacts.find(a=>a.digest===publication.resultDigest),raw=ref?this.provider.cache.object(ref.object.sha256):null,values=raw?[JSON.parse(raw.toString('utf8'))]:(op?this.provider.editor.artifacts(op):[]);ensure(!ref||raw,'RECOVERY','Accepted Application History Is Missing.');for(const a of values)if(a.schema==='NPCDexRDXApplication/1')artifacts.push(a);}
   todo.push(...publication.parentPublications);
  }return artifacts;
 }
 async refresh(){if(!this.ledger||this.closed)return;const work=this.source();if(work.head===this.ledger.sourceHead){this.error=null;return this.ledger;}
  try{const domainSHA256=sha(canonical(work.domain)),entries=[],priorIntent=this.maps.get('native-generation'),targets=work.domain.records.filter(r=>r.kind==='map').map(r=>{const old=this.ledger.maps.find(m=>m.mapRecordId===r.recordId)||priorIntent?.maps.find(m=>m.mapRecordId===r.recordId);return old||{mapRecordId:r.recordId,key:sha(canonical({datasetId:r.workspaceId,documentId:'content:rdx-map-'+sha(canonical({datasetId:r.workspaceId,mapRecordId:r.recordId}))})),revision:null,name:r.current.payload.name};});
   for(const m of targets)if(!this.ledger.maps.some(old=>old.key===m.key)&&!priorIntent?.maps.some(old=>old.key===m.key))ensure(!this.maps.store.db.prepare('SELECT 1 FROM documents WHERE key=?').get(m.key),'CONFLICT','A New Native Map Collides With an Imported RDX Identity.');
   this.maps.set('native-generation',{sourceHead:work.head,domainSHA256,maps:targets});
   for(const r of work.domain.records.filter(r=>r.kind==='map')){
    const old=targets.find(m=>m.mapRecordId===r.recordId),rowBefore=this.maps.store.db.prepare('SELECT * FROM documents WHERE key=?').get(old.key);
    if(rowBefore&&old.revision)ensure(this.maps.store.knownPrior(rowBefore,old.revision),'RECOVERY','An Adopted Map Lost Its Accepted Journal Ancestry.');
    const previous=rowBefore?this.maps.store.load(old.key,rowBefore.head):null;
    const value=nativeMapDocument({domain:work.domain,mapRecordId:r.recordId,head:work.head,assetBytes:h=>this.provider.cache.object(h),bindings:work.bindings,historyArtifacts:this.applicationHistory(work.head),previous}),key=documentKey(value.document),existing=this.maps.store.db.prepare('SELECT * FROM documents WHERE key=?').get(key);
    // A staged or interrupted generation is recoverable only for the same
    // original map identity. Never overwrite an independently imported map.
    if(existing){ensure(old&&old.key===key,'CONFLICT','An Existing RDX Identity Needs Adoption Review.');const staged=this.maps.store.load(key,existing.head),e=staged.document.extensions[ADOPTION_EXTENSION];ensure(e?.format==='ROMDexNativeMapEvidence/1'&&staged.document.scope.mapRecordId===r.recordId,'RECOVERY','An Interrupted Catalog Generation Needs Review.');
     if(e.mapContentSHA256!==value.document.extensions[ADOPTION_EXTENSION].mapContentSHA256)await this.maps.store.save(key,{documentBytes:value.documentBytes,blobs:value.blobs,expectedRevision:existing.head,nativeCheckpoint:true});
    }else{const temp=path.join(this.maps.store.root,'recovery','native-'+randomUUID()+'.rdx');try{await fs.writeFile(temp,await packRdx(value.documentBytes,value.blobs),{flag:'wx'});await this.maps.store.ingest(temp);}finally{await fs.unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}}
    const row=this.maps.store.row(key),status=await this.maps.store.status(key);ensure(status.saved,'RECOVERY','An Adopted Map Checkpoint Needs Recovery.');entries.push({mapRecordId:r.recordId,key,revision:row.head,name:r.current.payload.name});
   }
   ensure(entries.length>0,'RECOVERY','The Adopted Catalog Has No Maps.');const sourceEvidence=nativeSourceEvidence(work.domain,work.head),nextDomain=joinNativeMaps(entries.map(m=>this.maps.store.load(m.key,m.revision)),{source:sourceEvidence,sharedDomain:work.domain});ensure(sha(canonical(nextDomain))===domainSHA256,'RECOVERY','The New Native Map Generation Differs.');
   const nativeSourceRefs=this.provider.cache.packDomain(work.domain),ledger={...this.ledger,sourceHead:work.head,domainSHA256,maps:entries,sourceEvidence,nativeSourceRefs};this.maps.store.transaction(()=>{this.maps.set('native-catalog',ledger);this.maps.set('native-generation',null);});this.ledger=ledger;this.domain=nextDomain;this.error=null;this.changed();return ledger;
  }catch(e){this.error=e.message;this.changed();throw e;}
 }
 view(gender='male'){ensure(this.domain,'RECOVERY','No Complete Adopted Catalog Is Available.');const source=this.provider.view(gender),pending=source.head!==this.ledger.sourceHead||!!this.error;
  return {...source,head:pending?source.head:this.ledger.sourceHead,provider:'youtrack-content',documentKey:null,managedCatalog:true,snapshot:pending?source.snapshot:projectNPCDex(this.domain,{gender,revision:source.snapshot.revision,assetBytes:h=>{const row=this.maps.store.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(h);return row?Buffer.from(row.bytes):this.provider.cache.object(h);}}),status:{...source.status,localCheckpoint:!pending,attention:source.status.attention||!!this.error,pendingWrites:source.status.pendingWrites+(pending?1:0),message:this.error?'RDX Checkpoint Needs Recovery · '+this.error:pending?'Saved in the Local Journal · Updating Managed RDX Files.':source.status.message}};
 }
 schedule(){if(this.closed||!this.ledger||this.error)return;clearTimeout(this.timer);this.timer=setTimeout(()=>{this.timer=null;this.maps.execute(()=>this.refresh()).catch(()=>{});},5000);this.timer.unref?.();}
 async fastAPI(route,input){const value=await this.provider.api(route,input);if(!['/api/editor','/api/draft'].includes(route)&&!route.startsWith('/api/view'))this.schedule();return value;}
 async synchronize(input){await this.provider.api('/api/sync',input);await this.checkpoint();return this.view();}
 async api(route,input){if(route.startsWith('/api/view'))return this.view(new URL(route,'https://local.invalid').searchParams.get('gender')||'male');
  const value=await this.provider.api(route,input);if(!['/api/editor','/api/draft','/api/catalog/status','/api/import/context','/api/import/preview','/api/catalog/preview-transition'].includes(route))await this.refresh();return value;}
 select(input){const views=viewHeads(this.domain.views),townId=input?.townId,requested=input?.mapRecordId;let map=this.ledger.maps.find(m=>m.mapRecordId===requested||views.find(v=>v.recordId===m.mapRecordId)?.payload.fields?.id===townId||m.mapRecordId===townId);if(!map&&!townId&&!requested&&this.ledger.maps.length===1)map=this.ledger.maps[0];ensure(map,'INVALID','Select a Physical Map to Export. Global Dialogue Remains a Separate Shared Collection.');return map;}
 async export(input){await this.refresh();ensure(this.source().head===this.ledger.sourceHead,'CONFLICT','Newer Edits Arrived While Exporting. Export the Current Map Again.');const map=this.select(input),status=await this.maps.store.status(map.key);ensure(status.saved&&status.revision===map.revision,'RECOVERY','The Map RDX Checkpoint Needs Recovery.');return {map,key:map.key,path:status.path};}
 async checkpoint(){clearTimeout(this.timer);this.timer=null;await this.maps.execute(()=>this.refresh());}
 async close(){clearTimeout(this.timer);this.timer=null;this.closed=true;}
}

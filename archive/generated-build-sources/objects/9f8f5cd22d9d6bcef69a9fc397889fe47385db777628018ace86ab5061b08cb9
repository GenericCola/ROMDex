import {requireThat,sha,validateArtifact,same,isHash,MAX_MANIFEST_BYTES,canonical} from './contracts.mjs';
import {MANIFEST_NAME,validateCarrier} from './carrier.mjs';
import {applyPublication,resolvePublication} from './materialize.mjs';
import {projectNPCDex,PROJECTION_VERSION} from './projection.mjs';
import {workspaceAllowed} from './authorization.mjs';
async function mapReads(values,fn){const results=new Array(values.length);let next=0,failure;await Promise.all(Array.from({length:Math.min(4,values.length)},async()=>{for(;;){if(failure)return;const i=next++;if(i>=values.length)return;try{results[i]=await fn(values[i]);}catch(error){failure||=error;}}}));if(failure)throw failure;return results;}

export class ContentReader{
 constructor({transport,cache,workspace,bootstrapPublication,ownerId='2-2',authorization=null,enabled=()=>true,changed=()=>{},interval=60000,deadline=120000,now=()=>Date.now()}){
  requireThat(workspace===cache.workspace&&workspaceAllowed(workspace,authorization)&&isHash(bootstrapPublication)&&ownerId==='2-2','Explicit Content Root and Owner Pins Are Required.');this.authorization=authorization;
  requireThat(Number.isInteger(deadline)&&deadline>=1000&&deadline<=600000,'Invalid Content Cycle Deadline.');requireThat(Number.isInteger(interval)&&interval>=1000,'Invalid Content Poll Interval.');Object.assign(this,{transport,cache,workspace,bootstrapPublication,ownerId,enabled,changed,interval,deadline,now});this.task=null;this.timer=null;this.status={connection:'cached',attention:false,message:'Showing the Verified Content Cache.'};
  const binding={workspace,bootstrapPublication,registryIssueId:transport.registryIssueId,projectId:transport.projectId,ownerId};const previous=cache.get('binding');requireThat(!previous||same(previous,binding),'The Preview Registry Binding Changed.');if(!previous)cache.set('binding',binding);
 }
 view(){const accepted=this.cache.get('accepted');return {active:!!accepted,readOnly:true,head:accepted?.head||null,snapshot:accepted?.snapshot||null,status:{...this.status,automaticRemote:!!this.enabled(),pendingWrites:0,label:'NPCDex Content Preview'},review:this.cache.get('review')||[]};}
 async object(descriptor){const key=canonical(descriptor);if(this.cycleObjects.has(key))return this.cycleObjects.get(key);const task=(async()=>{this.cycleBytes+=descriptor.bytes;requireThat(this.cycleBytes<=64*1024*1024,'Content Cycle Transfer Budget Exceeded.');const chunks=await mapReads(descriptor.chunks,async ref=>{const bytes=await this.transport.download(ref.issueId,ref,{cache:this.cache,fullAudit:this.fullAudit});requireThat(bytes.length===ref.bytes&&sha(bytes)===ref.sha256,'Content Chunk Differs.');this.cache.putObject(bytes);return bytes;});const bytes=Buffer.concat(chunks);requireThat(bytes.length===descriptor.bytes&&sha(bytes)===descriptor.sha256,'Assembled Content Object Differs.');this.cache.putObject(bytes);return bytes;})();this.cycleObjects.set(key,task);return task;}
 cycle(manual=false,{audit=manual}={}){
  if(!manual&&!this.enabled())return Promise.resolve(this.view());if(this.task)return this.task;
  const audited=this.cache.get('full-audit')?.at;this.fullAudit=audit||!audited||this.now()<audited||this.now()-audited>=15*60*1000;
  this.lifecyclePaused=false;this.abort=new AbortController();this.task=this.pull().catch(error=>{this.status=this.lifecyclePaused&&this.abort.signal.aborted?{connection:'paused',attention:!!this.cache.get('review')?.length,message:'Automatic Content Sync Is Paused; the Verified Cache Is Retained.'}:{connection:'unavailable',attention:true,failureKind:error.code==='CONTENT_CONNECTION'||error.status?'connection':'review',message:error.message};this.changed(this.view());return this.view();}).finally(()=>{this.task=null;this.abort=null;});return this.task;
 }
 async pull(){
  this.status={connection:'syncing',attention:false,message:'Reading Content Publications.'};this.changed(this.view());this.cycleBytes=0;this.cycleObjects=new Map();this.transport.begin(AbortSignal.any([this.abort.signal,AbortSignal.timeout(this.deadline)]));
  const listing=await this.transport.discover(),review=[],entries=[],operations=new Map(),artifactOperations=new Map(),seenBindings=new Map(),observed=new Map(),referenced=new Set();let rootBindings=null;
  const candidates=listing.filter(a=>a.name===MANIFEST_NAME);requireThat(candidates.length<=1000,'Content Publication Count Exceeds the Preview Bound.');const known=this.cache.get('discovered')||[];
  for(const meta of candidates){
   this.abort.signal.throwIfAborted();
   try{
    requireThat(meta.name===MANIFEST_NAME,'Unexpected Registry Attachment Needs Review.');requireThat(meta.authorId===this.ownerId&&meta.size<=MAX_MANIFEST_BYTES,'Registry Attachment Author or Size Is Not Approved.');
    const bytes=await this.transport.download(this.transport.registryIssueId,{attachmentId:meta.id,bytes:meta.size});const byteHash=sha(bytes),old=known.find(a=>a.id===meta.id&&(a.issueId||this.transport.registryIssueId)===this.transport.registryIssueId);requireThat(!old?.byteHash||old.byteHash===byteHash,'A Previously Observed Manifest Changed Bytes.');observed.set(meta.id,{...meta,byteHash,issueId:this.transport.registryIssueId});const carrier=validateCarrier(bytes,this.workspace);this.cache.putObject(bytes);
    for(const object of [carrier.publication,...carrier.artifacts.map(a=>a.object),...carrier.assets.map(a=>a.object)])for(const ref of object.chunks)referenced.add(ref.issueId+'/'+ref.attachmentId);
    if(this.transport.primeIssues){const issueIds=[...new Set([this.transport.registryIssueId,...carrier.nativeMetadata.map(p=>p.issueId),...carrier.bindings.map(b=>b.issueId)])];await this.transport.primeIssues(issueIds);await mapReads(issueIds,issueId=>this.transport.inventory(issueId));}
    requireThat(carrier.publication.chunks.every(c=>c.issueId===this.transport.registryIssueId),'Publication Must Be Bound to Its Registry.');const pub=validateArtifact(await this.object(carrier.publication),this.workspace);requireThat(pub.schema==='NPCDexPublication/1'&&pub.operationId===carrier.operationId,'Carrier Publication Identity Differs.');
    const previous=operations.get(carrier.operationId);requireThat(!previous||previous===pub.digest,'Operation Identity Was Reused for Different Content.');operations.set(carrier.operationId,pub.digest);
    const artifacts=await mapReads(carrier.artifacts,async item=>{const a=validateArtifact(await this.object(item.object),this.workspace);requireThat((a.revisionId||a.digest)===item.digest,'Pinned Artifact Digest Differs.');const opKey=a.schema+':'+a.operationId,opDigest=artifactOperations.get(opKey);requireThat(!opDigest||opDigest===item.digest,'Artifact Operation Identity Was Reused.');artifactOperations.set(opKey,item.digest);const recordId=a.recordId||a.target?.recordId,issueId=recordId?carrier.bindings.find(b=>b.recordId===recordId)?.issueId:this.transport.registryIssueId;requireThat(issueId&&item.object.chunks.every(c=>c.issueId===issueId),'Artifact Is Bound to the Wrong Content Issue.');return a;});
    const assets=await mapReads(carrier.assets,async item=>{const bytes=await this.object(item.object);return {assetId:item.assetId,mime:item.mime,sha256:sha(bytes),bytes:bytes.length};});
    await mapReads(carrier.nativeMetadata,pin=>this.transport.issue(pin.issueId));
    const bindingKey=pub.digest,bindings=canonical({bindings:[...carrier.bindings].sort((a,b)=>a.recordId.localeCompare(b.recordId)),nativeMetadata:[...carrier.nativeMetadata].sort((a,b)=>a.issueId.localeCompare(b.issueId)),assets:assets.slice().sort((a,b)=>a.assetId.localeCompare(b.assetId))});requireThat(!seenBindings.has(bindingKey)||seenBindings.get(bindingKey)===bindings,'Publication Record Bindings Differ.');seenBindings.set(bindingKey,bindings);
    entries.push({pub,artifacts,assets,carrier,attachmentId:meta.id});if(pub.digest===this.bootstrapPublication)rootBindings=carrier.bindings;
   }catch(error){review.push({kind:'publication-needs-review',attachmentId:meta.id,message:error.message});}
  }
  const inventory=listing.map(meta=>({...meta,issueId:this.transport.registryIssueId}));
  if(rootBindings){const issues=[...new Set(entries.flatMap(e=>e.carrier.bindings.map(b=>b.issueId)))];const listings=await mapReads(issues,async issueId=>(await this.transport.inventory(issueId)).map(meta=>({...meta,issueId})));inventory.push(...listings.flat());}
  this.abort.signal.throwIfAborted();const currentIds=new Set(inventory.map(a=>a.issueId+'/'+a.id));for(const old of known)if(!currentIds.has((old.issueId||this.transport.registryIssueId)+'/'+old.id))review.push({kind:'missing-history',attachmentId:old.id,message:'A Previously Observed Published Attachment Is Missing.'});
  const unpublished=inventory.filter(a=>!referenced.has(a.issueId+'/'+a.id)&&!(a.issueId===this.transport.registryIssueId&&a.name===MANIFEST_NAME));
  for(const meta of unpublished)if(meta.authorId!==this.ownerId)review.push({kind:'unapproved-file',attachmentId:meta.id,message:'An Unpublished File Has an Unapproved or Missing Author.'});
  const byHash=new Map(entries.map(e=>[e.pub.digest,e])),root=byHash.get(this.bootstrapPublication),states=new Map(),invalid=new Set();
  if(root){
   requireThat(rootBindings.length===root.artifacts.filter(a=>a.schema==='NPCDexContentRevision/1').length,'Initial Record Bindings Are Incomplete.');
   const visiting=new Set(),retainedObjects=new Set();let materializedBytes=0,materializationExhausted=false;
   const visit=hash=>{if(states.has(hash))return states.get(hash);requireThat(!materializationExhausted,'Content Materialization Budget Exceeded.');requireThat(!visiting.has(hash),'Publication Ancestry Cycle.');const entry=byHash.get(hash);requireThat(entry&&!invalid.has(hash),'Publication Dependency Is Missing or Invalid.');visiting.add(hash);let parents=[];
    if(hash===this.bootstrapPublication)requireThat(entry.pub.kind==='bootstrap'&&entry.pub.parentPublications.length===0,'Pinned Initial Publication Is Invalid.');
    else{requireThat(entry.pub.kind==='resolution'?entry.pub.parentPublications.length>=2&&entry.pub.parentPublications.length<=16:entry.pub.parentPublications.length===1,'Publication Parent Set Is Invalid.');parents=entry.pub.parentPublications.map(visit);}
    const domain=entry.pub.kind==='resolution'?resolvePublication(parents,entry.pub,entry.artifacts,entry.assets):applyPublication(parents[0]||null,entry.pub,entry.artifacts,entry.assets);
    const pins=new Map(entry.carrier.bindings.map(b=>[b.recordId,b.issueId]));requireThat(pins.size===domain.records.length&&domain.records.every(r=>pins.has(r.recordId)),'Content Record Bindings Are Incomplete.');
    for(const parentHash of entry.pub.parentPublications)for(const b of byHash.get(parentHash).carrier.bindings)requireThat(pins.get(b.recordId)===b.issueId,'Record Rebinding Needs Explicit Review.');
    for(const a of entry.artifacts)if(a.schema==='NPCDexContentRevision/1')requireThat(entry.carrier.bindings.some(b=>b.recordId===a.recordId),'Content Record Binding Is Missing.');
    // Count shared immutable revisions once; collection references remain bounded.
    for(const values of Object.values(domain)){materializedBytes+=values.length*8;for(const value of values)if(!retainedObjects.has(value)){retainedObjects.add(value);materializedBytes+=Buffer.byteLength(JSON.stringify(value));}}
    if(materializedBytes>64*1024*1024){materializationExhausted=true;throw Error('Content Materialization Budget Exceeded.');}states.set(hash,domain);visiting.delete(hash);return domain;
   };
   for(const entry of entries)try{visit(entry.pub.digest);}catch(error){visiting.clear();invalid.add(entry.pub.digest);review.push({kind:'domain-needs-review',attachmentId:entry.attachmentId,message:error.message});}
  }else review.push({kind:'missing-root',message:'The Pinned Initial Publication Is Unavailable.'});
  let selected=null;
  if(states.has(this.bootstrapPublication)){
   const parents=new Set([...states.keys()].flatMap(h=>byHash.get(h).pub.parentPublications));const heads=[...states.keys()].filter(h=>!parents.has(h));
   const ancestors=hash=>{const seen=new Set(),todo=[hash];while(todo.length){const h=todo.pop();if(seen.has(h))continue;seen.add(h);todo.push(...byHash.get(h).pub.parentPublications);}return seen;};
   if(heads.length===1)selected=heads[0];else{const sets=heads.map(ancestors),common=[...sets[0]].filter(h=>sets.every(s=>s.has(h))),commonSet=new Set(common),commonParents=new Set(common.flatMap(h=>byHash.get(h).pub.parentPublications.filter(p=>commonSet.has(p))));const nearest=common.filter(h=>!commonParents.has(h));requireThat(nearest.length===1,'Content Has Ambiguous Common Ancestry.');selected=nearest[0];review.push({kind:'competing-publications',heads:heads.sort(),message:'Competing Content Versions Are Preserved for Review.'});}
  }
  if(selected){const domain=states.get(selected),entry=byHash.get(selected),pins=new Map(entry.carrier.bindings.map(b=>[b.recordId,b.issueId]));for(const record of domain.records){const issueId=pins.get(record.recordId),pin=entry.carrier.nativeMetadata.find(m=>m.issueId===issueId);requireThat(pin,'Current Native Metadata Pin Is Missing.');requireThat(pin.parentIssueId===(pins.get(record.parentRecordId)||null),'Native Metadata Parent Does Not Match Content.');}for(const pin of entry.carrier.nativeMetadata){const native=await this.transport.issue(pin.issueId);if(native.summary!==pin.summary||native.parentIssueId!==pin.parentIssueId||native.descriptionSha256!==pin.descriptionSha256||native.commentsSha256!==pin.commentsSha256)review.push({kind:'native-metadata-changed',issueId:pin.issueId,recordId:entry.carrier.bindings.find(b=>b.issueId===pin.issueId)?.recordId||null,before:pin,observed:{issueId:pin.issueId,summary:native.summary,parentIssueId:native.parentIssueId,descriptionSha256:native.descriptionSha256,commentsSha256:native.commentsSha256},message:'Native Metadata Changed Without a Validated Content Event.'});}}
  // Uncertain, missing or malformed data never silently replaces the last good view.
  if(selected){const d=states.get(selected);for(const [values,identity]of [[d.plans,'planId'],[d.reviews,'reviewId']]){const parents=new Set(values.flatMap(v=>v.parents)),groups=new Map();for(const value of values.filter(v=>!parents.has(v.digest))){const id=value[identity];if(!groups.has(id))groups.set(id,[]);groups.get(id).push(value);}for(const [id,heads]of groups)if(heads.length>1)review.push({kind:'proposal-conflict',identity,id,recordId:heads[0].target.recordId,heads:heads.map(h=>h.digest).sort(),message:'Concurrent Draft Versions Need Review.'});}}
  const prior=this.cache.get('accepted');const mayRollbackToCommon=review.some(r=>r.kind==='competing-publications')&&review.every(r=>['competing-publications','proposal-conflict'].includes(r.kind));
  if(!prior&&review.length&&states.has(this.bootstrapPublication))selected=this.bootstrapPublication;
  const accept=selected&&(!review.length||review.every(r=>r.kind==='proposal-conflict')||mayRollbackToCommon||!prior&&selected===this.bootstrapPublication);
  this.abort.signal.throwIfAborted();this.cache.transaction(()=>{
   for(const [head,domain]of states)if(!this.cache.has('domain:'+head))this.cache.set('domain:'+head,domain);
   for(const entry of entries)if(states.has(entry.pub.digest))this.cache.set('publication:'+entry.pub.digest,{publication:entry.pub,carrier:entry.carrier});
   const union=new Map(known.map(x=>[(x.issueId||this.transport.registryIssueId)+'/'+x.id,x]));for(const meta of inventory){const key=meta.issueId+'/'+meta.id;if(!referenced.has(key)&&!(meta.issueId===this.transport.registryIssueId&&meta.name===MANIFEST_NAME))continue;if(!union.has(key))union.set(key,meta.issueId===this.transport.registryIssueId?observed.get(meta.id)||meta:meta);else if(!union.get(key).byteHash&&meta.issueId===this.transport.registryIssueId&&observed.has(meta.id))union.set(key,observed.get(meta.id));}this.cache.set('discovered',[...union.values()]);
   this.cache.set('review',review);
   if(this.fullAudit&&!review.length)this.cache.set('full-audit',{at:this.now()});
   if(accept&&(!prior||prior.head!==selected||prior.projectionVersion!==PROJECTION_VERSION)){const domain=states.get(selected),snapshot=projectNPCDex(domain,{revision:(prior?.snapshot.revision||0)+1,assetBytes:hash=>this.cache.object(hash)});this.cache.set('accepted',{head:selected,snapshot,projectionVersion:PROJECTION_VERSION});}
  });
  this.status={connection:'connected',attention:review.length>0,pendingIncomingFiles:unpublished.length,message:review.length?'Content Needs Review · the Verified View Is Retained.':unpublished.length?'Waiting for Unpublished Content Files to Join a Complete Publication.':'Content Is Up to Date.'};this.changed(this.view());return this.view();
 }
 start(){if(this.timer||!this.enabled())return;const tick=async()=>{try{await this.cycle();}finally{if(this.timer&&this.enabled()){this.timer=setTimeout(tick,this.interval);this.timer.unref?.();}else this.timer=null;}};this.timer=setTimeout(tick,0);this.timer.unref?.();}
 async stop(){if(this.timer)clearTimeout(this.timer);this.timer=null;this.lifecyclePaused=true;this.abort?.abort();await this.task;this.cache.checkpoint();}
}

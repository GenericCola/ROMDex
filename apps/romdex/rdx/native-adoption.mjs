// Existing NPCD identities are retained. Map files carry one map; catalog-wide
// history and recovery live separately in protected application Data.
import {canonical,sha,seal,same} from '../content/contracts.mjs';
import {validateDomain} from '../content/materialize.mjs';import {viewHeads} from '../content/view-contract.mjs';import {projectNPCDex} from '../content/projection.mjs';
import {documentRevision,validateDocument} from './document.mjs';import {packRdx,unpackRdx} from './container.mjs';import {mapDomain} from './map-import.mjs';import {ensure} from './limits.mjs';
import {scopeNativeMap,assertOneMapPayload} from './native-map-scope.mjs';
export const ADOPTION_EXTENSION='org.romdex.native-adoption';
const artifactHash=a=>a.revisionId||a.digest,unique=items=>[...new Map(items.map(a=>[artifactHash(a),a])).values()];
export function nativeSourceEvidence(domain,head){const roots=viewHeads(domain.views||[]).filter(v=>v.recordId===null);ensure(roots.length===1,'REVIEW_REQUIRED','A Single Native Root Is Required.');return {sourceHead:head,sourceRoot:roots[0].digest,sourceDomainSHA256:sha(canonical(domain)),sourceOrder:Object.fromEntries(['records','revisions','plans','reviews','mappings','views','assets'].map(k=>[k,(domain[k]||[]).map(a=>k==='records'?a.recordId:k==='assets'?a.assetId:artifactHash(a))]))};}

export function nativeMapDocument({domain,mapRecordId,head,assetBytes,bindings=[],historyArtifacts=[],previous=null}){
 validateDomain(domain);ensure(/^[a-f0-9]{64}$/.test(head),'INVALID','A Verified Native Content Head Is Required.');
 const s=scopeNativeMap(domain,mapRecordId),datasetId=s.map.workspaceId,scopeHash=sha(canonical({datasetId,mapRecordId})),priorViews=previous?previous.document.content.views.filter(v=>v.actorClaim==='content:rdx-adapter'):[],priorHeads=viewHeads(priorViews);
 if(previous)ensure(previous.document.extensions[ADOPTION_EXTENSION]?.portableScope==='one-map-v2','REVIEW_REQUIRED','A Whole-Catalog Candidate Cannot Become a Map Baseline.');
 const unchanged=priorHeads.length===1&&same(priorHeads[0].payload,s.payload),scopedRoot=unchanged?priorHeads[0]:seal({...s.root,operationId:'content:rdx-scope-'+scopeHash.slice(0,32),actorClaim:'content:rdx-adapter',parents:priorHeads.map(v=>v.digest),payload:s.payload});
 const views=[...s.sourceViews.filter(v=>v.recordId!==null),scopedRoot],blobs=new Map(),assets=[],history=[];
 for(const a of s.assets){const bytes=assetBytes(a.sha256);ensure(Buffer.isBuffer(bytes)&&bytes.length===a.bytes&&sha(bytes)===a.sha256,'INVALID','An Existing Native Asset Failed Verification.');blobs.set(a.sha256,bytes);assets.push({...a,purpose:a.mime.startsWith('image/')?'image':'attachment'});}
 for(const artifact of unique([...priorViews,...historyArtifacts]).filter(a=>a.digest!==scopedRoot.digest)){
  ensure(artifact.workspaceId===datasetId,'INVALID','Native History Workspace Differs.');
  if(artifact.schema==='NPCDexViewRevision/1'&&artifact.recordId===null&&artifact.actorClaim!=='content:rdx-adapter')continue;
  if(artifact.recordId&&!s.selected.has(artifact.recordId)||artifact.readSet?.some(r=>!s.selected.has(r.recordId)))continue;
  const bytes=Buffer.from(canonical(artifact)),hash=sha(bytes);if(assets.some(a=>a.sha256===hash))continue;blobs.set(hash,bytes);assets.push({assetId:'history:native-'+hash,sha256:hash,bytes:bytes.length,mime:'application/json',purpose:'history'});history.push({sha256:hash,mediaType:'application/json',schema:artifact.schema,purpose:'Map-Scoped Native History'});
 }
 if(previous)for(const a of previous.document.assetInventory){if(!assets.some(x=>x.assetId===a.assetId)){assets.push(a);blobs.set(a.sha256,previous.blobs.get(a.sha256));}for(const h of previous.document.content.history.filter(h=>h.sha256===a.sha256))if(!history.some(x=>x.sha256===h.sha256))history.push(h);}
 const document={format:'RDXDocument/1',schemaVersion:1,namespace:'org.romdex.npcdex',kind:'map',datasetId,documentId:'content:rdx-map-'+scopeHash,parents:[],createdAt:[...s.records,...s.plans,...s.reviews,...views].map(a=>a.createdAt).sort().at(-1),origin:{role:'backend-sync',generator:'ROMDex Native Adoption/2',synthetic:datasetId.startsWith('fixture:')},capabilities:{required:['org.romdex.rdx.map-v1','org.romdex.npcdex.content-v1'],optional:[]},extensions:{[ADOPTION_EXTENSION]:{format:'ROMDexNativeMapEvidence/1',portableScope:'one-map-v2',sourceHead:head,sourceRootSHA256:s.root.digest,mapContentSHA256:s.contentSHA256,scopedRoot:scopedRoot.digest,bindings:bindings.filter(b=>s.selected.has(b.recordId)),notice:'One map and referenced dependencies. Full-catalog recovery is separate; bindings are evidence, not write authority.'}},assetInventory:assets,scope:{mode:'partial',mapRecordId,ownedRecordIds:[...s.owned],contextRecordIds:s.records.filter(r=>!s.owned.has(r.recordId)).map(r=>r.recordId),completeForParentIds:[],baselineInventory:[]},content:{records:unique([...s.revisions,...s.records]),recordHeads:s.records.map(r=>({recordId:r.recordId,revisionId:r.revisionId})),mappings:s.mappings,plans:s.plans,reviews:s.reviews,views,history,archivalRequests:[]},result:null};
 document.revision=documentRevision(document);const documentBytes=Buffer.from(canonical(document));validateDocument(documentBytes,{blobs});
 const others=domain.records.filter(r=>r.kind==='map'&&r.recordId!==mapRecordId).flatMap(r=>[r.recordId,...r.legacyRefs.filter(l=>l.kind==='town').map(l=>l.townId)]);assertOneMapPayload(document,blobs,others);return {document,documentBytes,blobs};
}

// Shared context is application-owned data, never embedded as a hidden second
// map. Map-owned content must come from the files, not from this context.
export function joinNativeMaps(values,{source=null,sharedDomain=null}={}){
 ensure(values.length>0,'INVALID','No Adopted Native Maps Are Available.');const domains=values.map(mapDomain);
 ensure(source&&sharedDomain,'RECOVERY','Complete Catalog Assembly Needs Separate Native Shared Context.');
 ensure(values.every(v=>v.document.datasetId===values[0].document.datasetId&&v.document.extensions[ADOPTION_EXTENSION]?.portableScope==='one-map-v2'),'RECOVERY','Native Map Checkpoint Workspaces Differ.');
 const sharedIds=new Set(sharedDomain.records.filter(r=>['region','profile','shared'].includes(r.kind)).map(r=>r.recordId)),domain={};
 for(const key of ['records','revisions','plans','reviews','mappings','views','assets']){
  const context=sharedDomain[key].filter(a=>key==='assets'||key==='views'&&a.recordId===null||sharedIds.has(a.recordId||a.target?.recordId)),all=[...context,...domains.flatMap(d=>d[key]||[]).filter(a=>key!=='views'||a.actorClaim!=='content:rdx-adapter')],by=new Map();
  for(const a of all){const id=key==='assets'?a.assetId:key==='records'?a.recordId:artifactHash(a),value=key==='assets'?(({purpose,...v})=>v)(a):a,old=by.get(id);ensure(!old||same(old,value),'RECOVERY','Shared Native Map Dependencies Differ: '+id);by.set(id,value);}
  const order=source.sourceOrder?.[key];ensure(Array.isArray(order),'RECOVERY','Native Source Order Is Missing.');domain[key]=order.map(id=>by.get(id));ensure(domain[key].every(Boolean),'RECOVERY','An Adopted Native Dependency Is Missing: '+key);
 }
 validateDomain(domain);ensure(sha(canonical(domain))===source.sourceDomainSHA256,'RECOVERY','The Adopted Catalog Does Not Match Its Native Source Fingerprint.');return domain;
}

export async function previewNativeAdoption({domain,head,assetBytes,bindings=[],historyArtifacts=[]}){
 const maps=[];
 for(const map of domain.records.filter(r=>r.kind==='map')){
  const value=nativeMapDocument({domain,mapRecordId:map.recordId,head,assetBytes,bindings,historyArtifacts}),bytes=await packRdx(value.documentBytes,value.blobs),readback=await unpackRdx(bytes);ensure(same(readback.document,value.document),'RECOVERY','A Native Map RDX Failed Exact Readback.');
  const s=scopeNativeMap(domain,map.recordId);for(const gender of ['male','female']){const before=projectNPCDex(domain,{gender,assetBytes}).towns.find(t=>t.id===s.townId),after=projectNPCDex(mapDomain(value),{gender,assetBytes:h=>value.blobs.get(h)});ensure(after.towns.length===1&&same(before,after.towns[0]),'RECOVERY','Portable Map Presentation Changed: '+map.current.payload.name);}
  maps.push({...value,bytes,summary:{mapRecordId:map.recordId,name:map.current.payload.name,documentId:value.document.documentId,revision:value.document.revision,bytes:bytes.length,sha256:sha(bytes),ownedRecords:value.document.scope.ownedRecordIds.length,sharedRecords:value.document.scope.contextRecordIds.length,recordRevisions:value.document.content.records.length,plans:value.document.content.plans.length,reviews:value.document.content.reviews.length,assets:value.document.assetInventory.length,issueId:bindings.find(b=>b.recordId===map.recordId)?.issueId||null}});
 }
 const joined=joinNativeMaps(maps,{source:nativeSourceEvidence(domain,head),sharedDomain:domain});for(const gender of ['male','female'])ensure(same(projectNPCDex(domain,{gender,assetBytes}),projectNPCDex(joined,{gender,assetBytes})),'RECOVERY','Adopting Map Files Changed the '+gender+' NPCDex View.');
 return {maps,summary:{format:'ROMDexNativeAdoptionPreview/2',portableScope:'one-map-v2',head,domainSHA256:sha(canonical(domain)),maps:maps.map(m=>m.summary),recordCount:domain.records.length,plans:domain.plans.length,reviews:domain.reviews.length,assets:domain.assets.length,sharedCollections:domain.records.filter(r=>r.kind==='shared'&&r.current.payload.sharedType==='global-dialogue').map(r=>({recordId:r.recordId,name:r.current.payload.name})),nativeBindings:bindings.length,backendRecordsCreated:0,exactCatalogRoundtrip:true,exactMaleAndFemaleViews:true,oneMapPayloadPerFile:true,wholeCatalogRecoveryEmbedded:false}};
}

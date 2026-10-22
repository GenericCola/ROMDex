import {compactRecords} from './compact-records.mjs';
import {canonical,sha,seal,same} from '../content/contracts.mjs';
import {viewHeads} from '../content/view-contract.mjs';
import {mapDomain,retainDocument} from './map-import.mjs';
import {documentRevision,validateDocument} from './document.mjs';
import {ensure} from './limits.mjs';
import {ORGANIZATION_CAPABILITY,ORGANIZATION_EXTENSION} from './organization-contract.mjs';
import {FEATURE_EXTENSION,conditionIndex} from './features.mjs';
import {extractionFromDocument} from '../rom/source-context.mjs';
import {extractionDigest,validateExtraction} from '../rom/extract.mjs';
import {extractConditions} from '../rom/condition-extraction.mjs';
import {sealIdentities} from '../rom/update-contract.mjs';
function validateGroups(groups,parent,child){
 if(!groups)return;const nodes=groups.nodes;
 ensure(typeof groups.rootId==='string'&&Array.isArray(nodes)&&nodes.length>1&&nodes.length<=256&&new Set(nodes.map(n=>n.id)).size===nodes.length,'INVALID','Invalid Reviewed Map Group Tree.');
 const byId=new Map(nodes.map(n=>[n.id,n])),headers=new Set();ensure(byId.has(groups.rootId),'INVALID','The Group Root Is Missing.');
 const allowed=new Set([parent,child].flatMap(v=>extractionFromDocument(v)?.identities.headerIds||[]));
 for(const n of nodes){ensure(typeof n.id==='string'&&n.id.length<=128&&typeof n.name==='string'&&n.name.trim()&&Array.isArray(n.ownHeaders)&&n.ownHeaders.every(h=>Number.isSafeInteger(h)&&h>=0&&allowed.has(h)&&!headers.has(h)&&(headers.add(h),true)),'INVALID','Group Areas Must Have Unique Verified ROM Headers.');let at=n,seen=new Set();while(at.id!==groups.rootId){ensure(!seen.has(at.id)&&seen.size<8&&byId.has(at.parentId),'INVALID','Invalid Nested Map Group Parent.');seen.add(at.id);at=byId.get(at.parentId);}ensure(byId.get(groups.rootId).parentId===null,'INVALID','The Group Root Cannot Have a Parent.');}
}
const hash=a=>a.revisionId||a.digest;
const union=(a,b,key=hash)=>{const out=new Map();for(const x of [...a,...b]){const id=key(x),old=out.get(id);ensure(!old||same(old,x),'REVIEW_REQUIRED','Conflicting Versions Need Review: '+id);out.set(id,x);}return [...out.values()];};
function mergedFields(a,b){const out=structuredClone(a);for(const [key,value]of Object.entries(b)){if(out[key]===undefined)out[key]=structuredClone(value);else if(same(out[key],value))continue;else if(Array.isArray(value)&&Array.isArray(out[key]))out[key]=[...new Map([...out[key],...value].map(v=>[canonical(v),v])).values()];else if(value&&typeof value==='object'&&out[key]&&typeof out[key]==='object')out[key]=mergedFields(out[key],value);else ensure(['revision','savedAt','contentRevision'].includes(key),'REVIEW_REQUIRED','Overlapping Saved Metadata Needs Review: '+key);}return out;}
function mergeSource(document,blobs,parent,child){
 const a=extractionFromDocument(parent),b=extractionFromDocument(child);if(!a&&!b)return;
 ensure(a&&b&&a.source.sha256===b.source.sha256&&a.inventoryDigest===b.inventoryDigest&&a.identities.projectId===b.identities.projectId,'REVIEW_REQUIRED','Regroup Maps From the Same Verified ROM Build.');
 const x=structuredClone(a);for(const [key,value]of Object.entries(b))if(Array.isArray(value))x[key]=[...new Map([...(x[key]||[]),...value].map(v=>[canonical(v),v])).values()];
 x.identities=sealIdentities({...a.identities,headerIds:[...new Set([...a.identities.headerIds,...b.identities.headerIds])].sort((a,b)=>a-b),entries:union(a.identities.entries,b.identities.entries,e=>e.key)});x.testbed={...a.testbed,headerIds:x.identities.headerIds};
 if(a.conditionAnalysis||b.conditionAnalysis)x.conditionAnalysis=extractConditions(x);x.digest=extractionDigest(x);validateExtraction(x);
 const attach=value=>{const bytes=Buffer.from(canonical(value)),hash=sha(bytes),assetId='content:asset-'+hash;if(!document.assetInventory.some(a=>a.assetId===assetId))document.assetInventory.push({assetId,sha256:hash,bytes:bytes.length,mime:'application/json',purpose:'attachment'});blobs.set(hash,bytes);return assetId;};
 const header=structuredClone(x),sections={};for(const [key,value]of Object.entries(x))if(Array.isArray(value)){delete header[key];sections[key]=[];for(let i=0;i<value.length;i+=64)sections[key].push(attach({format:'ROMDexExtractionSection/1',section:key,offset:i,items:value.slice(i,i+64)}));}
 document.extensions['org.romdex.rom-source']={...document.extensions['org.romdex.rom-source'],sourceAsset:attach({format:'ROMDexExtractionIndex/1',extractionDigest:x.digest,header,sections}),extractionDigest:x.digest};
 document.extensions['org.romdex.import-preparation']={...document.extensions['org.romdex.import-preparation'],selectedHeaderIds:[...new Set([parent,child].flatMap(v=>v.document.extensions?.['org.romdex.import-preparation']?.selectedHeaderIds||extractionFromDocument(v).areas.map(a=>a.headerId)))].sort((a,b)=>a-b),sourceArchiveHeaderIds:x.identities.headerIds};
}
export function combineMapDocuments(parent,child,{childKey,token,createdAt,groups=null}){
 ensure(parent.document.datasetId===child.document.datasetId&&parent.document.scope.mapRecordId!==child.document.scope.mapRecordId,'INVALID','Choose Two Different Maps From One Project.');
 ensure(!parent.requiresHumanTesting&&!child.requiresHumanTesting&&parent.document.origin.role!=='agent-result'&&child.document.origin.role!=='agent-result','REVIEW_REQUIRED','Resolve Pending Agent Returns Before Regrouping.');
 validateGroups(groups,parent,child);
 const a=mapDomain(parent),b=mapDomain(child),root=a.records.find(r=>r.kind==='map'),old=b.records.find(r=>r.kind==='map'),contexts=new Set(['profile','region','shared']);
 const overlaps=a.records.filter(r=>b.records.some(n=>n.recordId===r.recordId));ensure(overlaps.every(r=>contexts.has(r.kind)&&same(b.records.find(n=>n.recordId===r.recordId).current,r.current)&&b.records.find(n=>n.recordId===r.recordId).kind===r.kind),'REVIEW_REQUIRED','The Maps Have Overlapping Content or Conflicting Shared Definitions.');
 const document=structuredClone(parent.document),blobs=new Map([...parent.blobs,...child.blobs]);document.assetInventory=union(document.assetInventory,child.document.assetInventory,a=>a.assetId);
 document.capabilities.required=[...new Set([...document.capabilities.required,...child.document.capabilities.required,ORGANIZATION_CAPABILITY,'org.romdex.npcdex.nested-zones-v1'])];
 document.extensions[ORGANIZATION_EXTENSION]={format:'ROMDexMapOrganization/1',reviewToken:token,formerMaps:[...(document.extensions[ORGANIZATION_EXTENSION]?.formerMaps||[]),...(child.document.extensions[ORGANIZATION_EXTENSION]?.formerMaps||[]),{key:childKey,recordId:old.recordId,revision:child.document.revision}]};
 const records=[...a.records,...b.records.filter(r=>!a.records.some(x=>x.recordId===r.recordId))].map(r=>structuredClone(r)),byId=new Map(records.map(r=>[r.recordId,r])),changed=new Set(),change=r=>{changed.add(r.recordId);return r;};
 for(const r of overlaps)if(r.revisionId!==b.records.find(n=>n.recordId===r.recordId).revisionId)change(byId.get(r.recordId));
 const zone=change(byId.get(old.recordId));if(groups){const childGroup=child.document.extensions?.['org.romdex.map-groups']?.rootId||extractionFromDocument(child)?.testbed.key;zone.legacyData={...zone.legacyData,romGroup:{format:'ROMDexMapGroup/1',id:childGroup,sourceSHA256:child.document.extensions?.['org.romdex.rom-source']?.sourceSHA256}};}zone.kind='subzone';zone.parentRecordId=root.recordId;zone.current.payload={name:old.current.payload.name,mapId:root.recordId,sourceAreaKeys:[],appearanceIds:[],interactiveIds:[],sceneIds:[],aliasRefs:[],subzoneIds:b.records.filter(r=>r.kind==='subzone'&&r.parentRecordId===old.recordId).map(r=>r.recordId)};
 for(const r of b.records.filter(r=>r.kind==='subzone'))change(byId.get(r.recordId)).current.payload.mapId=root.recordId;
 change(byId.get(root.recordId)).current.payload.subzoneIds=[...new Set([...root.current.payload.subzoneIds,old.recordId,...old.current.payload.subzoneIds])];
 const leftIndex=conditionIndex(a.records),rightIndex=conditionIndex(b.records);ensure(!!leftIndex===!!rightIndex,'REVIEW_REQUIRED','Upgrade Both Maps to the Same Condition Format Before Regrouping.');
 const timeline=change(byId.get(root.current.payload.timelineRef)),other=change(byId.get(old.current.payload.timelineRef));timeline.current.payload.definitions.stages=union(timeline.current.payload.definitions.stages,other.current.payload.definitions.stages,s=>s.id);
 if(leftIndex){const index=timeline.current.payload.definitions.conditionIndex;for(const key of ['conditions','effects','coverage'])index[key]=union(index[key],rightIndex[key],x=>x.id||x.recordId);index.displayOrder=[...new Set([...index.displayOrder,...rightIndex.displayOrder])];delete other.current.payload.definitions.conditionIndex;}
 const before=new Map([...a.records,...b.records].map(r=>[r.recordId,r]));
 for(let i=0;i<records.length;i++)if(changed.has(records[i].recordId)){const r=records[i],prior=before.get(r.recordId);records[i]=seal({...r,parents:[...new Set([prior.revisionId,...overlaps.filter(x=>x.recordId===r.recordId).flatMap(x=>[x.revisionId,b.records.find(y=>y.recordId===x.recordId).revisionId])])],operationId:'content:regroup-'+sha(token+r.recordId).slice(0,40),createdAt,actorClaim:'content:owner'});}
 document.content.records=union(union(a.revisions,b.revisions),records);document.content.recordHeads=records.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));for(const key of ['plans','reviews','mappings'])document.content[key]=union(a[key],b[key]);document.content.history=union(document.content.history,child.document.content.history,h=>h.sha256);document.content.archivalRequests=union(document.content.archivalRequests,child.document.content.archivalRequests,r=>r.recordId);
 const allViews=union(a.views,b.views),heads=viewHeads(allViews),updated=[];const rootViews=heads.filter(v=>v.recordId===null),parentView=heads.find(v=>v.recordId===root.recordId),childView=heads.find(v=>v.recordId===old.recordId);
 for(const v of heads){const payload=structuredClone(v.payload);let update=false;if(v.recordId===null){if(v!==rootViews[0])continue;payload.fields=rootViews.reduce((out,x)=>mergedFields(out,x.payload.fields),{});payload.collectionOrder=[root.recordId];payload.reviewBindings=union(rootViews.flatMap(v=>v.payload.reviewBindings),[],r=>r.reviewId+':'+r.legacyKey);update=rootViews.length>1;}
  else {if(payload.collectionId===old.recordId){payload.collectionId=root.recordId;update=true;}if(payload.locationPreviews?.mapRecordId===old.recordId){payload.locationPreviews.mapRecordId=root.recordId;update=true;}if(v===parentView&&childView?.payload.roster){payload.roster=union(payload.roster||[],childView.payload.roster,r=>r.fields.id);update=true;}if(v===childView&&payload.roster){delete payload.roster;update=true;}}
  if(update)updated.push(seal({...v,parents:v.recordId===null?rootViews.map(v=>v.digest):[v.digest],operationId:'content:regroup-view-'+sha(token+v.viewId).slice(0,36),createdAt,actorClaim:'content:owner',payload}));
 }
 document.content.views=union(allViews,updated);
 if(document.extensions[FEATURE_EXTENSION]||child.document.extensions[FEATURE_EXTENSION])document.extensions[FEATURE_EXTENSION]={...(document.extensions[FEATURE_EXTENSION]||child.document.extensions[FEATURE_EXTENSION]),conditionIndexRecordId:leftIndex?timeline.recordId:null,locationPreviewViewIds:viewHeads(document.content.views).filter(v=>v.payload.locationPreviews).map(v=>v.viewId)};
 document.scope.ownedRecordIds=records.filter(r=>!contexts.has(r.kind)).map(r=>r.recordId);document.scope.contextRecordIds=records.filter(r=>contexts.has(r.kind)).map(r=>r.recordId);document.scope.completeForParentIds=[...new Set([...document.scope.completeForParentIds,...child.document.scope.completeForParentIds])];document.scope.baselineInventory=union(document.scope.baselineInventory,child.document.scope.baselineInventory,r=>r.recordId);
 retainDocument(document,blobs,child);mergeSource(document,blobs,parent,child);if(groups)document.extensions['org.romdex.map-groups']={format:'ROMDexMapGroups/1',...structuredClone(groups)};compactRecords(document,blobs);document.revision=documentRevision(document);const documentBytes=Buffer.from(canonical(document));validateDocument(documentBytes,{blobs});return {document,documentBytes,blobs};
}

export class MapOrganization{
 constructor(maps){this.maps=maps;}
 async preview(request){
  ensure(request?.parentKey&&request?.childKey&&request.parentKey!==request.childKey,'INVALID','Choose a Different Parent and Child Map.');
  const values=await Promise.all([request.parentKey,request.childKey].map(key=>this.maps.store.view(key)));
  ensure(values.every(v=>v.status.saved)&&![request.parentKey,request.childKey].some(k=>this.maps.get('retired-map:'+k)||this.maps.adoption?.owns(k)),'REVIEW_REQUIRED','Choose Two Current Saved Managed Maps.');
  const clouds=[request.parentKey,request.childKey].map(k=>this.maps.cloud?.get(k)||null);
  ensure(clouds.every(s=>!s?.intent&&!s?.review&&!s?.held)&&!!clouds[0]===!!clouds[1],'REVIEW_REQUIRED','Finish Cloud Review First. Publish Both Maps or Keep Both Local Before Regrouping.');
  const baselines=values.map((v,i)=>({key:[request.parentKey,request.childKey][i],head:v.document.revision,cloud:clouds[i]})),token=sha(canonical({request,baselines})),createdAt=new Date().toISOString();
  const result=combineMapDocuments(...values,{childKey:request.childKey,token,createdAt,groups:request.groups||null}),domain=mapDomain(result),parent=domain.records.find(r=>r.kind==='map'),child=domain.records.find(r=>r.recordId===values[1].document.scope.mapRecordId);
  const preview={request:{parentKey:request.parentKey,childKey:request.childKey,...(request.groups?{groups:request.groups}:{})},token,createdAt,baselines,parent:{id:parent.recordId,name:parent.current.payload.name},child:{id:child.recordId,name:child.current.payload.name},records:domain.records.length,areas:domain.records.filter(r=>r.kind==='subzone').length,plans:domain.plans.length,notes:domain.reviews.length,notice:'The child becomes a nested zone in the parent’s one working RDX. All descendants, identities, local edits, images, source evidence, proposals and history are retained. Its old working file and registry remain archived recovery evidence; no YouTrack issue is deleted.'};
  this.maps.set('map-organization-preview',preview);return preview;
 }
 async commit(input){
  const p=this.maps.get('map-organization-preview');ensure(p&&input?.approved===true&&p.token===input.token,'REVIEW_REQUIRED','Review the Exact Parent/Child Migration First.');
  const values=[];for(const b of p.baselines){const v=await this.maps.store.view(b.key);ensure(v.status.saved&&v.document.revision===b.head&&same(this.maps.cloud?.get(b.key)||null,b.cloud),'CONFLICT','A Map, Binding or Publication Changed. Preview Again.');values.push(v);}
  const value=combineMapDocuments(...values,{childKey:p.request.childKey,token:p.token,createdAt:p.createdAt,groups:p.request.groups||null}),domain=mapDomain(value);
  await this.maps.store.saveBatch([{key:p.request.parentKey,expectedRevision:p.baselines[0].head,documentBytes:value.documentBytes,blobs:value.blobs}],{metadata:heads=>{
   const after=heads[0].after;this.maps.set('map-organization:'+p.token,{...p,head:after});this.maps.set('organization-authority:'+p.request.parentKey,{token:p.token,revision:after,parents:domain.records.map(r=>({recordId:r.recordId,parentRecordId:r.parentRecordId}))});this.maps.set('retired-map:'+p.request.childKey,{parentKey:p.request.parentKey,baseline:p.baselines[1].head,token:p.token});
   if(p.baselines[0].cloud){const state=structuredClone(p.baselines[0].cloud),other=p.baselines[1].cloud;state.records=union(state.records||[],other.records||[],r=>r.recordId);state.native=union(state.native||[],other.native||[],r=>r.issueId);state.contextPins=union(state.contextPins||[],other.contextPins||[],r=>r.recordId).sort((a,b)=>a.recordId.localeCompare(b.recordId));this.maps.cloud.save(p.request.parentKey,state);}
   if(this.maps.active===p.request.childKey){this.maps.active=p.request.parentKey;this.maps.set('active',this.maps.active);}this.maps.set('map-organization-preview',null);
  }});this.maps.changed();return {saved:true,parentKey:p.request.parentKey,childKey:p.request.childKey,head:this.maps.store.row(p.request.parentKey).head};
 }
}

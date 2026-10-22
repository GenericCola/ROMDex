import {canonical,sha,seal,verifyDigest,validateGraph,same} from '../content/contracts.mjs';
import {viewHeads} from '../content/view-contract.mjs';
import {mapDomain} from './map-import.mjs';
import {validateShape} from './schema.mjs';
import {ensure,LIMITS} from './limits.mjs';

const ref=r=>({recordId:r.recordId,revisionId:r.revisionId});
const activePlans=plans=>viewHeads(plans).filter(p=>!['implemented','superseded'].includes(p.workflow));
export const executionPlan=p=>p.intent!=='FINAL'&&!['implemented','superseded'].includes(p.workflow);
export const packageName=(id,version,suffix='json')=>'NPCDex-'+sha(id).slice(0,16)+'-v'+version+'.'+suffix;
const idList=(value,records)=>{const found=new Set();const walk=x=>{if(typeof x==='string'&&records.has(x))found.add(x);else if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')Object.values(x).forEach(walk);};walk(value);return found;};
const at=(value,path)=>{let x=value;for(const part of path.split('/').slice(1).map(p=>p.replace(/~1/g,'/').replace(/~0/g,'~'))){if(!x||typeof x!=='object'||!Object.hasOwn(x,part))return {exists:false};x=x[part];}return {exists:true,value:x};};
function readClosure(plan,records){
 const ids=new Set([plan.target.recordId,...plan.readSet.map(r=>r.recordId),...plan.changes.map(c=>c.recordId)]);
 for(const change of plan.changes)for(const id of idList([change.before,change.after],records))ids.add(id);
 const todo=[...ids];while(todo.length){const r=records.get(todo.pop());ensure(r,'INVALID','A Package Read Record Is Missing.');const p=r.current.payload,related=[r.parentRecordId,p.timelineRef,p.profileId,...Object.values(p.profileByPlayerGender||{}),...(p.sceneIds||[]),...(p.participantIds||[])];
  for(const point of Object.values(p.points||p.definitions?.points||{})){related.push(...point.participantIds);for(const block of Object.values(point.blocks))related.push(block.speaker);}
  for(const id of related.filter(Boolean))if(!ids.has(id)){ensure(records.has(id),'INVALID','A Required Package Dependency Is Missing.');ids.add(id);todo.push(id);}
 }
 return [...ids].sort();
}
function targetLabel(target,records){let r=records.get(target.recordId),parts=[];const seen=new Set();while(r&&!seen.has(r.recordId)){seen.add(r.recordId);parts.unshift(r.current.payload.name||r.recordId);r=records.get(r.parentRecordId);}for(const [name,value]of [['Point',target.pointId],['Prompt',target.promptKey],['Gender',target.gender]])if(value)parts.push(name+': '+value);if(target.blockIds.length)parts.push('Blocks: '+target.blockIds.join(', '));return parts.join(' / ');}
export function inspectMapPackage(value,{selection=null}={}){
 const d=value.document;ensure(d.kind==='map'&&d.origin.role!=='agent-result','INVALID','Open an Editable One-Map Document First.');
 const domain=mapDomain(value),records=validateGraph(domain.records),owned=new Set(d.scope.ownedRecordIds),plans=activePlans(domain.plans),reviews=viewHeads(domain.reviews).filter(r=>r.flag!=='none'||r.note.length);
 ensure(plans.length+reviews.length<=2000,'LIMIT','Package Preview Exceeds 2,000 Entries. Narrow the Map Before Packaging.');
 const all=[...plans.map(p=>({key:'plan:'+p.digest,kind:executionPlan(p)?'change':'final',artifact:p})),...reviews.map(r=>({key:'review:'+r.digest,kind:'note',artifact:r}))];
 const keys=new Set(all.map(e=>e.key));ensure(selection===null||Array.isArray(selection)&&selection.length<=2000&&new Set(selection).size===selection.length&&selection.every(k=>keys.has(k)),'CONFLICT','The Selected Package Entries Changed. Refresh the Preview.');
 const selected=new Set(selection??keys),chosen=all.filter(e=>selected.has(e.key)),requests=chosen.filter(e=>e.key.startsWith('plan:')).map(e=>e.artifact),observations=chosen.filter(e=>e.kind==='note').map(e=>e.artifact),work=requests.filter(executionPlan),context=requests.filter(p=>!executionPlan(p)),warnings=[],blockers=[];
 for(const p of work){const r=records.get(p.target.recordId);if(r.revisionId!==p.baseline.revisionId)blockers.push('The Current Content Changed Since This Request Was Written: '+targetLabel(p.target,records));for(const v of p.readSet)if(records.get(v.recordId)?.revisionId!==v.revisionId)blockers.push('A Request Read Baseline Changed: '+v.recordId);for(const id of new Set([p.target.recordId,...p.changes.map(c=>c.recordId)]))if(!owned.has(id))blockers.push('A Shared or Cross-Map Change Needs Explicit Scope Review: '+id);}
 const branches=new Map();for(const p of requests){const old=branches.get(p.planId);if(old&&old!==p.digest)blockers.push('Conflicting Versions of One Change Need Review: '+p.planId);branches.set(p.planId,p.digest);}
 const patches=[];for(const p of work)for(const change of p.changes){if(!same(at(records.get(change.recordId)?.current,change.path),change.before))blockers.push('A Requested Change No Longer Matches Its Baseline: '+change.recordId+' '+change.path);for(const prior of patches)if(prior.recordId===change.recordId&&(prior.path===change.path?!same(prior.after,change.after):prior.path.startsWith(change.path+'/')||change.path.startsWith(prior.path+'/')))blockers.push('Selected Changes Overlap Incompatibly: '+change.recordId+' '+change.path);patches.push(change);}
 const worksets=work.map(p=>({plans:[p],reads:new Set(readClosure(p,records)),writes:new Set(p.changes.length?p.changes.map(c=>c.recordId):[p.target.recordId])}));
 const intersects=(a,b)=>[...a].some(id=>b.has(id));let joined=true;while(joined){joined=false;outer:for(let a=0;a<worksets.length;a++)for(let b=a+1;b<worksets.length;b++){const x=worksets[a],y=worksets[b];if(intersects(x.writes,y.reads)||intersects(y.writes,x.reads)||intersects(x.writes,y.writes)){x.plans.push(...y.plans);for(const id of y.reads)x.reads.add(id);for(const id of y.writes)x.writes.add(id);worksets.splice(b,1);joined=true;break outer;}}}
 const groups=worksets.map(g=>({groupId:'package:work-'+sha(canonical(g.plans.map(p=>p.digest).sort())).slice(0,32),planDigests:g.plans.map(p=>p.digest).sort(),readSet:[...g.reads].sort().map(id=>ref(records.get(id))),writeRecordIds:[...g.writes].sort(),dependsOn:[],acceptanceChecks:['Resolve the recorded locators uniquely against the supplied ROM/source before any change.','Return all outcomes in this dependent group together; preserve unrelated content.','All implemented outcomes require human review and in-game testing; leave the task open.']}));
 if(context.length||!work.length)groups.push({groupId:'package:context-'+sha(canonical(context.map(p=>p.digest).sort())).slice(0,32),planDigests:context.map(p=>p.digest).sort(),readSet:[ref(records.get(d.scope.mapRecordId))],writeRecordIds:[],dependsOn:[],acceptanceChecks:['Context only: FINAL decisions, flags and notes authorize no ROM changes.']});
 const mappingRefs=new Set(domain.records.flatMap(r=>r.mappingRefs)),mappings=domain.mappings.filter(m=>mappingRefs.has(m.digest));
 for(const p of work)if(!mappings.some(m=>m.recordId===p.target.recordId&&m.status!=='unresolved'&&m.locators.length))warnings.push('ROM Locator Needs Agent Verification: '+targetLabel(p.target,records));
 const primary=mappings.find(m=>m.recordId===d.scope.mapRecordId)||mappings[0],source=primary?.source||{repositoryId:'document:unresolved-rom',revision:d.revision,artifactSha256:sha(value.documentBytes),verification:'documented'};
 if(!primary||source.verification!=='rom-verified')warnings.push('Recorded Documentation Is Not Proof of the Latest ROM Build. The Agent Must Verify the ROM and Every Target Before Implementation.');
 const assetIds=new Set(requests.flatMap(p=>p.requiredAssetIds));for(const r of domain.records){const p=r.current.payload;for(const id of [p.baseImageId,p.overrides?.imageAssetId].filter(Boolean))assetIds.add(id);}
 const displayImages=[];for(const view of viewHeads(domain.views||[])){if(records.get(view.recordId)?.revisionId!==view.source.recordRevision)continue;const image=view.payload.fields?.image,value=image?.format==='NPCDexViewImage/1'?image:image?.dataUrl?.format==='NPCDexViewImage/1'?image.dataUrl:null;if(value){assetIds.add(value.assetId);displayImages.push({recordId:view.recordId,assetId:value.assetId});}}
 const inventoryIds=new Set(d.assetInventory.filter(a=>a.purpose!=='history').map(a=>a.assetId)),referenced=idList([domain.records,requests],new Map([...inventoryIds].map(id=>[id,true])));for(const id of referenced)assetIds.add(id);
 const assets=[...assetIds].sort().map(id=>{const a=d.assetInventory.find(a=>a.assetId===id);ensure(a&&value.blobs.has(a.sha256),'INVALID','A Required Package Asset Is Missing: '+id);return a;});
 ensure(chosen.length>0,'INVALID','Select at Least One Change, FINAL Decision, Flag or Note.');
 return {document:d,domain,records,requests,observations,groups,source,mappings,assets,displayImages,selection:[...selected].sort(),warnings:[...new Set(warnings)],blockers:[...new Set(blockers)],contextOnly:work.length===0,mapName:records.get(d.scope.mapRecordId).current.payload.name,
  rows:all.map(e=>({key:e.key,selected:selected.has(e.key),kind:e.kind,intent:e.artifact.intent||null,target:targetLabel(e.artifact.target,records),recordId:e.artifact.target.recordId,instructions:e.artifact.instructions??null,dialogue:e.artifact.proposedDialogue??null,note:e.artifact.note??null,flag:e.artifact.flag??null,returnMode:e.kind!=='change'?'context':e.artifact.changes.length?'typed':'review-exact-result'})),executable:work.map(p=>p.digest)};
}
export function buildMapPackage(prepared,{packageId,version,assets}){
 ensure(!prepared.blockers.length,'REVIEW_REQUIRED',prepared.blockers.join('\n'));
 const d=prepared.document,pkg=seal({format:'NPCDexMapPackage/2',packageId,version,datasetId:d.datasetId,baseDocument:{documentId:d.documentId,revision:d.revision},mapRecordId:d.scope.mapRecordId,source:prepared.source,contextRecords:prepared.domain.records,mappings:prepared.mappings,requests:prepared.requests,observations:prepared.observations,groups:prepared.groups,assets,
 instructions:[prepared.contextOnly?'NO ROM CHANGES REQUESTED. This is a context-only package.':'The selected non-FINAL changes in execution groups define the requested scope. Internal Draft/Ready labels are retained provenance, not an additional approval gate.',
 'Attaching this fixed package does not dispatch work. Execute only after separate explicit human handoff of this task.',
 'FINAL decisions, notes and flags are context. Groups with no writeRecordIds authorize no changes. Never infer work from unselected plans in the baseline RDX.',
 'This JSON supplies the permitted current baseline records, mapping evidence, selected plan/observation versions and portable document identity. Required asset locations give verified YouTrack identities and exact hashes; no private GitHub access is required. The full working RDX stays local so excluded notes/plans/history are not exposed. Construct the returned map from this context; ROMDex must retain its original local presentation, history and unselected drafts during reconciliation.',
 'The source hash describes recorded extraction/inventory evidence, not necessarily ROM bytes. Verify the actual ROM/source revision and resolve each locator uniquely before implementation. Missing or ambiguous mappings require clarification; do not guess.',
 'Preserve all stable identities. Return an updated one-map .rdx to this same actionable task with the separate RDXTaskBinding/1, exact package byte hash, base document, source evidence and per-group outcomes. Do not write NPCD directly.',
 'Precisely bounded typed patches may reconcile automatically. Instructions-only requests require human approval of the exact returned differences. Do not broaden record, passage, dependency or task scope.',
 'Every agent result needs human review and testing. Notify that it is ready for testing and leave the task open. Later NPCDex edits are newer drafts and must survive this package.',...prepared.displayImages.map(a=>'Current Display Image (Context Only): Record '+a.recordId+' uses Asset '+a.assetId+'. Preserve this association; this is not a sprite replacement instruction.'),...prepared.warnings]});
 validateMapPackage(pkg);const bytes=Buffer.from(JSON.stringify(pkg,null,2)+'\n');ensure(bytes.length<=LIMITS.json,'LIMIT','Map Package JSON Exceeds 16 MiB.');return {package:pkg,bytes,sha256:sha(bytes),name:packageName(packageId,version)};
}
export function validateMapPackage(pkg){
 validateShape(pkg,'package');verifyDigest(pkg);const records=validateGraph(pkg.contextRecords);
 ensure(pkg.contextRecords.filter(r=>r.kind==='map').length===1&&records.get(pkg.mapRecordId)?.kind==='map','INVALID','A Package Must Describe One Physical Map.');
 for(const a of [...pkg.contextRecords,...pkg.mappings,...pkg.requests,...pkg.observations]){verifyDigest(a);ensure(a.workspaceId===pkg.datasetId,'INVALID','Package Artifact Dataset Differs.');}
 const assigned=pkg.groups.flatMap(g=>g.planDigests),plans=new Map(pkg.requests.map(p=>[p.digest,p])),groups=new Map(pkg.groups.map(g=>[g.groupId,g]));
 ensure(plans.size===pkg.requests.length&&groups.size===pkg.groups.length&&new Set(assigned).size===assigned.length&&same([...assigned].sort(),pkg.requests.map(p=>p.digest).sort()),'INVALID','Package Requests Must Belong to Exactly One Group.');
 for(const g of pkg.groups){
  const executable=g.planDigests.map(h=>plans.get(h)).filter(executionPlan),writes=[...new Set(executable.flatMap(p=>p.changes.length?p.changes.map(c=>c.recordId):[p.target.recordId]))].sort();
  ensure(same([...g.writeRecordIds].sort(),writes),'INVALID','Package Group Write Scope Differs From Its Selected Changes.');
  const reads=new Map(g.readSet.map(r=>[r.recordId,r.revisionId]));for(const p of executable)for(const id of readClosure(p,records))ensure(reads.get(id)===records.get(id).revisionId,'INVALID','Package Group Omits a Required Read Baseline.');
  for(const id of g.writeRecordIds)ensure(records.has(id),'INVALID','Package Write Scope Is Missing Its Baseline Record.');
 }
 ensure(groups.size<=2000,'LIMIT','Package Group Limit Exceeded.');const marks=new Map();for(const root of groups.keys()){if(marks.get(root)===2)continue;const stack=[{id:root,exit:false}];while(stack.length){const frame=stack.pop();ensure(groups.has(frame.id),'INVALID','A Package Group Dependency Is Missing.');if(frame.exit){marks.set(frame.id,2);continue;}if(marks.get(frame.id)===2)continue;ensure(marks.get(frame.id)!==1,'INVALID','Package Group Dependencies Are Cyclic.');marks.set(frame.id,1);stack.push({id:frame.id,exit:true});for(const id of groups.get(frame.id).dependsOn)stack.push({id,exit:false});}}
 for(const p of pkg.requests)for(const id of p.requiredAssetIds)ensure(pkg.assets.some(a=>a.assetId===id),'INVALID','A Required Package Asset Has No Verified Delivery Location.');
 ensure(new Set(pkg.assets.map(a=>a.assetId)).size===pkg.assets.length,'INVALID','Duplicate Package Asset Identity.');
 for(const a of pkg.assets)ensure(a.location.instanceOrigin==='https://thegobindsingh.youtrack.cloud','AUTH','A Package Asset Is Outside the Approved YouTrack Origin.');
 return pkg;
}

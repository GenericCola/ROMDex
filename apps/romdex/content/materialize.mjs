import {requireThat,verifyDigest,validateGraph,same,unique} from './contracts.mjs';
const digest=a=>a.revisionId||a.digest;
const empty=()=>({records:[],plans:[],reviews:[],mappings:[],assets:[],revisions:[]});
export function validateDomain(domain){
 for(const key of ['records','plans','reviews','mappings','assets'])requireThat(domain[key].length<=10000,'Content Domain Collection Exceeds Its Bound.');requireThat(domain.revisions.length<=50000,'Content Revision History Exceeds Its Bound.');
 const graph=validateGraph(domain.records),revisions=new Map(domain.revisions.map(r=>[r.revisionId,r]));
 for(const artifact of [...domain.plans,...domain.reviews]){
  requireThat(graph.has(artifact.target.recordId),'Proposal or Review Target Is Missing.');
  const base=revisions.get(artifact.baseline.revisionId);requireThat(base?.recordId===artifact.target.recordId,'Proposal Baseline Is Missing.');
  for(const ref of artifact.readSet||[])requireThat(revisions.get(ref.revisionId)?.recordId===ref.recordId,'Proposal Read Reference Is Missing.');
  const point=artifact.target.pointId?base.current.payload.points?.[artifact.target.pointId]:null;
  if(artifact.target.pointId)requireThat(point,'Proposal Point Is Missing.');for(const id of artifact.target.blockIds)requireThat(point?.blocks[id],'Proposal Block Is Missing.');
 }
 for(const [list,key]of [[domain.plans,'planId'],[domain.reviews,'reviewId']]){const byHash=new Map(list.map(a=>[a.digest,a])),marks=new Map();for(const artifact of list){if(marks.get(artifact.digest)===2)continue;const stack=[{artifact,next:0}];while(stack.length){const frame=stack.at(-1),a=frame.artifact;marks.set(a.digest,1);if(frame.next===a.parents.length){marks.set(a.digest,2);stack.pop();continue;}const hash=a.parents[frame.next++],parent=byHash.get(hash);requireThat(parent&&parent[key]===a[key],'Proposal Ancestry Is Missing or Mismatched.');requireThat(marks.get(hash)!==1,'Proposal Ancestry Cycle.');if(marks.get(hash)!==2)stack.push({artifact:parent,next:0});}}}
 const mappings=new Map(domain.mappings.map(m=>[m.digest,m]));
 for(const record of domain.records)for(const ref of record.mappingRefs)requireThat(mappings.get(ref)?.recordId===record.recordId,'Record Mapping Is Missing.');
 const assets=new Set(domain.assets.map(a=>a.assetId));
 for(const record of domain.records){const p=record.current.payload;for(const id of [p.baseImageId,p.overrides?.imageAssetId].filter(Boolean))requireThat(assets.has(id),'Content Image Asset Is Missing.');}
 for(const plan of domain.plans)for(const id of plan.requiredAssetIds)requireThat(assets.has(id),'Plan Asset Is Missing.');
 return domain;
}
export function applyPublication(parent,pub,artifacts,assets){
 requireThat(same([...pub.artifactDigests].sort(),artifacts.map(digest).sort()),'Publication Artifact Set Differs.');
 unique(artifacts.map(a=>a.operationId),'Operation Within Publication');
 const domain=parent?structuredClone(parent):empty();
 const prior=new Map(domain.records.map(r=>[r.recordId,r]));
 for(const base of pub.baseRevisions)requireThat(prior.get(base.recordId)?.revisionId===base.revisionId,'Publication Baseline Is Stale.');
 if(pub.kind==='bootstrap'){
  requireThat(!parent&&!pub.parentPublications.length&&!pub.baseRevisions.length&&!pub.resultDigest&&!pub.groupId,'Invalid Initial Publication.');
  for(const a of artifacts){
   if(a.schema==='NPCDexContentRevision/1'){requireThat(a.parents.length===0,'Bootstrap Record Has a Prior Revision.');domain.records.push(a);domain.revisions.push(a);}
   else if(a.schema==='NPCDexPlanRevision/1')domain.plans.push(a);
   else if(a.schema==='NPCDexReviewRevision/1')domain.reviews.push(a);
   else if(a.schema==='NPCDexROMMapping/1')domain.mappings.push(a);
   else throw Error('Unsupported Bootstrap Artifact.');
  }
 }else if(pub.kind==='planning'){
  requireThat(parent&&!pub.resultDigest&&!pub.groupId,'Invalid Planning Publication.');
  for(const a of artifacts){const key=a.schema==='NPCDexPlanRevision/1'?'plans':a.schema==='NPCDexReviewRevision/1'?'reviews':null;requireThat(key,'Planning Cannot Replace Current Content.');const identity=key==='plans'?'planId':'reviewId';for(const p of a.parents){const previous=domain[key].find(x=>x.digest===p);requireThat(previous?.[identity]===a[identity],'Planning Parent Does Not Match.');}if(!domain[key].some(x=>x.digest===a.digest))domain[key].push(a);}
 }else if(pub.kind==='correction'){
  requireThat(parent&&pub.resultDigest&&!pub.groupId,'Invalid Documentation Correction Publication.');
  const correction=artifacts.find(a=>a.digest===pub.resultDigest);requireThat(correction?.schema==='NPCDexDocumentationCorrection/1'&&correction.romChangeRequested===false&&correction.reason.trim()&&correction.evidence.length,'Documentation Correction Evidence Is Missing.');
  for(const ref of correction.readSet)requireThat(prior.get(ref.recordId)?.revisionId===ref.revisionId,'Documentation Correction Is Stale.');
  unique(correction.recordUpdates.map(u=>u.before.recordId),'Correction Target');
  requireThat(artifacts.length===correction.recordUpdates.length+1,'Correction Contains Unrelated Artifacts.');
  for(const update of correction.recordUpdates){
   const before=prior.get(update.before.recordId),after=update.after;
   requireThat(before?.revisionId===update.before.revisionId&&after.recordId===before.recordId&&after.kind===before.kind,'Correction Target Differs.');
   requireThat(same(after.parents,[before.revisionId])&&after.current.lifecycle===before.current.lifecycle&&after.parentRecordId===before.parentRecordId,'Correction Cannot Perform a Lifecycle or Parent Move.');
   requireThat(same(after.mappingRefs,before.mappingRefs),'Correction Remapping Needs a Later Reviewed Workflow.');
   requireThat(artifacts.some(a=>a.revisionId===after.revisionId&&same(a,after)),'Correction After-Revision Is Missing.');
   domain.records=domain.records.map(r=>r.recordId===before.recordId?after:r);domain.revisions.push(after);
  }
 }else throw Error('This Publication Workflow Is Not Enabled in the Read-Only Preview.');
 for(const asset of assets){const previous=domain.assets.find(a=>a.assetId===asset.assetId);requireThat(!previous||previous.sha256===asset.sha256,'Asset Identity Was Reused for Different Bytes.');if(!previous)domain.assets.push(asset);}
 for(const list of [domain.plans,domain.reviews]){
  unique(list.map(a=>a.digest),'Versioned Proposal');
  for(const a of list){verifyDigest(a);for(const p of a.parents)requireThat(p!==a.digest,'Proposal Revision Cycle.');}
 }
 return validateDomain(domain);
}

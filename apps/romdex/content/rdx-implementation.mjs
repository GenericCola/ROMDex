import {seal,sha,canonical,same,requireThat,pointPayload,validateArtifact} from './contracts.mjs';
import {viewHeads} from './view-contract.mjs';
import {resultGroup} from '../rdx/result-validation.mjs';

const ref=r=>({recordId:r.recordId,revisionId:r.revisionId});
// Rebuilt both before queuing and during remote readback. The native owner
// publication is evidence of acceptance, never a portable approval credential.
export function implementationArtifacts(domain,receipt){
 validateArtifact(Buffer.from(canonical(receipt)),receipt.workspaceId);const facts=resultGroup(receipt),{pkg,group,plans,updates}=facts,prior=new Map(domain.records.map(r=>[r.recordId,r]));
 for(const r of group.readSet)requireThat(prior.get(r.recordId)?.revisionId===r.revisionId,'Returned Group Has a Stale Content Read Baseline.');
 const root=receipt.operationId.replace(/:evidence$/,''),base=(schema,suffix)=>({schema,workspaceId:receipt.workspaceId,operationId:root+':'+suffix,createdAt:receipt.createdAt,actorClaim:'content:rdx-reconciler'}),mappingBy=new Map(),mappings=receipt.mappings.map((m,i)=>{const next=seal({...m,...base(m.schema,'mapping-'+i)});mappingBy.set(m.digest,next.digest);return next;}),records=updates.map(({before,after})=>{
  requireThat(prior.get(before.recordId)?.revisionId===before.revisionId,'Returned Content Changed Before Application.');requireThat(!before.mappingRefs.length||after.mappingRefs.length,'An Implementation Cannot Discard All Mapping Evidence.');
  return seal({...after,...base(after.schema,'record-'+sha(after.recordId).slice(0,24)),mappingRefs:after.mappingRefs.map(h=>mappingBy.get(h)||h)});
 }),implemented=[];
 for(const plan of plans){const original=domain.plans.find(p=>p.digest===plan.digest);requireThat(original&&same(original,plan),'The Authorized Plan Version Is Missing Locally.');const heads=viewHeads(domain.plans.filter(p=>p.planId===plan.planId));if(heads.length===1&&heads[0].digest===plan.digest)implemented.push(seal({...plan,...base(plan.schema,'plan-'+sha(plan.planId).slice(0,24)),version:plan.version+1,parents:[plan.digest],workflow:'implemented'}));}
 const reviews=[];for(const record of records){
  const current=viewHeads(domain.reviews.filter(r=>r.target.recordId===record.recordId));const handled=new Set();
  for(const review of current){const target=review.target,p=pointPayload(record)?.points?.[target.pointId];if(target.pointId&&(!p||target.blockIds.some(id=>!p.blocks[id])))continue;
   requireThat(!handled.has(review.reviewId),'Conflicting Affected Review Notes Need Human Review.');handled.add(review.reviewId);reviews.push(seal({...review,...base(review.schema,'review-'+sha(review.reviewId).slice(0,24)),parents:[review.digest],baseline:ref(record),testStatus:'unreviewed'}));
  }
  if(!current.length||current.some(r=>!handled.has(r.reviewId))){const id='content:testing-'+sha(root+':'+record.recordId).slice(0,32);reviews.push(seal({...base('NPCDexReviewRevision/1','testing-'+sha(record.recordId).slice(0,24)),reviewId:id,parents:[],target:{recordId:record.recordId,pointId:null,blockIds:[],promptKey:null,gender:null},baseline:ref(record),flag:'none',note:'',testStatus:'unreviewed'}));}
 }
 return {...facts,records,mappings,implemented,reviews,artifacts:[receipt,...records,...mappings,...implemented,...reviews]};
}

export function applyImplementation(domain,pub,artifacts,assets){
 requireThat(pub.resultDigest&&pub.groupId,'RDX Application Evidence Is Missing.');const receipt=artifacts.find(a=>a.digest===pub.resultDigest);requireThat(receipt?.schema==='NPCDexRDXApplication/1'&&receipt.groupId===pub.groupId&&receipt.applicationId===pub.operationId&&receipt.operationId===pub.operationId+':evidence','Unsupported RDX Implementation Publication.');
 const built=implementationArtifacts(domain,receipt);requireThat(same(pub.baseRevisions,built.group.readSet)&&same([...pub.artifactDigests].sort(),built.artifacts.map(a=>a.revisionId||a.digest).sort())&&same(artifacts.slice().sort((a,b)=>(a.revisionId||a.digest).localeCompare(b.revisionId||b.digest)),built.artifacts.slice().sort((a,b)=>(a.revisionId||a.digest).localeCompare(b.revisionId||b.digest))),'RDX Implementation Artifacts Differ From Their Validated Evidence.');
 requireThat(!assets.length,'Unrequested Asset Uploads Cannot Accompany an RDX Implementation.');
 // Required image/attachment IDs and bytes are pinned by the immutable package.
 for(const a of built.pkg.assets){const old=domain.assets.find(x=>x.assetId===a.assetId);requireThat(old&&['sha256','bytes','mime'].every(k=>old[k]===a[k]),'Pinned Application Asset Differs From the Native Catalog.');}
 const next={...domain,records:domain.records.map(r=>built.records.find(n=>n.recordId===r.recordId)||r),revisions:[...domain.revisions,...built.records],plans:[...domain.plans,...built.implemented],reviews:[...domain.reviews,...built.reviews],mappings:[...domain.mappings,...built.mappings]};
 for(const key of ['records','revisions','plans','reviews','mappings'])domain[key]=next[key];return built;
}

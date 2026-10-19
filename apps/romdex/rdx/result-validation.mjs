import {canonical,parseJSON,sha,same,verifyDigest,validateArtifact} from '../content/contracts.mjs';
import {validateMapPackage} from './map-package.mjs';
import {validateShape} from './schema.mjs';
import {ensure} from './limits.mjs';

const fail=(ok,message)=>ensure(ok,'REVIEW_REQUIRED',message);
export function resultEvidence(receipt){
 const bytes=Buffer.from(receipt.packageJSON);fail(sha(bytes)===receipt.packageSHA256,'The Fixed Package Hash Differs.');
 const pkg=validateMapPackage(parseJSON(bytes)),result=parseJSON(Buffer.from(receipt.resultJSON));validateShape(result,'result');
 fail(same(result.taskBinding.package,{packageId:pkg.packageId,version:pkg.version,sha256:receipt.packageSHA256})&&same(result.baseDocument,pkg.baseDocument),'The Return Package or Base Differs.');
 fail(pkg.datasetId===receipt.workspaceId&&pkg.mapRecordId===receipt.recordId,'The Application Map Identity Differs.');
 fail(result.source.repositoryId===pkg.source.repositoryId&&result.source.beforeRevision.trim()&&result.source.afterRevision.trim()&&result.readinessNotice.trim(),'Source/Build Evidence or the Readiness Notice Is Missing.');
 fail(result.source.verification!=='fixture'||pkg.datasetId.startsWith('fixture:'),'Synthetic Source Evidence Cannot Authorize Production Content.');
 const groups=new Set(),plans=new Set();for(const g of result.groups){fail(!groups.has(g.groupId),'Duplicate Returned Group.');groups.add(g.groupId);const expected=pkg.groups.find(x=>x.groupId===g.groupId);fail(expected&&expected.writeRecordIds.length,'The Return Claims an Unknown or Context-Only Group.');for(const o of g.outcomes){fail(!plans.has(o.planDigest),'Duplicate Returned Plan Outcome.');plans.add(o.planDigest);fail(expected.planDigests.includes(o.planDigest)&&pkg.requests.some(p=>p.planId===o.planId&&p.digest===o.planDigest&&p.intent!=='FINAL'),'The Return Exceeds the Authorized Plan Scope.');fail(o.reason.trim()&&o.checks.every(c=>c.trim()),'Returned Outcome Evidence Is Empty.');fail(o.outcome==='implemented'||o.writes.length===0,'Unfinished Work Cannot Claim Content Writes.');}}
 return {pkg,result};
}

const parts=path=>{const values=path.split('/').slice(1).map(p=>p.replace(/~1/g,'/').replace(/~0/g,'~'));fail(path.startsWith('/')&&values.length&&['lifecycle','payload'].includes(values[0])&&values.every(p=>p&&!['__proto__','constructor','prototype'].includes(p)),'Unsupported Returned Patch Path.');return values;};
export function patchState(value,path){let at=value;for(const key of parts(path)){if(!at||typeof at!=='object'||!Object.hasOwn(at,key))return {exists:false};at=at[key];}return {exists:true,value:at};}
function patch(value,change){const keys=parts(change.path);let at=value;for(const key of keys.slice(0,-1)){fail(at&&typeof at==='object'&&!Array.isArray(at)&&Object.hasOwn(at,key),'A Returned Patch Parent Is Missing or Ambiguous.');at=at[key];}fail(at&&typeof at==='object'&&!Array.isArray(at),'Array-Index Patches Need Explicit Review.');const key=keys.at(-1);if(change.after.exists)at[key]=structuredClone(change.after.value);else delete at[key];}

// Package requests, not returned claims, define every permitted current-state
// byte. Group validation is pure and never imports returned drafts/views/tests.
export function resultGroup(receipt){
 const {pkg,result}=resultEvidence(receipt),group=pkg.groups.find(g=>g.groupId===receipt.groupId),actual=result.groups.find(g=>g.groupId===receipt.groupId);
 fail(group&&actual&&same([...actual.outcomes.map(o=>o.planDigest)].sort(),group.planDigests.slice().sort()),'A Dependent Group Is Incomplete. Nothing in That Group Was Applied.');
 fail(actual.outcomes.every(o=>o.outcome==='implemented'&&o.checks.length),'This Group Has Unfinished Work or Missing Implementation Checks.');
 const plans=group.planDigests.map(d=>pkg.requests.find(p=>p.digest===d)),base=new Map(pkg.contextRecords.map(r=>[r.recordId,r])),changes=new Map(),writes=new Map();
 fail(plans.every(p=>p.changes.length),'Instructions-Only Requests Need Human Scope Review Before Application.');
 for(const p of plans){const outcome=actual.outcomes.find(o=>o.planDigest===p.digest),ids=[...new Set(p.changes.map(c=>c.recordId))].sort();fail(same(outcome.writes.map(w=>w.recordId).sort(),ids),'Returned Write Membership Differs From the Requested Changes.');
  for(const change of p.changes){fail(group.writeRecordIds.includes(change.recordId)&&base.has(change.recordId),'A Returned Change Is Outside Its Group.');const list=changes.get(change.recordId)||[];for(const old of list)fail(old.path===change.path?same(old,change):!old.path.startsWith(change.path+'/')&&!change.path.startsWith(old.path+'/'),'Overlapping Request Patches Need Review.');if(!list.some(c=>same(c,change)))list.push(change);changes.set(change.recordId,list);}
  for(const w of outcome.writes){const old=writes.get(w.recordId);fail(!old||same(old,w),'Dependent Outcomes Disagree About a Written Revision.');writes.set(w.recordId,w);}
 }
 fail(same([...writes.keys()].sort(),[...changes.keys()].sort()),'Returned Group Writes Differ.');
 const updates=[];for(const [id,list]of changes){const before=base.get(id),w=writes.get(id),after=receipt.records.find(r=>r.recordId===id);fail(before&&after&&w.beforeRevision===before.revisionId&&w.afterRevision===after.revisionId,'A Returned Record Revision Pin Differs.');verifyDigest(after);
  fail(!['region','shared','profile'].includes(before.kind),'Shared or Cross-Map Writes Require Explicit Review.');
  fail(after.workspaceId===before.workspaceId&&after.kind===before.kind&&after.parentRecordId===before.parentRecordId&&same(after.parents,[before.revisionId])&&same(after.legacyRefs,before.legacyRefs)&&same(after.legacyData,before.legacyData),'A Return Cannot Rebind Stable Content Identity or Compatibility History.');
  const expected=structuredClone(before.current);for(const change of list){fail(same(patchState(before.current,change.path),change.before),'The Requested Before Value Differs From Its Fixed Baseline.');patch(expected,change);}
  fail(!same(expected,before.current)&&same(expected,after.current),'Returned Content Differs From the Exact Requested Patches.');updates.push({before,after});
 }
 fail(receipt.records.length===updates.length&&new Set(receipt.records.map(r=>r.recordId)).size===updates.length,'The Application Contains Unrelated Record Revisions.');
 const required=new Set(updates.flatMap(u=>u.after.mappingRefs.filter(h=>!u.before.mappingRefs.includes(h))));fail(same([...required].sort(),receipt.mappings.map(m=>m.digest).sort()),'Returned Mapping Inventory Differs.');
 for(const m of receipt.mappings){validateArtifact(Buffer.from(canonical(m)),receipt.workspaceId);fail(updates.some(u=>u.after.recordId===m.recordId&&u.after.mappingRefs.includes(m.digest))&&m.source.repositoryId===result.source.repositoryId&&m.source.revision===result.source.afterRevision&&m.source.artifactSha256===result.source.afterArtifactSha256,'Updated Mapping Evidence Does Not Match the Returned Build.');for(const locator of m.locators)fail(!/^(?:[a-z]+:|[\\/])/i.test(locator.path)&&!locator.path.split(/[\\/]/).includes('..'),'Unsafe Returned ROM Locator.');}
 return {pkg,result,group,plans,updates};
}

export function validateResultEnvelope(value,pkg,binding){
 const d=value.document,r=d.result;fail(d.kind==='map'&&d.origin.role==='agent-result'&&r?.requiresHumanTesting===true&&same(r.taskBinding,binding)&&same(r.baseDocument,pkg.baseDocument)&&d.datasetId===pkg.datasetId&&d.documentId===pkg.baseDocument.documentId&&d.scope.mapRecordId===pkg.mapRecordId,'Returned Map/Task/Package Identity Differs.');
 const base=new Map(pkg.contextRecords.map(r=>[r.recordId,r])),all=new Map(d.content.records.map(r=>[r.revisionId,r])),changed=new Set(r.groups.flatMap(g=>g.outcomes.flatMap(o=>o.writes.map(w=>w.recordId))));
 fail(same(d.content.recordHeads.map(h=>h.recordId).sort(),[...base.keys()].sort())&&!d.content.archivalRequests.length,'A Return Cannot Omit or Add Unrequested Content Identities.');
 for(const h of d.content.recordHeads){const b=base.get(h.recordId);fail(b&&all.get(h.revisionId)?.recordId===h.recordId,'A Returned Content Head Is Missing.');fail(changed.has(h.recordId)||h.revisionId===b.revisionId,'The Returned Map Changes Content Outside Its Declared Outcomes.');}
 for(const group of r.groups)for(const outcome of group.outcomes)for(const w of outcome.writes)fail(d.content.recordHeads.some(h=>h.recordId===w.recordId&&h.revisionId===w.afterRevision),'A Returned Write Is Not the Returned Map Head.');
 for(const a of pkg.assets){const actual=d.assetInventory.find(x=>x.assetId===a.assetId);fail(actual&&['assetId','sha256','bytes','mime'].every(k=>actual[k]===a[k]),'A Pinned Package Asset Was Changed or Omitted.');}
 return r;
}

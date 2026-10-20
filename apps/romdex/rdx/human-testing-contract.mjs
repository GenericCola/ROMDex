import {seal,verifyDigest,same} from '../content/contracts.mjs';
import {ensure} from './limits.mjs';

const exact=(v,n)=>v&&Object.keys(v).sort().join(',')===n.split(',').sort().join(',');
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export const TESTING_ACTIONS=['verify','fail','reopen','request-reversal','cancel-reversal','review-conflict'];
export function validateTestingHistory(history){
 ensure(exact(history,'format,events')&&history.format==='RDXHumanTestingHistory/1'&&Array.isArray(history.events)&&history.events.length>0&&history.events.length<=1000,'INVALID','Invalid Human Testing History.');
 let scope=null;const known=new Map(),reversals=new Map();
 for(const event of history.events){
  verifyDigest(event);
  ensure(exact(event,'format,id,key,receiptDigest,bindingDigest,action,build,notes,observed,createdAt,parent,digest'+(event.mergeParents?',mergeParents':''))&&event.format==='RDXHumanTestingDecision/1'&&typeof event.id==='string'&&event.id.length>0&&event.id.length<=100&&hash(event.key)&&hash(event.receiptDigest)&&hash(event.bindingDigest)&&TESTING_ACTIONS.includes(event.action)&&typeof event.build==='string'&&event.build.length<=240&&typeof event.notes==='string'&&event.notes.length<=8192&&typeof event.createdAt==='string'&&Number.isFinite(Date.parse(event.createdAt))&&(event.parent===null||hash(event.parent)&&known.has(event.parent)),'INVALID','Invalid Human Testing Decision.');
  ensure(event.action!=='verify'||event.build.trim().length>0,'INVALID','Human Verification Requires the Tested Build.');
  ensure(event.action==='verify'||event.notes.trim().length>0,'INVALID','Record a Reason for This Testing or Reversal Decision.');
  ensure(Array.isArray(event.observed)&&event.observed.length>0&&event.observed.length<=1000&&new Set(event.observed.map(r=>r.recordId)).size===event.observed.length&&event.observed.every(r=>exact(r,'recordId,revisionId')&&typeof r.recordId==='string'&&r.recordId.length>0&&hash(r.revisionId)),'INVALID','Invalid Human Testing Content Baseline.');
  ensure(!known.has(event.digest)&&(!event.mergeParents||Array.isArray(event.mergeParents)&&event.mergeParents.length>0&&event.mergeParents.length<=64&&new Set(event.mergeParents).size===event.mergeParents.length&&event.mergeParents.every(p=>hash(p)&&known.has(p)&&p!==event.parent)),'INVALID','Invalid Human Testing Merge Parents.');const pending=[event.parent,...(event.mergeParents||[])].filter(Boolean).some(p=>reversals.get(p));ensure(event.action!=='verify'||!pending,'REVIEW_REQUIRED','Cancel the Outstanding Reversal Request Before Verification.');ensure(event.action!=='cancel-reversal'||pending,'REVIEW_REQUIRED','There Is No Outstanding Reversal Request to Cancel.');reversals.set(event.digest,event.action==='request-reversal'?true:event.action==='cancel-reversal'?false:pending);
  const next={key:event.key,receiptDigest:event.receiptDigest,bindingDigest:event.bindingDigest};ensure(!scope||same(scope,next),'INVALID','Human Testing History Scope Changed.');scope=next;known.set(event.digest,event);
 }
 return history;
}
export function testingHeads(history){const parents=new Set(history.events.flatMap(e=>[e.parent,...(e.mergeParents||[])].filter(Boolean)));return history.events.filter(e=>!parents.has(e.digest));}
export function reversalPending(history){if(!history)return false;validateTestingHistory(history);const states=new Map();for(const e of history.events){const pending=[e.parent,...(e.mergeParents||[])].filter(Boolean).some(p=>states.get(p));states.set(e.digest,e.action==='request-reversal'?true:e.action==='cancel-reversal'?false:pending);}return testingHeads(history).some(e=>states.get(e.digest));}
export function extendsTesting(before,after){validateTestingHistory(after);return !before||validateTestingHistory(before).events.every(e=>after.events.some(n=>n.digest===e.digest&&same(n,e)));}
export function appendTesting(records,event){
 const prior=records?.[event.key],history=prior?structuredClone(validateTestingHistory(prior)):{format:'RDXHumanTestingHistory/1',events:[]};
 ensure(history.events.length<1000,'LIMIT','Human Testing History Requires Retention Review.');const heads=testingHeads(history).map(e=>e.digest).sort();history.events.push(seal({format:'RDXHumanTestingDecision/1',...event,parent:heads[0]||null,...(heads.length>1?{mergeParents:heads.slice(1)}:{})}));validateTestingHistory(history);return history;
}
export function verifiedTesting(acceptance,history,observed){
 if(!history)return false;validateTestingHistory(history);const heads=testingHeads(history);if(heads.length!==1)return false;const event=heads[0];
 return event.action==='verify'&&event.key===acceptance.key&&event.receiptDigest===acceptance.receiptDigest&&event.bindingDigest===acceptance.binding.digest&&same([...event.observed].sort((a,b)=>a.recordId.localeCompare(b.recordId)),[...observed].sort((a,b)=>a.recordId.localeCompare(b.recordId)));
}

// A resolution retains both causal branches and resets testing after a fork.
export function mergeTestingHistories(histories,{id,createdAt}){
 const byDigest=new Map();for(const h of histories.filter(Boolean))for(const e of validateTestingHistory(h).events){const old=byDigest.get(e.digest);ensure(!old||same(old,e),'INTEGRITY','A Human Testing Event Changed.');byDigest.set(e.digest,e);}
 const events=[],seen=new Set();while(events.length<byDigest.size){const ready=[...byDigest.values()].filter(e=>!seen.has(e.digest)&&[e.parent,...(e.mergeParents||[])].filter(Boolean).every(p=>seen.has(p))).sort((a,b)=>a.digest.localeCompare(b.digest));ensure(ready.length,'INVALID','Human Testing Merge Has Missing Ancestry.');for(const e of ready){events.push(e);seen.add(e.digest);}}
 const h={format:'RDXHumanTestingHistory/1',events};validateTestingHistory(h);const heads=testingHeads(h);if(heads.length===1)return h;const source=heads[0];return appendTesting({[source.key]:h},{id,key:source.key,receiptDigest:source.receiptDigest,bindingDigest:source.bindingDigest,action:'review-conflict',build:'',notes:'Concurrent human testing decisions were preserved during metadata review. Verify the current affected content and build again before completion.',observed:source.observed,createdAt});
}

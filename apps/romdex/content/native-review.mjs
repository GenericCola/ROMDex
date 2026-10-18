import {requireThat,same,seal,validateArtifact} from './contracts.mjs';
import {buildEdit} from './edits.mjs';
import {applyPublication} from './materialize.mjs';

// Ticket prose is evidence for review, never an executable content payload.
export function nativeReviewCommand(domain,review,input){
 requireThat(input&&Object.keys(input).every(k=>['issueId','observed','adoptTitle','reason','evidence','sharedAcknowledged'].includes(k)),'Unsupported Native Review Fields.');
 requireThat(review?.kind==='native-metadata-changed'&&review.issueId===input.issueId&&same(review.observed,input.observed),'The Native Edit Changed. Refresh and Review It Again.');
 requireThat(review.before.parentIssueId===review.observed.parentIssueId,'Native Parent Moves Need a Complete Membership Update; Restore the Link or Publish a Validated Content Update.');
 const record=domain.records.find(r=>r.recordId===review.recordId);
 requireThat(record&&record.current.payload.definitions?.migration?.format!=='ROMDexLegacyMigration/1','This Technical Record Cannot Be Adopted Through Content Editing.');
 requireThat(typeof input.adoptTitle==='boolean'&&typeof input.reason==='string'&&input.reason.trim()&&input.reason.length<=8192&&typeof input.evidence==='string'&&input.evidence.trim()&&input.evidence.length<=32768,'Native Review Needs an Explicit Choice, Reason and Evidence.');
 const command={type:'definition',recordId:record.recordId,expectedRevision:record.revisionId,documentationCorrection:true,reason:input.reason,evidence:input.reason+'\n'+input.evidence+'\nNative Metadata Review (Unmapped Prose Is Not ROM Content):\n'+JSON.stringify({issueId:review.issueId,before:review.before,observed:review.observed,adoptTitle:input.adoptTitle}),sharedAcknowledged:input.sharedAcknowledged===true};
 if(input.adoptTitle){
  requireThat(review.before.summary!==review.observed.summary,'The Native Title Has Not Changed.');
  const name=review.observed.summary.replace(/^\[(?:NPCDex|ROMDex U20D QA)\] /,'');
  requireThat(name.trim()&&name.length<=1024,'The Native Title Cannot Be Used as a Content Name.');command.name=name;
 }
 return command;
}

export function buildNativeReview(domain,reviews,inputs,ctx){
 requireThat(Array.isArray(inputs)&&inputs.length>0&&inputs.length===reviews.length&&inputs.length<=100&&new Set(inputs.map(x=>x.issueId)).size===inputs.length,'Review Every Observed Native Edit Exactly Once.');
 const updates=new Map(),evidence=[];
 for(let i=0;i<inputs.length;i++){
  const input=inputs[i],review=reviews.find(r=>r.issueId===input.issueId),command=nativeReviewCommand(domain,review,input);
  const edit=buildEdit(domain,command,{...ctx,operationId:ctx.operationId+':item-'+i});
  evidence.push(...edit.artifacts[0].evidence);
  for(const update of edit.artifacts[0].recordUpdates){
   // Profile dependencies only invalidate observations. An explicitly adopted
   // local name takes precedence over that unchanged dependent body.
   const old=updates.get(update.before.recordId);
   if(!old||update.before.recordId===command.recordId&&input.adoptTitle)updates.set(update.before.recordId,update);
  }
 }
 const base={workspaceId:ctx.workspace,createdAt:ctx.createdAt,actorClaim:ctx.workspace.startsWith('fixture:')?'fixture:owner':'content:owner'};
 const recordUpdates=[...updates.values()].map((u,i)=>({before:u.before,after:seal({...u.after,operationId:ctx.operationId+':record-'+i})}));
 const correction=seal({...base,schema:'NPCDexDocumentationCorrection/1',operationId:ctx.operationId+':correction',correctionId:ctx.operationId,reason:'Explicit Owner Review of Native YouTrack Metadata',evidence,readSet:recordUpdates.map(u=>u.before),recordUpdates,romChangeRequested:false});
 const artifacts=[correction,...recordUpdates.map(u=>u.after)],publication=seal({...base,schema:'NPCDexPublication/1',operationId:ctx.operationId,publicationId:ctx.operationId,kind:'correction',parentPublications:[ctx.head],artifactDigests:artifacts.map(a=>a.revisionId||a.digest),baseRevisions:correction.readSet,resultDigest:correction.digest,groupId:null});
 for(const a of artifacts)validateArtifact(Buffer.from(JSON.stringify(a)),ctx.workspace);
 return {publication,artifacts,assets:[],preview:applyPublication(domain,publication,artifacts,[])};
}

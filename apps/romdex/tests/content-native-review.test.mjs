import test from 'node:test';import assert from 'node:assert/strict';
import {editorSetup} from './content-editor-fixture.mjs';import {sha} from '../content/contracts.mjs';
const changes=s=>s.reader.view().review.filter(r=>r.kind==='native-metadata-changed');
const input=(r,adoptTitle=true)=>({issueId:r.issueId,observed:r.observed,adoptTitle,reason:'Owner reviewed the native edit.',evidence:'Documentation label checked against source; no ROM change.',sharedAcknowledged:true});
const native=(s,recordId)=>s.transport.issues.get(s.transport.bindings.find(b=>b.recordId===recordId).issueId);
const current=(s,id)=>s.editor.working().domain.records.find(r=>r.recordId===id);

test('A native title stays in review until explicitly adopted; correction, identity and originals survive restart',async t=>{
 const s=await editorSetup(t),original=current(s,'fixture:guide');native(s,'fixture:guide').summary='Reviewed Guide';await s.reader.cycle(true);
 assert.equal(current(s,'fixture:guide').revisionId,original.revisionId);assert.equal(changes(s).length,1);
 s.editor.queueNativeReview(changes(s).map(r=>input(r)),s.editor.view().head);await s.reopen();
 const view=await s.editor.sync(true);assert.equal(view.operations.length,0,JSON.stringify(view.operations));assert.equal(view.review.length,0);
 assert.equal(current(s,'fixture:guide').current.payload.overrides.displayName,'Reviewed Guide');assert(s.editor.working().domain.revisions.some(r=>r.revisionId===original.revisionId));
 const correction=s.editor.operations()[0].artifacts[0];assert.equal(correction.romChangeRequested,false);assert(correction.evidence[0].excerpt.includes('Owner reviewed'));assert.equal(current(s,'fixture:guide').recordId,original.recordId);
});

test('Multiple native edits are reviewed atomically; shared dependent invalidation preserves explicit local titles',async t=>{
 const s=await editorSetup(t);native(s,'fixture:profile-guide').summary='Shared Reviewed Name';native(s,'fixture:guide').summary='Local Reviewed Name';await s.reader.cycle(true);
 const reviews=changes(s);assert.equal(reviews.length,2);assert.throws(()=>s.editor.queueNativeReview([input(reviews[0])],s.editor.view().head),/Every Observed/);
 s.editor.queueNativeReview(reviews.map(r=>input(r)),s.editor.view().head);const view=await s.editor.sync(true);assert.equal(view.status.pendingWrites,0,JSON.stringify(view.operations));
 assert.equal(current(s,'fixture:profile-guide').current.payload.name,'Shared Reviewed Name');assert.equal(current(s,'fixture:guide').current.payload.overrides.displayName,'Local Reviewed Name');assert.equal(view.review.length,0);
});

test('Reviewed comments and descriptions retain current dialogue and names and preserve native fingerprints as evidence',async t=>{
 const s=await editorSetup(t),before=current(s,'fixture:guide').current;const issue=native(s,'fixture:guide');issue.descriptionSha256=sha('Native context, not dialogue');issue.commentsSha256=sha('A native comment');await s.reader.cycle(true);
 s.editor.queueNativeReview(changes(s).map(r=>input(r,false)),s.editor.view().head);const view=await s.editor.sync(true);assert.equal(view.review.length,0);assert.deepEqual(current(s,'fixture:guide').current,before);assert(s.editor.operations()[0].artifacts[0].evidence[0].excerpt.includes(issue.commentsSha256));
});

test('Stale observations, missing evidence, unacknowledged shared scope and native reparenting cannot be adopted',async t=>{
 const s=await editorSetup(t);native(s,'fixture:profile-guide').summary='Shared Edit';await s.reader.cycle(true);const review=changes(s)[0],head=s.editor.view().head;
 for(const patch of [{observed:{...review.observed,summary:'Unobserved'}},{evidence:''},{sharedAcknowledged:false}])assert.throws(()=>s.editor.queueNativeReview([{...input(review),...patch}],head));
 native(s,'fixture:profile-guide').parentIssueId='3-555';await s.reader.cycle(true);assert.throws(()=>s.editor.queueNativeReview(changes(s).map(r=>input(r)),head),/Parent Moves/);assert.equal(s.transport.uploadCount,0);
});

test('A native edit after review blocks the frozen correction without publishing or erasing alternatives',async t=>{
 const s=await editorSetup(t);native(s,'fixture:guide').summary='First';await s.reader.cycle(true);s.editor.queueNativeReview(changes(s).map(r=>input(r)),s.editor.view().head);const hash=s.editor.operations()[0].publication.digest;
 native(s,'fixture:guide').summary='Second';const view=await s.editor.sync(true);assert.equal(view.operations[0].state,'blocked');assert.equal(s.transport.uploadCount,0);assert.equal(s.editor.operations()[0].publication.digest,hash);assert.equal(changes(s)[0].observed.summary,'Second');
});

test('Native metadata reads drain before failure and never exceed four concurrent calls',async t=>{
 const s=await editorSetup(t);s.editor.queue({type:'review',recordId:'fixture:guide',note:'Bounded metadata check'},s.editor.view().head);const raw=s.editor.transport.native;let active=0,max=0,started=0;
 s.editor.transport.native=async id=>{active++;max=Math.max(active,max);const ordinal=++started;try{await new Promise(resolve=>setTimeout(resolve,5));if(ordinal===1)throw Error('Injected native failure');return await raw(id);}finally{active--;}};
 await s.editor.sync(true);assert(max<=4);assert.equal(active,0);assert.equal(s.transport.uploadCount,0);
});

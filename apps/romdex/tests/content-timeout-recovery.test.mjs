import test from 'node:test';import assert from 'node:assert/strict';
import {editorSetup,guidePlan} from './content-editor-fixture.mjs';
import {publicationFailureState,recoverPrewriteTimeouts} from '../content/delivery-recovery.mjs';

test('read timeout keeps a dependent local chain visible and retries without losing artifacts',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.editor.queue({type:'review',recordId:'fixture:visitor',note:'Dependent local note'},s.editor.view().head);
 const head=s.editor.working().head,before=s.editor.operations().map(o=>({id:o.id,publication:o.publication,preview:o.preview})),read=s.editor.transport.native;
 s.editor.transport.native=async()=>{throw new DOMException('The operation was aborted due to timeout','TimeoutError');};
 await s.editor.sync(true);assert.equal(s.editor.operations()[0].state,'queued');assert.equal(s.editor.working().head,head);assert.equal(s.editor.view().status.review,false);
 s.editor.transport.native=read;await s.editor.sync(true);assert.equal(s.editor.view().status.pendingWrites,0);assert.deepEqual(s.editor.operations().map(o=>({id:o.id,publication:o.publication,preview:o.preview})),before);
});

test('restart repairs only the exact legacy prewrite timeout and retains every immutable operation',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.editor.queue({type:'review',recordId:'fixture:visitor',note:'Later saved history'},s.editor.view().head);
 const before=s.editor.operations(),head=s.editor.working().head,op=before[0];s.editor.save({...op,state:'blocked',errorCode:23,error:'The operation was aborted due to timeout'});
 await s.reopen();const after=s.editor.operations();assert.equal(after[0].state,'queued');assert.equal(after[0].recovery.kind,'legacy-prewrite-timeout');assert.equal(after[0].recovery.prior.errorCode,23);assert.equal(s.editor.working().head,head);
 for(let i=0;i<before.length;i++)for(const k of ['id','publication','artifacts','preview','assets','slots'])assert.deepEqual(after[i][k],before[i][k]);
 assert.equal(recoverPrewriteTimeouts(s.editor),0);assert.equal((await s.editor.sync(true)).status.pendingWrites,0);
});

test('legacy repair never replays recorded write intents, different failures or hard validation errors',()=>{
 const base={state:'blocked',errorCode:23,error:'The operation was aborted due to timeout',publication:{digest:'a'.repeat(64)},slots:{}},saved=[];
 const ops=[{...base,slots:{x:{state:'sending'}}},{...base,slots:{x:{state:'verified'}}},{...base,errorCode:'INTEGRITY'},{...base,error:'Different failure'},{...base,state:'uncertain'}];
 assert.equal(recoverPrewriteTimeouts({operations:()=>ops,save:o=>saved.push(o),now:()=>0}),0);assert.deepEqual(saved,[]);
 assert.equal(publicationFailureState(ops[0],new DOMException('Timeout','TimeoutError')),'uncertain');
 assert.equal(publicationFailureState(base,Error('Integrity mismatch')),'blocked');
 assert.equal(publicationFailureState(base,new DOMException('Aborted','AbortError')),'queued');
});


test('unchanged plan and review checkpoints do not inflate the queue, but real changes and stale edits are not hidden',async t=>{const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);let op=s.editor.operations()[0],a=op.artifacts[0],command={...guidePlan(),planId:a.planId,expectedParents:[a.digest]};const head=s.editor.working().head;s.editor.queue(command,head);assert.equal(s.editor.operations().length,1);assert.equal(s.editor.working().head,head);s.editor.queue({...command,instructions:'A real new instruction'},head);assert.equal(s.editor.operations().length,2);assert.throws(()=>s.editor.queue(command,s.editor.working().head),/Newer or Conflicting/);s.editor.queue({type:'review',recordId:'fixture:visitor',note:'A real note'},s.editor.working().head);a=s.editor.operations().at(-1).artifacts[0];command={type:'review',recordId:'fixture:visitor',reviewId:a.reviewId,expectedParents:[a.digest],note:a.note,flag:a.flag,testStatus:a.testStatus};s.editor.queue(command,s.editor.working().head);assert.equal(s.editor.operations().length,3);s.editor.queue({...command,note:'A changed note'},s.editor.working().head);assert.equal(s.editor.operations().length,4);});

test('blocked cloud delivery retains local chain and all publication guards',async t=>{const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.editor.queue({type:'review',recordId:'fixture:visitor',note:'Later local note'},s.editor.view().head);const head=s.editor.working().head,before=s.editor.operations(),op=before[0];s.editor.save({...op,state:'blocked',error:'Native metadata needs review',slots:{file:{state:'verified',attachmentId:'12-88'}}});assert.equal(s.editor.working().head,head);assert.equal(s.editor.view().status.review,true);assert.throws(()=>s.editor.queue(guidePlan(),head),/Resolve Pending Content Review/);assert.equal(s.editor.operations()[0].slots.file.attachmentId,'12-88');assert.equal(s.editor.operations().length,before.length);});

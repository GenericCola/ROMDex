import test from 'node:test';
import assert from 'node:assert/strict';
import {editorSetup,guidePlan} from './content-editor-fixture.mjs';
import {ContentEditor} from '../content/writer.mjs';
import {sha} from '../content/contracts.mjs';
import {createContentPreview} from '../content/preview-server.mjs';
import {YouTrackContentWriter} from '../content/youtrack-writer.mjs';

function pinnedWriter(remote){const writer=remote.writer(),find=writer.findObject;writer.finds=0;writer.pinned=0;writer.findObject=async(...args)=>{writer.finds++;return find(...args);};writer.verifyObject=async(issueId,slot,bytes)=>{writer.pinned++;const found=remote.attachments.get(slot.attachmentId);assert(found&&found.issueId===issueId&&found.meta.name===slot.name&&found.meta.authorId==='2-2'&&found.bytes.equals(bytes),'Pinned upload changed');return {attachmentId:slot.attachmentId,bytes:bytes.length,sha256:sha(bytes)};};return writer;}

test('Initial and readback history time does not consume the separate cumulative write budget',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.editor.queue({type:'review',recordId:'fixture:visitor',note:'Second operation'},s.editor.view().head);
 let clock=0,begins=0;const read=s.reader.cycle.bind(s.reader);s.reader.cycle=async(...args)=>{const result=await read(...args);clock+=20000;return result;};
 const writer=s.transport.writer(),begin=writer.begin;writer.begin=function(signal){begins++;assert(!signal.aborted);begin.call(this,signal);};
 const editor=new ContentEditor({reader:s.reader,transport:writer,writeDeadline:1000,now:()=>clock});const view=await editor.sync(true);
 assert.equal(view.status.pendingWrites,0,JSON.stringify(view.operations));assert(clock>=60000);assert(begins>=3);
});

test('Actual write work shares a bounded budget and continues from its durable checkpoint',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.editor.queue({type:'review',recordId:'fixture:visitor',note:'Later work survives'},s.editor.view().head);
 let clock=0;const writer=s.transport.writer(),upload=writer.uploadObject;writer.uploadObject=async(...args)=>{const saved=await upload(...args);clock+=600;return saved;};
 const editor=new ContentEditor({reader:s.reader,transport:writer,writeDeadline:1000,now:()=>clock});await editor.sync(true);assert.equal(editor.view().status.pendingWrites,1);const pending=editor.operations().find(o=>o.state!=='committed');assert.equal(pending.errorCode,'CONTENT_CHECKPOINT');
 assert.equal((await editor.sync(true)).status.pendingWrites,0);
});

test('Repeated connected checks without progress pause only automatic delivery across restart',async t=>{
 const s=await editorSetup(t);s.setEnabled(true);s.editor.queue(guidePlan(),s.editor.view().head);let writes=0;const fail=async()=>{writes++;throw Object.assign(Error('Write connection paused'),{code:'CONTENT_CONNECTION'});};s.editor.transport.native=fail;
 for(let i=0;i<3;i++)await s.editor.sync();assert.equal(s.editor.deliveryProgress().held,true);assert.match(s.editor.view().status.message,/Paused.*Review Sync/);const count=writes,reads=s.transport.reads;await s.editor.sync();assert.equal(writes,count);assert(s.transport.reads>reads,'Incoming reads must continue');assert.equal(s.editor.view().status.review,true);
 await s.reopen();s.setEnabled(true);s.editor.transport.native=fail;await s.editor.sync();assert.equal(writes,count,'Restart must retain the hold');
 await s.editor.sync(true);assert(writes>count,'Explicit manual save permits one check');assert.equal(s.editor.deliveryProgress().held,true);
 await s.reopen();assert.equal((await s.editor.sync(true)).status.pendingWrites,0);assert.equal(s.editor.deliveryProgress().held,false);
});

test('Transient offline reads do not accumulate a false stalled-publication hold',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.transport.fail=true;for(let i=0;i<4;i++)await s.editor.sync(true);assert.equal(s.editor.deliveryProgress().held,false);assert.equal(s.editor.deliveryProgress().stalledCycles,0);s.transport.fail=false;assert.equal((await s.editor.sync(true)).status.pendingWrites,0);
});

test('Cancelling the last safe queued operation does not leave a hold on unrelated later work',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.cache.set('delivery-progress',{held:true,stalledCycles:3});s.editor.cancel(s.editor.operations()[0].id);assert.equal(s.cache.get('delivery-progress').held,false);s.editor.queue(guidePlan({instructions:'A separate later plan.'}),s.editor.view().head);s.setEnabled(true);assert.equal((await s.editor.sync()).status.pendingWrites,0);
});

test('An uncertain-only upload exposes recovery even when there is no content conflict',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.transport.dropUpload=true;await s.editor.sync(true);assert.deepEqual(s.reader.view().review,[]);assert.equal(s.editor.view().status.review,true);assert.equal(s.editor.view().operations[0].state,'uncertain');assert.equal(s.editor.deliveryProgress().pendingOperations,1);
});

test('Verified slots use pinned attachment identities on resume and missing ones never resend blindly',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);const writer=pinnedWriter(s.transport),upload=writer.uploadObject;let attempts=0;writer.uploadObject=async(...args)=>{if(++attempts===2)throw Error('Second upload never reached server');return upload(...args);};
 const editor=new ContentEditor({reader:s.reader,transport:writer});await editor.sync(true);const op=editor.operations()[0],uncertain=Object.entries(op.slots).find(([,v])=>v.state==='sending');assert(uncertain);assert(Object.values(op.slots).some(v=>v.state==='verified'));
 editor.retryUncertain(op.id,uncertain[0]);const finds=writer.finds;writer.uploadObject=upload;assert.equal((await editor.sync(true)).status.pendingWrites,0);assert(writer.pinned>0);assert(writer.finds-finds<=2,'Verified slots must not repeat name searches');
});

test('Removal of a previously verified upload requires review rather than replacement',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);const writer=pinnedWriter(s.transport),editor=new ContentEditor({reader:s.reader,transport:writer});const op=editor.operations()[0],bytes=Buffer.from(JSON.stringify(op.publication));await editor.object(op,'publication',s.transport.registryIssueId,bytes);const saved=editor.operations()[0],slot=Object.values(saved.slots)[0];s.transport.attachments.delete(slot.attachmentId);const uploads=s.transport.uploadCount;await assert.rejects(editor.object(saved,'publication',s.transport.registryIssueId,bytes),/Pinned upload changed/);assert.equal(s.transport.uploadCount,uploads);
});

test('A reviewed uncertain retry clears a persisted hold but cannot race an active sync',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);s.transport.dropUpload=true;await s.editor.sync(true);const op=s.editor.operations()[0],key=Object.keys(op.slots)[0];s.cache.set('delivery-progress',{held:true,stalledCycles:3});
 let release;const wait=new Promise(resolve=>release=resolve),read=s.reader.cycle.bind(s.reader);s.reader.cycle=async(...args)=>{await wait;return read(...args);};const task=s.editor.sync(true);assert.throws(()=>s.editor.retryUncertain(op.id,key),/Current Sync/);release();await task;
 // A lost acknowledgement may already have been rediscovered by that check.
 if(s.editor.operations()[0].state==='uncertain'){s.editor.retryUncertain(op.id,key);assert.equal(s.editor.deliveryProgress().held,false);}else assert.equal(s.editor.operations()[0].state,'committed');
});

test('Recovery API includes progress without requiring a content-conflict record',async t=>{
 const cleanup=[],s=await editorSetup({after:fn=>cleanup.push(fn)});s.cache.set('preview-auto-sync',false);s.editor.queue(guidePlan(),s.editor.view().head);s.transport.dropUpload=true;await s.editor.sync(true);const server=await createContentPreview({reader:s.reader,editor:s.editor});t.after(async()=>{await server.close();for(const fn of cleanup)await fn();});const context=await(await fetch(server.origin+'/api/editor')).json();assert.deepEqual(context.review,[]);assert.equal(context.deliveryProgress.pendingOperations,1);assert(context.operations[0].uncertainSlots.length);const view=await(await fetch(server.origin+'/api/view')).json();assert.equal(view.status.review,true);
});

test('Progress notifications are bounded while durable verified slots continue to advance',async t=>{
 const s=await editorSetup(t);s.editor.queue(guidePlan(),s.editor.view().head);let notices=0;const editor=new ContentEditor({reader:s.reader,transport:s.transport.writer(),now:()=>10000,changed:()=>notices++});await editor.sync(true);assert.equal(editor.view().status.pendingWrites,0);assert(notices<=4,'Do not rebuild/send a full UI snapshot for every chunk');assert(s.cache.get('delivery-progress').lastProgressAt);
});

function writerHTTP(){
 const marker='ROMDexU20DFixture/12345678-1234-1234-1234-123456789abc',bytes=Buffer.from('Immutable fixture bytes');
 const issue={id:'3-1000',summary:'[ROMDex U20D QA] Fixture',description:marker+'\nRegistry',project:{id:'0-2'},reporter:{id:'2-2'},visibility:{permittedUsers:[{id:'2-2'}],permittedGroups:[]},links:[],commentsCount:0,comments:[]};
 const attachment={id:'12-1',name:'npcdex-publication.json',size:bytes.length,updated:1,author:{id:'2-2'},url:'/api/files/fixture?signed=ephemeral'};let downloads=0,listed=true,payload=bytes;
 const writer=new YouTrackContentWriter({registryIssueId:issue.id,workspace:'fixture:workspace',marker,credential:async()=> 'synthetic-credential-only',fetch:async(url,options)=>{assert.equal(options.method,'GET');if(url.pathname==='/api/issues/'+issue.id)return Response.json(issue);if(url.pathname.endsWith('/attachments'))return Response.json(listed?[attachment]:[]);if(url.pathname==='/api/files/fixture'){downloads++;return new Response(payload);}throw Error('Unexpected fixture route');}});
 return {writer,issue,attachment,bytes,get downloads(){return downloads;},missing(){listed=false;},alter(){attachment.updated++;payload=Buffer.alloc(bytes.length,1);}};
}

test('Pinned writer reuses verified immutable bytes after fresh metadata and checks ownership every cycle',async t=>{
 const s=await editorSetup(t),f=writerHTTP(),slot={attachmentId:f.attachment.id,name:f.attachment.name,sha256:sha(f.bytes),bytes:f.bytes.length};s.cache.putObject(f.bytes);
 await f.writer.verifyObject(f.issue.id,slot,f.bytes,{cache:s.cache});assert.equal(f.downloads,1);f.writer.begin();await f.writer.verifyObject(f.issue.id,slot,f.bytes,{cache:s.cache});assert.equal(f.downloads,1,'Unchanged fingerprint should reuse exact local bytes');
 f.writer.begin();f.issue.visibility.permittedGroups=[{id:'3-1'}];await assert.rejects(f.writer.verifyObject(f.issue.id,slot,f.bytes,{cache:s.cache}),/Cannot Modify/);assert.equal(f.downloads,1);
});

test('Missing, altered or foreign verified attachments cannot use the immutable-byte shortcut',async t=>{
 const s=await editorSetup(t);for(const change of ['missing','alter','author']){const f=writerHTTP(),slot={attachmentId:f.attachment.id,name:f.attachment.name,sha256:sha(f.bytes),bytes:f.bytes.length};s.cache.putObject(f.bytes);await f.writer.verifyObject(f.issue.id,slot,f.bytes,{cache:s.cache});f.writer.begin();if(change==='author')f.attachment.author={id:'2-1'};else f[change]();await assert.rejects(f.writer.verifyObject(f.issue.id,slot,f.bytes,{cache:s.cache}),/Missing or Changed|Bytes Do Not Match/);}
});

test('Resuming a write phase changes its signal without resetting write and request ceilings',()=>{
 const {writer}=writerHTTP();writer.writes=180;writer.read.requests=99;const signal=new AbortController().signal;writer.resume(signal);assert.equal(writer.signal,signal);assert.equal(writer.read.signal,signal);assert.equal(writer.writes,180);assert.equal(writer.read.requests,99);assert.equal(writer.shouldCheckpoint(),true);
});

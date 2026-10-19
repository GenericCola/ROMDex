import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sha,seal} from '../content/contracts.mjs';
import {packRdx,readRdxFile,unpackRdx} from '../rdx/container.mjs';
import {documentRevision} from '../rdx/document.mjs';
import {ManagedDocuments,documentKey} from '../rdx/managed-store.mjs';
import {localMain} from '../rdx/local-cli.mjs';
const run=promisify(execFile),fixtures=new URL('./fixtures/rdx/',import.meta.url);
async function input(name='map'){
 const raw=await fs.readFile(new URL(name+'.document.json',fixtures)),doc=JSON.parse(raw),blobs=new Map();for(const a of doc.assetInventory)blobs.set(a.sha256,await fs.readFile(new URL('blobs/'+a.sha256+'.bin',fixtures)));
 return {doc,blobs,bytes:await packRdx(raw,blobs)};
}
async function scenario(t,name='map'){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'romdex-rd04-')),dataDirectory=path.join(root,'Data'),source=path.join(root,'input.rdx'),f=await input(name),stores=[];await fs.writeFile(source,f.bytes);
 t.after(async()=>{for(const store of stores)if(!store.closed)await store.close();assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('romdex-rd04-'));await fs.rm(root,{recursive:true,force:true});});
 const open=async options=>{const s=await ManagedDocuments.open({dataDirectory,...options});stores.push(s);return s;};
 return {root,dataDirectory,source,f,open};
}
function edit(view,note='New Local Note  '){const d=structuredClone(view.document);d.extensions['org.romdex.local-edit']={note,flag:true};return Buffer.from(JSON.stringify(d));}
async function save(store,key,note){const v=await store.view(key);return store.save(key,{documentBytes:edit(v,note),expectedRevision:v.status.revision});}
for(const name of ['map','plan','optional-extension','returned-map'])test('offline '+name+' import, edit, save, reopen, export and clean-instance import',async t=>{
 const x=await scenario(t,name),s=await x.open(),first=await s.ingest(x.source);assert.equal(first.saved,true);assert.equal(first.sync,'unbound-local');assert.ok(first.path.startsWith(path.join(x.dataDirectory,'RDX','working')));
 const before=await s.view(first.key);assert.deepEqual(before.document,x.f.doc);const changed=await save(s,first.key);assert.notEqual(changed.revision,first.revision);assert.equal(changed.saved,true);
 assert.deepEqual(await fs.readFile(x.source),x.f.bytes);await s.close();const reopened=await x.open(),view=await reopened.view(first.key);
 assert.equal(view.document.extensions['org.romdex.local-edit'].note,'New Local Note  ');assert.deepEqual(view.document.content[name==='plan'?'tasks':'plans'],before.document.content[name==='plan'?'tasks':'plans']);
 assert.equal(view.document.origin.role,name==='returned-map'?'agent-result':'user');
 assert.ok(view.document.content.history.length>before.document.content.history.length);for(const [h,b]of x.f.blobs)assert.deepEqual(view.blobs.get(h),b);
 const exported=path.join(x.root,'portable.rdx');await reopened.exportFile(first.key,exported);const second=await ManagedDocuments.open({dataDirectory:path.join(x.root,'Other-Data')});
 try{const imported=await second.ingest(exported),copy=await second.view(imported.key);assert.deepEqual(copy.document,view.document);for(const [h,b]of view.blobs)assert.deepEqual(copy.blobs.get(h),b);assert.equal(imported.sync,'unbound-local');assert.equal(imported.requiresHumanTesting,name==='returned-map');}finally{await second.close();}
});
test('new asset, native proposal, flags and notes survive portable export with original history',async t=>{
 const x=await scenario(t),s=await x.open(),state=await s.ingest(x.source),v=await s.view(state.key),d=v.document,blobs=v.blobs;
 const old=d.content.plans[0],next={...old,version:old.version+1,parents:[old.digest],instructions:'Updated Local Instructions  '};d.content.plans.push(seal(next));
 const b=Buffer.from('Sprite bytes  \0\xff','latin1'),h=sha(b);d.assetInventory.push({assetId:'fixture:new-file',sha256:h,bytes:b.length,mime:'application/octet-stream',purpose:'attachment'});blobs.set(h,b);d.extensions['org.romdex.local-edit']={flag:true,note:'Keep exact trailing spaces  '};
 await s.save(state.key,{documentBytes:Buffer.from(JSON.stringify(d)),blobs,expectedRevision:state.revision});const output=path.join(x.root,'changed.rdx');await s.exportFile(state.key,output);const result=await readRdxFile(output);
 assert.deepEqual(result.blobs.get(h),b);assert.equal(result.document.content.plans.at(-1).instructions,'Updated Local Instructions  ');assert.equal(result.document.content.plans[0].digest,old.digest);assert.equal(result.document.extensions['org.romdex.local-edit'].flag,true);
});
test('same import and no-op save do not duplicate history, journal or blobs',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source);assert.equal((await s.ingest(x.source)).alreadyPresent,true);
 const v=await s.view(a.key),before=s.db.prepare('SELECT count(*) AS n FROM journal').get().n;
 assert.equal((await s.save(a.key,{documentBytes:v.documentBytes,expectedRevision:a.revision})).unchanged,true);assert.equal(s.db.prepare('SELECT count(*) AS n FROM journal').get().n,before);
 const unexpected=new Map([[sha('extra'),Buffer.from('extra')]]);await assert.rejects(s.save(a.key,{documentBytes:v.documentBytes,blobs:unexpected,expectedRevision:a.revision}));
});
test('stale saves, identity changes and existing-document imports require review',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),old=await s.view(a.key);await save(s,a.key);
 await assert.rejects(s.save(a.key,{documentBytes:edit(old),expectedRevision:a.revision}),e=>e.code==='CONFLICT');
 const current=await s.view(a.key),other=structuredClone(current.document);other.documentId='rdx:different';await assert.rejects(s.save(a.key,{documentBytes:Buffer.from(JSON.stringify(other)),expectedRevision:current.status.revision}),e=>e.code==='CONFLICT');
 await assert.rejects(s.ingest(x.source),e=>e.code==='REVIEW_REQUIRED');assert.equal((await s.status(a.key)).revision,current.document.revision);
});
test('one store owns a Data folder; closing releases ownership without stale PID files',async t=>{
 const x=await scenario(t),s=await x.open();await assert.rejects(x.open(),e=>e.code==='BUSY');await s.close();const next=await x.open();assert.deepEqual(await next.list(),[]);
});
for(const point of ['after-journal','during-write','after-stage-write','after-stage-verify','after-previous','after-replace','before-checkpoint-commit','after-checkpoint-commit'])test('actual process crash recovers '+point+' without losing newer draft or assets',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source);await s.close();
 await assert.rejects(run(process.execPath,[fileURLToPath(new URL('./rdx-managed-crash-fixture.mjs',import.meta.url)),x.dataDirectory,a.key,point],{windowsHide:true}),e=>e.code===86);
 const recovered=await x.open(),v=await recovered.view(a.key);assert.equal(v.document.extensions['org.romdex.crash-test'].point,point);assert.equal(v.status.saved,true);assert.notEqual(v.status.revision,a.revision);for(const [h,b]of x.f.blobs)assert.deepEqual(v.blobs.get(h),b);
 assert.equal(recovered.db.prepare("SELECT count(*) AS n FROM journal WHERE state='pending'").get().n,0);assert.deepEqual(await fs.readFile(x.source),x.f.bytes);
});
test('disk-full staging error retains durable newer head and blocks stale export until recovery',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),original=await fs.readFile(a.path);s.fault=point=>{if(point==='during-write')throw Object.assign(Error('Synthetic Disk Full'),{code:'ENOSPC'});};
 await assert.rejects(save(s,a.key),e=>e.code==='ENOSPC');const pending=await s.status(a.key);assert.equal(pending.saved,false);assert.notEqual(pending.revision,a.revision);assert.deepEqual(await fs.readFile(a.path),original);
 await assert.rejects(s.exportFile(a.key,path.join(x.root,'stale.rdx')),e=>e.code==='RECOVERY');await assert.rejects(fs.stat(path.join(x.root,'stale.rdx')));
 s.fault=()=>{};assert.equal((await s.recover(a.key))[0].saved,true);assert.equal((await s.status(a.key)).revision,pending.revision);
});
test('failure before durable journal preserves previous head and creates no false save',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source);for(const failure of ['before-journal','before-journal-commit']){const count=s.db.prepare('SELECT count(*) AS n FROM versions').get().n;s.fault=point=>{if(point===failure)throw Error('Before Journal');};await assert.rejects(save(s,a.key));assert.equal((await s.status(a.key)).revision,a.revision);assert.equal(s.pending(a.key),undefined);assert.equal(s.db.prepare('SELECT count(*) AS n FROM versions').get().n,count);}
});
test('incomplete staging file is retained separately and rebuilt from journal',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source);s.fault=point=>{if(point==='after-stage-write')throw Error('Interrupted');};await assert.rejects(save(s,a.key));const pending=s.pending(a.key),stage=path.join(s.root,'working',a.key+'.pending-'+pending.id+'.rdx');await fs.writeFile(stage,'incomplete');await s.close();const next=await x.open();assert.equal((await next.status(a.key)).saved,true);assert.equal((await fs.readdir(path.join(next.root,'recovery'))).length,1);
});
test('lost working file and known-old rename recover the newest durable version',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),old=await fs.readFile(a.path),current=await save(s,a.key);await fs.unlink(a.path);assert.equal((await s.recover(a.key))[0].saved,true);await fs.writeFile(a.path,old);assert.equal((await s.recover(a.key))[0].saved,true);assert.equal((await s.status(a.key)).revision,current.revision);
});
test('unknown external edits and corrupt checkpoints are preserved for review',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),foreign=structuredClone(x.f.doc);foreign.extensions['org.romdex.external']={note:'Separate Edit'};foreign.revision=documentRevision(foreign);const bytes=await packRdx(Buffer.from(JSON.stringify(foreign)),x.f.blobs);await fs.writeFile(a.path,bytes);
 const review=(await s.recover(a.key))[0];assert.equal(review.saved,false);assert.match(review.error,/Outside the Journal/);assert.deepEqual(await fs.readFile(a.path),bytes);await assert.rejects(s.exportFile(a.key,path.join(x.root,'wrong.rdx')));
 await fs.writeFile(a.path,'broken checkpoint');assert.equal((await s.recover(a.key))[0].saved,false);assert.equal(await fs.readFile(a.path,'utf8'),'broken checkpoint');
});
test('storage quota rejects a new document without dropping assets or history',async t=>{
 const x=await scenario(t),s=await x.open({maxBytes:1024});await assert.rejects(s.ingest(x.source),e=>e.code==='LIMIT');assert.equal((await s.list()).length,0);assert.deepEqual(await fs.readFile(x.source),x.f.bytes);
});
test('imported agent testing and result evidence cannot be cleared through local save',async t=>{
 const x=await scenario(t,'returned-map'),s=await x.open(),a=await s.ingest(x.source),v=await s.view(a.key);v.document.origin.role='user';v.document.result=null;await assert.rejects(s.save(a.key,{documentBytes:Buffer.from(JSON.stringify(v.document)),expectedRevision:a.revision}),e=>e.code==='REVIEW_REQUIRED');assert.equal((await s.status(a.key)).requiresHumanTesting,true);
});
test('export is no-overwrite, refuses managed paths and protects raced destinations',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),dest=path.join(x.root,'existing.rdx');await fs.writeFile(dest,'Keep This');await assert.rejects(s.exportFile(a.key,dest),e=>e.code==='EEXIST');assert.equal(await fs.readFile(dest,'utf8'),'Keep This');await assert.rejects(s.exportFile(a.key,path.join(s.root,'unsafe.rdx')),e=>e.code==='PATH');await assert.rejects(s.exportFile(a.key,x.source));
 const raced=path.join(x.root,'raced.rdx');s.fault=point=>{if(point==='after-export-verify')fsSync.writeFileSync(raced,'Rival Output',{flag:'wx'});};await assert.rejects(s.exportFile(a.key,raced),e=>e.code==='EEXIST');assert.equal(await fs.readFile(raced,'utf8'),'Rival Output');
});
test('concurrent save/export is rejected instead of exporting an older revision as current',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),v=await s.view(a.key),saving=s.save(a.key,{documentBytes:edit(v),expectedRevision:a.revision});await assert.rejects(s.exportFile(a.key,path.join(x.root,'racing.rdx')),e=>e.code==='BUSY');await saving;
});
test('invalid imports and missing assets do not establish a managed document',async t=>{
 const x=await scenario(t),s=await x.open();await fs.writeFile(x.source,'not an rdx');await assert.rejects(s.ingest(x.source));assert.deepEqual(await s.list(),[]);
});
test('managed journal corruption refuses recovery rather than installing an older baseline',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source);s.fault=point=>{if(point==='after-journal')throw Error('Interrupted');};await assert.rejects(save(s,a.key));s.db.prepare('UPDATE blobs SET bytes=? WHERE hash=?').run(Buffer.from('corrupt'),[...x.f.blobs.keys()][0]);s.fault=()=>{};const state=(await s.recover(a.key))[0];assert.equal(state.saved,false);assert.match(state.error,/Asset Failed Verification/);assert.equal((await readRdxFile(a.path)).document.revision,a.revision);
});
test('local CLI supports disconnected import/show/save/export/list with no token',async t=>{
 const x=await scenario(t,'plan'),a=await localMain(['import',x.dataDirectory,x.source]),v=await localMain(['show',x.dataDirectory,a.key]),draft=path.join(x.root,'draft.json'),empty=path.join(x.root,'empty');await fs.mkdir(empty);await fs.writeFile(draft,edit(v,'CLI Draft  '));const changed=await localMain(['save',x.dataDirectory,a.key,a.revision,draft,empty]);assert.equal(changed.saved,true);await localMain(['export',x.dataDirectory,a.key,path.join(x.root,'cli.rdx')]);assert.equal((await localMain(['list',x.dataDirectory])).length,1);assert.equal((await readRdxFile(path.join(x.root,'cli.rdx'))).document.extensions['org.romdex.local-edit'].note,'CLI Draft  ');
});
test('interrupted portable export never marks a partial output complete or damages the working file',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),dest=path.join(x.root,'partial.rdx');s.fault=(point,info)=>{if(point==='during-write'&&info.file===dest)throw Object.assign(Error('Export Interrupted'),{code:'ENOSPC'});};await assert.rejects(s.exportFile(a.key,dest));assert.equal((await s.status(a.key)).saved,true);assert.equal((await fs.readdir(x.root)).some(n=>n.startsWith('.rdx-export-')),true);assert.deepEqual(await fs.readFile(x.source),x.f.bytes);
});
test('a failed prior-checkpoint copy is retained and repaired without a retry loop',async t=>{
 const x=await scenario(t),s=await x.open(),a=await s.ingest(x.source),hash=sha(await fs.readFile(a.path)),old=path.join(s.root,'previous',a.key+'-'+hash+'.rdx');await fs.writeFile(old,'partial copy');await save(s,a.key);assert.equal((await s.status(a.key)).saved,true);assert.equal(sha(await fs.readFile(old)),hash);assert.equal((await fs.readdir(path.join(s.root,'recovery'))).length,1);
});
test('an established store with an unknown database version is never reset or reseeded',async t=>{
 const x=await scenario(t),s=await x.open();await s.ingest(x.source);s.db.exec('PRAGMA user_version=999');await s.close();await assert.rejects(x.open(),e=>e.code==='UNSUPPORTED');assert.deepEqual(await fs.readFile(x.source),x.f.bytes);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {setTimeout as delay} from 'node:timers/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {canonical,sha} from '../content/contracts.mjs';
import {packRdx,unpackRdx,readRdxFile,identifyInput,dispatchInputFile,MAGIC} from '../rdx/container.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {operation,LIMITS} from '../rdx/limits.mjs';
import {main} from '../rdx/cli.mjs';
const fixtures=new URL('./fixtures/rdx/',import.meta.url);
test('map files reject other maps hidden in JSON attachments or backup payloads',async()=>{
 const base=await fixture(),document=structuredClone(base.doc),blobs=new Map(base.blobs),foreign=Buffer.from(JSON.stringify({version:2,towns:[{id:'another-map',name:'Another Map',areas:[],characters:[],locations:[]}]})),hash=sha(foreign);
 document.assetInventory.push({assetId:'fixture:hidden-catalog',sha256:hash,bytes:foreign.length,mime:'application/json',purpose:'attachment'});blobs.set(hash,foreign);document.revision=documentRevision(document);await assert.rejects(packRdx(Buffer.from(canonical(document)),blobs),/Another Map|Multi-Map/);
 const multi=Buffer.from(JSON.stringify({towns:[{id:document.scope.mapRecordId,areas:[],characters:[]},{id:'another-map',areas:[],characters:[]}]})),h=sha(multi);document.assetInventory.at(-1).sha256=h;document.assetInventory.at(-1).bytes=multi.length;blobs.delete(hash);blobs.set(h,multi);document.revision=documentRevision(document);await assert.rejects(packRdx(Buffer.from(canonical(document)),blobs),/Multi-Map/);
});
async function fixture(name='map'){
 const bytes=await fs.readFile(new URL(name+'.document.json',fixtures)),doc=JSON.parse(bytes),blobs=new Map();
 for(const a of doc.assetInventory)blobs.set(a.sha256,await fs.readFile(new URL('blobs/'+a.sha256+'.bin',fixtures)));
 return {doc,bytes,blobs};
}
function revised(doc){doc.revision=documentRevision(doc);return Buffer.from(canonical(doc));}
function frame(manifest,bodies){const header=Buffer.from(typeof manifest==='string'?manifest:JSON.stringify(manifest)),prefix=Buffer.alloc(12);MAGIC.copy(prefix);prefix.writeUInt32LE(header.length,8);return Buffer.concat([prefix,header,...bodies]);}
function split(bytes){const at=12+bytes.readUInt32LE(8),manifest=JSON.parse(bytes.subarray(12,at));return {manifest,bodies:manifest.entries.map(e=>bytes.subarray(at+e.offset,at+e.offset+e.storedBytes))};}
async function stored(){const f=await fixture();return split(await packRdx(f.bytes,f.blobs,{compress:false}));}
for(const name of ['map','plan','returned-map','optional-extension'])test(name+' exact document/assets round-trip and deterministic repack',async()=>{
 const f=await fixture(name),packed=await packRdx(f.bytes,f.blobs),result=await unpackRdx(packed);
 assert.deepEqual(result.document,f.doc);assert.equal(result.documentBytes.toString(),canonical(f.doc));
 for(const [h,b]of f.blobs)assert.deepEqual(result.blobs.get(h),b);
 assert.deepEqual(await packRdx(result.documentBytes,result.blobs),packed);
 assert.equal(result.requiresHumanTesting,name==='returned-map');assert.equal(result.authorization,'not-established');
});
test('optional extension values and Unicode/control/trailing text survive unchanged',async()=>{
 const f=await fixture('optional-extension');f.doc.extensions['org.romdex.future'].text=' \n\\v[PLAYER] é 日本語 😀  ';
 const result=await unpackRdx(await packRdx(revised(f.doc),f.blobs));assert.deepEqual(result.document.extensions,f.doc.extensions);
});
test('duplicate asset bytes have one physical blob and retain all logical identities',async()=>{
 const f=await fixture();f.doc.assetInventory.push({...f.doc.assetInventory[0],assetId:'fixture:duplicate'});
 const result=await unpackRdx(await packRdx(revised(f.doc),f.blobs));assert.equal(result.blobs.size,2);assert.equal(result.document.assetInventory.length,3);
});
test('empty and incompressible attachment bytes are stored without re-encoding',async()=>{
 const f=await fixture('plan');for(const b of [Buffer.alloc(0),randomBytes(65536)]){const h=sha(b);f.doc.assetInventory.push({assetId:'asset:'+h,sha256:h,bytes:b.length,mime:'application/octet-stream',purpose:'attachment'});f.blobs.set(h,b);}
 const result=await unpackRdx(await packRdx(revised(f.doc),f.blobs));for(const [h,b]of f.blobs)assert.deepEqual(result.blobs.get(h),b);
 assert.equal(result.manifest.entries.filter(e=>e.codec==='store').length>=2,true);
});
test('GIF image bytes survive without conversion',async()=>{
 const f=await fixture('plan'),b=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64'),h=sha(b);
 f.doc.assetInventory.push({assetId:'fixture:gif',sha256:h,bytes:b.length,mime:'image/gif',purpose:'image'});f.blobs.set(h,b);
 const result=await unpackRdx(await packRdx(revised(f.doc),f.blobs));assert.deepEqual(result.blobs.get(h),b);
});
test('compression reduces structured data while preserving semantic revision across levels',async()=>{
 const f=await fixture('returned-map'),a=await packRdx(f.bytes,f.blobs,{level:1}),b=await packRdx(f.bytes,f.blobs,{level:9}),raw=await packRdx(f.bytes,f.blobs,{compress:false});
 assert.ok(b.length<raw.length/2);assert.equal((await unpackRdx(a)).document.revision,(await unpackRdx(b)).document.revision);
});
const mutations=[
 ['overlapping offsets',m=>m.entries[1].offset--],['gapped offsets',m=>m.entries[1].offset++],
 ['duplicate document',m=>m.entries.push({...m.entries[0]})],['missing document',m=>m.entries[0].id='blob:'+m.entries[0].sha256],
 ['path entry',m=>m.entries[1].id='../escape'],['absolute path',m=>m.entries[1].id='C:/escape'],
 ['unsafe integer',m=>m.entries[0].offset=Number.MAX_SAFE_INTEGER+1],['negative length',m=>m.entries[0].decodedBytes=-1],
 ['wrong stored length',m=>m.entries[0].decodedBytes++],['wrong hash',m=>m.entries[0].sha256='0'.repeat(64)],
 ['wrong blob identity',m=>m.entries[1].id='blob:'+'0'.repeat(64)],['wrong manifest revision',m=>m.documentRevision='0'.repeat(64)],
 ['unknown core field',m=>m.command='run'],['unknown codec',m=>m.entries[0].codec='execute'],
 ['unknown required capability',m=>m.requiredCapabilities.push('org.example.required')],['unknown container major',m=>m.format='RDXContainer/2'],
];
for(const [name,mutate]of mutations)test('reject '+name,async()=>{const {manifest,bodies}=await stored();mutate(manifest);await assert.rejects(unpackRdx(frame(manifest,bodies)));});
test('reject truncation and trailing undeclared bytes',async()=>{const f=await fixture(),bytes=await packRdx(f.bytes,f.blobs);await assert.rejects(unpackRdx(bytes.subarray(0,-1)));await assert.rejects(unpackRdx(Buffer.concat([bytes,Buffer.from([0])])));});
test('strict manifest JSON rejects duplicates, BOM, invalid UTF-8 and excessive nesting',async()=>{
 const {manifest,bodies}=await stored(),json=canonical(manifest);
 for(const bad of [json.replace('{','{"format":"RDXContainer/1",'), '\ufeff'+json, '{"x":'+ '['.repeat(70)+'0'+']'.repeat(70)+'}',json.replace('"RDXContainer/1"','"\\ud800"')])await assert.rejects(unpackRdx(frame(bad,bodies)));
 const bytes=frame(manifest,bodies);bytes[20]=255;await assert.rejects(unpackRdx(bytes));
});
test('bounded inflation refuses false decoded size, truncated streams and trailing compressed data',async()=>{
 const f=await fixture(),original=await packRdx(f.bytes,f.blobs);
 for(const mutation of ['small','truncated','trailing','concatenated']){
  const {manifest,bodies}=split(original),i=manifest.entries.findIndex(e=>e.codec==='deflate-raw');
  if(mutation==='small')manifest.entries[i].decodedBytes=1;
  if(mutation==='truncated')bodies[i]=bodies[i].subarray(0,-1);
  if(mutation==='trailing')bodies[i]=Buffer.concat([bodies[i],Buffer.from('garbage')]);
  if(mutation==='concatenated')bodies[i]=Buffer.concat([bodies[i],deflateRawSync(Buffer.from('extra'))]);
  let offset=0;manifest.entries.forEach((e,j)=>{e.offset=offset;e.storedBytes=bodies[j].length;offset+=e.storedBytes;});
  await assert.rejects(unpackRdx(frame(manifest,bodies)));
 }
});
for(const [name,value]of [['manifest',1],['stored',100],['decoded',100],['entries',1],['json',100],['blob',1],['depth',2],['nodes',5]])test('enforce '+name+' bound without changing input',async()=>{
 const f=await fixture(),bytes=await packRdx(f.bytes,f.blobs),before=sha(bytes);await assert.rejects(unpackRdx(bytes,{limits:{[name]:value}}));assert.equal(sha(bytes),before);
});
test('bounds cannot be silently raised or disabled',async()=>{const f=await fixture();for(const limits of [{stored:LIMITS.stored+1},{nodes:0},{unknown:1}])await assert.rejects(packRdx(f.bytes,f.blobs,{limits}));});
test('pre-cancellation and cancellation during decompression stop work',async()=>{
 const f=await fixture(),controller=new AbortController();controller.abort();await assert.rejects(packRdx(f.bytes,f.blobs,{signal:controller.signal}));
 const bytes=await packRdx(f.bytes,f.blobs),active=new AbortController(),pending=unpackRdx(bytes,{signal:active.signal});active.abort();await assert.rejects(pending);
});
test('operation work deadline stops and closes its timer',async()=>{const op=operation({limits:{milliseconds:1}});try{await delay(8);assert.throws(op.check,/Work Time Limit/);}finally{op.close();}});
test('unknown document namespace, kind, version or capability is unsupported',async()=>{
 for(const change of [d=>d.namespace='org.example.future',d=>d.kind='future',d=>d.schemaVersion=2,d=>d.capabilities.required.push('org.example.required')]){
  const f=await fixture();change(f.doc);assert.throws(()=>validateDocument(revised(f.doc),{blobs:f.blobs}),e=>e.code==='UNSUPPORTED');
 }
});
test('document revision, graph, artifact dataset, mapping and asset errors fail closed',async()=>{
 const changes=[d=>d.revision='0'.repeat(64),d=>d.content.recordHeads[0].revisionId='0'.repeat(64),d=>d.scope.ownedRecordIds.push(d.scope.contextRecordIds[0]),d=>d.content.records[0].workspaceId='other:workspace',d=>d.content.records[0].mappingRefs=['0'.repeat(64)],d=>d.assetInventory[0].bytes++];
 for(const change of changes){const f=await fixture();change(f.doc);const bytes=change===changes[0]?Buffer.from(canonical(f.doc)):revised(f.doc);await assert.rejects(packRdx(bytes,f.blobs));}
});
test('missing and unlisted blobs cannot be dropped or smuggled',async()=>{const f=await fixture();const missing=new Map(f.blobs);missing.delete([...missing.keys()][0]);await assert.rejects(packRdx(f.bytes,missing));f.blobs.set(sha('extra'),Buffer.from('extra'));await assert.rejects(packRdx(f.bytes,f.blobs));});
test('image signature, dimensions and structured history bounds are enforced',async()=>{
 for(const bad of ['signature','dimensions','history']){
  const f=await fixture('returned-map'),a=f.doc.assetInventory.find(a=>a.purpose===(bad==='history'?'history':'image'));let b=Buffer.from(f.blobs.get(a.sha256));
  if(bad==='signature')b[0]=0;if(bad==='dimensions')b.writeUInt32BE(5000,16);if(bad==='history')b=Buffer.from('{"duplicate":1,"duplicate":2}');
  f.blobs.delete(a.sha256);a.sha256=sha(b);a.bytes=b.length;f.blobs.set(a.sha256,b);await assert.rejects(packRdx(revised(f.doc),f.blobs));
 }
});
test('plan cycles, invalid dates, missing attachments and unpinned deletions are rejected',async()=>{
 for(const change of [d=>d.content.tasks[0].parentTaskId=d.content.tasks.at(-1).taskId,d=>d.content.tasks.find(t=>t.fields.some(f=>f.type==='date')).fields.find(f=>f.type==='date').value='2026-02-30',d=>d.content.tasks.at(-1).attachments[0].assetId='missing:asset',d=>d.content.deletionRequests.push({taskId:d.content.tasks[0].taskId,expectedRevision:'0'.repeat(64)})]){
  const f=await fixture('plan');change(f.doc);await assert.rejects(packRdx(revised(f.doc),f.blobs));
 }
});
test('agent returned file cannot claim that human testing is unnecessary',async()=>{const f=await fixture('returned-map');f.doc.result.requiresHumanTesting=false;await assert.rejects(packRdx(revised(f.doc),f.blobs));});
test('declared plan tiers agree with parent placement and saturate at Task',async()=>{
 const f=await fixture('plan');f.doc.content.tasks[1].declaredTier='epic';await assert.rejects(packRdx(revised(f.doc),f.blobs),/Tiers/);
 const good=await fixture('plan'),parent=good.doc.content.tasks.at(-1);good.doc.content.tasks.push({...structuredClone(parent),taskId:'fixture:deep-task',parentTaskId:parent.taskId,attachments:[]});
 const result=await unpackRdx(await packRdx(revised(good.doc),good.blobs));assert.equal(result.document.content.tasks.at(-1).declaredTier,'task');
});
test('format dispatch ignores extension and keeps legacy routes separate',async()=>{
 assert.equal(identifyInput(Buffer.from('ROMDEXM1')).route,'legacy-migration');assert.equal(identifyInput(Buffer.from('{"format":"NPCDexMapImport/1"}')).route,'legacy-map-json');
 assert.equal(identifyInput(Buffer.from('ROMDXR02')).route,'unsupported-rdx');assert.equal(identifyInput(Buffer.from('{"format":"RDXDocument/1"}')).route,'unknown');
 await assert.rejects(unpackRdx(Buffer.from('ROMDEXM1'+ '0000')),e=>e.code==='UNSUPPORTED');
});
test('CLI pack/unpack/repack validates exact files, refuses overwrite and never alters source',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'romdex-rd03-'));
 try{
  const doc=path.join(dir,'map.json'),blobs=path.join(dir,'blobs'),out=path.join(dir,'any-name.dat'),unpacked=path.join(dir,'unpacked');
  await fs.copyFile(new URL('map.document.json',fixtures),doc);await fs.cp(new URL('blobs/',fixtures),blobs,{recursive:true});
  const before=await fs.readFile(doc),made=await main(['pack',doc,blobs,out]);assert.equal(made.packed,true);
  assert.equal((await main(['validate',out])).validated,true);assert.equal((await main(['inspect',out])).route,'rdx');
  const run=promisify(execFile),cli=new URL('../rdx/cli.mjs',import.meta.url);
  const command=await run(process.execPath,[fileURLToPath(cli), 'validate',out],{windowsHide:true});assert.equal(JSON.parse(command.stdout).validated,true);
  await main(['unpack',out,unpacked]);await main(['pack',path.join(unpacked,'document.json'),path.join(unpacked,'blobs'),path.join(dir,'again.rdx')]);
  assert.deepEqual(await fs.readFile(out),await fs.readFile(path.join(dir,'again.rdx')));assert.deepEqual(await fs.readFile(doc),before);
  await assert.rejects(main(['pack',doc,blobs,out]),e=>e.code==='EEXIST');await assert.rejects(main(['unpack',out,unpacked]),e=>e.code==='EEXIST');
  assert.equal((await readRdxFile(out)).document.kind,'map');
  let legacyCalls=0;const handlers={legacyMigration:async({bytes})=>{legacyCalls++;assert.equal(bytes.subarray(0,8).toString(),'ROMDEXM1');return 'dedicated-migration';},legacyMapJSON:async({bytes})=>{legacyCalls++;assert.equal(JSON.parse(bytes).format,'NPCDexMapImport/1');return 'dedicated-map';}};
  assert.equal((await dispatchInputFile(out,handlers)).route,'rdx');assert.equal(legacyCalls,0);
  const old=path.join(dir,'old.rdx');await fs.writeFile(old,'ROMDEXM1');assert.equal((await dispatchInputFile(old,handlers)).value,'dedicated-migration');
  await assert.rejects(dispatchInputFile(old),e=>e.code==='UNSUPPORTED');
  await fs.writeFile(old,'{"format":"NPCDexMapImport/1"}');assert.equal((await dispatchInputFile(old,handlers)).value,'dedicated-map');
  await fs.writeFile(old,'ROMDXR02');await assert.rejects(dispatchInputFile(old,handlers),e=>e.code==='UNSUPPORTED');assert.equal(legacyCalls,2);
  await assert.rejects(run(process.execPath,[fileURLToPath(cli),'validate',old],{windowsHide:true}),e=>e.code===2&&JSON.parse(e.stderr).code==='UNSUPPORTED');
  const bad=path.join(dir,'bad.rdx');await fs.writeFile(bad,Buffer.from('broken'));await assert.rejects(main(['unpack',bad,path.join(dir,'must-not-exist')]));await assert.rejects(fs.stat(path.join(dir,'must-not-exist')));
 }finally{assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));assert.ok(path.basename(dir).startsWith('romdex-rd03-'));await fs.rm(dir,{recursive:true,force:true});}
});

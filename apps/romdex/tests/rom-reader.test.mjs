import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {RomReader,sha256} from '../rom/reader.mjs';
import {identifyRom,decodeEvents,decodeMapNames,decodeMapHeader,linkWarps} from '../rom/hgss.mjs';
import {makeLocator,resolveLocator} from '../rom/locators.mjs';
import {syntheticRom,syntheticNarc} from './rom-reader-fixture.mjs';
import {run} from '../rom/cli.mjs';
import {createIdentityManifest} from '../rom/identities.mjs';
import {inventoryDigest} from '../rom/hgss.mjs';
import {nativeMapping,createNativeMappingSession} from '../rom/native-mapping.mjs';
import {HGSS_ADAPTER} from '../rom/profiles.mjs';
async function fixture(t,bytes=syntheticRom()){
 const root=process.env.ROMDEX_TEST_SCRATCH||os.tmpdir();await fs.mkdir(root,{recursive:true});const dir=await fs.mkdtemp(path.join(root,'rom-reader-')),file=path.join(dir,'Synthetic.nds');await fs.writeFile(file,bytes);
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));return {dir,file,bytes};
}
test('read-only ROM filesystem, NARC access and fingerprint preserve exact source bytes',async t=>{
 const f=await fixture(t),rom=await RomReader.open(f.file);try{
  assert.equal((await rom.fingerprint()).sha256,sha256(f.bytes));assert.equal(rom.files().length,2);assert.equal(rom.fileInfo('test.narc').fileId,1);
  const archive=await rom.narc('test.narc');assert.equal(archive.members.length,2);assert.equal((await rom.member(1,0)).toString(),'synthetic event bytes');archive.members[0].bytes=0;assert.equal((await rom.narc(1)).members[0].bytes,21);
  const metadata=rom.files();metadata[1].path='evil';assert.equal(rom.fileInfo(1).path,'test.narc');
 }finally{await rom.close();}assert.deepEqual(await fs.readFile(f.file),f.bytes);await rom.close();await assert.rejects(()=>rom.read(0,1),{code:'CLOSED'});
});
test('game codes never authorize an unknown modified build',async t=>{
 const f=await fixture(t),rom=await RomReader.open(f.file);try{const result=await identifyRom(rom);assert.equal(result.support,'unreviewed-build');assert.equal(result.profile,null);}finally{await rom.close();}
 const other=await fixture(t,syntheticRom({gameCode:'XXXX'})),reader=await RomReader.open(other.file);try{assert.equal((await identifyRom(reader)).support,'unsupported-build');}finally{await reader.close();}
});
test('allocation bounds, cyclic paths and traversal filenames fail before resource use',async t=>{
 const mutations=[
  b=>b.writeUInt32LE(0xffffffff,0x110c),
  b=>{b[0x1008]=9;b.write('../escape',0x1009);},
  b=>{b.writeUInt32LE(12,68);b[0x1008]=0x81;b[0x1009]=97;b.writeUInt16LE(0xf000,0x100a);},
  b=>b.writeUInt32LE(0xffffffff,68),
 ];
 for(const mutate of mutations){const b=syntheticRom();mutate(b);const f=await fixture(t,b);await assert.rejects(()=>RomReader.open(f.file),e=>['BOUNDS','INVALID','LIMIT'].includes(e.code));}
});
test('NARC overlapping/missing ranges and oversized allocation counts are rejected',async t=>{
 const narcs=[syntheticNarc(),syntheticNarc(),syntheticNarc()];
 narcs[0].writeUInt32LE(0,36);narcs[1].writeUInt32LE(0xffffffff,32);narcs[2].writeUInt16LE(65535,24);
 for(const narc of narcs){const f=await fixture(t,syntheticRom({narc})),rom=await RomReader.open(f.file);try{await assert.rejects(()=>rom.narc(1),e=>['BOUNDS','LIMIT'].includes(e.code));}finally{await rom.close();}}
});
test('limits, cancellation and source mutation remain explicit',async t=>{
 const f=await fixture(t),controller=new AbortController();controller.abort();await assert.rejects(()=>RomReader.open(f.file,{signal:controller.signal}),{code:'CANCELLED'});
 const rom=await RomReader.open(f.file,{limits:{read:1024}});try{await assert.rejects(()=>rom.read(0,1025),{code:'LIMIT'});await assert.rejects(()=>rom.read(-1,1),{code:'BOUNDS'});await assert.rejects(()=>rom.fingerprint(),{code:'LIMIT'});await fs.utimes(f.file,new Date(),new Date(Date.now()+5000));await assert.rejects(()=>rom.assertUnchanged(),{code:'SOURCE_CHANGED'});}finally{await rom.close();}
 await assert.rejects(()=>RomReader.open(f.file,{limits:{bytes:Infinity}}),{code:'LIMIT'});
});
test('overlapping overlay addresses require an explicit owner; compressed owners stay unsupported',async t=>{
 const f=await fixture(t),rom=await RomReader.open(f.file);try{await assert.rejects(()=>rom.resolveAddress(0x023c8000),{code:'AMBIGUOUS_ADDRESS'});assert.equal((await rom.resolveAddress(0x023c8000,{overlayId:131})).id,131);}finally{await rom.close();}
 const bytes=syntheticRom();bytes.writeUInt32LE(0x01000020,0x121c);const f2=await fixture(t,bytes),r=await RomReader.open(f2.file);try{await assert.rejects(()=>r.resolveAddress(0x023c8000,{overlayId:1}),{code:'UNSUPPORTED'});}finally{await r.close();}
});
test('portable native locators resolve exact bytes and reject stale or altered references',async t=>{
 const f=await fixture(t),rom=await RomReader.open(f.file);try{
  const pin=(await rom.fingerprint()).sha256,locator=await makeLocator(rom,{kind:'event',fileId:1,memberId:0,offset:1,bytes:8,selectors:{mapHeaderId:60}});
  assert.equal((await resolveLocator(rom,locator,pin)).toString(),'ynthetic');assert.equal(locator.path,'test.narc');
  await assert.rejects(()=>resolveLocator(rom,locator,'a'.repeat(64)),{code:'SOURCE_CHANGED'});
  await assert.rejects(()=>resolveLocator(rom,{...locator,path:'../../outside'},pin),{code:'INTEGRITY'});
  await assert.rejects(()=>resolveLocator(rom,{...locator,selectors:{...locator.selectors,byteOffset:99999}},pin),{code:'BOUNDS'});
  await assert.rejects(()=>resolveLocator(rom,{...locator,fileSha256:'b'.repeat(64)},pin),{code:'INTEGRITY'});
  const system=await makeLocator(rom,{kind:'map',sourceType:'arm9',offset:0,bytes:16});assert.equal((await resolveLocator(rom,system,pin)).length,16);
 }finally{await rom.close();}
});
test('ROM identity mappings use the existing native schema and independently resolve their pinned bytes',async t=>{
 const f=await fixture(t),rom=await RomReader.open(f.file);try{
  const source=await rom.fingerprint(),locator=await makeLocator(rom,{kind:'map',sourceType:'arm9',bytes:24}),selected=await resolveLocator(rom,locator,source.sha256);
  const inventory={format:'ROMDexSourceInventory/1',adapter:HGSS_ADAPTER,source,maps:[{headerId:60,internalName:'T20',sha256:sha256(selected),locator,events:{backgrounds:[],overworlds:[],warps:[],triggers:[]}}],warnings:[]};inventory.digest=inventoryDigest(inventory);
  const identities=createIdentityManifest(inventory),mapping=nativeMapping(inventory,identities,'area/60',{workspaceId:'workspace:synthetic',createdAt:'2026-10-19T00:00:00.000Z'});
  assert.equal(mapping.schema,'NPCDexROMMapping/1');assert.equal(mapping.status,'documented');assert.equal(mapping.source.artifactSha256,source.sha256);assert.deepEqual(await resolveLocator(rom,mapping.locators[0],mapping.source.artifactSha256),selected);
  assert.throws(()=>nativeMapping(inventory,identities,'area/61',{workspaceId:'workspace:synthetic'}),{code:'NOT_FOUND'});
  const session=createNativeMappingSession(inventory,identities);identities.entries[0].id='tampered:id';inventory.maps[0].locator.path='tampered-path';const pinned=session.mapping('area/60',{workspaceId:'workspace:synthetic'});assert.equal(pinned.recordId,mapping.recordId);assert.equal(pinned.locators[0].path,mapping.locators[0].path);
 }finally{await rom.close();}
});
test('event decoding retains negative coordinates, unknown fields and unresolved warp destinations',()=>{
 const b=Buffer.alloc(16+32+12+16);let at=0;b.writeUInt32LE(0,at);at+=4;b.writeUInt32LE(1,at);at+=4;b.writeUInt16LE(9,at);b.writeInt16LE(-3,at+24);b.writeInt32LE(-12,at+28);at+=32;
 b.writeUInt32LE(1,at);at+=4;b.writeUInt16LE(0xffff,at+4);at+=12;b.writeUInt32LE(1,at);at+=4;b.writeUInt16LE(0x4000,at+14);
 const events=decodeEvents(b);assert.equal(events.overworlds[0].localId,9);assert.equal(events.overworlds[0].x,-3);assert.equal(events.overworlds[0].z,-12);assert.equal(events.triggers[0].variable,0x4000);assert.equal(linkWarps([{headerId:1,events}])[0].state,'runtime-dependent');
 const maps=[{headerId:1,events:{warps:[{index:0,destinationHeader:2,destinationWarp:0}]}},{headerId:2,events:{warps:[]}}];assert.equal(linkWarps(maps)[0].state,'unresolved');
 assert.throws(()=>decodeEvents(b.subarray(0,b.length-1)),e=>['LIMIT','BOUNDS'].includes(e.code));assert.throws(()=>decodeEvents(Buffer.concat([b,Buffer.from([0])])),{code:'INVALID'});
});
test('ROM names and header bitfields are decoded without inventing editorial labels',()=>{
 const names=Buffer.alloc(32);names.write('T20');names.write('T20R0101',16);assert.deepEqual(decodeMapNames(names),['T20','T20R0101']);names[31]=1;assert.throws(()=>decodeMapNames(names),{code:'INVALID'});
 const header=Buffer.alloc(24);header.writeUInt16LE(843,6);header.writeUInt32LE(0x601,20);const value=decodeMapHeader(header,61,'T20R0101');assert.equal(value.scriptBank,843);assert.equal(value.regionId,1);assert.equal(value.mapType,6);
});
test('CLI refuses output replacement and never uses a ROM filename as an output overwrite',async t=>{
 const f=await fixture(t),output=path.join(f.dir,'report.json'),messages=[],options={stdout:s=>messages.push(JSON.parse(s)),stderr:s=>messages.push(JSON.parse(s))};
 assert.equal(await run(['inspect',f.file,output],options),0);assert.equal(await run(['inspect',f.file,output],options),1);assert.equal(messages.at(-1).code,'EEXIST');
 assert.equal(await run(['inspect',f.file,f.file],options),1);assert.deepEqual(await fs.readFile(f.file),f.bytes);
});

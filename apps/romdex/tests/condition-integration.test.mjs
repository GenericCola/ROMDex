import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import vm from 'node:vm';
import {fixture} from './rom-compilation-fixture.mjs';
import {extractConditions} from '../rom/condition-extraction.mjs';import {extractionDigest} from '../rom/extract.mjs';
import {compileMapExtraction} from '../rom/compile-map.mjs';import {upgradeMapConditions} from '../rom/condition-upgrade.mjs';
import {conditionIndex,CONDITION_CAPABILITY} from '../rdx/features.mjs';import {mapDomain} from '../rdx/map-import.mjs';
import {dialoguePrompts} from '../public/mapdex-preview.mjs';import {selectPreparedAreas,mergePreparation} from '../rom/staging-document.mjs';
import {ManagedDocuments,documentKey} from '../rdx/managed-store.mjs';import {packRdx,unpackRdx} from '../rdx/container.mjs';
import {canonical,seal,sha} from '../content/contracts.mjs';import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {buildEdit} from '../content/edits.mjs';import {localDocumentAuthority} from '../content/authorization.mjs';
import {installCloudFeatureChecks,installTransportFeatureChecks} from '../rdx/cloud-features.mjs';
import {groupingFixture,groupNodes} from './rom-grouping-fixture.mjs';import {prepareGroupedDocument} from '../rom/grouped-document.mjs';
async function example(conditions=true){const f=fixture();if(conditions){f.x.conditionAnalysis=extractConditions(f.x);f.x.digest=extractionDigest(f.x);}return compileMapExtraction(f.x,f.assets,f.inventory);}
test('older source-pinned maps upgrade without replacing records, assets, text or portable evidence',async()=>{
 const v=await example(false),old=mapDomain(v),next=upgradeMapConditions(v),domain=mapDomain(next),index=conditionIndex(domain.records);
 assert(index);assert.deepEqual(domain.records.map(r=>r.recordId),old.records.map(r=>r.recordId));for(const [hash,bytes]of v.blobs)assert(next.blobs.get(hash)?.equals(bytes),'An original source/image blob was not retained');assert([...next.blobs.values()].some(b=>b.equals(v.documentBytes)));assert.equal(next.document.parents[0],v.document.revision);
 for(const r of domain.records){const before=old.records.find(p=>p.recordId===r.recordId);assert.equal(r.current.payload.name,before.current.payload.name);for(const p of Object.values(r.current.payload.points||{}))for(const b of Object.values(p.blocks))assert.equal(b.text,before.current.payload.points[p.id].blocks[b.id].text);}
 assert.equal(upgradeMapConditions(next),next);validateDocument(next.documentBytes,{blobs:next.blobs});
});
test('managed save upgrade preserves the exact original bytes and survives reopen/export/fresh import',async t=>{
 const base=path.resolve(process.env.ROMDEX_TEST_SCRATCH||os.tmpdir()),dir=await fs.mkdtemp(path.join(base,'mx03-managed-')),v=await example(false);let store;
 t.after(async()=>{await store?.close();assert.equal(path.dirname(dir),base);assert(path.basename(dir).startsWith('mx03-managed-'));await fs.rm(dir,{recursive:true,force:true});});
 await fs.writeFile(path.join(dir,'input.rdx'),v.bytes);store=await ManagedDocuments.open({dataDirectory:dir});const key=documentKey(v.document);await store.ingest(path.join(dir,'input.rdx'));
 await store.save(key,{documentBytes:v.documentBytes,blobs:v.blobs,expectedRevision:v.document.revision});let next=await store.view(key);assert(conditionIndex(mapDomain(next).records));assert([...next.blobs.values()].some(b=>b.equals(v.documentBytes)));await store.close();store=await ManagedDocuments.open({dataDirectory:dir});next=await store.view(key);assert(next.status.saved);const exported=await unpackRdx(await packRdx(next.documentBytes,next.blobs));assert.equal(exported.document.revision,next.document.revision);
});
test('known and unresolved filters select individual dialogue alternatives and preserve source blocks',async()=>{
 const v=await example(),records=mapDomain(v).records,index=conditionIndex(records),r=records.find(r=>r.kind==='appearance'),p=r.current.payload;
 const all=dialoguePrompts(p,'all',{index,recordId:r.recordId});assert.equal(all.total,2);assert(all.visible.every(x=>x.blocks.length===1&&x.condition.includes('Flag')));
 assert.equal(dialoguePrompts(p,index.conditions[0].id,{index,recordId:r.recordId}).visible.length,2);
 assert.equal(dialoguePrompts(p,'unresolved',{index,recordId:r.recordId}).visible.length,0);
 assert.deepEqual(all.visible.flatMap(x=>x.blocks.map(b=>b.text)),p.pointOrder.flatMap(id=>p.points[id].blockOrder.map(bid=>p.points[id].blocks[bid].text)));
});
test('owner labels/order edit the authoritative condition index without changing guards or evidence',async()=>{
 const v=await example(),domain=mapDomain(v),timeline=domain.records.find(r=>r.current.payload.definitions?.conditionIndex),old=structuredClone(conditionIndex(domain.records));
 const stages=timeline.current.payload.definitions.stages.map(s=>({...s,name:'Owner Condition Label'})),ctx={workspace:v.document.datasetId,authorization:localDocumentAuthority(v.document.datasetId),operationId:'content:owner-condition-label',createdAt:'2026-10-21T12:00:00.000Z',head:null};
 const out=buildEdit(domain,{type:'definition',recordId:timeline.recordId,documentationCorrection:true,timelineStages:stages,reason:'Source inspection',evidence:'Fictional evidence'},ctx),next=conditionIndex(out.preview.records);
 assert.equal(next.conditions[0].label,'Owner Condition Label');assert.equal(next.conditions[0].labelOrigin,'owner');assert.deepEqual(next.conditions[0].expression,old.conditions[0].expression);assert.deepEqual(next.effects,old.effects);
});
test('area selection retains a valid condition scope and no foreign effects',async()=>{
 const v=await example(),out=selectPreparedAreas(v,[1]);validateDocument(out.documentBytes,{blobs:out.blobs});const index=conditionIndex(mapDomain(out).records),ids=new Set(mapDomain(out).records.map(r=>r.recordId));assert(index.effects.every(e=>ids.has(e.target.recordId)));
});
test('unsupported cloud semantics block before reading objects; missing declared features are rejected',async()=>{
 let read=false;class Cloud{async value(){read=true;return example();}}installCloudFeatureChecks(Cloud);const c=new Cloud();await assert.rejects(c.value({requiredCapabilities:['org.romdex.future-unsupported']}));assert.equal(read,false);await assert.rejects(c.value({}),/Does Not Declare/);
 class Store{async commits(){return [{requiredCapabilities:['org.romdex.future-unsupported']}];}}installTransportFeatureChecks(Store);await assert.rejects(new Store().commits());
});
test('tampered source fingerprints and unknown required location semantics cannot be accepted as current',async()=>{
 const v=await example();for(const mutate of [d=>d.capabilities.required.push('org.romdex.npcdex.location-previews-v1'),d=>{const r=d.content.records.find(r=>r.current.payload.definitions?.conditionIndex);r.current.payload.definitions.conditionIndex.sourceRomSha256='b'.repeat(64);Object.assign(r,seal(r));d.content.recordHeads=d.content.records.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));}]){const d=structuredClone(v.document);mutate(d);d.revision=documentRevision(d);assert.throws(()=>validateDocument(Buffer.from(canonical(d)),{blobs:v.blobs}));}
});
test('nested child areas keep their own effects and excluding an area prunes only its condition targets',async()=>{
 const f=await groupingFixture();f.x.conditionAnalysis=extractConditions(f.x);f.x.digest=extractionDigest(f.x);const compiled=selectPreparedAreas(await compileMapExtraction(f.x,f.assets,f.inventory),[1,2,3]),grouped=prepareGroupedDocument(compiled,null,{rootId:'section:1',nodes:groupNodes}),domain=mapDomain(grouped),index=conditionIndex(domain.records);
 assert.equal(domain.records.filter(r=>r.kind==='map').length,1);for(const appearance of domain.records.filter(r=>r.kind==='appearance'))assert(index.effects.some(e=>e.kind==='dialogue'&&e.target.recordId===appearance.recordId));
 const selected=selectPreparedAreas(compiled,[1,2]),kept=new Set(mapDomain(selected).records.map(r=>r.recordId));assert(conditionIndex(mapDomain(selected).records).effects.every(e=>kept.has(e.target.recordId)));assert.equal(mapDomain(selected).records.filter(r=>r.kind==='appearance').length,2);
});
test('unconditional maps remain usable with no fabricated condition buttons',async()=>{
 const f=fixture();f.x.appearances[0].visibility.flag=0;f.x.flows[0].instructions.push({offset:2,name:'End',locator:f.x.roots[0].locator,messageReferences:[]});f.x.conditionAnalysis=extractConditions(f.x);f.x.digest=extractionDigest(f.x);const v=await compileMapExtraction(f.x,f.assets,f.inventory),index=conditionIndex(mapDomain(v).records);assert.equal(globalThis.romdexConditions.stages(index).length,0);assert(index.effects.some(e=>e.kind==='dialogue'&&e.requires.op==='constant'&&e.requires.value));
});
test('supported legacy upgrade retains exact proposals, critical notes, testing and all original image bytes',async()=>{
 const v=await example(false),domain=mapDomain(v),r=domain.records.find(r=>r.kind==='appearance'),point=Object.values(r.current.payload.points)[0],ctx={workspace:v.document.datasetId,authorization:localDocumentAuthority(v.document.datasetId),operationId:'content:preservation-review',createdAt:'2026-10-21T12:00:00.000Z',head:null};
 const reviewed=buildEdit(domain,{type:'review',recordId:r.recordId,pointId:point.id,note:'Keep exact note  ',flag:'critical',testStatus:'verified'},ctx),planned=buildEdit(reviewed.preview,{type:'plan',recordId:r.recordId,pointId:point.id,blockId:point.blockOrder[0],instructions:'Keep exact proposed request ',proposedDialogue:'Different text '},{...ctx,operationId:'content:preservation-plan'});
 const d=structuredClone(v.document);d.content.reviews=planned.preview.reviews;d.content.plans=planned.preview.plans;d.revision=documentRevision(d);const value={...v,document:d,documentBytes:Buffer.from(canonical(d))},next=upgradeMapConditions(value);validateDocument(next.documentBytes,{blobs:next.blobs});
 assert.deepEqual(next.document.content.reviews,d.content.reviews);assert.deepEqual(next.document.content.plans,d.content.plans);for(const asset of d.assetInventory)assert.deepEqual(next.document.assetInventory.find(a=>a.assetId===asset.assetId),asset);assert(next.document.content.history.some(h=>h.sha256===sha(value.documentBytes)));for(const [hash,b]of v.blobs)assert(next.blobs.get(hash).equals(b));
});
test('repreparing an upgraded map preserves owner labels and current content without a false source conflict',async()=>{
 const f=fixture(),legacy=selectPreparedAreas(await compileMapExtraction(f.x,f.assets,f.inventory),[1]),local=upgradeMapConditions(legacy),r=local.document.content.records.find(r=>local.document.content.recordHeads.some(h=>h.revisionId===r.revisionId)&&r.current.payload.definitions?.conditionIndex),index=r.current.payload.definitions.conditionIndex;index.conditions[0].label='Owner Label';index.conditions[0].labelOrigin='owner';r.current.payload.definitions.stages=globalThis.romdexConditions.stages(index);Object.assign(r,seal(r));local.document.content.recordHeads=local.document.content.recordHeads.map(h=>h.recordId===r.recordId?{recordId:h.recordId,revisionId:r.revisionId}:h);local.document.revision=documentRevision(local.document);local.documentBytes=Buffer.from(canonical(local.document));
 f.x.conditionAnalysis=extractConditions(f.x);f.x.digest=extractionDigest(f.x);const incoming=selectPreparedAreas(await compileMapExtraction(f.x,f.assets,f.inventory),[1]),out=mergePreparation(incoming,local);assert.equal(conditionIndex(mapDomain(out).records).conditions[0].label,'Owner Label');assert(!out.document.extensions['org.romdex.map-groups']);assert.deepEqual(recoverText(out),recoverText(local));validateDocument(out.documentBytes,{blobs:out.blobs});
});
function recoverText(v){return mapDomain(v).records.flatMap(r=>Object.values(r.current.payload.points||{}).flatMap(p=>Object.values(p.blocks).map(b=>[b.id,b.text])));}

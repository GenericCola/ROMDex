import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './rom-compilation-fixture.mjs';
import {extractConditions} from '../rom/condition-extraction.mjs';
import {extractionDigest} from '../rom/extract.mjs';
import {compileMapExtraction} from '../rom/compile-map.mjs';
import {validateDocument,documentRevision} from '../rdx/document.mjs';
import {unpackRdx,packRdx} from '../rdx/container.mjs';
import {splitDocument,joinDocument} from '../rdx/cloud-parts.mjs';
import {conditionIndex,CONDITION_CAPABILITY} from '../rdx/features.mjs';
import {canonical,seal} from '../content/contracts.mjs';
import {mapDomain} from '../rdx/map-import.mjs';
import {projectNPCDex} from '../content/projection.mjs';
async function example(){const f=fixture();f.x.conditionAnalysis=extractConditions(f.x);f.x.digest=extractionDigest(f.x);return compileMapExtraction(f.x,f.assets,f.inventory);}
test('compiled conditions pin real content targets and evidence; gender blocks keep independent review keys',async()=>{
 const v=await example(),d=v.document,index=conditionIndex(d.content.records);assert(d.capabilities.required.includes(CONDITION_CAPABILITY));assert.equal(index.conditions.length,1);assert.equal(index.effects.filter(e=>e.kind==='dialogue').length,2);
 const p=d.content.records.find(r=>r.kind==='appearance').current.payload.points;for(const point of Object.values(p)){assert.equal(new Set(Object.values(point.blocks).map(b=>b.reviewKey)).size,2);assert(point.stageIds.includes(index.conditions[0].id));}
 validateDocument(v.documentBytes,{blobs:v.blobs});
});
test('portable reimport and factored cloud recovery retain exact condition data and semantic capabilities',async()=>{
 const v=await example(),u=await unpackRdx(v.bytes),parts=splitDocument(v),joined=await joinDocument(parts,async id=>parts.objects.get(id));assert.deepEqual(joined.document,u.document);assert.deepEqual(conditionIndex(joined.document.content.records),conditionIndex(v.document.content.records));
 const again=await unpackRdx(await packRdx(joined.documentBytes,joined.blobs));assert.equal(again.document.revision,v.document.revision);
});
test('projection exposes the selected map index and does not apply legacy observed scene labels',async()=>{
 const v=await example(),snapshot=projectNPCDex(mapDomain(v),{assetBytes:hash=>v.blobs.get(hash)}),town=snapshot.towns[0],timeline=snapshot.timelines[town.timelineRef];
 assert(timeline.conditionIndex);assert.equal(timeline.stages.length,1);assert.equal(timeline.stages[0].name,'Flag 0x0007');assert(timeline.stages[0].conditionEffect);
});
test('unknown feature caps, dangling blocks and unrelated Timeline entries fail before import',async()=>{
 const v=await example();
 for(const mutate of [d=>d.capabilities.required.push('org.romdex.future-unknown'),d=>{const r=d.content.records.find(r=>r.current.payload.definitions?.conditionIndex);r.current.payload.definitions.conditionIndex.effects.find(e=>e.kind==='dialogue').target.blockIds=['block:missing'];Object.assign(r,seal(r));d.content.recordHeads=d.content.records.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));}]){
  const d=structuredClone(v.document);mutate(d);d.revision=documentRevision(d);assert.throws(()=>validateDocument(Buffer.from(canonical(d)),{blobs:v.blobs}));
 }
});

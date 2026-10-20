import test from 'node:test';
import assert from 'node:assert/strict';
import {inventoryDigest} from '../rom/hgss.mjs';
import {HGSS_ADAPTER} from '../rom/profiles.mjs';
import {createIdentityManifest,previewIdentityUpdate,validateIdentityManifest} from '../rom/identities.mjs';
import {canonical} from '../content/contracts.mjs';
import {sha256} from '../rom/reader.mjs';
function inventory(hash='a'.repeat(64)){
 const value={format:'ROMDexSourceInventory/1',adapter:HGSS_ADAPTER,source:{format:'ROMDexROMFingerprint/1',sha256:hash},maps:[1,2].map(id=>({headerId:id,internalName:'AREA'+id,sha256:String(id).repeat(64),events:{backgrounds:[],overworlds:[{index:0,localId:1,sha256:'c'.repeat(64)}],warps:[],triggers:[]}})),warnings:[]};value.digest=inventoryDigest(value);return value;
}
function reseal(value){delete value.digest;value.digest=sha256(Buffer.from(canonical(value)));return value;}
test('first ROM-only identity capture allocates durable IDs separate from indices and map names',()=>{
 const source=inventory(),manifest=createIdentityManifest(source);assert.equal(manifest.entries.length,4);assert.equal(new Set(manifest.entries.map(e=>e.id)).size,4);
 assert(manifest.entries.every(e=>e.id.startsWith('rom-source:')&&!e.id.includes('AREA')));assert.equal(manifest.sourceSHA256,source.source.sha256);assert.deepEqual(validateIdentityManifest(JSON.parse(JSON.stringify(manifest))),manifest);
});
test('same pinned source reuses exact IDs, project and manifest across reopening',()=>{
 const source=inventory(),first=createIdentityManifest(source),again=createIdentityManifest(source,{previous:JSON.parse(JSON.stringify(first))});
 assert.deepEqual(again,first);assert.equal(previewIdentityUpdate(first,source).requiresReview,false);
});
test('newer source and reordered rows produce candidates without reassigning existing identities',()=>{
 const original=inventory(),manifest=createIdentityManifest(original),before=structuredClone(manifest),next=inventory('b'.repeat(64));next.maps[0].events.overworlds[0].sha256='d'.repeat(64);next.digest=inventoryDigest(next);
 const preview=previewIdentityUpdate(manifest,next);assert.equal(preview.state,'needs-review');assert.equal(preview.assignments.find(e=>e.key==='area/1/overworlds/0').candidateId,manifest.entries.find(e=>e.key==='area/1/overworlds/0').id);assert.equal(preview.assignments.find(e=>e.key==='area/1/overworlds/0').evidenceUnchanged,false);
 assert.throws(()=>createIdentityManifest(next,{previous:manifest}),{code:'IDENTITY_REVIEW_REQUIRED'});assert.deepEqual(manifest,before);
});
test('missing source rows remain pending review rather than becoming deletion or archival',()=>{
 const old=inventory(),manifest=createIdentityManifest(old),next=inventory('b'.repeat(64));next.maps[0].events.overworlds=[];next.digest=inventoryDigest(next);
 const plan=previewIdentityUpdate(manifest,next);assert.equal(plan.missing.length,1);assert.equal(plan.missing[0].action,'retain-pending-review');assert.equal(plan.missing[0].id,manifest.entries.find(e=>e.kind==='overworlds'&&e.headerId===1).id);
});
test('map-scoped manifests exclude other maps and cannot silently change their scope',()=>{
 const source=inventory(),manifest=createIdentityManifest(source,{headerIds:[2]});assert.deepEqual(manifest.headerIds,[2]);assert(manifest.entries.every(e=>e.headerId===2));
 assert.throws(()=>createIdentityManifest(source,{previous:manifest,headerIds:[1,2]}),{code:'REVIEW_REQUIRED'});assert.throws(()=>createIdentityManifest(source,{headerIds:[1,1]}),{code:'INVALID'});assert.throws(()=>createIdentityManifest(source,{headerIds:[99]}),{code:'INVALID'});
});
test('duplicate object identities, tampered baselines and duplicate IDs stay blocked',()=>{
 const source=inventory();source.warnings=[{code:'DUPLICATE_LOCAL_ID',mapHeaderId:1,localId:1}];source.digest=inventoryDigest(source);
 assert.throws(()=>createIdentityManifest(source),{code:'AMBIGUOUS_IDENTITY'});assert.equal(createIdentityManifest(source,{headerIds:[2]}).entries.length,2);
 const ordinary=inventory(),manifest=createIdentityManifest(ordinary),altered=structuredClone(manifest);altered.entries[0].evidenceSHA256='e'.repeat(64);reseal(altered);assert.throws(()=>createIdentityManifest(ordinary,{previous:altered}),{code:'INTEGRITY'});
 const duplicate=structuredClone(manifest);duplicate.entries[1].id=duplicate.entries[0].id;reseal(duplicate);assert.throws(()=>validateIdentityManifest(duplicate),{code:'INTEGRITY'});
 ordinary.maps[0].sha256='f'.repeat(64);assert.throws(()=>createIdentityManifest(ordinary),{code:'INTEGRITY'});
 const stripped=inventory();stripped.maps[0].events.overworlds.push({index:1,localId:1,sha256:'d'.repeat(64)});stripped.warnings=[];stripped.digest=inventoryDigest(stripped);assert.throws(()=>createIdentityManifest(stripped),{code:'AMBIGUOUS_IDENTITY'});
});

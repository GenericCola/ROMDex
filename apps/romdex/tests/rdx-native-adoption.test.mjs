import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {document as original} from './cloud-merge-fixture.mjs';
import {previewLegacyMigration,recoverLegacyOriginal} from '../content/migration.mjs';
import {buildNativeViewTransition,buildContentImport} from '../content/catalog.mjs';
import {mapBundle} from './content-native-tree-fixture.mjs';
import {buildEdit} from '../content/edits.mjs';
import {sha,canonical} from '../content/contracts.mjs';
import {previewNativeAdoption,nativeMapDocument,joinNativeMaps,nativeSourceEvidence,ADOPTION_EXTENSION} from '../rdx/native-adoption.mjs';
import {unpackRdx} from '../rdx/container.mjs';import {mapDomain} from '../rdx/map-import.mjs';
import {MapWorkspace} from '../rdx/map-workspace.mjs';
import {scopeNativeMap} from '../rdx/native-map-scope.mjs';

function source(){
 const d=original();d.characterImages.sprite.dataUrl='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
 d.towns[0].characters[0].image={...d.characterImages.sprite};
 d.annotations['town|element|point|block']={flag:true,note:'Keep exact note \n  trailing space ',testStatus:'verified'};d.history=[{id:'fixture:history',patches:[],at:'2026-10-18T00:00:00.000Z',detail:'Preserve original history.'}];
 const p=previewLegacyMigration({bytes:Buffer.from(JSON.stringify(d)),workspace:'fixture:workspace',regions:{town:'Johto'},createdAt:'2026-10-18T15:00:00.000Z',sourceHead:'source'}),ctx={workspace:'fixture:workspace',head:'a'.repeat(64),operationId:'fixture:native-transition',createdAt:'2026-10-18T15:01:00.000Z'},assetBytes=h=>p.assetBytes.get(h),transition=buildNativeViewTransition(p.domain,ctx,{assetBytes});
 const f={d,p,ctx,assetBytes,transition,domain:transition.preview},bundle=mapBundle(f),imported=buildContentImport(f.domain,Buffer.from(JSON.stringify(bundle)),{...ctx,head:transition.publication.digest});
 return {...f,domain:imported.preview,head:imported.publication.digest};
}
async function preview(f){return previewNativeAdoption({domain:f.domain,head:f.head,assetBytes:f.assetBytes,bindings:f.domain.records.map((r,i)=>({recordId:r.recordId,issueId:'3-'+(i+1)}))});}
const context=f=>({source:nativeSourceEvidence(f.domain,f.head),sharedDomain:f.domain});

test('map export retains scoped planning dictionaries without another map or undefined history values',()=>{
 const f=source(),map=f.domain.records.find(r=>r.kind==='map'),root=f.domain.views.find(v=>v.recordId===null),townId=f.domain.views.find(v=>v.recordId===map.recordId).payload.fields.id;
 root.payload.fields.promptStatusUnset={[townId+'|prompt|point']:true,'other-map|prompt|point':true};
 root.payload.fields.decisionConflicts={here:{target:{townId}},elsewhere:{target:{townId:'other-map'}}};
 const scoped=scopeNativeMap(f.domain,map.recordId),fields=scoped.payload.fields;
 assert.deepEqual(fields.promptStatusUnset,{[townId+'|prompt|point']:true});assert.deepEqual(fields.decisionConflicts,{here:{target:{townId}}});assert.equal(Array.isArray(fields.romReversalResolutions),false);assert.doesNotThrow(()=>canonical(scoped.payload));
});

test('existing maps split without changing catalog, exact originals, assets or issue identities',async()=>{
 const f=source(),p=await preview(f);assert.equal(p.maps.length,2);assert.equal(p.summary.backendRecordsCreated,0);assert.equal(p.summary.exactMaleAndFemaleViews,true);
 const joined=joinNativeMaps(p.maps,context(f));assert.deepEqual(joined,f.domain);
 assert(recoverLegacyOriginal(joined,f.assetBytes).bytes.equals(Buffer.from(JSON.stringify(f.d))));
 for(const v of p.maps){assert.equal(v.document.content.recordHeads.filter(h=>v.document.content.records.find(r=>r.revisionId===h.revisionId)?.kind==='map').length,1);const read=await unpackRdx(v.bytes);assert.deepEqual(read.document,v.document);for(const a of v.document.assetInventory)assert(read.blobs.get(a.sha256).equals(f.assetBytes(a.sha256)));assert.equal(v.document.extensions[ADOPTION_EXTENSION].bindings.length,v.document.content.recordHeads.length);assert(!v.document.content.records.some(r=>r.current.payload.definitions?.migration));assert.equal(v.document.content.views.filter(v=>v.recordId===null).length,1);assert.equal(v.document.content.views.find(v=>v.recordId===null).payload.collectionOrder.length,1);}
});

test('conversion is deterministic and never changes stable identities on recapture',async()=>{
 const f=source(),a=await preview(f),b=await preview(f);assert.deepEqual(a.summary,b.summary);assert(a.maps.every((v,i)=>v.bytes.equals(b.maps[i].bytes)));
 const record=f.domain.records.find(r=>r.kind==='appearance'),edit=buildEdit(f.domain,{type:'review',recordId:record.recordId,expectedRevision:record.revisionId,expectedParents:[],note:'New local note with space ',flag:'critical',testStatus:'unreviewed'},{...f.ctx,operationId:'fixture:queued-note',createdAt:'2026-10-18T15:03:00.000Z',head:f.head});
 const next={...f,domain:edit.preview,head:edit.publication.digest},c=await preview(next);assert.deepEqual(c.maps.map(v=>v.document.documentId),a.maps.map(v=>v.document.documentId));assert(joinNativeMaps(c.maps,context(next)).reviews.some(r=>r.note==='New local note with space '));assert.deepEqual(f.domain.records,edit.preview.records);
});

test('mixed source heads and missing map dependencies cannot produce a catalog',async()=>{
 const f=source(),p=await preview(f);assert.throws(()=>joinNativeMaps([p.maps[0]],context(f)),/Dependency Is Missing/);assert.throws(()=>joinNativeMaps(p.maps),/Separate Native Shared Context/);const wrong=structuredClone(p.maps[1].document);wrong.datasetId='fixture:wrong';assert.throws(()=>joinNativeMaps([p.maps[0],{...p.maps[1],document:wrong}],context(f)),/Dataset|Workspace/);
 assert.throws(()=>nativeMapDocument({domain:f.domain,mapRecordId:'fixture:missing',head:f.head,assetBytes:f.assetBytes}),/Native Map/);
 assert.throws(()=>nativeMapDocument({domain:f.domain,mapRecordId:p.maps[0].document.scope.mapRecordId,head:f.head,assetBytes:()=>Buffer.from('damaged')}),/Asset Failed Verification/);
});

test('adopted files independently import and export with exact text and no token or native write authority',async t=>{
 const f=source(),p=await preview(f),dir=await fs.mkdtemp(path.join(os.tmpdir(),'rd10-portable-')),m=new MapWorkspace({dataDirectory:path.join(dir,'Data')});t.after(async()=>{await m.close();assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));await fs.rm(dir,{recursive:true,force:true});});
 await m.open();const input=path.join(dir,'map.rdx');await fs.writeFile(input,p.maps[0].bytes);const saved=await m.store.ingest(input);m.active=saved.key;const view=await m.view();assert.equal(view.status.cloud,false);assert.equal(view.snapshot.towns.find(t=>t.id==='town')?.name,'Test Town');assert.equal(view.snapshot.towns.find(t=>t.id==='town')?.areas[0].elements[0].points[0].blocks[0].text,'Original Dialogue');assert(!view.snapshot.towns.some(t=>t.id==='fixture:new-map'));
 const value=await m.store.view(saved.key);assert.deepEqual(mapDomain(value).records,mapDomain(p.maps[0]).records);assert.equal(sha(await fs.readFile(m.store.file(saved.key))),sha(p.maps[0].bytes));assert(!canonical(value.document).includes('connection.encrypted'));
 const notes=(await m.dispatch('/api/editor')).reviews;assert(notes.every(r=>r.testStatus==='unreviewed'),'Portable claims do not acquire local human-verification authority.');
});

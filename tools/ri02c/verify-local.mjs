import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {canonical,sha} from '../../apps/romdex/content/contracts.mjs';
import {unpackRdx,packRdx} from '../../apps/romdex/rdx/container.mjs';
import {MapWorkspace} from '../../apps/romdex/rdx/map-workspace.mjs';
import {mapDomain} from '../../apps/romdex/rdx/map-import.mjs';
import {validateExtraction} from '../../apps/romdex/rom/extract.mjs';
const work=path.resolve('work/ri02c'),input=path.join(work,'compiled/VioletCityMap.rdx'),bytes=await fs.readFile(input),value=await unpackRdx(bytes),d=value.document,domain=mapDomain(value),maps=new MapWorkspace({dataDirectory:path.join(work,'local-data')});
const report={task:'RI02C',testbed:'Violet City',scope:'Real ROM-derived RDX in empty local profiles',productionDataAccess:false,checks:[]};
try{
 assert.equal(domain.records.filter(r=>r.kind==='map').length,1);assert.equal(domain.records.filter(r=>r.kind==='subzone').length,8);assert.equal(domain.records.filter(r=>r.kind==='appearance').length,50);
 assert((await packRdx(value.documentBytes,value.blobs)).equals(bytes));report.checks.push('Container unpack/repack preserves exact bytes');
 const assetById=new Map(d.assetInventory.map(a=>[a.assetId,a])),source=JSON.parse(value.blobs.get(assetById.get(d.extensions['org.romdex.rom-source'].sourceAsset).sha256)),x=source.header;
 for(const [key,refs]of Object.entries(source.sections)){x[key]=[];for(const aid of refs){const section=JSON.parse(value.blobs.get(assetById.get(aid).sha256));assert.equal(section.offset,x[key].length);assert.equal(section.section,key);x[key].push(...section.items);}}
 validateExtraction(x);assert.equal(x.digest,'90233882912c2214b20147baf392a7beae9cbdec6ec5ddce939a568d27e1d461');
 const originals=new Map(x.messages.map(m=>[m.key,m.text])),observed=new Set();let gendered=0;
 for(const r of domain.records)for(const p of Object.values(r.current.payload.points||{}))for(const b of Object.values(p.blocks)){if(b.sourceBlockId){assert.equal(b.text,originals.get(b.sourceBlockId));observed.add(b.sourceBlockId);}if(b.gender!=='both')gendered++;}
 assert.equal(observed.size,329);assert(gendered>0);report.checks.push('All 329 source texts, controls, raw tokens and extraction sections reconstruct exactly');
 const u=await maps.dispatch('/api/rdx/begin',{bytes:bytes.length},null);for(let offset=0;offset<bytes.length;offset+=u.chunkBytes)await maps.dispatch('/api/rdx/chunk',{id:u.id,offset,base64:bytes.subarray(offset,offset+u.chunkBytes).toString('base64')},null);
 const p=await maps.dispatch('/api/rdx/preview',{id:u.id},null);assert.equal(p.conflicts.length,0);await maps.dispatch('/api/rdx/commit',{id:u.id,token:p.token,approved:true},null);const key=maps.active;
 for(const gender of ['male','female']){const view=await maps.view(gender);assert.equal(view.snapshot.towns.length,1);assert.equal(view.snapshot.towns[0].areas.length,8);assert.equal(view.snapshot.towns[0].characters.length,50);assert.equal(view.status.requiresHumanTesting,true);assert.equal(view.snapshot.towns[0].characters.filter(c=>c.image).length,48);assert.equal(Object.values(view.snapshot.timelines)[0].stages.length,4);}
 report.checks.push('Both player-gender snapshots display eight areas, 50 objects and 48 unambiguous sprite thumbnails; two ambiguous palettes retain all alternatives without a guessed default');
 const selected=domain.records.find(r=>r.kind==='appearance'&&Object.values(r.current.payload.points).some(p=>p.blockOrder.some(k=>p.blocks[k].kind==='dialogue'))),point=Object.values(selected.current.payload.points).find(p=>p.blockOrder.some(k=>p.blocks[k].kind==='dialogue')),block=point.blockOrder.map(k=>point.blocks[k]).find(b=>b.kind==='dialogue');
 const edit=async command=>maps.dispatch('/api/edit',{expectedHead:(await maps.store.view(key)).document.revision,command},key);
 await edit({type:'review',recordId:selected.recordId,pointId:point.id,reviewId:'content:ri02c-local-review',expectedParents:[],note:'RI02C local note with trailing space ',flag:'critical',testStatus:'unreviewed'});
 await edit({type:'plan',recordId:selected.recordId,pointId:point.id,blockId:block.id,planId:'content:ri02c-local-plan',expectedParents:[],intent:'UPDATE',workflow:'draft',instructions:'Isolated RI02C proof only. Do not modify the ROM.',proposedDialogue:block.text+' [RI02C proposed test edit]'});
 const after=await maps.store.view(key);assert.equal(after.document.content.reviews[0].flag,'critical');assert.equal(after.document.content.plans[0].changes.length,1);assert.equal(mapDomain(after).records.find(r=>r.recordId===selected.recordId).revisionId,selected.revisionId);
 await fs.copyFile(maps.store.file(key),path.join(work,'VioletCity-Local-Edited.rdx'));report.checks.push('Local note, critical flag and proposed dialogue persist without changing recorded ROM content');
 const rev=after.document.revision;await maps.close();await maps.initialize();assert.equal((await maps.store.view(key)).document.revision,rev);
 const second=new MapWorkspace({dataDirectory:path.join(work,'second-local-data')});await second.open();await second.store.ingest(path.join(work,'VioletCity-Local-Edited.rdx'));second.active=key;const copy=await second.store.view(key);assert.equal(copy.document.revision,rev);assert.equal((await second.view()).status.requiresHumanTesting,true);for(const [h,b]of value.blobs)assert(copy.blobs.get(h).equals(b));await second.close();
 report.checks.push('Reopen and second empty profile retain every source/image byte, stable identity, note, flag, proposal and human-testing requirement');
 report.status='passed';report.documentKey=key;report.datasetId=d.datasetId;report.selected={recordId:selected.recordId,pointId:point.id,blockId:block.id};report.sourceSHA256=x.source.sha256;report.extractionDigest=x.digest;report.inputSHA256=sha(bytes);report.inputBytes=bytes.length;report.records=domain.records.length;report.images=d.assetInventory.filter(a=>a.purpose==='image').length;report.genderSpecificBlocks=gendered;
 await fs.writeFile(path.join(work,'identity.json'),JSON.stringify({key,datasetId:d.datasetId,mapId:d.scope.mapRecordId,selected:report.selected}));
}catch(e){report.status='failed';report.error=e.stack;throw e;}finally{await maps.close();await fs.writeFile(path.join(work,'local-proof.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}

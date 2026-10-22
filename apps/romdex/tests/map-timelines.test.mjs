import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {seal,sha,canonical,validateGraph} from '../content/contracts.mjs';
import {validateSnapshot,snapshotStages,definitionStages,chooseStage,label} from '../content/timelines.mjs';
import {previewLegacyMigration,recoverLegacyOriginal} from '../content/migration.mjs';
import {buildContentImport} from '../content/catalog.mjs';
import {projectNPCDex} from '../content/projection.mjs';
import {buildEdit} from '../content/edits.mjs';
import {nativeFixture,mapBundle} from './content-native-tree-fixture.mjs';
import {document as legacyDocument} from './cloud-merge-fixture.mjs';
import {packRdx,unpackRdx} from '../rdx/container.mjs';
import {documentRevision} from '../rdx/document.mjs';
import {mapDomain} from '../rdx/map-import.mjs';
import {MapWorkspace} from '../rdx/map-workspace.mjs';
import {createContentAssets} from '../content/desktop-assets.mjs';
const stage=(id,name=id)=>({id,name,event:'Condition for '+id});
function snapshot(){
 const town=(id,ref,stages)=>({id,name:id,timelineRef:ref,areas:[{id:id+'-area',elements:[{id:id+'-npc',points:[{id:id+'-point',stages:[stages[0].id],condition:'Current',blocks:[]}]}]}],locations:[],characters:[]});
 const first=[stage('first:arrival'),stage('first:badge')],second=[stage('second:one'),stage('second:two'),stage('second:three'),stage('second:four')];
 return {version:2,revision:0,stages:[],timelines:{'timeline:first':{id:'timeline:first',name:'First',stages:first},'timeline:second':{id:'timeline:second',name:'Second',stages:second}},towns:[town('first','timeline:first',first),town('second','timeline:second',second)],annotations:{'first-note':{flag:true,note:'Keep trailing space ',testStatus:'verified'}},changePlans:{draft:{instructions:'Keep newer draft'}},history:[{id:'old-history'}]};
}
function ownTimeline(){
 const f=nativeFixture(),b=mapBundle(f),stages=[stage('violet:scene-one'),stage('violet:scene-three')];
 b.records.unshift({recordId:'fixture:violet-timeline',kind:'shared',parentRecordId:null,current:{lifecycle:'active',payload:{name:'Violet scoped timeline (synthetic)',sharedType:'progression',definitions:{stages}}},presentation:null,mapping:{status:'unresolved',locators:[],evidence:[]}});
 b.records.find(r=>r.kind==='map').current.payload.timelineRef='fixture:violet-timeline';
 b.records.find(r=>r.kind==='appearance').current.payload.points['fixture:new-point'].stageIds=[stages[0].id];
 const imported=buildContentImport(f.domain,Buffer.from(JSON.stringify(b)),{...f.ctx,head:f.transition.publication.digest});
 return {...f,b,imported};
}
test('maps have different bounded timeline sizes and stable IDs, with Roman ordinals beyond ten',()=>{
 const d=snapshot();validateSnapshot(d);assert.equal(snapshotStages(d,d.towns[0]).length,2);assert.equal(snapshotStages(d,d.towns[1]).length,4);
 const long=Array.from({length:12},(_,i)=>stage('phase:'+i));assert.equal(label(long,'phase:10'),'XI');assert.equal(label(long,'phase:11'),'XII');
 assert.equal(chooseStage(long,'phase:10'),'phase:10');assert.equal(chooseStage(long,'missing'),'phase:0');assert.equal(chooseStage([],null),'conditional');
});
test('desktop HTML serves the shared timeline logic before runtime and bootstraps the scoped registry',async()=>{
 const get=await createContentAssets({publicDir:fileURLToPath(new URL('../public/',import.meta.url)),view:async()=>({provider:'rdx-local',active:true,snapshot:snapshot()})}),page=(await get('/addons/npcdex/index.html')).bytes.toString();
 assert.ok(page.indexOf('content-timelines.js')<page.indexOf('content-runtime.js'));assert.ok((await get('/addons/npcdex/content-timelines.js')).bytes.toString().includes('root.romdexTimelines'));
 assert.ok((await get('/addons/npcdex/content-bootstrap.js')).bytes.toString().includes('timeline:first'));
});
test('duplicate, reserved and cross-map stage references fail before a save/import',()=>{
 const d=snapshot();d.towns[0].areas[0].elements[0].points[0].stages=['second:one'];assert.throws(()=>validateSnapshot(d),/Outside Its Map/);
 const missing=snapshot();missing.towns[0].timelineRef='timeline:missing';assert.throws(()=>validateSnapshot(missing),/Timeline Is Missing/);
 for(const id of ['all','conditional','__proto__','with space'])assert.throws(()=>definitionStages({stages:[stage(id)]}),/Stable IDs/);
 assert.throws(()=>definitionStages({stages:[stage('x'),stage('x')]}),/Stable IDs/);assert.throws(()=>definitionStages({stages:Array.from({length:257},(_,i)=>stage('x:'+i))}),/Bounded/);
});
test('legacy A-J identities and declared ID-only portable timelines remain readable without fixed counts',()=>{
 const d=legacyDocument();validateSnapshot(d);assert.equal(d.stages[0].id,'A');const list=definitionStages({stageIds:['A','B','C']});assert.equal(list.length,3);assert.equal(list[2].name,'Stage III');assert.match(list[0].event,/Not Supplied/);
});
test('renaming and reordering stages changes labels, never point/annotation/plan/testing identities',()=>{
 const d=snapshot(),saved=structuredClone(d);d.timelines['timeline:first'].stages.reverse();d.timelines['timeline:first'].stages[0].name='New descriptive label';validateSnapshot(d);
 assert.equal(label(snapshotStages(d,d.towns[0]),'first:arrival'),'II');assert.equal(d.towns[0].areas[0].elements[0].points[0].stages[0],'first:arrival');
 assert.deepEqual(d.annotations,saved.annotations);assert.deepEqual(d.changePlans,saved.changePlans);assert.deepEqual(d.history,saved.history);
});
test('a new native map can import its own timeline, while the existing map retains its ten legacy stages',()=>{
 const f=ownTimeline(),d=projectNPCDex(f.imported.preview,{assetBytes:f.assetBytes});assert.equal(snapshotStages(d,d.towns[0]).length,10);const t=d.towns.find(t=>t.id==='fixture:new-map');assert.equal(t.timelineRef,'fixture:violet-timeline');assert.equal(snapshotStages(d,t).length,2);
 assert.deepEqual(f.imported.preview.records.find(r=>r.recordId===f.domain.records.find(r=>r.kind==='map').recordId).current,f.domain.records.find(r=>r.kind==='map').current);
});
test('native graph rejects a map pointing at non-progression shared content and wrong stage membership',()=>{
 const f=ownTimeline(),d=structuredClone(f.imported.preview);let r=d.records.find(r=>r.recordId==='fixture:new-person');r.current.payload.points['fixture:new-point'].stageIds=['A'];r=seal(r);d.records=d.records.map(x=>x.recordId===r.recordId?r:x);assert.throws(()=>validateGraph(d.records),/Outside Its Map/);
 const b=structuredClone(f.b);b.records.find(r=>r.kind==='shared').current.payload.sharedType='global-dialogue';assert.throws(()=>buildContentImport(f.domain,Buffer.from(JSON.stringify(b)),{...f.ctx,head:f.transition.publication.digest}),/Timeline|Shared Content/);
});
test('owner timeline correction preserves existing entity revisions, flags, plans and tested results',()=>{
 const f=ownTimeline(),domain=f.imported.preview,record=domain.records.find(r=>r.recordId==='fixture:new-person'),point=record.current.payload.points['fixture:new-point'];
 const ctx={...f.ctx,head:f.imported.publication.digest,operationId:'fixture:timeline-review'},review=buildEdit(domain,{type:'review',recordId:record.recordId,pointId:point.id,note:'Keep note ',flag:'critical',testStatus:'verified'},ctx);
 const timeline=review.preview.records.find(r=>r.recordId==='fixture:violet-timeline'),stages=structuredClone(timeline.current.payload.definitions.stages).reverse();stages[0].name='Renamed state';
 const updated=buildEdit(review.preview,{type:'definition',recordId:timeline.recordId,expectedRevision:timeline.revisionId,documentationCorrection:true,timelineStages:stages,reason:'Clarify presentation order',evidence:'Synthetic timeline evidence'},{...ctx,head:review.publication.digest,operationId:'fixture:timeline-order'});
 assert.equal(updated.preview.records.find(r=>r.recordId===record.recordId).revisionId,record.revisionId);assert.deepEqual(updated.preview.reviews,review.preview.reviews);assert.deepEqual(updated.preview.plans,review.preview.plans);
 const ui=projectNPCDex(updated.preview,{assetBytes:f.assetBytes}),town=ui.towns.find(t=>t.id==='fixture:new-map');assert.equal(label(snapshotStages(ui,town),point.stageIds[0]),'II');assert.equal(ui.contentPreview.reviewStates[0].status,'verified');
 assert.throws(()=>buildEdit(review.preview,{type:'definition',recordId:timeline.recordId,documentationCorrection:true,timelineStages:[stages[0]],reason:'Remove used state',evidence:'Synthetic'},{...ctx,head:review.publication.digest,operationId:'fixture:bad-remove'}),/Outside Its Map/);
});
test('point condition/stage editing validates against its own map rather than another timeline',()=>{
 const f=ownTimeline(),ctx={...f.ctx,head:f.imported.publication.digest,operationId:'fixture:point-stage'};
 const edit=buildEdit(f.imported.preview,{type:'definition',recordId:'fixture:new-person',pointId:'fixture:new-point',documentationCorrection:true,stageIds:['violet:scene-three'],condition:'Changed condition',reason:'Correct extraction',evidence:'Synthetic source'},ctx);
 assert.equal(edit.preview.records.find(r=>r.recordId==='fixture:new-person').current.payload.points['fixture:new-point'].condition,'Changed condition');
 assert.throws(()=>buildEdit(f.imported.preview,{type:'definition',recordId:'fixture:new-person',pointId:'fixture:new-point',documentationCorrection:true,stageIds:['A'],reason:'Wrong map',evidence:'Synthetic'},ctx),/Outside Its Map/);
});
test('legacy migration with map-scoped timelines keeps its exact recovery bytes and independent conditions',()=>{
 const d=legacyDocument(),a=structuredClone(d.towns[0]),b=structuredClone(a);b.id='second';b.name='Second Town';a.timelineRef='timeline:alpha';b.timelineRef='timeline:beta';
 d.timelines={'timeline:alpha':{id:'timeline:alpha',name:'Alpha',stages:[stage('alpha:start'),stage('alpha:end')]},'timeline:beta':{id:'timeline:beta',name:'Beta',stages:[stage('beta:start'),stage('beta:middle'),stage('beta:end')]}};
 a.areas[0].elements[0].points[0].stages=['alpha:end'];b.areas[0].elements[0].points[0].stages=['beta:middle'];d.towns=[a,b];
 const bytes=Buffer.from(JSON.stringify(d)),m=previewLegacyMigration({bytes,workspace:'fixture:workspace',regions:{town:'Johto',second:'Johto'},createdAt:'2026-10-20T10:00:00.000Z',sourceHead:'fixture:source'}),ui=projectNPCDex(m.domain,{assetBytes:h=>m.assetBytes.get(h)});
 assert.equal(snapshotStages(ui,ui.towns[0]).length,2);assert.equal(snapshotStages(ui,ui.towns[1]).length,3);assert.ok(recoverLegacyOriginal(m.domain,h=>m.assetBytes.get(h)).bytes.equals(bytes));assert.deepEqual(ui.towns[0].areas[0].elements[0].points[0].stages,['alpha:end']);
});
test('RDX unpack/repack preserves stable timeline IDs/order, exact notes/plans and portability without a global ten-stage array',async()=>{
 const document=JSON.parse(await fs.readFile(new URL('./fixtures/rdx/map.document.json',import.meta.url))),blobs=new Map();
 for(const a of document.assetInventory)blobs.set(a.sha256,await fs.readFile(new URL('./fixtures/rdx/blobs/'+a.sha256+'.bin',import.meta.url)));
 const r=document.content.records.find(r=>r.recordId==='fixture:progression'),next=seal({...r,operationId:'fixture:two-stage-timeline',parents:[r.revisionId],current:{...r.current,payload:{...r.current.payload,definitions:{stages:[stage('A','Arrival'),stage('phase:later','Later')]}}}});
 document.content.records.push(next);document.content.recordHeads.find(h=>h.recordId===r.recordId).revisionId=next.revisionId;document.revision=documentRevision(document);
 const first=await unpackRdx(await packRdx(Buffer.from(canonical(document)),blobs)),second=await unpackRdx(await packRdx(first.documentBytes,first.blobs));assert.equal(second.document.revision,first.document.revision);
 const projected=projectNPCDex(mapDomain(second),{assetBytes:h=>second.blobs.get(h)});assert.equal(snapshotStages(projected,projected.towns[0]).length,2);assert.deepEqual(second.document.content.plans,document.content.plans);assert.deepEqual(second.document.content.reviews,document.content.reviews);
});
test('actual runtime handlers switch map stage sets, restore stage IDs and render Roman captions without legacy G-I warnings',async()=>{
 const source=(await fs.readFile(new URL('../content/workspace-runtime.js',import.meta.url),'utf8')).replace(/\r\n/g,'\n'),core=await fs.readFile(new URL('../content/timeline-core.js',import.meta.url),'utf8'),d=snapshot();
 const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',classList:{toggle(){}},style:{setProperty(){}},setAttribute(){},querySelectorAll:()=>[],scrollTop:0});return nodes.get(id);};
 const ctx=vm.createContext({data:d,townId:'first',stage:'first:badge',timelinePositions:new Map(),locationId:null,roomAreaId:null,selected:null,pointId:null,pageIndex:0,scopeOverride:null,expandedLocationId:null,$:node,town:()=>d.towns.find(t=>t.id===ctx.townId),flushNote(){},render(){},renderDialogue(){},points:()=>[],timelinePromptRecords:()=>[],timelineLightHTML:()=>'',conditionEffectLights:()=>'',esc:String,titleCase:String,formatStages:String});
 vm.runInContext(core,ctx);
 for(const name of ['activeStages','conditionIndex','conditionalPoint','eligible','romanNumeral','stageLabel','bindTiles']){const line=source.split('\n').find(l=>l.startsWith('function '+name+'('));assert.ok(line);vm.runInContext(line,ctx);}
 const start=source.indexOf('function renderTimeline('),end=source.indexOf('\n}\n',start)+2;vm.runInContext(source.slice(start,end),ctx);
 const buttons=['first','second'].map(id=>({dataset:{selectType:'town',selectId:id}})),root={querySelectorAll:selector=>selector==='[data-select-type]'?buttons:[]};
 ctx.root=root;vm.runInContext('bindTiles(root)',ctx);buttons[1].onclick();assert.equal(ctx.townId,'second');assert.equal(ctx.stage,'second:one');ctx.stage='second:four';buttons[0].onclick();assert.equal(ctx.stage,'first:badge');
 vm.runInContext('renderTimeline()',ctx);assert.match(node('stages').innerHTML,/>I<\/b>/);assert.match(node('stages').innerHTML,/>II<\/b>/);assert.doesNotMatch(node('stage-caption').textContent,/probable|G|–/);assert.equal(node('stage-caption').textContent,'Condition for first:badge');ctx.data.timelines['timeline:first'].stages=[];ctx.stage='conditional';assert.equal(vm.runInContext("eligible({stages:['all']})",ctx),true);
});
test('managed map save, reopen, export and fresh-profile import retain a two-stage timeline and exact feedback',async t=>{
 const allowed=path.resolve(process.env.ROMDEX_TEST_SCRATCH||os.tmpdir()),root=await fs.mkdtemp(path.join(allowed,'map-timelines-')),open=[];
 t.after(async()=>{for(const m of open)await m.close();assert.equal(path.dirname(root),allowed);assert.ok(path.basename(root).startsWith('map-timelines-'));await fs.rm(root,{recursive:true,force:true});});
 const make=async name=>{const m=new MapWorkspace({dataDirectory:path.join(root,name)});await m.initialize();open.push(m);return m;};
 const ingest=async(m,value)=>{
  const bytes=await packRdx(value.documentBytes,value.blobs),u=await m.dispatch('/api/rdx/begin',{bytes:bytes.length},m.active);
  for(let offset=0;offset<bytes.length;offset+=u.chunkBytes)await m.dispatch('/api/rdx/chunk',{id:u.id,offset,base64:bytes.subarray(offset,offset+u.chunkBytes).toString('base64')},m.active);
  const p=await m.dispatch('/api/rdx/preview',{id:u.id},m.active);await m.dispatch('/api/rdx/commit',{id:u.id,token:p.token,approved:true},m.active);
 };
 const document=JSON.parse(await fs.readFile(new URL('./fixtures/rdx/map.document.json',import.meta.url))),blobs=new Map();
 for(const a of document.assetInventory)blobs.set(a.sha256,await fs.readFile(new URL('./fixtures/rdx/blobs/'+a.sha256+'.bin',import.meta.url)));
 const old=document.content.records.find(r=>r.recordId==='fixture:progression'),timeline=seal({...old,parents:[old.revisionId],operationId:'fixture:managed-timeline',current:{...old.current,payload:{...old.current.payload,definitions:{stages:[stage('A','Arrival'),stage('phase:later','Later')]}}}});
 document.content.records.push(timeline);document.content.recordHeads.find(h=>h.recordId===old.recordId).revisionId=timeline.revisionId;document.revision=documentRevision(document);
 const m=await make('first');await ingest(m,await unpackRdx(await packRdx(Buffer.from(canonical(document)),blobs)));let c=await m.dispatch('/api/editor');
 await m.dispatch('/api/edit',{expectedHead:c.head,command:{type:'review',recordId:'fixture:guide',expectedParents:[],note:'Keep exact note ',flag:'critical',testStatus:'verified'}},m.active);c=await m.dispatch('/api/editor');
 await m.dispatch('/api/edit',{expectedHead:c.head,command:{type:'definition',recordId:timeline.recordId,documentationCorrection:true,timelineStages:[stage('phase:later','Later renamed'),stage('A','Arrival renamed')],reason:'Clarify timeline labels',evidence:'Synthetic source'}},m.active);
 const key=m.active;await m.close();await m.initialize();assert.equal(m.active,key);
 const view=await m.dispatch('/api/view'),stages=snapshotStages(view.snapshot,view.snapshot.towns[0]);assert.deepEqual(stages.map(s=>s.id),['phase:later','A']);assert.equal(label(stages,'A'),'II');assert.ok((await m.dispatch('/api/editor')).reviews.some(r=>r.note==='Keep exact note '&&r.testStatus==='verified'));
 const exported=await m.dispatch('/api/rdx/export',{},key),parts=[];for(let offset=0;offset<exported.bytes;offset+=exported.chunkBytes)parts.push(Buffer.from((await m.dispatch('/api/rdx/export-chunk',{id:exported.id,offset},key)).base64,'base64'));
 const returned=await unpackRdx(Buffer.concat(parts)),other=await make('second');await ingest(other,returned);
 const remote=await other.dispatch('/api/view'),again=snapshotStages(remote.snapshot,remote.snapshot.towns[0]);assert.deepEqual(again,stages);assert.ok((await other.dispatch('/api/editor')).reviews.some(r=>r.note==='Keep exact note '&&r.flag==='critical'));assert.ok((await other.dispatch('/api/editor')).reviews.every(r=>r.testStatus==='unreviewed'));
});

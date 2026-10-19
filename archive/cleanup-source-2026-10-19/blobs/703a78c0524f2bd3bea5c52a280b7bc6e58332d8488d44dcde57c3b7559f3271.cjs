const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input=JSON.parse(fs.readFileSync('C:/Users/mrgen/Downloads/npcdex-v2.32/npcdex-agent-export.json','utf8'));
fs.writeFileSync('work/session-before-reconciliation-234.json',JSON.stringify(input));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage();await page.goto('file:///'+path.resolve('outputs/npcdex.html').replace(/\\/g,'/'));await page.evaluate(()=>startupReady);
const output=await page.evaluate(async input=>{
  data=structuredClone(input);ensurePlanningData(data);reviewCache=null;validate(data);
  const elements=data.towns.find(t=>t.id==='new-bark-town').areas.flatMap(a=>a.elements),sign=elements.find(e=>e.id==='60-14'),archive=elements.find(e=>e.id==='unused-0'),point=sign.points[0],unused=archive.points[0];
  const keys=['prompt:60-14-0:point:60-14-0','entry:unused-0-0-block-4:0'],feedback=keys.map(key=>({key,pointId:data.annotations[key].context.pointId,previous:structuredClone(data.annotations[key])}));
  const source=unused.blocks.find(b=>b.id==='unused-0-0-block-4'),sourceNote=unused.blocks.find(b=>b.id==='unused-0-0-block-3');
  if(source.text!=='New Bark Town\nWinds of a New Beginning'||point.blocks.length)throw Error('Unexpected picture-sign baseline');
  const beforePoint=structuredClone(point),beforeUnused=structuredClone(unused),beforeContext=archive.context;
  commitChange('Reconcile Picture Sign Indexing From Tester Export Revision '+input.revision,()=>{
    point.condition='Any time you read the Picture Sign in the center of New Bark Town.';
    point.uncertain=false;point.ids=['NBT-DLG-060-U34'];
    point.blocks=[{...structuredClone(source),id:'60-14-0-block-0',reviewKey:'point:60-14-0',sourceBlockId:source.id}];
    point.evidence=[structuredClone(unused.evidence.find(r=>r.id==='NBT-DLG-060-U34'))];
    point.mappingEvidence={status:'tester-reported',sourceRevision:input.revision,sourceRecordId:'NBT-DLG-060-U34',sourceBlockId:source.id,eventId:'NBT-EVT-060-15',location:'New Bark Town › Outdoors › Town Exterior (T20)',scriptBinding:'Original script analysis reported no text caller; the tester identifies this as the Picture Sign. Exact engine/script linkage has not been independently rechecked.'};
    source.archived=true;source.reassignedTo={elementId:sign.id,pointId:point.id,blockId:point.blocks[0].id,sourceId:'NBT-DLG-060-U34'};sourceNote.archived=true;
    archive.context=archive.context.replace(/\*\*Outside in town\.\*\* Probably the town's name banner,[\s\S]*?\[NBT-DLG-060-U34\]/,'**Reclassified reference.** NBT-DLG-060-U34 is displayed by the Picture Sign in the center of town, according to tester playthrough. Its original record remains archived here for reconciliation.');
    const plan=Object.values(data.changePlans).find(p=>p.target.id===keys[0]);if(plan){plan.target.blockIds=[point.blocks[0].id];plan.target.passageKeys=['point:60-14-0'];}
    for(const key of keys)Object.assign(data.annotations[key],{flag:false,critical:false,note:'',testStatus:'unreviewed'});
    Object.assign(data.annotations[keys[0]].context,{condition:point.condition,sourceIds:point.ids,blockId:point.blocks[0].id,sourceBlockId:source.id,entryKey:'point:60-14-0',passageKeys:['point:60-14-0']});
    resetTesting([point.id,unused.id]);
    data.contentRevision=(input.contentRevision||0)+1;
  },{target:{townId:'new-bark-town',type:'element',id:sign.id},pointIds:[point.id,unused.id],sourceRevision:input.revision,requiresRomReversal:false});
  const record=data.history.at(-1);
  const fields=p=>Object.fromEntries(Object.keys(p).map(k=>[k,structuredClone(p[k])]));
  data.reconciliations.push({build:'2.34',contentRevision:data.contentRevision,sourceExport:'npcdex-agent-export.json',sourceRevision:input.revision,sourceSavedAt:input.savedAt,historyId:record.id,changes:[{pointId:point.id,before:fields(beforePoint),after:fields(point)},{pointId:unused.id,before:fields(beforeUnused),after:fields(unused)}],patches:structuredClone(record.patches).filter(p=>p.path!=='/contentRevision'),resolved:feedback.map(f=>({...f,resolution:'Assign NBT-DLG-060-U34 to the Picture Sign; retain original unused record as an archived reference; clear resolved feedback and reset validation.'})),pendingRomChanges:'No ROM changes have been implemented. All four UPDATE tickets and the three Critical character flags remain pending.'});
  data.buildVersion='2.34';data.interfaceBuild='2.34';data.importedExportRevision=input.revision;data.revision=input.revision+1;data.savedAt=new Date().toISOString();validate(data);const snapshot=structuredClone(data);await updateChangeReport(snapshot);return snapshot;
},input);await browser.close();
for(const key of ['characterImages','characterNames','index','sourceBaseline','sourceBaselines','preferences','implementationReceipts'])assert.deepEqual(output[key],input[key],key+' changed');
for(const [key,value] of Object.entries(input.annotations))if(!['prompt:60-14-0:point:60-14-0','entry:unused-0-0-block-4:0'].includes(key)&&!['60-14-0','unused-0-0'].includes(value.context?.pointId))assert.deepEqual(output.annotations[key],value,'Unrelated feedback '+key);
const pending=Object.values(input.changePlans).filter(p=>p.intent==='UPDATE');assert.equal(pending.length,4);for(const plan of pending)assert.deepEqual(Object.values(output.changePlans).find(p=>p.id===plan.id),plan,'ROM plan changed');
assert.equal(Object.values(output.annotations).filter(a=>a.flag||a.note).length,3);assert.equal(output.changeRequests.length,4);
for(const old of input.history)assert(output.history.some(h=>JSON.stringify(h)===JSON.stringify(old)),'History lost');
for(const name of ['npcdex-data.json','npcdex-agent-export.json'])fs.writeFileSync('outputs/'+name,JSON.stringify(output,null,2));console.log('Reconciled two indexing notes; retained four ROM tickets, three Critical flags, images, source IDs, validation and history.');
})().catch(e=>{console.error(e);process.exit(1)});

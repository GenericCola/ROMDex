import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {sha,canonical} from '../../apps/romdex/content/contracts.mjs';
import {validateExtraction} from '../../apps/romdex/rom/extract.mjs';
import {RomReader} from '../../apps/romdex/rom/reader.mjs';
import {resolveLocator} from '../../apps/romdex/rom/locators.mjs';
import {validateSnapshot,snapshotStages,label,chooseStage} from '../../apps/romdex/content/timelines.mjs';
const [extractionFile,romFile,output]=process.argv.slice(2),x=validateExtraction(JSON.parse(await fs.readFile(extractionFile,'utf8')));
assert.equal(x.testbed.key,'violet-city');const variable=0x4074;
const writes=x.mutations.filter(m=>m.kind==='SetVar'&&m.operands[0]===variable),values=[...new Set(writes.map(w=>w.operands[1]))].sort((a,b)=>a-b);
assert.deepEqual(values,[1,2,3,4]);const id='timeline:violet-'+sha(x.identities.projectId).slice(0,24);
const stages=values.map(value=>({id:'stage:'+sha(canonical([x.identities.projectId,variable,value])).slice(0,32),name:'Violet Scene State '+value,event:'Map scene variable 0x4074 equals '+value+'. Other independent/runtime conditions remain separate.',uncertain:true,condition:{variable,value},evidence:writes.filter(w=>w.operands[1]===value).map(w=>w.locator)}));
const hooks=x.roots.filter(r=>r.headerId===73&&r.kind==='scene-hook'&&r.predicate.left===variable);
assert.deepEqual(hooks.map(h=>h.predicate.right),[1,3]);
const r=await RomReader.open(romFile);let checked=0;
try{
 for(const locator of [...writes.map(w=>w.locator),...hooks.map(h=>h.locator)]){await resolveLocator(r,locator,x.source.sha256);checked++;}
 assert.equal(await r.hashRange(0,r.size),x.source.sha256);
}finally{await r.close();}
const snapshot={version:2,revision:1,stages:[],timelines:{[id]:{id,name:'Violet City source-state proof',stages},'timeline:control':{id:'timeline:control',name:'Synthetic independent control',stages:[{id:'control:one',name:'Control one',event:'Synthetic condition'}]}},towns:[{id:'map:violet-proof',name:'Violet City (isolated proof)',timelineRef:id,areas:[{id:'area:proof',elements:[{id:'entity:proof',points:[{id:'point:proof',stages:[stages[0].id],blocks:[]}]}]}]},{id:'map:control',name:'Synthetic Control',timelineRef:'timeline:control',areas:[]}],annotations:{'point:proof':{flag:true,note:'Isolated note ',testStatus:'verified'}},changePlans:{proof:{instructions:'Preserve this synthetic draft'}},history:[]};
validateSnapshot(snapshot);const old=structuredClone(snapshot),selected=stages[0].id;
snapshot.timelines[id].stages.reverse();snapshot.timelines[id].stages[3].name='Renamed source state';validateSnapshot(snapshot);
assert.equal(label(snapshotStages(snapshot,snapshot.towns[0]),selected),'IV');assert.equal(chooseStage(snapshotStages(snapshot,snapshot.towns[0]),selected),selected);
assert.deepEqual(snapshot.annotations,old.annotations);assert.deepEqual(snapshot.changePlans,old.changePlans);assert.equal(snapshotStages(snapshot,snapshot.towns[1]).length,1);
const report={format:'ROMDexRI02TTimelineProof/1',sourceSHA256:x.source.sha256,extractionDigest:x.digest,testbed:'Violet City',headers:x.testbed.headerIds,sourceVariable:variable,observedWrittenStates:values,sceneHookStates:hooks.map(h=>h.predicate.right),sourceLocatorsReopened:checked,displayStageCounts:[4,1],renamedStageIdentityPreserved:true,selectionPreservedAfterReordering:true,annotationsAndPlansPreserved:true,romanLabelAfterReordering:'IV',fullROMHashUnchanged:true,cloudAccess:false,productionDataAccess:false,rdxCompiled:false,limitation:'Four observed source states prove map-scoped display and identity behavior. The zero/initial state and full chronology are not inferred. These are not an approved complete gameplay timeline; source predicates and runtime-dependent branches remain reviewable in RI02C.'};
await fs.mkdir(output);await fs.writeFile(path.join(output,'VioletCity-Timeline-Source-Preview.json'),canonical(snapshot)+'\n');await fs.writeFile(path.join(output,'timeline-proof.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

import test from 'node:test';import assert from 'node:assert/strict';
import {sharedSyncStatus} from '../public/shared-sync-status.mjs';
import {fixture as metadataFixture} from './metadata-fixture.mjs';
import {fixture as npcFixture} from './cloud-merge-fixture.mjs';
import {SaveCoordinator} from '../public/save-coordinator.mjs';
import fs from 'node:fs/promises';
test('served header assets match their canonical suite copies',async()=>{for(const name of ['theme.css','header.mjs'])assert((await fs.readFile(new URL('../shared-ui/'+name,import.meta.url))).equals(await fs.readFile(new URL('../public/shared-ui/'+name,import.meta.url))),name+' Served Copy Differs');});
const healthy=()=>Object.fromEntries(['youtrack','npcdex','romdex-metadata'].map(id=>[id,{label:id,cloud:true,connection:'connected',pending:0,attention:false,lastSync:1}]));
test('every configured service contributes to connection health without inventing unsaved work',()=>{
 for(const id of Object.keys(healthy())){const providers=healthy();providers[id].connection='unavailable';const view=sharedSyncStatus({providers});assert.equal(view.connection.color,'red');assert.equal(view.attention,false);providers[id].pending=1;assert.equal(sharedSyncStatus({providers}).attention,true);}
});
test('ordinary flowing edits remain green across all providers; Off requires a manual save only for pending work',()=>{
 const providers=healthy();for(const p of Object.values(providers)){p.pending=2;p.syncing=true;}assert.equal(sharedSyncStatus({providers}).attention,false);assert.equal(sharedSyncStatus({providers}).connection.color,'blue');for(const p of Object.values(providers))p.syncing=false;
 const off=sharedSyncStatus({providers,automaticSyncEnabled:false});assert(off.attention);assert.equal(off.connection.color,'dark-blue');assert.equal(sharedSyncStatus({providers,automaticSyncEnabled:false,saving:true}).attention,false);for(const p of Object.values(providers))p.pending=0;assert.equal(sharedSyncStatus({providers,automaticSyncEnabled:false}).attention,false);
});
test('known conflicts require review while a healthy transport remains blue',()=>{const providers=healthy();providers.npcdex.review={token:'review'};const view=sharedSyncStatus({providers});assert(view.attention);assert.equal(view.connection.color,'blue');assert.equal(view.services.find(s=>s.id==='npcdex').state,'Review Required');});
test('checking and local-only providers are truthful; local recovery and coordinator errors stay visible',()=>{const providers=healthy();providers.npcdex.connection='checking';assert.equal(sharedSyncStatus({providers}).connection.color,'dark-blue');providers.npcdex={label:'NPCDex',cloud:false,connection:'local'};assert.equal(sharedSyncStatus({providers}).connection.color,'blue');providers.npcdex.localError='Disk Full';assert(sharedSyncStatus({providers}).attention);assert(sharedSyncStatus({providers:healthy(),storageError:'Disk Full'}).attention);});
test('service interruption overrides stale cloud status, including when no view is currently active',()=>{const providers=healthy(),view=sharedSyncStatus({providers,serviceError:'Desktop Service Lost'});assert.equal(view.connection.color,'red');assert.equal(view.attention,false);assert(view.services.every(s=>s.message==='Desktop Service Lost'));providers.npcdex.dirty=true;assert(sharedSyncStatus({providers,serviceError:'Desktop Service Lost'}).attention);});
for(const[kind,fixture]of [['Metadata',metadataFixture],['NPCDex',npcFixture]]){
 test(kind+' clean offline check uses the connection lamp; queued work requires Save and recovery clears it',async t=>{
  const f=await fixture(t),engine=await f.client('one');await engine.cycle(true);assert.equal(engine.status().connection,'connected');f.remote.offline=true;await engine.cycle(true);assert.equal(engine.status().connection,'unavailable');assert.equal(engine.status().attention,false);
  if(kind==='Metadata')await engine.capture({...engine.document(),assigned:{'PMON-1':'In Development'}});else{const current=engine.view();const doc=structuredClone(current.snapshot);doc.revision++;doc.annotations.test='Pending';await engine.stage(doc,current.head);}
  assert(engine.status().attention);f.remote.offline=false;await engine.cycle(true);assert.equal(engine.status().connection,'connected');assert.equal(engine.status().pending,0);assert.equal(engine.status().attention,false);
 });
}
test('one failed provider does not block successful one-cycle saves and never enables automatic sync',async()=>{
 let enabled=false,delivered=[];const c=new SaveCoordinator({storage:{load:async()=>null,save:async()=>{}},setting:{enabled:()=>enabled,set:async value=>enabled=value}});await c.init();for(const id of ['youtrack','npcdex','romdex-metadata'])c.register(id,{status:()=>({}),save:async()=>{if(id==='npcdex')throw Error('Cloud Offline');delivered.push(id);return {ok:true};}});const result=await c.save();assert.deepEqual(delivered,['youtrack','romdex-metadata']);assert.equal(result.results.filter(x=>!x.ok).length,1);assert.equal(enabled,false);
});

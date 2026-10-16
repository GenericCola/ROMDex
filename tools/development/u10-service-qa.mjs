import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
if(process.env.ROMDEX_U10_CHILD!=='1'){
 const dir=path.resolve('work/u10/service-qa-'+Date.now());await fs.mkdir(dir,{recursive:true});const seed=JSON.parse(await fs.readFile('outputs/ROMDex/public/seed.json','utf8'));await fs.writeFile(path.join(dir,'fixture.json'),JSON.stringify(seed));await fs.writeFile(path.join(dir,'sync-settings.json'),JSON.stringify({enabled:false}));
 const checks=[];for(const phase of ['initial','restart']){const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),[import.meta.filename,phase],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1',ROMDEX_U10_CHILD:'1',ROMDEX_DATA_DIR:dir,ROMDEX_QA:'1',ROMDEX_DESKTOP_FIXTURE:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);const code=await new Promise(r=>child.on('close',r));if(code)throw Error(output);checks.push(...JSON.parse(output.trim()).checks);}
 await fs.writeFile('outputs/U10-Utility-Service-Verification.json',JSON.stringify({checks,bundledRuntime:'Electron 44.7.2 / Node 24.21.0',productionWrites:false},null,2));console.log(JSON.stringify({checks:checks.length,allPassed:true}));
}else{
 const {handle,snapshot}=await import('../outputs/ROMDex/desktop/service.mjs');const {server}=await import('../outputs/ROMDex/server.mjs'),checks=[];assert.equal(server.listening,false);await handle('init');checks.push('Service and domain engine run with the bundled runtime without opening an HTTP port');
 if(process.argv[2]==='initial'){
  assert(snapshot().state.remote.length>250);assert.equal(snapshot().automaticSyncEnabled,false);
  await handle('storage',['save','npcdex-recovery-draft',{format:1,marker:'preserve'}]);await handle('storage',['save','coordinator',{version:1,lastManual:null}]);
  for(const args of [['save','../../connection.encrypted',{}],['load','not-a-workspace']])await assert.rejects(()=>handle('storage',args));await assert.rejects(()=>handle('read',['/api/backup']));await assert.rejects(()=>handle('request',[]));await assert.rejects(()=>handle('preferences',[{operations:[]}]));checks.push('Unknown stores, raw requests and queue-replacement preferences are rejected');
  const fixturePath=path.join(process.env.ROMDEX_DATA_DIR,'fixture.json'),seed=JSON.parse(await fs.readFile(fixturePath,'utf8'));seed.items[0].summary='Native Update Arrived';await fs.writeFile(fixturePath,JSON.stringify(seed));await handle('sync',[true]);assert.equal(snapshot().state.remote[0].summary,'Native Update Arrived');assert.equal(snapshot().automaticSyncEnabled,false);checks.push('Manual sync pulls native fixture changes once while leaving Auto-Sync Off');
  await handle('setAutomaticSync',[true]);assert.equal(snapshot().automaticSyncEnabled,true);seed.items[0].summary='Background Update Arrived';await fs.writeFile(fixturePath,JSON.stringify(seed));await handle('sync');assert.equal(snapshot().state.remote[0].summary,'Background Update Arrived');await handle('setAutomaticSync',[false]);checks.push('Automatic setting and incoming native changes reach the utility-owned state');
  const id=snapshot().state.remote[0].id;await handle('edit',[id,{description:'Durable Desktop Edit'}]);const file=path.join(process.env.ROMDEX_DATA_DIR,'tiny.txt');await fs.writeFile(file,'original bytes');await handle('attach',[id,[file]]);assert.equal(snapshot().state.operations.length,2);assert.equal(snapshot().automaticSyncEnabled,false);await handle('checkpoint');checks.push('Accepted edits and attachment bytes are durable while automatic sync is disabled');
 }else{
  assert.equal(snapshot().state.operations.length,2);assert.equal(snapshot().state.operations[0].patch.description,'Durable Desktop Edit');const upload=snapshot().state.operations[1];const meta=JSON.parse(await fs.readFile(path.join(process.env.ROMDEX_DATA_DIR,'queued-files/uploads',upload.uploadId+'.json'),'utf8'));assert.equal(meta.name,'tiny.txt');assert.equal((await handle('storage',['load','npcdex-recovery-draft'])).marker,'preserve');assert.equal(snapshot().automaticSyncEnabled,false);checks.push('Process restart recovers queued edits, attachment metadata/bytes, NPCDex recovery and paused setting');
 }
 await handle('shutdown');console.log(JSON.stringify({checks}));
}

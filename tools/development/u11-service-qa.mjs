import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
if(process.env.ROMDEX_U11_CHILD!=='1'){
 const dir=path.resolve('work/u11/service-'+Date.now());await fs.mkdir(dir,{recursive:true});const seed=JSON.parse(await fs.readFile('outputs/ROMDex/public/seed.json','utf8'));await fs.writeFile(path.join(dir,'fixture.json'),JSON.stringify(seed));await fs.writeFile(path.join(dir,'sync-settings.json'),JSON.stringify({enabled:false}));
 const checks=[];for(const phase of ['initial','restart']){const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),[import.meta.filename,phase],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1',ROMDEX_U11_CHILD:'1',ROMDEX_DATA_DIR:dir,ROMDEX_QA:'1',ROMDEX_DESKTOP_FIXTURE:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);const code=await new Promise(r=>child.on('close',r));if(code)throw Error(output);checks.push(...JSON.parse(output.trim()).checks);}
 await fs.writeFile('outputs/U11-Service-Verification.json',JSON.stringify({verifiedAt:new Date().toISOString(),checks,bundledRuntime:'Electron 44.7.2 / Node 24.21.0',fixtureOnly:true,productionWrites:false},null,2));console.log({checks:checks.length,allPassed:true});
}else{
 const {handle,snapshot}=await import('../outputs/ROMDex/desktop/service.mjs');const {server}=await import('../outputs/ROMDex/server.mjs'),checks=[];await handle('init');assert.equal(server.listening,false);assert.equal(snapshot().automaticSyncEnabled,false);checks.push('Utility initialization opens no HTTP listener and restores Auto-Sync Off');
 const dir=process.env.ROMDEX_DATA_DIR,fixturePath=path.join(dir,'fixture.json');
 if(process.argv[2]==='initial'){
  await handle('edit',['PMON-1',{description:'U11 Pending Data'}]);await handle('storage',['save','npcdex-recovery-draft',{format:1,marker:'U11 recovery'}]);await handle('storage',['save','coordinator',{version:1,lastManual:null}]);const file=path.join(dir,'sprite.txt');await fs.writeFile(file,'U11 Queued Bytes');await handle('attach',['PMON-1',[file]]);await fs.unlink(file);checks.push('Accepted notes, queued bytes and NPCDex recovery are durable independently of original attachment paths');
  await handle('suspend');await handle('resume');assert.equal(snapshot().automaticSyncEnabled,false);assert.equal(snapshot().state.operations.length,2);await handle('checkpoint');checks.push('Suspend/resume preserves the paused setting and pending operations');
  await handle('shutdown');assert.equal(JSON.parse(await fs.readFile(path.join(dir,'desktop-workspace.json'),'utf8')).operations.length,2);checks.push('Orderly shutdown flushes local work without requiring successful remote synchronization');
 }else{
  assert.equal(snapshot().state.operations.length,2);assert.equal(snapshot().state.operations[0].patch.description,'U11 Pending Data');const upload=snapshot().state.operations[1];assert.equal((await fs.readFile(path.join(dir,'queued-files/uploads',upload.uploadId+'.bin'))).toString(),'U11 Queued Bytes');assert.equal((await handle('storage',['load','npcdex-recovery-draft'])).marker,'U11 recovery');checks.push('A fresh process restores pending notes, attachment bytes and NPCDex recovery');
  const copy=snapshot().state.operations[1];await handle('cancelAttachment',[copy.opId]);await handle('shutdown');
 }
 console.log(JSON.stringify({checks}));
}

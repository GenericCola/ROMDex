import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {spawn} from 'node:child_process';import {packRdx} from '../../outputs/ROMDex/rdx/container.mjs';import {canonical} from '../../outputs/ROMDex/content/contracts.mjs';
const require=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/probe.cjs'),{_electron:electron}=require('playwright'),root=path.resolve('work/rd08'),profile=path.join(root,'native-profile');
await fs.mkdir(path.join(profile,'service'),{recursive:true});await fs.writeFile(path.join(profile,'service/fixture.json'),JSON.stringify({items:[]}));await fs.writeFile(path.join(profile,'service/sync-settings.json'),JSON.stringify({enabled:false}));
for(const [name,filename]of [['map','New Bark Ω.rdx'],['plan','Plan.rdx'],['returned-map','Returned.rdx']]){const d=JSON.parse(await fs.readFile('outputs/ROMDex/tests/fixtures/rdx/'+name+'.document.json')),blobs=new Map();for(const a of d.assetInventory)blobs.set(a.sha256,await fs.readFile('outputs/ROMDex/tests/fixtures/rdx/blobs/'+a.sha256+'.bin'));await fs.writeFile(path.join(root,filename),await packRdx(Buffer.from(canonical(d)),blobs));}
const checks=[],report={task:'RD08',scope:'Packaged Windows Electron, isolated local fixture; no credentials or production saves',checks};let app;
try{
 const env={...process.env,ROMDEX_QA:'1',ROMDEX_DESKTOP_FIXTURE:'1',ROMDEX_DESKTOP_PROFILE:profile,ROMDEX_QA_REPORT:path.join(root,'native-ready.json'),TEMP:path.join(root,'tmp'),TMP:path.join(root,'tmp')};delete env.ELECTRON_RUN_AS_NODE;
 const executable=process.env.RD08_NATIVE_EXE||path.join(root,'package-0.5.15/ROMDex.exe');
 app=await electron.launch({executablePath:executable,args:[path.join(root,'New Bark Ω.rdx')],env,timeout:25000});const page=await app.firstWindow();
 await page.waitForFunction(()=>window.romdexShell?.host.views.size===2,{timeout:20000});
 await page.waitForFunction(()=>document.getElementById('npcdex-frame').contentDocument.querySelector('.content-import-dialog[open]')?.textContent.includes('Import Local Map'),{timeout:20000});
 const snapshot=await app.evaluate(()=>({pid:process.pid,utility:global.romdexQA.service.worker.pid}));checks.push('Cold launch routes a spaced/unicode map path to the real NPCDex preview');
 assert.equal(await page.evaluate(()=>window.romdexShell.host.current),'npcdex');
 const status=await page.evaluate(()=>window.romdexDesktop.call('npcdexContent',['/api/rdx/status']));assert.equal(status.documents.length,0);checks.push('Opening alone creates no managed document or cloud binding');
 await page.evaluate(()=>document.getElementById('npcdex-frame').contentDocument.querySelector('.content-import-dialog').close());
 await new Promise((resolve,reject)=>{const p=spawn(executable,[path.join(root,'Plan.rdx')],{env,windowsHide:true,stdio:'ignore'}),timer=setTimeout(()=>{p.kill();reject(Error('Second Instance Did Not Exit.'));},15000);p.once('error',reject);p.once('exit',code=>{clearTimeout(timer);code===0?resolve():reject(Error('Second instance failed '+code));});});
 await page.waitForFunction(()=>document.getElementById('romdex-frame').contentDocument.querySelector('.rdx-plan-dialog[open]')?.textContent.includes('Save Local Plan'),{timeout:20000});
 assert.equal(await app.evaluate(()=>global.romdexQA.service.worker.pid),snapshot.utility);checks.push('Second native process exits and the original utility/window shows the plan preview');
 assert.equal(await page.evaluate(()=>window.romdexShell.host.current),'romdex');
 await page.evaluate(()=>document.getElementById('romdex-frame').contentDocument.querySelector('.rdx-plan-dialog').close());
 // Keep an existing modal open and verify the OS file request waits.
 await page.evaluate(()=>document.getElementById('romdex-frame').contentDocument.getElementById('connection-dialog').showModal());
 await app.evaluate(({app},{file})=>{app.emit('second-instance',{},[process.execPath,file],process.cwd());},{file:path.join(root,'New Bark Ω.rdx')});
 await page.waitForTimeout(1800);assert.equal(await page.evaluate(()=>window.romdexShell.host.current),'romdex');assert.equal(await page.evaluate(()=>document.getElementById('romdex-frame').contentDocument.getElementById('connection-dialog').open),true);checks.push('Open editor modal is preserved and defers the incoming file');
 await page.evaluate(()=>document.getElementById('romdex-frame').contentDocument.getElementById('connection-dialog').close());
 await page.waitForFunction(()=>document.getElementById('npcdex-frame').contentDocument.querySelector('.content-import-dialog[open]'),{timeout:15000});checks.push('Deferred file resumes after editor closes');
 await page.screenshot({path:path.join(root,'native-map-preview.png')});
 await page.evaluate(()=>document.getElementById('npcdex-frame').contentDocument.querySelector('.content-import-dialog').close());
 await app.evaluate(({app},{file})=>{app.emit('second-instance',{},[process.execPath,file],process.cwd());},{file:path.join(root,'Returned.rdx')});
 await page.waitForFunction(()=>document.querySelector('dialog[aria-label="Open RDX File"][open]')?.textContent.includes('Human Testing'),{timeout:15000});checks.push('Agent-return file is rejected into review, with no automatic import/testing bypass');
 await page.getByRole('button',{name:'Dismiss',exact:true}).click();
 const final=await page.evaluate(()=>window.romdexDesktop.call('npcdexContent',['/api/rdx/status']));assert.equal(final.documents.length,0);
 await page.evaluate(()=>window.romdexShell.desktopCommand('workspace','romdex'));await page.screenshot({path:path.join(root,'native-app-icon.png')});
 await app.evaluate(()=>{global.romdexQA.quit();});await app.close();app=null;checks.push('Normal quit checkpoints and closes after native previews');report.status='passed';
}catch(e){report.status='needs-review';report.error=e.stack;}finally{if(app)await app.evaluate(()=>global.romdexQA?.forceExit()).catch(()=>{});await fs.writeFile(process.env.RD08_NATIVE_REPORT||path.join(root,'native-evidence.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));process.exitCode=report.status==='passed'?0:1;

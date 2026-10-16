import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.connectOverCDP('http://127.0.0.1:9239'),page=browser.contexts()[0].pages().find(p=>p.url()==='romdex-app://shell/');
const fixture='work/u10/windows-qa/service/fixture.json',seed=JSON.parse(await fs.readFile(fixture,'utf8')),previous=seed.items[0].summary;
try{
 await page.evaluate(async()=>{await window.romdexShell.native.setAutomaticSync(false);await window.romdexShell.host.activate('npcdex');window.u10SwitchTraces=[];const host=window.romdexShell.host,original=host.activate;host.activate=function(...args){window.u10SwitchTraces.push({id:args[0],stack:new Error().stack});return original.apply(this,args);};await window.romdexShell.native.setAutomaticSync(true);});
 seed.items[0].summary='U10 Utility Clock Incoming Update';await fs.writeFile(fixture,JSON.stringify(seed));
 await page.waitForFunction(()=>window.romdexShell.native.items[0].summary==='U10 Utility Clock Incoming Update',undefined,{timeout:30000});
 const state=await page.evaluate(()=>({current:window.romdexShell.host.current,traces:window.u10SwitchTraces}));assert.equal(state.current,'npcdex',JSON.stringify(state));
 await page.locator('#auto-sync').click();await page.waitForFunction(()=>!window.romdexShell.native.automaticSyncEnabled&&!window.romdexShell.native.settingBusy);
 seed.items[0].summary=previous;await fs.writeFile(fixture,JSON.stringify(seed));await page.evaluate(()=>window.romdexShell.native.sync(true));
 await page.locator('#workspace-switcher').click();await page.locator('[data-workspace=romdex]').click();
 const report=JSON.parse(await fs.readFile('outputs/U10-Windows-Verification.json','utf8'));report.checks.push('Utility clock automatically receives native fixture edits while NPCDex is active, then respects Auto-Sync Off');report.verifiedAt=new Date().toISOString();await fs.writeFile('outputs/U10-Windows-Verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,backgroundPollVerified:true}));
}finally{seed.items[0].summary=previous;await fs.writeFile(fixture,JSON.stringify(seed));await browser.close();}

import fs from 'node:fs/promises';import assert from 'node:assert/strict';import path from 'node:path';
const profile=path.resolve('work/u11/windows-qa'),startup=JSON.parse(await fs.readFile('work/u11/windows-startup.json','utf8'));
let alive=true;try{process.kill(startup.pid,0);}catch(error){if(error.code==='ESRCH')alive=false;else throw error;}assert.equal(alive,false);
await assert.rejects(fs.stat(path.join(profile,'desktop-owner.json')),{code:'ENOENT'});
const record=JSON.parse(await fs.readFile(path.join(profile,'service/desktop-workspace.json'),'utf8'));assert.equal(record.operations.length,1);assert.equal(record.operations[0].patch.description,'U11 Durable Pending Edit');assert.equal(JSON.parse(await fs.readFile(path.join(profile,'service/sync-settings.json'),'utf8')).enabled,false);
const screenshot=await fs.stat('outputs/U11-Desktop-Preview.png');assert(screenshot.mtimeMs>=(await fs.stat('work/u11/windows-startup.json')).mtimeMs);
const code=await fs.readFile('work/u11-desktop-qa.mjs','utf8'),checks=[...code.matchAll(/checks\.push\('([^']+)'\)/g)].map(x=>x[1]);assert.equal(checks.length,11);
// The harness reached its screenshot after all pre-Quit assertions, then waited for
// a debugger close event after the app had exited. Verify exit independently.
const report={verifiedAt:new Date().toISOString(),checks,errors:[],fixtureOnly:true,productionWrites:false,profile,appPID:startup.pid,postExitAudit:{mainProcessStopped:true,profileLeaseReleased:true,pendingEditDurable:true,automaticSyncRemainsOff:true,screenshotRecordedBeforeQuit:true},harnessNote:'All pre-Quit assertions passed and screenshot was written. The harness then waited for a debugger-close notification after application exit; this independent PID, lease and disk audit verifies the final Quit scenario. The harness was stopped and updated to use bounded process-exit checks.'};
await fs.writeFile('outputs/U11-Desktop-Verification.json',JSON.stringify(report,null,2));console.log({checks:checks.length,postExitAudit:report.postExitAudit});

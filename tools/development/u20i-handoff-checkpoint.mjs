// Run only after a fresh explicit human Quit confirmation has been recorded.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const gate=JSON.parse(await fs.readFile('work/u20i/deploy-ready.json'));assert.equal(gate.task,'U20I');assert.equal(gate.userConfirmedQuit,true);assert(Date.now()-gate.at<3600000);
async function run(file,electron=false){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const log=await fs.open('work/u20i/handoff-checkpoint.log','a');try{const c=spawn(electron?path.resolve('work/u10/runtime/electron/electron.exe'):process.execPath,[path.resolve(file)],{cwd:process.cwd(),env,windowsHide:true,stdio:['ignore',log.fd,log.fd]});assert.equal(await new Promise((r,j)=>{c.on('error',j);c.on('close',r);}),0,file+' needs review');}finally{await log.close();}}
await run('work/u20i-backup-restore.cjs',true);
await run('work/u20i-transition-preview.mjs');

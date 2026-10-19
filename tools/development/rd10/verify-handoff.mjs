// Runs only after a human-confirmed quit. Existing Windows helper supplies the
// normal account context required for protected credentials and MSI execution.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const work=path.resolve('work/rd10'),read=async f=>JSON.parse(await fs.readFile(f));
assert.equal((await read(path.join(work,'deploy-ready.json'))).userConfirmedQuit,true);assert.equal((await read(path.join(work,'pre-release-validation.json'))).status,'passed');
await fs.copyFile(path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/Runtime/thegobindsingh-PMON/Local State'),path.join(work,'private-profile/session/Local State'));
async function run(file,electron=false){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const log=await fs.open(path.join(work,'handoff.log'),'a');try{const child=spawn(electron?path.resolve('work/u10/runtime/electron/electron.exe'):process.execPath,[path.join(work,file)],{cwd:process.cwd(),env,windowsHide:true,stdio:['ignore',log.fd,log.fd]});assert.equal(await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);}),0,file+' Needs Review.');}finally{await log.close();}}
await run('backup-restore.cjs',true);await run('publish.mjs');await run('deploy.mjs');await run('installed-check.cjs',true);

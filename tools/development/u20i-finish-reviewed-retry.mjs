// Sequential closeout; only a successful reviewed recovery may reach final gates.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const result=JSON.parse(await fs.readFile('work/u20i-bound/reviewed-retry-result.json'));
assert.equal(result.status,'passed');assert(result.queueEmpty&&result.nativeAccepted&&result.backupHashesVerified);
async function run(file){const log=await fs.open('work/u20i/reviewed-closeout.log','a');try{const child=spawn(process.execPath,[path.resolve(file)],{cwd:process.cwd(),env:process.env,windowsHide:true,stdio:['ignore',log.fd,log.fd]});assert.equal(await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve);}),0,file+' needs review');}finally{await log.close();}}
await run('work/u20i-resume-delivery-check.mjs');
await run('work/u20i-closeout.mjs');

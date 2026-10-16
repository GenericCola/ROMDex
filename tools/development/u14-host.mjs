import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {secureDirectory} from '../outputs/ROMDex/desktop/migration.mjs';
const root=process.cwd(),work=path.resolve('work/u14'),session=path.join(work,'private-profile/session'),source=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/Runtime/thegobindsingh-PMON/Local State');
const electron=path.resolve('work/u10/runtime/electron/electron.exe');
await fs.mkdir(work,{recursive:true});
const phase=async phase=>fs.writeFile(path.join(work,'host-state.json'),JSON.stringify({at:new Date().toISOString(),phase,pid:process.pid}));
async function run(executable,args,options={}){return new Promise((resolve,reject)=>{const child=spawn(executable,args,{cwd:root,windowsHide:true,stdio:'ignore',env:process.env,...options});child.on('error',reject);child.on('exit',code=>resolve(code));});}
async function inspect(script){await secureDirectory(path.join(work,'private-profile'));await fs.mkdir(session,{recursive:true});const state=JSON.parse(await fs.readFile(source,'utf8'));assert.equal(typeof state.os_crypt?.encrypted_key,'string');await fs.writeFile(path.join(session,'Local State'),JSON.stringify(state));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;return run(electron,[script],{env});}
try {
 await phase('Checking the Saved YouTrack Connection — Read Only');
 const initial=await inspect(path.resolve('work/u14-readonly-probe.cjs'));
 await phase(initial===0?'Read-Only Inspection Complete — Waiting for Reviewed U14 Checks':'Read-Only Inspection Needs Review — Host Remains Available');
 const processed=new Set(),deadline=Date.now()+90*60000;
 while(Date.now()<deadline){
  let job;try{job=JSON.parse(await fs.readFile(path.join(work,'next-job.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(job&&!processed.has(job.id)){
   assert.equal(job.task,'U14');assert(Date.now()-job.at<3600000);processed.add(job.id);
   const script=path.resolve(job.script);assert.equal(path.dirname(script),path.join(root,'work'));assert(/^u14-[a-z0-9-]+\.(?:mjs|cjs)$/.test(path.basename(script)));
   assert.equal(createHash('sha256').update(await fs.readFile(script)).digest('hex'),job.reviewedSha256);
   await phase('Running Reviewed U14 Check: '+path.basename(script));
   const code=script.endsWith('.cjs')?await inspect(script):await run(process.execPath,[script]);
   await fs.writeFile(path.join(work,'job-result.json'),JSON.stringify({id:job.id,at:new Date().toISOString(),code}));
   await phase(code===0?'Reviewed Check Complete — Waiting':'Check Needs Review — Waiting');
  }
  await new Promise(r=>setTimeout(r,2000));
 }
 await phase('Inspection Session Finished');
} catch {await phase('Inspection Needs Review — Original Saves Retained');process.exitCode=1;}

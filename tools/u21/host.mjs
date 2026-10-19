import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const work=path.resolve(import.meta.dirname),root=path.resolve(work,'../..'),done=new Set(),deadline=Date.now()+8*3600000;
const state=phase=>fs.writeFile(path.join(work,'host-state.json'),JSON.stringify({task:'U21',pid:process.pid,phase,at:new Date().toISOString()}));
await fs.mkdir(path.join(work,'tmp'),{recursive:true});await state('Ready for Reviewed U21 Checks');
try{while(Date.now()<deadline){let job;try{job=JSON.parse(await fs.readFile(path.join(work,'job.json')));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(job&&!done.has(job.id)){done.add(job.id);if(job.task!=='U21'||Date.now()-job.at>3600000||job.at>Date.now()+60000)throw Error('Expired Verification Job.');if(job.stop){await state('Stopped');break;}
 const file=path.resolve(job.file);if(path.dirname(file)!==work||!/^verify-[\w-]+\.(mjs|cjs)$/.test(path.basename(file))||createHash('sha256').update(await fs.readFile(file)).digest('hex')!==job.sha256)throw Error('Unreviewed Verification Job.');await state('Running '+path.basename(file));const log=await fs.open(path.join(work,'host.log'),'a');let code;
 try{code=await new Promise((resolve,reject)=>{const env={...process.env,TEMP:path.join(work,'tmp'),TMP:path.join(work,'tmp')};delete env.ELECTRON_RUN_AS_NODE;const exe=file.endsWith('.cjs')?path.join(root,'work/u10/runtime/electron/electron.exe'):process.execPath;const p=spawn(exe,[file],{cwd:root,env,windowsHide:true,stdio:['ignore',log.fd,log.fd]});p.once('error',reject);p.once('exit',resolve);});}catch(e){code=-1;await log.write(e.message+'\n');}finally{await log.close();}
 await fs.writeFile(path.join(work,'job-result.json'),JSON.stringify({id:job.id,code,at:new Date().toISOString()}));await state('Waiting After '+path.basename(file));}
 await new Promise(r=>setTimeout(r,1500));}}catch(e){await state('Needs Review: '+e.message);process.exitCode=1;}

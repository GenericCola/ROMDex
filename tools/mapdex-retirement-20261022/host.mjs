import fs from'node:fs/promises';import path from'node:path';import{createHash}from'node:crypto';import{spawn}from'node:child_process';
const work=import.meta.dirname,seen=new Set(),until=Date.now()+8*3600000;
while(Date.now()<until){let gate;try{gate=JSON.parse(await fs.readFile(path.join(work,'authorization.json')));}catch(e){throw e;}
 if(!seen.has(gate.runId)){seen.add(gate.runId);const file=path.join(work,'run-rollback.mjs');if(createHash('sha256').update(await fs.readFile(file)).digest('hex')!==gate.helperSHA256)throw Error('Unreviewed rollback helper');const log=await fs.open(path.join(work,'helper-output.log'),'a'),err=await fs.open(path.join(work,'helper-error.log'),'a');const code=await new Promise((resolve,reject)=>{const p=spawn(process.execPath,[file],{cwd:path.resolve(work,'../..'),windowsHide:true,stdio:['ignore',log.fd,err.fd]});p.once('error',reject);p.once('exit',resolve);});await log.close();await err.close();const state=JSON.parse(await fs.readFile(path.join(work,'status.json')));await fs.writeFile(path.join(work,'host-state.json'),JSON.stringify({pid:process.pid,state:state.status,code,runId:gate.runId}));if(state.status==='complete')break;
 }
 await new Promise(r=>setTimeout(r,1000));
}

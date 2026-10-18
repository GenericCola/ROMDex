import fs from 'node:fs/promises';import path from 'node:path';import {spawn,execFile} from 'node:child_process';import {promisify} from 'node:util';import assert from 'node:assert/strict';
const root=process.cwd(),work=path.resolve('work/u20f'),script=path.resolve('work/u20f-ui.cjs'),run=promisify(execFile);
// Only a hidden synthetic verification window may be stopped. Never target the
// installed ROMDex executable, its utility, host or any other application.
const info=JSON.parse(await fs.readFile(path.join(work,'ui-window.json'),'utf8'));assert.equal(info.synthetic,true);assert.equal(info.credentialUsed,false);assert(Number.isSafeInteger(info.pid)&&info.pid>0);
const command="$p=Get-CimInstance Win32_Process -Filter 'ProcessId = "+info.pid+"'; if($p -and $p.Name -eq 'electron.exe' -and $p.CommandLine.Contains('"+script.replaceAll("'","''")+"')) { Stop-Process -Id $p.ProcessId -Force } elseif($p) { throw 'Unexpected verification process; no process stopped.' }";
await run('powershell.exe',['-NoProfile','-WindowStyle','Hidden','-Command',command],{windowsHide:true});
const log=await fs.open(path.join(work,'ui-window.log'),'a'),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try{await new Promise((resolve,reject)=>{const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),[script],{cwd:root,env,windowsHide:false,stdio:['ignore',log.fd,log.fd]});child.on('error',reject);child.on('close',resolve);});}finally{await log.close();}

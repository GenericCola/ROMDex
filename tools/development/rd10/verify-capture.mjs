import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
const work=path.resolve('work/rd10'),session=path.join(work,'private-profile/session');await fs.mkdir(session,{recursive:true});
const state=JSON.parse(await fs.readFile(path.join(process.env.LOCALAPPDATA,'ROMDexDesktop/Data/Runtime/thegobindsingh-PMON/Local State')));await fs.writeFile(path.join(session,'Local State'),JSON.stringify(state));
const code=await new Promise((resolve,reject)=>{const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const p=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),[path.join(work,'capture.cjs')],{env,windowsHide:true,stdio:'inherit'});p.once('error',reject);p.once('exit',resolve);});process.exitCode=code??1;

import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const scratch=path.resolve('work/u13b/test-scratch');await fs.mkdir(scratch,{recursive:true});
const tests=(await fs.readdir('outputs/ROMDex/tests')).filter(x=>x.endsWith('.test.mjs')).map(x=>'outputs/ROMDex/tests/'+x),h=await fs.open('work/u13b/tests.log','w');
const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),['--test','--test-concurrency=4',...tests],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1',TEMP:scratch,TMP:scratch,ROMDEX_TEST_SCRATCH:scratch},windowsHide:true,stdio:['ignore',h.fd,h.fd]});
const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});await h.close();const log=await fs.readFile('work/u13b/tests.log','utf8');console.log(log.split('\n').filter(l=>/^(ℹ|# (tests|pass|fail|duration)|✖|not ok)/.test(l)).join('\n'));if(code)console.log(log.slice(-4500));process.exitCode=code;


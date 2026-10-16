import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const scratch=path.resolve('work/u08/test-scratch');await fs.mkdir(scratch,{recursive:true});
const tests=(await fs.readdir('outputs/ROMDex/tests')).filter(x=>x.endsWith('.test.mjs')).map(x=>'outputs/ROMDex/tests/'+x);
const handle=await fs.open('work/u08/tests.log','w');
const child=spawn(process.execPath,['--test',...tests],{env:{...process.env,TEMP:scratch,TMP:scratch,ROMDEX_TEST_SCRATCH:scratch},windowsHide:true,stdio:['ignore',handle.fd,handle.fd]});
const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});await handle.close();
const log=await fs.readFile('work/u08/tests.log','utf8');console.log(log.split('\n').filter(x=>/^(ℹ|# (tests|pass|fail|duration)|✖|not ok)/.test(x)).join('\n'));if(code)console.log(log.slice(-4500));process.exitCode=code;


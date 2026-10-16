import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const read=async file=>JSON.parse(await fs.readFile(file,'utf8')),log=await fs.readFile('work/u18/regression-tests-final.log','utf8');
assert(/tests 413\s/.test(log)&&/pass 413\s/.test(log)&&/fail 0\s/.test(log),'The Complete Regression Suite Has Not Passed.');
await fs.copyFile('work/u18/native-core-verification.json','work/u18/native-initial-core.json');
const code=await new Promise((resolve,reject)=>{const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),['work/u18-native-check.cjs'],{cwd:process.cwd(),windowsHide:true,stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:undefined}});child.on('error',reject);child.on('exit',resolve);});assert.equal(code,0,'Final Native Metadata Checks Need Review.');assert.equal((await read('work/u18/native-core-verification.json')).status,'passed');
await import('./u18-crash-check.mjs');assert.equal((await read('work/u18/crash-verification.json')).status,'passed');
await import('./u18-build.mjs');assert.equal((await read('work/u18/build-result.json')).status,'passed');
await import('./u18-artifact-audit.mjs');

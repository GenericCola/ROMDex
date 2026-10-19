import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
// Reuse the passed data/adapter evidence; only reload handling changed.
for(const file of ['package.mjs','verify-native.mjs','validate-candidate.mjs']){const child=spawn(process.execPath,[path.resolve('work/rd10',file)],{cwd:process.cwd(),env:process.env,windowsHide:true,stdio:'inherit'});assert.equal(await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);}),0,file+' Needs Review.');}

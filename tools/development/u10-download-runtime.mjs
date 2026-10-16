import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const version='44.7.2',name=`electron-v${version}-win32-x64.zip`,base=`https://github.com/electron/electron/releases/download/v${version}/`,dir=path.resolve('work/u10/runtime');
await fs.mkdir(dir,{recursive:true});
const sums=await (await fetch(base+'SHASUMS256.txt')).text();
const match=sums.split('\n').find(l=>l.trim().split(/\s+/).at(-1).replace(/^\*/,'')===name);if(!match)throw Error('No official runtime checksum');
const expected=match.split(/\s+/)[0],file=path.join(dir,name);let bytes;
try{bytes=await fs.readFile(file);}catch{const response=await fetch(base+name);if(!response.ok)throw Error('Runtime download '+response.status);bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(file,bytes);}
const actual=createHash('sha256').update(bytes).digest('hex');if(actual!==expected)throw Error('Runtime checksum mismatch');
await fs.writeFile(path.join(dir,'runtime.json'),JSON.stringify({version,platform:'win32',arch:'x64',url:base+name,checksumURL:base+'SHASUMS256.txt',sha256:actual,bytes:bytes.length},null,2));
console.log(JSON.stringify({version,bytes:bytes.length,sha256:actual}));

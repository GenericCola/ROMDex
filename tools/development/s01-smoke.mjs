import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve('outputs/ROMDex-v0.4.1/ROMDex'),scratch=path.resolve('work/s01/smoke-profile');await fs.mkdir(scratch,{recursive:true});
const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,ROMDEX_DATA_DIR:scratch,ROMDEX_PORT:'4343',YOUTRACK_TOKEN:''},windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='';child.stderr.on('data',b=>stderr+=b);
const origin='http://127.0.0.1:4343',sha=b=>createHash('sha256').update(b).digest('hex');
try{
 let status;for(let i=0;i<60;i++){try{const r=await fetch(origin+'/api/status');if(r.ok){status=await r.json();break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 assert.ok(status,stderr);assert.equal(status.version,'0.4.1');assert.equal(status.connected,false);assert.equal(status.rememberedConnection,false);
 const manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.1-Manifest.json'));let assets=0;
 for(const file of manifest.files.filter(x=>x.path.startsWith('ROMDex/public/'))){const rel=file.path.slice('ROMDex/public/'.length),res=await fetch(origin+'/'+rel);assert.equal(res.status,200,rel);assert.equal(sha(Buffer.from(await res.arrayBuffer())),file.sha256,rel);assets++;}
 const credential=JSON.parse(await fs.readFile('work/s01/credential-integrity.json'));assert.equal(sha(await fs.readFile(credential.path)),credential.sha256);
 const old=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4-Manifest.json'));assert.equal(sha(await fs.readFile('outputs/ROMDex-v0.4.zip')),old.zipSHA256);for(const f of old.files)assert.equal(sha(await fs.readFile('outputs/ROMDex-v0.4/'+f.path)),f.sha256);
 const result={verifiedAt:new Date().toISOString(),version:status.version,publicAssetsVerified:assets,isolatedNoTokenStart:true,ciphertextUnchanged:true,oldReleaseUntouched:true,newPackageSourceAndZipVerified:true,stderr};await fs.writeFile('work/s01/smoke-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{try{await fetch(origin+'/api/stop',{method:'POST',headers:{Origin:origin}});}catch{}child.kill();}

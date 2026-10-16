import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildIdentity} from '../outputs/ROMDex/runtime-profile.mjs';
const origin='http://127.0.0.1:4322',hash=b=>createHash('sha256').update(b).digest('hex'),identity=await buildIdentity(path.resolve('outputs/ROMDex-v0.4.2/ROMDex'));
const response=await fetch(origin+'/api/status',{signal:AbortSignal.timeout(10000)});assert.equal(response.status,200);const status=await response.json();assert.equal(status.version,'0.4.2');assert.equal(status.installationId,identity.installationId);assert.equal(status.serviceBuild,identity.serviceBuild);assert.equal(status.connected,true);assert.equal(status.rememberedConnection,true);
const manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.2-Manifest.json'));let assets=0;for(const f of manifest.files.filter(f=>f.path.startsWith('ROMDex/public/'))){const url=origin+'/'+f.path.slice('ROMDex/public/'.length),r=await fetch(url,{signal:AbortSignal.timeout(10000)});assert.equal(r.status,200,f.path);assert.equal(hash(Buffer.from(await r.arrayBuffer())),f.sha256,f.path);assets++;}
const cipher=JSON.parse(await fs.readFile('work/u06/credential-integrity.json'));assert.equal(hash(await fs.readFile(cipher.path)),cipher.sha256);
const baseline=JSON.parse(await fs.readFile('work/u08/baseline.json'));assert.equal(hash(await fs.readFile(baseline.export.path)),baseline.export.sha256);
const result={verifiedAt:new Date().toISOString(),version:status.version,installationIdentityMatches:true,serviceBuildMatches:true,connected:true,rememberedConnection:true,credentialCiphertextUnchanged:true,servedAssetsVerified:assets,npcSourceExportUnchanged:true,verificationUsedGETOnly:true,productionWrites:false};await fs.writeFile('outputs/U08-Live-Verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));

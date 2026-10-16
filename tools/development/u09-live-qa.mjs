import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildIdentity} from '../outputs/ROMDex/runtime-profile.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),origin='http://127.0.0.1:4322',expected=await buildIdentity(path.resolve('outputs/ROMDex-v0.4.3/ROMDex')),before=JSON.parse(await fs.readFile('work/u09/prelaunch.json'));
const status=await(await fetch(origin+'/api/status',{signal:AbortSignal.timeout(10000)})).json();assert.equal(status.version,'0.4.3');assert.equal(status.installationId,expected.installationId);assert.equal(status.serviceBuild,expected.serviceBuild);assert.equal(status.connected,true);assert.equal(status.rememberedConnection,true);assert.equal(status.automaticSyncEnabled,before.automaticSyncEnabled);assert.equal(hash(await fs.readFile(before.credential.path)),before.credential.sha256);
let assets=0;const manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.3-Manifest.json'));for(const f of manifest.files.filter(f=>f.path.startsWith('ROMDex/public/'))){const r=await fetch(origin+'/'+f.path.slice('ROMDex/public/'.length),{signal:AbortSignal.timeout(10000)});assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),f.sha256);assets++;}
const result={verifiedAt:new Date().toISOString(),version:status.version,installationIdentityMatches:true,serviceBuildMatches:true,rememberedConnection:true,credentialCiphertextUnchanged:true,automaticSyncUnchanged:true,servedAssetsVerified:assets,verificationUsedGETOnly:true,productionWrites:false};await fs.writeFile('outputs/U09-Live-Verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));

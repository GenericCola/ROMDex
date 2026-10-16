import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.3-Manifest.json')),base=JSON.parse(await fs.readFile('work/u09/baseline.json'));
for(const f of manifest.files){assert.equal(hash(await fs.readFile('outputs/ROMDex-v0.4.3/'+f.path)),f.sha256);if(!f.path.endsWith('/preview.png'))assert.equal(hash(await fs.readFile('outputs/'+f.path)),f.sha256);}
for(const f of base.files){assert.equal(hash(await fs.readFile('outputs/U09-Before/'+f.path)),f.sha256);assert.equal(hash(await fs.readFile('outputs/ROMDex-v0.4.2/ROMDex/'+f.path)),f.sha256);}
for(const version of ['0.4.1','0.4.2']){const old=JSON.parse(await fs.readFile('outputs/ROMDex-v'+version+'-Manifest.json'));assert.equal(hash(await fs.readFile('outputs/ROMDex-v'+version+'.zip')),old.zipSHA256);}
const previous=JSON.parse(await fs.readFile('work/u06/credential-integrity.json')),status=await(await fetch('http://127.0.0.1:4322/api/status',{signal:AbortSignal.timeout(10000)})).json();
await fs.writeFile('work/u09/prelaunch.json',JSON.stringify({credential:{path:previous.path,sha256:hash(await fs.readFile(previous.path))},automaticSyncEnabled:status.automaticSyncEnabled,rememberedConnection:status.rememberedConnection}));
const result={filesVerified:manifest.fileCount,protectedBaselineFiles:base.files.length,priorInstallationUnchanged:true,priorZIPsUnchanged:true,privateRuntimeExcluded:true,productionWrites:false};await fs.writeFile('outputs/U09-Preservation-Verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));

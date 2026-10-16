import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const hash=b=>createHash('sha256').update(b).digest('hex'),root=path.resolve('outputs');
const old=JSON.parse(await fs.readFile(path.join(root,'ROMDex-v0.4.3-Manifest.json'),'utf8'));
for(const r of old.files){assert.equal(hash(await fs.readFile(path.join(root,'ROMDex-v0.4.3',r.path))),r.sha256);assert.equal(hash(await fs.readFile(path.join(root,'U10-Before',r.path.slice(7)))),r.sha256);}
assert.equal(hash(await fs.readFile(path.join(root,'ROMDex-v0.4.3.zip'))),old.zipSHA256);
const delivery=JSON.parse(await fs.readFile(path.join(root,'U10-Desktop-Manifest.json'),'utf8'));for(const r of delivery.files)assert.equal(hash(await fs.readFile(path.join(root,'ROMDex-Desktop-U10',r.path))),r.sha256);
const previous=JSON.parse(await fs.readFile('work/u09/prelaunch.json','utf8'));assert.equal(hash(await fs.readFile(previous.credential.path)),previous.credential.sha256);
const legacy=await (await fetch('http://127.0.0.1:4322/api/status')).json();assert.equal(legacy.version,'0.4.3');assert(legacy.rememberedConnection);
const report={verifiedAt:new Date().toISOString(),protectedFiles:old.files.length,legacyReleaseFilesUnchanged:true,legacyZIPUnchanged:true,desktopFilesVerified:delivery.files.length,desktopBytes:delivery.bytes,credentialCiphertextUnchanged:true,legacyServiceVersion:legacy.version,legacyConnectionRemembered:true,legacyAutomaticSyncEnabled:legacy.automaticSyncEnabled,productionWrites:false};
await fs.writeFile(path.join(root,'U10-Preservation-Verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));

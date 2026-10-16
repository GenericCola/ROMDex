import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.2-Manifest.json')),baseline=JSON.parse(await fs.readFile('work/u08/baseline.json'));
for(const f of manifest.files){const local='outputs/ROMDex-v0.4.2/'+f.path;assert.equal(sha(await fs.readFile(local)),f.sha256);if(!f.path.endsWith('/preview.png'))assert.equal(sha(await fs.readFile('outputs/'+f.path)),f.sha256);}
for(const f of baseline.files)assert.equal(sha(await fs.readFile('outputs/U08-Before/'+f.path)),f.sha256);
assert.equal(sha(await fs.readFile(baseline.export.path)),baseline.export.sha256);
for(const f of JSON.parse(await fs.readFile('outputs/U06-Patch-Manifest.json')).files)assert.equal(sha(await fs.readFile('outputs/ROMDex-v0.4.1/ROMDex/'+f.path)),f.sha256);
const cipher=JSON.parse(await fs.readFile('work/u06/credential-integrity.json'));assert.equal(sha(await fs.readFile(cipher.path)),cipher.sha256);
const old=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.1-Manifest.json'));assert.equal(sha(await fs.readFile('outputs/ROMDex-v0.4.1.zip')),old.zipSHA256);
const script=await fs.readFile('outputs/ROMDex/public/addons/npcdex/workspace.js','utf8'),data=JSON.parse(script.match(/const ORIGINAL=([\s\S]*?);\r?\nlet data=structuredClone\(ORIGINAL\)/)[1]);assert.deepEqual(data,JSON.parse(await fs.readFile(baseline.export.path)));
const result={filesVerified:manifest.files.length,protectedBaselineFiles:baseline.files.length,installed041Unchanged:true,credentialCiphertextUnchanged:true,originalNPCExportUnchanged:true,embeddedNPCDataExactMatch:true,priorZIPUnchanged:true,revision:data.revision};await fs.writeFile('outputs/U08-Preservation-Verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));

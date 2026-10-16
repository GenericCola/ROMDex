import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4-Manifest.json'));
const dest=path.resolve('outputs/S01-Before');await fs.mkdir(dest,{recursive:false});
const files=[];for(const f of manifest.files){const rel=f.path.slice(7);assert.ok(!rel.includes('..')&&!rel.includes('.romdex'));const src=rel==='preview.png'?'outputs/ROMDex-v0.4-Preview.png':'outputs/ROMDex/'+rel;const bytes=await fs.readFile(src);assert.equal(sha(bytes),f.sha256);assert.equal(sha(await fs.readFile('outputs/ROMDex-v0.4/'+f.path)),f.sha256);await fs.mkdir(path.dirname(path.join(dest,rel)),{recursive:true});await fs.writeFile(path.join(dest,rel),bytes);files.push({path:rel,sha256:f.sha256});}
await fs.mkdir('work/s01',{recursive:true});await fs.writeFile('work/s01/before-manifest.json',JSON.stringify({files,privateProfileCopied:false},null,2));
const profile='C:/Users/mrgen/AppData/Local/ROMDex/thegobindsingh-PMON/connection.encrypted';await fs.writeFile('work/s01/credential-integrity.json',JSON.stringify({path:profile,sha256:sha(await fs.readFile(profile))}));
console.log(JSON.stringify({backedUp:files.length,sourceAndInstalledVerified:true,privateProfileCopied:false,credentialPlaintextAccessed:false}));

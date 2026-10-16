import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.1-Manifest.json'));
await fs.mkdir('outputs/U06-Before',{recursive:false});await fs.mkdir('work/u06',{recursive:true});
for(const f of manifest.files){const rel=f.path.slice(7),source=rel==='preview.png'?'outputs/ROMDex-v0.4.1-Preview.png':'outputs/ROMDex/'+rel,b=await fs.readFile(source);assert.equal(hash(b),f.sha256);assert.equal(hash(await fs.readFile('outputs/ROMDex-v0.4.1/'+f.path)),f.sha256);const target=path.join('outputs/U06-Before',rel);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b);}
await fs.writeFile('work/u06/before-manifest.json',JSON.stringify(manifest,null,2));
const credential='C:/Users/mrgen/AppData/Local/ROMDex/thegobindsingh-PMON/connection.encrypted';await fs.writeFile('work/u06/credential-integrity.json',JSON.stringify({path:credential,sha256:hash(await fs.readFile(credential))}));
console.log(JSON.stringify({baseline:'0.4.1',files:manifest.files.length,sourceAndInstallationVerified:true,privateProfileCopied:false}));

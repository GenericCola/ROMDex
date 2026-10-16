import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');await fs.mkdir('work/u08',{recursive:true});await fs.mkdir('outputs/U08-Before');
const old=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.1-Manifest.json')),patch=JSON.parse(await fs.readFile('outputs/U06-Patch-Manifest.json'));
const names=new Set([...old.files.map(f=>f.path.slice(7)),...patch.files.map(f=>f.path)]),files=[];
for(const name of names){const src='outputs/ROMDex/'+name;const bytes=await fs.readFile(src).catch(e=>{if(e.code==='ENOENT'&&name==='preview.png')return fs.readFile('outputs/ROMDex-v0.4.1-Preview.png');throw e;});const dest='outputs/U08-Before/'+name;await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);files.push({path:name,sha256:sha(bytes),bytes:bytes.length});}
const original='C:/Users/mrgen/Downloads/npcdex-v2.42/npcdex-agent-export.json',savedBytes=await fs.readFile(original),saved=JSON.parse(savedBytes);assert.equal(saved.version,2);assert.ok(saved.towns.length);await fs.writeFile('work/u08/latest-npcdex-export.json',savedBytes);
await fs.writeFile('outputs/U08-Data-Adoption-Preview.json',JSON.stringify({source:original,revision:saved.revision,contentRevision:saved.contentRevision,sha256:sha(savedBytes),towns:saved.towns.length,annotations:Object.keys(saved.annotations).length,historyEntries:saved.history.length,adoption:'Exact current saved export as embedded first-launch baseline; originals retained; existing integrated browser save takes precedence on subsequent launches.',cloudMigration:false},null,2));
await fs.writeFile('work/u08/baseline.json',JSON.stringify({files,export:{path:original,sha256:sha(savedBytes),revision:saved.revision}},null,2));
await fs.copyFile('outputs/ROMDex/public/index.html','outputs/ROMDex/public/tasks.html');
console.log(JSON.stringify({baselineFiles:files.length,currentNPCRevision:saved.revision,originalUntouched:true}));

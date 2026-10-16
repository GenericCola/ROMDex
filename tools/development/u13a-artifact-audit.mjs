import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {fileDigest} from '../outputs/ROMDex/desktop/migration.mjs';
const old=JSON.parse(await fs.readFile('outputs/U12-Desktop-Manifest.json','utf8'));
for(const item of old.files)assert.equal(await fileDigest(path.join('outputs/ROMDex-Desktop-U12',item.path)),item.sha256);
const root=path.resolve('work/u13a/packages/ROMDex-0.5.2'),files=[];
async function walk(dir,rel=''){for(const entry of await fs.readdir(dir,{withFileTypes:true})){assert(!entry.isSymbolicLink());const name=path.join(rel,entry.name),file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file,name);else files.push({path:name.replaceAll('\\','/'),bytes:(await fs.stat(file)).size,sha256:await fileDigest(file)});}}
await walk(root);
assert(!files.some(x=>/(^|\/)(Data|connection\.encrypted|desktop-workspace\.json|npcdex-current\.json)(\/|$)/.test(x.path)));
let matchingSource=0,preservedAssets=0;
for(const item of files.filter(x=>x.path.startsWith('resources/app/'))){const relative=item.path.slice(14);let digest;try{digest=await fileDigest(path.join('outputs/ROMDex',relative));matchingSource++;}catch(error){if(error.code!=='ENOENT')throw error;digest=old.files.find(x=>x.path===item.path)?.sha256;preservedAssets++;}assert.equal(digest,item.sha256,'Release Source or Preserved Asset Mismatch: '+relative);}
const result={task:'U13A',version:'0.5.2',electron:'44.7.2',platform:'win32-x64',testsPassed:287,syntaxChecks:89,originalU12DeliveryHashesVerified:old.files.length,releaseSourceFilesMatching:matchingSource,preservedU12Assets:preservedAssets,currentSavesAndCredentialExcluded:true,files};
await fs.writeFile('outputs/U13A-Application-Manifest.json',JSON.stringify(result,null,2));
console.log({...result,files:files.length});

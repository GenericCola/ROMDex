import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {fileDigest,secureDirectory,readStableProfile} from '../outputs/ROMDex/desktop/migration.mjs';
const installed=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON');
const marker=JSON.parse(await fs.readFile(path.join(installed,'application-folder-migration.json'),'utf8'));
assert.equal(marker.format,'ROMDexApplicationFolderMigration/1');
await readStableProfile(marker.source);
await assert.rejects(fs.stat(path.join(marker.source,'desktop-owner.json')),{code:'ENOENT'});
const destination=path.resolve('outputs/U13A-Protected-Data-Backup/final-checkpoint');
await assert.rejects(fs.stat(destination),{code:'ENOENT'});await secureDirectory(destination);
for(const item of marker.files){assert.equal(await fileDigest(path.join(marker.source,item.path)),item.sha256);const target=path.resolve(destination,item.path);assert(target.startsWith(destination+path.sep));await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(marker.source,item.path),target);assert.equal(await fileDigest(target),item.sha256);}
const originalKey=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktopData/sessions/thegobindsingh-PMON/Local State'),keyFolder=path.join(destination,'runtime-key');await fs.mkdir(keyFolder);const keyHash=await fileDigest(originalKey);await fs.copyFile(originalKey,path.join(keyFolder,'Local State'));assert.equal(await fileDigest(path.join(keyFolder,'Local State')),keyHash);
await fs.writeFile(path.join(destination,'backup-inventory.json'),JSON.stringify({at:new Date().toISOString(),source:marker.source,files:marker.files,summary:marker.summary,originalSourceRetained:true,protectedRuntimeKey:{source:originalKey,sha256:keyHash}},null,2));
console.log({backup:destination,files:marker.files.length,summary:marker.summary});

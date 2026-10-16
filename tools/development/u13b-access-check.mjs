import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {inspector} from './u11-inspector.mjs';
import {fileDigest} from '../outputs/ROMDex/desktop/migration.mjs';
const directory=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON/updates');
const main=await inspector(9258);
try {
 const state=await main.evaluate(()=>global.romdexQA.updater.snapshot());
 assert.equal(state.phase,'current');assert.equal(state.accessReady,true);
 const credential=path.join(directory,'download-access.encrypted');
 const stat=await fs.stat(credential);assert(stat.isFile()&&stat.size>0);
 const entries=await fs.readdir(directory);assert(!entries.some(name=>name.endsWith('.msi')));
 const result={verifiedAt:new Date().toISOString(),version:state.version,phase:state.phase,accessReady:state.accessReady,protectedFilePresent:true,protectedCredentialSha256:await fileDigest(credential),repository:state.repository,signedCurrentReleaseVerified:true,installerDownloaded:false};
 await fs.writeFile('work/u13b/github-access-verification.json',JSON.stringify(result,null,2));
 console.log({...result,protectedCredentialSha256:'Verified; Retained in Local Evidence'});
} finally {main.close();}

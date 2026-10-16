import fs from 'node:fs/promises';
const p='work/u13b-normal-relaunch.mjs';
let s=await fs.readFile(p,'utf8');
s=s.replace("import {inspector} from './u11-inspector.mjs';","import {inspector} from './u11-inspector.mjs';import {fileDigest} from '../outputs/ROMDex/desktop/migration.mjs';");
s=s.replace('const main=await inspector(9258);',"const accessFile=path.join(profile,'updates/download-access.encrypted'),accessBefore=await fileDigest(accessFile);const main=await inspector(9258);");
s=s.replace('const result={startedAt',"assert.equal(await fileDigest(accessFile),accessBefore,'Saved GitHub Access Changed Across Restart.');const result={savedGitHubAccessPreserved:true,startedAt");
await fs.writeFile(p,s);

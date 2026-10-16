import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve('work/u16'),proof=JSON.parse(await fs.readFile(path.join(root,'ui-verification.json'),'utf8'));assert.equal(proof.status,'passed','Finish the Packaged UI Verification Before Rebuilding.');
const archive=path.join(root,'prior-candidate-'+Date.now());await fs.mkdir(archive);
for(const relative of ['packages/release-0.5.4','make-release-0.5.4']){const target=path.resolve(root,relative);assert(target.startsWith(root+path.sep));await fs.rename(target,path.join(archive,path.basename(target)));}
await fs.copyFile('outputs/ROMDex-Installer-0.5.4/ROMDex-0.5.4-x64.msi',path.join(archive,'ROMDex-0.5.4-first-candidate.msi'));
await import('./u16-build.mjs');if(process.exitCode)throw Error('The Final Build Needs Review.');await import('./u16-artifact-audit.mjs');

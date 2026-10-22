import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const work=path.resolve('work/lp03'), source=path.resolve('outputs/ROMDex'), mirror=path.resolve('work/u13b/repository/apps/romdex');
const build=JSON.parse(await fs.readFile(path.join(work,'build.json'))), digest=b=>createHash('sha256').update(b).digest('hex');
let appFiles=0;
for(const f of build.files){
  const bytes=await fs.readFile(path.join(build.candidate,f.path));
  assert.equal(digest(bytes),f.sha256,'Candidate mismatch: '+f.path);
  if(!f.path.startsWith('resources/app/'))continue;
  const rel=f.path.slice('resources/app/'.length);
  if(rel==='package.json'){
    const original=JSON.parse(await fs.readFile(path.join(source,rel))),candidate=JSON.parse(bytes);
    assert.equal(original.version,'0.5.26');assert.equal(candidate.version,build.candidateVersion);
    candidate.version=original.version;candidate.description=original.description;assert.deepEqual(candidate,original);
  }else assert.equal(digest(await fs.readFile(path.join(source,rel))),f.sha256,'Source mismatch: '+rel);
  assert.equal(digest(await fs.readFile(path.join(mirror,rel))),digest(await fs.readFile(path.join(source,rel))),'Repository mirror mismatch: '+rel);
  appFiles++;
}
const report={status:'passed',candidateVersion:build.candidateVersion,packagedFiles:build.files.length,exactSourceAndMirrorFiles:appFiles,onlyCandidateMetadataChange:'prerelease version and description',romIncluded:false,credentialsIncluded:false,productionInstalled:false};
await fs.writeFile(path.join(work,'source-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));

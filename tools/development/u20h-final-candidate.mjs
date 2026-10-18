import fs from 'node:fs/promises';
// Preserve the first source/package attempts; final checks and packaging use r3.
for(const name of ['package.mjs','build-candidate.mjs','release-checks.mjs']){
 let source=await fs.readFile('work/u20h-'+name,'utf8');source=source.replaceAll('release-0.5.11-r2','release-0.5.11-r3').replace("version+'-r2'","version+'-r3'");
 if(name==='build-candidate.mjs')source=source.replace('work/u20h-package.mjs','work/u20h-final-package.mjs');
 if(name==='release-checks.mjs')source=source.replace('work/u20h-build-candidate.mjs','work/u20h-final-build.mjs');
 const target=name==='package.mjs'?'final-package.mjs':name==='build-candidate.mjs'?'final-build.mjs':'final-checks.mjs';await fs.writeFile('work/u20h-'+target,source);
}
const publisher='work/u20h-publish.mjs';await fs.writeFile(publisher,(await fs.readFile(publisher,'utf8')).replaceAll('release-0.5.11-r2','release-0.5.11-r3'));
const evidence='work/u20h-release-evidence.mjs';await fs.writeFile(evidence,(await fs.readFile(evidence,'utf8')).replace('packagedChecks:9',"packagedChecks:(await read('work/u20h/packaged-backend.json')).checks.length"));
const audit='work/u20h-audit-candidate.mjs';await fs.writeFile(audit,(await fs.readFile(audit,'utf8')).replace('focused.tests>=59','focused.tests>=62'));

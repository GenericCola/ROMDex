import fs from 'node:fs/promises';
const old=JSON.parse(await fs.readFile('work/u20i/candidate-manifest.json'));
await fs.writeFile('work/u20i/superseded-r2-manifest.json',JSON.stringify({...old,reason:'Superseded before deployment by reviewed membership resolution and standalone renderer extraction.'},null,2));
const p='work/u20i-package.mjs';let source=await fs.readFile(p,'utf8');if(!source.includes("version+'-r2'"))throw Error('Unexpected candidate generation');source=source.replace("version+'-r2'","version+'-r3'").replace("packages/release-0.5.12-r1'","packages/release-0.5.12-r2'");await fs.writeFile(p,source);
const b='work/u20i-build-candidate.mjs';await fs.writeFile(b,(await fs.readFile(b,'utf8')).replace('build-release-0.5.12-r2.json','build-release-0.5.12-r3.json'));

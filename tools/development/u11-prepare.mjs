import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await fs.readFile('outputs/U10F-Desktop-Manifest.json','utf8')),records=[];
await fs.mkdir('outputs/U11-Before');await fs.mkdir('work/u11',{recursive:true});
for(const record of manifest.files.filter(x=>x.path.startsWith('resources/app/'))){const rel=record.path.slice(14),data=await fs.readFile(path.join('outputs/ROMDex-Desktop-U10F',record.path));if(createHash('sha256').update(data).digest('hex')!==record.sha256)throw Error('Prior package changed');const target=path.join('outputs/U11-Before',rel);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data);records.push({path:rel,sha256:record.sha256});}
await fs.writeFile('work/u11/baseline.json',JSON.stringify({files:records},null,2));console.log({protectedFiles:records.length});

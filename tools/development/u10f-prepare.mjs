import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await fs.readFile('outputs/U10-Desktop-Manifest.json','utf8')),backup=path.resolve('outputs/U10F-Before'),records=[];
await fs.mkdir(backup,{recursive:false});
for(const record of manifest.files.filter(x=>x.path.startsWith('resources/app/'))){const rel=record.path.slice(14),source=path.join('outputs/ROMDex-Desktop-U10',record.path),bytes=await fs.readFile(source);if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error('U10 package drift');const target=path.join(backup,rel);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);records.push({path:rel,sha256:record.sha256});}
await fs.mkdir('work/u10f',{recursive:true});await fs.writeFile('work/u10f/baseline.json',JSON.stringify({files:records},null,2));console.log(JSON.stringify({protectedFiles:records.length}));

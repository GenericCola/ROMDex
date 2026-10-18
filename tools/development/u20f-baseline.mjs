import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('outputs/ROMDex'),target=path.resolve('work/u20f/source-baseline');
await fs.mkdir(target,{recursive:true});
const files=[];
async function visit(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())await visit(full);else if(entry.isFile()){const relative=path.relative(root,full),bytes=await fs.readFile(full);await fs.mkdir(path.dirname(path.join(target,relative)),{recursive:true});await fs.writeFile(path.join(target,relative),bytes,{flag:'wx'});files.push({path:relative.replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}}
await visit(root);await fs.writeFile('work/u20f/source-baseline.json',JSON.stringify({task:'U20F',version:'0.5.8',at:new Date().toISOString(),files},null,2));
console.log(JSON.stringify({files:files.length,version:'0.5.8',sourceOnly:true}));

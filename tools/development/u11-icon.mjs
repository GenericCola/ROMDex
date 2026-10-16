import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const original=await fs.readFile('outputs/ROMDex/public/icon.svg'),sizes=[16,20,24,32,48,64,128,256],images=[];
for(const size of sizes)images.push(await sharp(original,{density:768}).resize(size,size).png().toBuffer());
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
for(let i=0;i<sizes.length;i++){const at=6+i*16,size=sizes[i];header[at]=size%256;header[at+1]=size%256;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(images[i].length,at+8);header.writeUInt32LE(offset,at+12);offset+=images[i].length;}
await fs.writeFile('outputs/ROMDex/desktop/app.ico',Buffer.concat([header,...images]));await fs.writeFile('outputs/ROMDex/desktop/app.png',images.at(-1));
await fs.writeFile('outputs/U11-App-Icon.png',images.at(-1));console.log({source:'public/icon.svg',sizes});

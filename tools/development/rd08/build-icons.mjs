import fs from 'node:fs/promises';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';
const require=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/probe.cjs'),{chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage();
const sizes=[16,24,32,48,64,128,256],root='outputs/ROMDex';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');const evidence={sizes,icons:{}};
try{for(const [name,input]of [['app','shared-ui/romdex-pixel.svg'],['rdx','shared-ui/npcdex-pokeball.svg']]){
 const svg=await fs.readFile(root+'/'+input,'utf8'),images=[];
 for(const size of sizes){const png=Buffer.from(await page.evaluate(async({svg,size})=>{const image=new Image();image.src='data:image/svg+xml;base64,'+btoa(svg);await image.decode();const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,16,16);const out=document.createElement('canvas');out.width=out.height=size;const draw=out.getContext('2d');draw.imageSmoothingEnabled=false;draw.drawImage(c,0,0,16,16,0,0,size,size);return out.toDataURL('image/png').split(',')[1];},{svg,size}),'base64');images.push(png);if(size===256)await fs.writeFile(root+'/desktop/'+name+'.png',png);}
 const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
 for(let i=0;i<sizes.length;i++){const at=6+16*i;header[at]=header[at+1]=sizes[i]===256?0:sizes[i];header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(images[i].length,at+8);header.writeUInt32LE(offset,at+12);offset+=images[i].length;}
 const ico=Buffer.concat([header,...images]);await fs.writeFile(root+'/desktop/'+name+'.ico',ico);evidence.icons[name]={source:input,sourceSHA256:sha(Buffer.from(svg)),icoSHA256:sha(ico),frames:images.map((bytes,i)=>({size:sizes[i],sha256:sha(bytes)}))};
}await fs.copyFile(root+'/shared-ui/romdex-pixel.svg',root+'/public/icon.svg');await fs.writeFile('work/rd08/icon-evidence.json',JSON.stringify(evidence,null,2));}finally{await browser.close();}

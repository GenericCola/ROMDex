import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
// Windows scanners can briefly hold a file during replacement. Never delete the
// existing save to work around a lock; retain atomic replacement and bound retries.
export async function replaceFile(source,target,{rename=fs.rename,delay=ms=>new Promise(r=>setTimeout(r,ms)),attempts=6}={}){
 for(let attempt=0;;attempt++){try{return await rename(source,target);}catch(error){if(!['EPERM','EACCES','EBUSY'].includes(error.code)||attempt>=attempts-1)throw error;await delay(20*2**attempt);}}
}
// Inject into the same engine/coordinator in the later desktop utility process.
export class DurableJSONStorage {
 constructor(file){this.file=path.resolve(file);this.writes=Promise.resolve();}
 async load(){await this.writes;try{return JSON.parse(await fs.readFile(this.file,'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}}
 save(value){const bytes=JSON.stringify(value),run=this.writes.then(async()=>{await fs.mkdir(path.dirname(this.file),{recursive:true});const temp=this.file+'.'+randomUUID()+'.tmp';let handle;try{handle=await fs.open(temp,'wx');await handle.writeFile(bytes);await handle.sync();await handle.close();handle=null;await replaceFile(temp,this.file);}catch(error){await handle?.close().catch(()=>{});await fs.unlink(temp).catch(()=>{});throw error;}});this.writes=run.catch(()=>{});return run;}
}

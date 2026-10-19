import fs from 'node:fs/promises';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {ensure} from './limits.mjs';

export async function regular(file,{optional=false}={}){
 try{const s=await fs.lstat(file);ensure(s.isFile()&&!s.isSymbolicLink(),'PATH','Managed RDX Files Must Be Regular Files.');return s;}
 catch(e){if(optional&&e.code==='ENOENT')return null;throw e;}
}
export async function directory(dir){
 const absolute=path.resolve(dir);let ancestor=absolute;
 for(;;){try{await fs.lstat(ancestor);break;}catch(e){if(e.code!=='ENOENT')throw e;const parent=path.dirname(ancestor);ensure(parent!==ancestor,'PATH','The RDX Data Drive Is Unavailable.');ancestor=parent;}}
 for(let at=ancestor;;at=path.dirname(at)){const s=await fs.lstat(at);ensure(s.isDirectory()&&!s.isSymbolicLink(),'PATH','RDX Data Paths Cannot Contain Links.');if(path.dirname(at)===at)break;}
 await fs.mkdir(absolute,{recursive:true});
 for(let at=absolute;;at=path.dirname(at)){const s=await fs.lstat(at);ensure(s.isDirectory()&&!s.isSymbolicLink(),'PATH','RDX Data Paths Cannot Contain Links.');if(path.dirname(at)===at)break;}
 ensure(path.resolve(await fs.realpath(absolute)).toLowerCase()===absolute.toLowerCase(),'PATH','RDX Data Must Use Its Real Path.');return absolute;
}
export async function flushDirectory(dir){
 // Windows does not expose directory FlushFileBuffers through Node. The FULL
 // SQLite journal retains every version, so a lost rename can be reconstructed.
 if(process.platform==='win32')return;
 const handle=await fs.open(dir,'r');try{await handle.sync();}finally{await handle.close();}
}
export async function writeDurable(file,bytes,{fault=()=>{},signal}={}){
 const handle=await fs.open(file,'wx',0o600);try{
  for(let at=0;at<bytes.length;){signal?.throwIfAborted();const r=await handle.write(bytes,at,Math.min(65536,bytes.length-at),at);ensure(r.bytesWritten>0,'IO','RDX Write Made No Progress.');at+=r.bytesWritten;fault('during-write',{file,written:at});}
  await handle.sync();
 }finally{await handle.close();}
}
export async function takeLock(root){
 const file=path.join(root,'ownership.sqlite');await regular(file,{optional:true});await regular(file+'-journal',{optional:true});let db;
 try{
  db=new DatabaseSync(file);db.exec('PRAGMA busy_timeout=0; BEGIN EXCLUSIVE;');
  // Separate lock database: the OS releases ownership when a process dies.
  // This avoids stale-PID and unlink races without holding the document journal.
  return {db,file};
 }catch(error){db?.close();if(/locked|busy/i.test(error.message))ensure(false,'BUSY','This RDX Data Folder Already Has an Active Writer.');throw error;}
}
export async function releaseLock(lock){
 if(!lock)return;try{lock.db.exec('ROLLBACK');}finally{lock.db.close();}
}
export function inside(root,file){const rel=path.relative(path.resolve(root),path.resolve(file));return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}

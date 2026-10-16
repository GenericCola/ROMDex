import fs from 'node:fs/promises';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';
export async function verifyInstaller(file,artifact){
 const info=await fs.lstat(file);if(!info.isFile()||info.isSymbolicLink()||info.size!==artifact.size)throw Error('Installer Size or File Type Does Not Match the Signed Release.');
 const handle=await fs.open(file,'r');const hash=createHash('sha256');let bytes=0;try{for await(const chunk of handle.createReadStream({autoClose:false})){bytes+=chunk.length;hash.update(chunk);}}finally{await handle.close();}
 if(bytes!==artifact.size||hash.digest('hex')!==artifact.sha256)throw Error('The Installer Failed Its SHA-256 Verification.');return true;
}
// Provider transport supplies a stream; it never buffers an installer in IPC.
export async function stageInstaller({directory,release,open,approved,signal,onProgress=()=>{}}){
 if(approved!==true)throw Error('Approve the Update Before Downloading.');
 await fs.mkdir(directory,{recursive:true});const stage=path.join(directory,'.download-'+randomUUID()+'.part'),target=path.join(directory,release.artifact.name);let handle,response;
 try{
  response=await open(release.artifact,{signal});if(!response.ok)throw Error('Installer Download Failed ('+response.status+').');
  const expected=release.artifact.size,declared=response.headers?.get('content-length');if(declared!==null&&declared!==undefined&&Number(declared)!==expected)throw Error('Installer Download Size Does Not Match.');
  handle=await fs.open(stage,'wx');let total=0;const hash=createHash('sha256');
  for await(const chunk of response.body){signal?.throwIfAborted();total+=chunk.length;if(total>expected)throw Error('Installer Download Exceeded Its Signed Size.');hash.update(chunk);await handle.writeFile(chunk);onProgress({bytes:total,total:expected});}
  signal?.throwIfAborted();if(total!==expected||hash.digest('hex')!==release.artifact.sha256)throw Error('Installer Download Failed Its Size or SHA-256 Verification.');
  await handle.sync();await handle.close();handle=null;
  try{await fs.lstat(target);await verifyInstaller(target,release.artifact);await fs.unlink(stage);return target;}catch(error){if(error.code!=='ENOENT')throw error;}
  await fs.rename(stage,target);return target;
 }catch(error){await handle?.close().catch(()=>{});await response?.body?.cancel?.().catch(()=>{});await fs.unlink(stage).catch(()=>{});throw error;}
}
export async function stageLocalInstaller({file,directory,release,approved}){
 if(approved!==true)throw Error('Approve the Update Before Preparing Installation.');
 await verifyInstaller(file,release.artifact);
 return stageInstaller({directory,release,approved:true,open:async()=>{const handle=await fs.open(file,'r');return {ok:true,headers:new Headers({'content-length':String(release.artifact.size)}),body:handle.createReadStream()};}});
}

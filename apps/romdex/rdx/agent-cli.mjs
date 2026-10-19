import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {parseJSON} from '../content/contracts.mjs';
import {readBoundedFile} from './container.mjs';
import {AgentTaskFiles} from './agent-files.mjs';
import {ensure,LIMITS} from './limits.mjs';

const usage='Usage: node rdx/agent-cli.mjs fetch HANDOFF.json NEW_DIRECTORY | return HANDOFF.json RESULT.rdx --confirm-upload. Configure ROMDEX_YOUTRACK_TOKEN securely in the agent environment, never in arguments or chat.';
export async function main(args,{client=new AgentTaskFiles({credential:()=>process.env.ROMDEX_YOUTRACK_TOKEN})}={}){
 const [command,manifestPath,destination,confirm]=args;ensure(manifestPath&&destination,'INVALID',usage);
 const manifest=parseJSON(await readBoundedFile(manifestPath,64*1024));
 if(command==='fetch'&&args.length===3){
  try{await fs.lstat(destination);throw Error('Choose a New Agent Output Directory.');}catch(e){if(e.code!=='ENOENT')throw e;}
  const bundle=await client.fetchBundle(manifest);await fs.mkdir(destination);await fs.mkdir(path.join(destination,'blobs'));
  for(const [name,bytes]of [['package.json',bundle.packageBytes],['return-context.json',bundle.contextBytes],['document.json',bundle.documentBytes]])await fs.writeFile(path.join(destination,name),bytes,{flag:'wx'});
  for(const [hash,bytes]of bundle.blobs)await fs.writeFile(path.join(destination,'blobs',hash+'.bin'),bytes,{flag:'wx'});
  return {downloaded:true,account:bundle.identity.account.login,task:bundle.identity.task.idReadable,output:path.resolve(destination),files:bundle.blobs.size+3,backendWrites:false};
 }
 if(command==='return'&&args.length===4&&confirm==='--confirm-upload'){
  const bytes=await readBoundedFile(destination,50*1024*1024),journalPath=destination+'.upload.json',journal={load:async()=>{try{return parseJSON(await readBoundedFile(journalPath,LIMITS.json));}catch(e){if(e.code==='ENOENT')return null;throw e;}},save:async value=>{const temp=journalPath+'.'+randomUUID()+'.tmp';try{await fs.writeFile(temp,JSON.stringify(value)+'\n',{flag:'wx'});await fs.rename(temp,journalPath);}finally{await fs.rm(temp,{force:true});}}};
  return {...await client.returnFile(manifest,bytes,{journal}),taskClosed:false,npcdWrites:false};
 }
 throw Error(usage);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).then(r=>process.stdout.write(JSON.stringify(r,null,2)+'\n'),e=>{process.stderr.write(JSON.stringify({error:e.message,code:e.code||'TRANSFER'})+'\n');process.exitCode=1;});

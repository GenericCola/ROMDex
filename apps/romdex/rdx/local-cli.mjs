import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseJSON} from '../content/contracts.mjs';
import {ManagedDocuments} from './managed-store.mjs';
import {readBoundedFile} from './container.mjs';
import {LIMITS,ensure} from './limits.mjs';
import {regular} from './managed-files.mjs';

const usage='Usage: node rdx/local-cli.mjs import DATA INPUT.rdx | list DATA | show DATA KEY | recover DATA [KEY] | save DATA KEY EXPECTED_REV DOCUMENT.json BLOBS_DIR | export DATA KEY NEW_FILE.rdx';
export async function localMain(args){
 const [command,dataDirectory,...rest]=args,length={import:1,list:0,show:1,save:4,export:2};
 ensure(dataDirectory&&((command==='recover'&&rest.length<=1)||(Object.hasOwn(length,command)&&rest.length===length[command])),'INVALID',usage);
 const store=await ManagedDocuments.open({dataDirectory});try{
  if(command==='import')return await store.ingest(rest[0]);
  if(command==='list')return await store.list();
  if(command==='show'){const value=await store.view(rest[0]);return {document:value.document,status:value.status};}
  if(command==='recover')return await store.recover(rest[0]);
  if(command==='export')return await store.exportFile(rest[0],rest[1]);
  const [key,expectedRevision,file,blobDirectory]=rest,documentBytes=await readBoundedFile(file,LIMITS.json),doc=parseJSON(documentBytes),blobs=new Map();
  ensure(Array.isArray(doc.assetInventory)&&doc.assetInventory.length<LIMITS.entries,'INVALID','Missing or Oversized RDX Asset Inventory.');
  let total=documentBytes.length;for(const asset of doc.assetInventory){
   ensure(/^[a-f0-9]{64}$/.test(asset.sha256),'INVALID','Invalid RDX Asset Hash.');if(blobs.has(asset.sha256))continue;
   const input=path.join(blobDirectory,asset.sha256+'.bin');const stat=await regular(input,{optional:true});if(!stat)continue;
   total+=stat.size;ensure(total<=LIMITS.decoded,'LIMIT','RDX Draft Asset Limit Exceeded.');blobs.set(asset.sha256,await readBoundedFile(input,LIMITS.blob));
  }
  return await store.save(key,{documentBytes,blobs,expectedRevision});
 }finally{await store.close();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))localMain(process.argv.slice(2)).then(v=>process.stdout.write(JSON.stringify(v,null,2)+'\n'),e=>{process.stderr.write(JSON.stringify({error:e.message,code:e.code||'INVALID'})+'\n');process.exitCode=1;});

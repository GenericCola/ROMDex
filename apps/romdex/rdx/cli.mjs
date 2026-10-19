import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseJSON,canonical} from '../content/contracts.mjs';
import {packRdx,readRdxFile,readBoundedFile,identifyInput} from './container.mjs';
import {documentRevision} from './document.mjs';
import {LIMITS,ensure} from './limits.mjs';

const usage='Usage: node rdx/cli.mjs validate FILE | inspect FILE | revision DOCUMENT.json | pack DOCUMENT.json BLOBS_DIR OUTPUT.rdx | unpack FILE NEW_DIRECTORY';
const summary=result=>({format:result.document.format,namespace:result.document.namespace,kind:result.document.kind,documentId:result.document.documentId,revision:result.document.revision,assets:result.document.assetInventory.length,uniqueBlobs:result.blobs.size,storedBytes:12+Buffer.byteLength(canonical(result.manifest))+result.manifest.entries.reduce((n,e)=>n+e.storedBytes,0),decodedBytes:result.manifest.entries.reduce((n,e)=>n+e.decodedBytes,0),containerSha256:result.containerSha256,requiresHumanTesting:result.requiresHumanTesting,authorization:result.authorization,backendWrites:false});
export async function main(args){
 const [command,...rest]=args;
 if(command==='revision'&&rest.length===1){const bytes=await readBoundedFile(rest[0],LIMITS.json),doc=parseJSON(bytes);return {revision:documentRevision(doc),fileChanged:false};}
 if(command==='inspect'&&rest.length===1){
  const bytes=await readBoundedFile(rest[0],LIMITS.stored),route=identifyInput(bytes);
  if(route.route!=='rdx')return {...route,sourceChanged:false};
  return {...summary(await readRdxFile(rest[0])),route:'rdx',validated:true};
 }
 if(command==='validate'&&rest.length===1)return {...summary(await readRdxFile(rest[0])),validated:true};
 if(command==='pack'&&rest.length===3){
  const [documentFile,blobDirectory,output]=rest,bytes=await readBoundedFile(documentFile,LIMITS.json),doc=parseJSON(bytes),blobs=new Map();
  ensure(Array.isArray(doc.assetInventory)&&doc.assetInventory.length<LIMITS.entries,'LIMIT','Missing or Oversized RDX Asset Inventory.');
  let total=bytes.length;for(const asset of doc.assetInventory){
   ensure(/^[a-f0-9]{64}$/.test(asset.sha256),'INVALID','Invalid RDX Blob Hash.');if(blobs.has(asset.sha256))continue;
   const file=path.join(blobDirectory,asset.sha256+'.bin'),stat=await fs.lstat(file);ensure(stat.isFile()&&!stat.isSymbolicLink(),'INVALID','RDX Blob Must Be a Regular File.');
   ensure(stat.size<=LIMITS.blob,'LIMIT','RDX Binary Entry Limit Exceeded.');total+=stat.size;ensure(total<=LIMITS.decoded,'LIMIT','RDX Decoded Aggregate Limit Exceeded.');
   blobs.set(asset.sha256,await readBoundedFile(file,LIMITS.blob));
  }
  const packed=await packRdx(bytes,blobs);await fs.writeFile(output,packed,{flag:'wx'});return {packed:true,output:path.resolve(output),storedBytes:packed.length,sourceChanged:false,backendWrites:false};
 }
 if(command==='unpack'&&rest.length===2){
  const [input,output]=rest,result=await readRdxFile(input);
  // Validation completes before creating anything. Imported logical IDs and
  // filenames are never paths. Refuse an existing destination, including links.
  await fs.mkdir(output);await fs.mkdir(path.join(output,'blobs'));
  await fs.writeFile(path.join(output,'document.json'),result.documentBytes,{flag:'wx'});
  for(const [hash,bytes]of result.blobs)await fs.writeFile(path.join(output,'blobs',hash+'.bin'),bytes,{flag:'wx'});
  return {...summary(result),unpacked:true,output:path.resolve(output),sourceChanged:false};
 }
 throw Error(usage);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2)).then(result=>process.stdout.write(JSON.stringify(result,null,2)+'\n'),error=>{process.stderr.write(JSON.stringify({error:error.message,code:error.code||'INVALID'})+'\n');process.exitCode=error.code==='UNSUPPORTED'?2:1;});
}

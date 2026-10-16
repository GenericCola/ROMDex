import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {MAX_FILE_BYTES,validateFile,validUploadId} from './public/attachment-core.mjs';
export const fileHash=bytes=>createHash('sha256').update(bytes).digest('hex');
export class UploadStorage {
 constructor(profile){this.dir=path.join(profile,'uploads');}
 file(id,suffix){return path.join(this.dir,validUploadId(id)+suffix);}
 async get(id){try{return JSON.parse(await fs.readFile(this.file(id,'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 async stage(id,file,bytes){
  validateFile(file);if(bytes.length!==file.size)throw Error('The Uploaded File Is Incomplete.');
  const metadata={...file,hash:fileHash(bytes)};if(file.hash&&file.hash!==metadata.hash)throw Error('The Uploaded File Checksum Does Not Match.');
  const existing=await this.get(id);if(existing){if(existing.hash!==metadata.hash||existing.name!==file.name||existing.size!==file.size)throw Error('This Upload ID Already Contains a Different File.');return existing;}
  await fs.mkdir(this.dir,{recursive:true});
  await fs.writeFile(this.file(id,'.bin.tmp'),bytes);await fs.rename(this.file(id,'.bin.tmp'),this.file(id,'.bin'));
  await fs.writeFile(this.file(id,'.json.tmp'),JSON.stringify(metadata));await fs.rename(this.file(id,'.json.tmp'),this.file(id,'.json'));return metadata;
 }
 async read(id,expected){const metadata=await this.get(id);if(!metadata)throw Error('The Queued File Is Missing. Reattach It Before Retrying.');if(expected&&(metadata.hash!==expected.hash||metadata.name!==expected.name||metadata.size!==expected.size))throw Error('The Queued File Does Not Match This Pending Upload.');const bytes=await fs.readFile(this.file(id,'.bin'));if(bytes.length!==metadata.size||fileHash(bytes)!==metadata.hash)throw Error('The Queued File Failed Its Integrity Check.');return {metadata,bytes};}
 async release(id){for(const suffix of ['.bin','.json'])await fs.rm(this.file(id,suffix),{force:true});}
}
export async function multipartFile(req){
 const limit=MAX_FILE_BYTES+1024*1024;if(Number(req.headers['content-length'])>limit){req.resume();throw Object.assign(Error('File Upload Is Too Large.'),{status:413});}
 let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(Error('File Upload Is Too Large.'),{status:413});chunks.push(chunk);}
 const form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':req.headers['content-type']}}).formData();
 const entries=[...form.entries()],file=form.get('file'),uploadId=form.get('uploadId');
 if(entries.length!==2||!file||typeof file==='string'||typeof uploadId!=='string')throw Error('Upload One File at a Time.');
 validUploadId(uploadId);const metadata={name:file.name,size:file.size,mimeType:file.type||'application/octet-stream'};validateFile(metadata);return {uploadId,metadata,bytes:Buffer.from(await file.arrayBuffer())};
}

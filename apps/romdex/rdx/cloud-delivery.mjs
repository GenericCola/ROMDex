import {deflateRawSync,inflateRawSync} from 'node:zlib';
import {sha} from '../content/contracts.mjs';
import {ensure} from './limits.mjs';

export const FILE_BYTES=512*1024,PACK_BYTES=4*1024*1024;
// Only previously unpublished objects are packed. Record artifacts keep their
// native ticket attachment, and accepted immutable deliveries are never moved.
export function planDelivery(parts,known=new Map()){
 const groups=[],loose=[];
 for(const [hash,bytes]of [...parts.objects].sort(([a],[b])=>a<b?-1:a>b?1:0)){
  if(known.has(hash))continue;
  const owner=parts.owners.get(hash);
  if(owner||bytes.length===0||bytes.length>PACK_BYTES)groups.push({owner:owner||null,objects:[{hash,bytes}],packed:false});
  else loose.push({hash,bytes});
 }
 const pack=objects=>{if(!objects.length)return;const raw=Buffer.concat(objects.map(o=>o.bytes)),encoded=deflateRawSync(raw,{level:9});
  if(encoded.length>FILE_BYTES){if(objects.length===1){groups.push({owner:null,objects,packed:false});return;}const mid=Math.floor(objects.length/2);pack(objects.slice(0,mid));pack(objects.slice(mid));return;}
  groups.push({owner:null,objects,packed:true,bytes:encoded,decodedBytes:raw.length,decodedSha256:sha(raw)});
 };
 let batch=[],size=0;for(const o of loose){if(size+o.bytes.length>PACK_BYTES){pack(batch);batch=[];size=0;}batch.push(o);size+=o.bytes.length;}pack(batch);
 return groups;
}

export function unpackCloudObject(object,encoded,cache=new Map()){
 const p=object.pack;
 ensure(p?.format==='RDXCloudPack/1'&&Number.isSafeInteger(p.decodedBytes)&&p.decodedBytes>0&&p.decodedBytes<=PACK_BYTES&&Number.isSafeInteger(p.offset)&&p.offset>=0&&Number.isSafeInteger(object.bytes)&&object.bytes>=0&&p.offset+object.bytes<=p.decodedBytes,'INVALID','Invalid Packed Cloud Object Bounds.');
 ensure(Buffer.isBuffer(encoded)&&encoded.length<=FILE_BYTES&&sha(encoded)===p.file.sha256,'INTEGRITY','Cloud Pack Bytes Differ.');
 const cacheKey=p.file.sha256+':'+p.decodedSha256;let raw=cache.get(cacheKey);if(!raw)try{const result=inflateRawSync(encoded,{maxOutputLength:p.decodedBytes,info:true});ensure(result.engine.bytesWritten===encoded.length,'INTEGRITY','Cloud Pack Has Trailing Bytes.');raw=result.buffer;}catch(e){if(e.name==='RdxError')throw e;ensure(false,'INTEGRITY','Cloud Pack Cannot Be Decoded Within Its Bound.');}
 ensure(raw.length===p.decodedBytes&&sha(raw)===p.decodedSha256,'INTEGRITY','Decoded Cloud Pack Differs.');
 if(!cache.has(cacheKey)){if([...cache.values()].reduce((n,b)=>n+b.length,0)+raw.length>64*1024*1024)cache.clear();cache.set(cacheKey,raw);}
 const bytes=raw.subarray(p.offset,p.offset+object.bytes);ensure(sha(bytes)===object.hash,'INTEGRITY','Packed Cloud Object Hash Differs.');return bytes;
}

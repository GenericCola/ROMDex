import fs from 'node:fs/promises';
import {Readable,Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {createDeflateRaw,createInflateRaw} from 'node:zlib';
import {parseJSON,canonical,sha,unique} from '../content/contracts.mjs';
import {validateShape} from './schema.mjs';
import {validateDocument,requireCapabilities} from './document.mjs';
import {operation,ensure,bounds} from './limits.mjs';

export const MAGIC=Buffer.from('ROMDXR01');
export const DEFAULT_LEVEL=9;
const LEGACY=Buffer.from('ROMDEXM1');
export function identifyInput(bytes){
 ensure(Buffer.isBuffer(bytes),'INVALID','RDX Input Must Be Bytes.');
 if(bytes.subarray(0,8).equals(MAGIC))return {route:'rdx',validated:false};
 if(bytes.subarray(0,8).equals(LEGACY))return {route:'legacy-migration',validated:false,handler:'desktop/migration.mjs'};
 if(bytes.subarray(0,6).toString()==='ROMDXR')return {route:'unsupported-rdx',validated:false};
 if(bytes.length<=8*1024*1024){
  try{const value=parseJSON(bytes,{maxBytes:8*1024*1024});if(value.format==='NPCDexMapImport/1')return {route:'legacy-map-json',validated:false,handler:'content/catalog.mjs:buildContentImport'};}catch{}
 }
 return {route:'unknown',validated:false};
}
async function transformBytes(bytes,mode,maximum,op,level){
 op.check();let length=0;const chunks=[],transform=mode==='inflate'?createInflateRaw({chunkSize:16384}):createDeflateRaw({level,chunkSize:16384});
 function* pieces(){for(let at=0;at<bytes.length;at+=65536){op.check();yield bytes.subarray(at,at+65536);}}
 const sink=new Writable({write(chunk,encoding,callback){try{op.check();length+=chunk.length;ensure(length<=maximum,'LIMIT','RDX Decoded or Compressed Entry Limit Exceeded.');chunks.push(chunk);callback();}catch(error){callback(error);}}});
 try{await pipeline(Readable.from(pieces()),transform,sink,{signal:op.signal});}
 catch(error){op.check();throw error;}
 if(mode==='inflate')ensure(transform.bytesWritten===bytes.length,'INVALID','RDX Compressed Entry Has Trailing or Concatenated Data.');
 op.check();return Buffer.concat(chunks,length);
}
const packedProofs=new WeakMap();
const compressedEntries=new Map();let compressedBytes=0;
const COMPRESSED_CACHE_BYTES=16*1024*1024;
async function compressEntry(bytes,level,op){const key=level+':'+sha(bytes);let cached=compressedEntries.get(key);if(cached){if(cached.bytes)ensure(sha(cached.bytes)===cached.hash,'INTEGRITY','A Cached RDX Compression Entry Changed.');compressedEntries.delete(key);compressedEntries.set(key,cached);op.check();return cached.bytes;}const compressed=await transformBytes(bytes,'deflate',bytes.length+65536,op,level),selected=compressed.length<bytes.length?compressed:null;cached={bytes:selected,hash:selected?sha(selected):null};const size=selected?.length||0;if(size<=COMPRESSED_CACHE_BYTES){while((compressedBytes+size>COMPRESSED_CACHE_BYTES||compressedEntries.size>=1024)&&compressedEntries.size){const [id,old]=compressedEntries.entries().next().value;compressedEntries.delete(id);compressedBytes-=old.bytes?.length||0;}compressedEntries.set(key,cached);compressedBytes+=size;}return selected;}
export async function packRdx(documentBytes,blobs=new Map(),options={}){
 const op=operation(options);try{
  const level=options.level??DEFAULT_LEVEL;ensure(Number.isInteger(level)&&level>=0&&level<=9,'INVALID','Invalid RDX Compression Level.');
  ensure(blobs instanceof Map,'INVALID','RDX Blobs Must Be Hash-Keyed.');
  const validated=validateDocument(documentBytes,{blobs,limits:op.limits,check:op.check}),{document,canonicalBytes}=validated;
  ensure(blobs.size+1<=op.limits.entries,'LIMIT','RDX Entry Count Limit Exceeded.');
  const entries=[],bodies=[];let offset=0,decoded=0;
  for(const [id,bytes]of [['document',canonicalBytes],...[...blobs].sort(([a],[b])=>a.localeCompare(b)).map(([h,b])=>['blob:'+h,b])]){
   op.check();decoded+=bytes.length;ensure(decoded<=op.limits.decoded,'LIMIT','RDX Decoded Aggregate Limit Exceeded.');
   const compressed=options.compress===false?null:await compressEntry(bytes,level,op);
   const stored=compressed&&compressed.length<bytes.length?compressed:bytes;
   entries.push({id,codec:stored===bytes?'store':'deflate-raw',offset,storedBytes:stored.length,decodedBytes:bytes.length,sha256:sha(bytes)});
   bodies.push(stored);offset+=stored.length;ensure(offset<=op.limits.stored,'LIMIT','RDX Stored File Limit Exceeded.');
  }
  const manifest={format:'RDXContainer/1',documentRevision:document.revision,requiredCapabilities:[...new Set(['org.romdex.rdx.container-v1',...document.capabilities.required])],entries};validateShape(manifest,'container');
  const header=Buffer.from(canonical(manifest));ensure(header.length<=op.limits.manifest,'LIMIT','RDX Manifest Limit Exceeded.');
  ensure(12+header.length+offset<=op.limits.stored,'LIMIT','RDX Stored File Limit Exceeded.');
  const prefix=Buffer.alloc(12);MAGIC.copy(prefix);prefix.writeUInt32LE(header.length,8);op.check();
  const packed=Buffer.concat([prefix,header,...bodies],12+header.length+offset);packedProofs.set(packed,{digest:sha(packed),limits:canonical(op.limits),validated});return packed;
 }finally{op.close();}
}
export async function unpackRdx(bytes,options={}){
 const op=operation(options);try{
  ensure(Buffer.isBuffer(bytes)&&bytes.length>=8,'INVALID','Incomplete RDX Header.');op.check();
  ensure(bytes.length<=op.limits.stored,'LIMIT','RDX Stored File Limit Exceeded.');
  const route=identifyInput(bytes).route;ensure(route==='rdx','UNSUPPORTED',route==='legacy-migration'?'Legacy Browser Migration: Use Its Dedicated Migration Reader.':route==='legacy-map-json'?'Legacy Map JSON: Use Import Map Data.':'Unsupported RDX Framing or Version.');
  ensure(bytes.length>=12,'INVALID','Incomplete RDX Header.');
  const headerLength=bytes.readUInt32LE(8);ensure(headerLength>0&&headerLength<=op.limits.manifest,'LIMIT','RDX Manifest Limit Exceeded.');
  const start=12+headerLength;ensure(start<=bytes.length,'INVALID','Incomplete RDX Manifest.');
  const manifest=parseJSON(bytes.subarray(12,start),{maxBytes:op.limits.manifest,maxDepth:op.limits.depth,maxNodes:op.limits.nodes});
  ensure(manifest.format==='RDXContainer/1','UNSUPPORTED','Unsupported RDX Container Version.');
  requireCapabilities(manifest.requiredCapabilities);
  if(manifest.entries?.some(e=>!['store','deflate-raw'].includes(e.codec)))ensure(false,'UNSUPPORTED','Unsupported RDX Entry Codec.');
  validateShape(manifest,'container');ensure(manifest.entries.length<=op.limits.entries,'LIMIT','RDX Entry Count Limit Exceeded.');
  unique(manifest.entries.map(e=>e.id),'RDX Entry');ensure(manifest.entries.filter(e=>e.id==='document').length===1,'INVALID','RDX Requires Exactly One Document.');
  let offset=0,decoded=0;
  for(const entry of manifest.entries){
   op.check();const maximum=entry.id==='document'?op.limits.json:op.limits.blob;
   ensure(entry.offset===offset,'INVALID','RDX Entry Gap or Overlap.');
   ensure(entry.decodedBytes<=maximum&&entry.storedBytes<=maximum+65536,'LIMIT','RDX Entry Byte Limit Exceeded.');
   ensure(entry.codec!=='store'||entry.storedBytes===entry.decodedBytes,'INVALID','RDX Stored Entry Lengths Differ.');
   ensure(entry.id==='document'||entry.id==='blob:'+entry.sha256,'INVALID','RDX Blob Identity Differs.');
   offset+=entry.storedBytes;decoded+=entry.decodedBytes;
   ensure(Number.isSafeInteger(offset)&&offset<=bytes.length-start,'INVALID','RDX Body Is Truncated.');
   ensure(decoded<=op.limits.decoded,'LIMIT','RDX Decoded Aggregate Limit Exceeded.');
  }
  ensure(offset===bytes.length-start,'INVALID','Unlisted RDX Trailing Bytes.');
  const blobs=new Map();let documentBytes;
  for(const entry of manifest.entries){
   op.check();const stored=bytes.subarray(start+entry.offset,start+entry.offset+entry.storedBytes);
   const body=entry.codec==='store'?Buffer.from(stored):await transformBytes(stored,'inflate',entry.decodedBytes,op);
   ensure(body.length===entry.decodedBytes&&sha(body)===entry.sha256,'INVALID','RDX Entry Hash or Decoded Length Differs.');
   if(entry.id==='document')documentBytes=body;else blobs.set(entry.sha256,body);
  }
  const known=packedProofs.get(bytes),reusable=known&&known.digest===sha(bytes)&&known.limits===canonical(op.limits);if(reusable)packedProofs.delete(bytes);const validated=reusable?{...known.validated,document:structuredClone(known.validated.document),canonicalBytes:Buffer.from(known.validated.canonicalBytes)}:validateDocument(documentBytes,{blobs,limits:op.limits,check:op.check});
  ensure(documentBytes.equals(validated.canonicalBytes),'INVALID','RDX Document Entry Must Use Canonical JSON.');
  ensure(manifest.documentRevision===validated.document.revision,'INVALID','RDX Manifest and Document Revisions Differ.');
  return {...validated,manifest,documentBytes,blobs,containerSha256:sha(bytes)};
 }finally{op.close();}
}
// Read a fixed, bounded allocation instead of an unbounded readFile on a
// concurrently growing input. Never modify or delete a rejected source file.
export async function readBoundedFile(file,maximum,signal){
 const handle=await fs.open(file,'r');try{
  signal?.throwIfAborted();const stat=await handle.stat();ensure(stat.isFile()&&stat.size<=maximum,'LIMIT','RDX Input File Type or Byte Limit Exceeded.');
  const bytes=Buffer.alloc(stat.size);let at=0;
  while(at<bytes.length){signal?.throwIfAborted();const result=await handle.read(bytes,at,Math.min(65536,bytes.length-at),at);ensure(result.bytesRead>0,'INVALID','RDX Input Changed While Reading.');at+=result.bytesRead;}
  const probe=Buffer.alloc(1);ensure((await handle.read(probe,0,1,at)).bytesRead===0&&(await handle.stat()).size===stat.size,'INVALID','RDX Input Changed While Reading.');return bytes;
 }finally{await handle.close();}
}
export async function readRdxFile(file,options={}){return unpackRdx(await readBoundedFile(file,bounds(options.limits).stored,options.signal),options);}
// The host supplies its existing context-bound migration/import readers. Data
// inside a file cannot select code, provide a handler or bypass their validation.
export async function dispatchInputFile(file,{legacyMigration,legacyMapJSON,...options}={}){
 const bytes=await readBoundedFile(file,bounds(options.limits).stored,options.signal),{route}=identifyInput(bytes);
 if(route==='rdx')return {route,value:await unpackRdx(bytes,options)};
 if(route==='legacy-migration'&&typeof legacyMigration==='function')return {route,value:await legacyMigration({file,bytes})};
 if(route==='legacy-map-json'&&typeof legacyMapJSON==='function')return {route,value:await legacyMapJSON({file,bytes})};
 ensure(false,'UNSUPPORTED',route.startsWith('legacy-')?'Use the Dedicated '+route+' Reader; No Import Was Performed.':'Unsupported RDX Input.');
}

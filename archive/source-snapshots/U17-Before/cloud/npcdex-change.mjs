import {gzipSync,gunzipSync} from 'node:zlib';
import {randomUUID} from 'node:crypto';
import {sha256,CHUNK_BYTES,DESCRIPTOR_BYTES} from './github-store.mjs';
import {inspectNPC,MAX_SOURCE_BYTES} from './npcdex-import.mjs';
const encode=value=>Buffer.from(JSON.stringify(value)),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const check=(test,message)=>{if(!test)throw Error(message);},hash=id=>typeof id==='string'&&/^[a-f0-9]{64}$/.test(id);
// Existing NPCDex hashes stay untouched. Only this cloud semantic hash omits device view preferences.
const cloudDocument=value=>{const copy={...value};delete copy.preferences;return copy;};
export const documentHash=value=>sha256(encode(cloudDocument(value)));
export function diffDocument(before,after){
 const patches=[];function walk(a,b,path){if(equal(a,b))return;
  if(Array.isArray(a)&&Array.isArray(b)){
   if(a.length===b.length){for(let i=0;i<a.length;i++)walk(a[i],b[i],[...path,i]);return;}
   let start=0,end=0;while(start<Math.min(a.length,b.length)&&equal(a[start],b[start]))start++;while(end<Math.min(a.length,b.length)-start&&equal(a[a.length-1-end],b[b.length-1-end]))end++;
   patches.push({op:'splice',path,index:start,remove:a.length-start-end,values:b.slice(start,b.length-end)});return;
  }
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
   const aa=Object.keys(a),bb=Object.keys(b),common=aa.filter(k=>Object.hasOwn(b,k));
   if(!equal([...common,...bb.filter(k=>!Object.hasOwn(a,k))],bb)){patches.push({op:'set',path,value:b});return;}
   for(const key of aa)if(!Object.hasOwn(b,key))patches.push({op:'delete',path:[...path,key]});
   for(const key of bb)if(!Object.hasOwn(a,key))patches.push({op:'set',path:[...path,key],value:b[key]});else walk(a[key],b[key],[...path,key]);return;
  }
  patches.push({op:'set',path,value:b});
 }walk(before,after,[]);check(patches.length<=100000,'Too Many NPCDex Changes for One Transaction.');return patches;
}
export function applyPatches(document,patches){
 check(Array.isArray(patches)&&patches.length<=100000,'Invalid NPCDex Change List.');let result=structuredClone(document);
 for(const patch of patches){check(['set','delete','splice'].includes(patch?.op)&&Array.isArray(patch.path)&&patch.path.length<100,'Invalid NPCDex Change.');
  if(!patch.path.length){check(patch.op==='set','Invalid Root Change.');result=structuredClone(patch.value);continue;}
  let parent=result;for(const key of patch.path.slice(0,-1)){check(parent&&typeof parent==='object'&&Object.hasOwn(parent,key),'Missing NPCDex Change Target.');parent=parent[key];}
  const key=patch.path.at(-1);check(parent&&typeof parent==='object'&&(typeof key==='string'||Number.isSafeInteger(key)),'Invalid NPCDex Change Target.');
  if(Array.isArray(parent))check(Number.isSafeInteger(key)&&key>=0&&key<parent.length,'Invalid NPCDex Array Target.');
  if(patch.op==='set')Object.defineProperty(parent,key,{value:structuredClone(patch.value),enumerable:true,configurable:true,writable:true});
  else if(patch.op==='delete'){check(!Array.isArray(parent)&&Object.hasOwn(parent,key),'Invalid NPCDex Deletion.');delete parent[key];}
  else{const target=parent[key];check(Array.isArray(target)&&Number.isSafeInteger(patch.index)&&patch.index>=0&&patch.index<=target.length&&Number.isSafeInteger(patch.remove)&&patch.remove>=0&&patch.index+patch.remove<=target.length&&Array.isArray(patch.values),'Invalid NPCDex Array Change.');target.splice(patch.index,patch.remove,...structuredClone(patch.values));}
 }
 return result;
}
export function makeChange({before,after,workspace,device,parent,sequence,operation=randomUUID(),createdAt=new Date().toISOString()}){
 const raw=encode(after);inspectNPC(raw);check(raw.length<=MAX_SOURCE_BYTES&&hash(parent)&&/^[a-f0-9-]{36}$/.test(workspace)&&/^[a-f0-9-]{36}$/.test(device)&&/^[a-f0-9-]{36}$/.test(operation)&&Number.isSafeInteger(sequence)&&sequence>0,'Invalid NPCDex Change Identity.');
 const patches=diffDocument(cloudDocument(before),cloudDocument(after));if(!patches.length)return null;check(equal(applyPatches(cloudDocument(before),patches),cloudDocument(after)),'NPCDex Delta Does Not Reproduce the Edited Document.');
 const payload=encode(patches);check(payload.length<=64*1024*1024,'NPCDex Change Exceeds the Expanded Limit.');const compressed=gzipSync(payload,{level:6}),files=new Map(),chunks=[];
 for(let offset=0;offset<compressed.length;offset+=CHUNK_BYTES){const bytes=compressed.subarray(offset,offset+CHUNK_BYTES),id=sha256(bytes);files.set(`workspaces/${workspace}/objects/${id.slice(0,2)}/${id}`,bytes);chunks.push({sha256:id,bytes:bytes.length});}
 const record={format:'ROMDexNPCDexChange/1',workspace,namespace:'npcdex',actor:'32021766',device,sequence,operation,createdAt,parents:[parent],before:documentHash(before),after:documentHash(after),payload:{codec:'gzip',sha256:sha256(compressed),bytes:compressed.length,expandedSha256:sha256(payload),expandedBytes:payload.length,chunks}};
 const bytes=encode(record);check(bytes.length<=DESCRIPTOR_BYTES,'NPCDex Change Descriptor Is Too Large.');const id=sha256(bytes);files.set(`workspaces/${workspace}/npcdex/records/${id}.json`,bytes);return {id,record,bytes,files};
}
export function validateChange(bytes,id,workspace){
 check(Buffer.isBuffer(bytes)&&bytes.length<=DESCRIPTOR_BYTES&&hash(id)&&sha256(bytes)===id,'NPCDex Change Record Integrity Failed.');const r=JSON.parse(bytes);
 check(r?.format==='ROMDexNPCDexChange/1'&&r.workspace===workspace&&r.namespace==='npcdex'&&r.actor==='32021766'&&Array.isArray(r.parents)&&r.parents.length===1&&hash(r.parents[0])&&hash(r.before)&&hash(r.after)&&/^[a-f0-9-]{36}$/.test(r.device)&&/^[a-f0-9-]{36}$/.test(r.operation)&&Number.isSafeInteger(r.sequence)&&r.sequence>0,'NPCDex Change Identity Is Invalid.');
 const p=r.payload;check(p?.codec==='gzip'&&hash(p.sha256)&&hash(p.expandedSha256)&&Number.isSafeInteger(p.bytes)&&p.bytes>0&&p.bytes<=64*1024*1024&&Number.isSafeInteger(p.expandedBytes)&&p.expandedBytes>0&&p.expandedBytes<=64*1024*1024&&Array.isArray(p.chunks)&&p.chunks.length===Math.ceil(p.bytes/CHUNK_BYTES),'NPCDex Payload Descriptor Is Invalid.');
 let total=0;for(let i=0;i<p.chunks.length;i++){const c=p.chunks[i];check(hash(c.sha256)&&Number.isSafeInteger(c.bytes)&&c.bytes>0&&c.bytes<=CHUNK_BYTES&&(i===p.chunks.length-1||c.bytes===CHUNK_BYTES),'NPCDex Payload Chunk Is Invalid.');total+=c.bytes;}check(total===p.bytes,'NPCDex Payload Length Differs.');return r;
}
export async function applyChange({before,bytes,id,workspace,readObject}){
 const r=validateChange(bytes,id,workspace);check(documentHash(before)===r.before,'NPCDex Change Has a Different Semantic Base.');const parts=[];
 for(const c of r.payload.chunks){const b=await readObject(c.sha256);check(Buffer.isBuffer(b)&&b.length===c.bytes&&sha256(b)===c.sha256,'NPCDex Change Dependency Is Missing or Damaged.');parts.push(b);}
 const encoded=Buffer.concat(parts);check(sha256(encoded)===r.payload.sha256,'NPCDex Compressed Payload Integrity Failed.');const payload=gunzipSync(encoded,{maxOutputLength:r.payload.expandedBytes+1});check(payload.length===r.payload.expandedBytes&&sha256(payload)===r.payload.expandedSha256,'NPCDex Expanded Payload Integrity Failed.');const after=applyPatches(before,JSON.parse(payload));check(documentHash(after)===r.after,'NPCDex Result Integrity Failed.');inspectNPC(encode(after));return after;
}

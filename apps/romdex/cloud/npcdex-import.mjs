import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {TextDecoder} from 'node:util';
import {CHUNK_BYTES,DESCRIPTOR_BYTES,sha256} from './github-store.mjs';
import {DurableJSONStorage} from '../durable-json-storage.mjs';

export const NPC_FILES=['npcdex-current.json','npcdex-recovery-draft.json','npcdex-held-recovery.json'];
export const MAX_SOURCE_BYTES=16*1024*1024;
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const requireThat=(test,message)=>{if(!test)throw Error(message);};
const encode=x=>Buffer.from(JSON.stringify(x));
function decode(bytes){try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw Error('NPCDex Source Is Not Valid UTF-8 JSON.');}}
export function inspectNPC(bytes){
 requireThat(Buffer.isBuffer(bytes)&&bytes.length>0&&bytes.length<=MAX_SOURCE_BYTES,'NPCDex Source Exceeds the Desktop Save Limit.');const d=decode(bytes);
 requireThat(d?.version===2&&Array.isArray(d.towns)&&d.towns.length>0&&Array.isArray(d.stages)&&d.stages.length===10&&d.annotations&&typeof d.annotations==='object'&&!Array.isArray(d.annotations)&&Number.isSafeInteger(d.revision)&&d.revision>=0,'The NPCDex Save Is Unsupported.');
 const summary={revision:d.revision,towns:d.towns.length,areas:0,elements:0,points:0,blocks:0,characters:0,plans:Object.keys(d.changePlans||{}).length,history:d.history?.length||0,receipts:d.implementationReceipts?.length||0,requests:d.changeRequests?.length||0,annotations:Object.keys(d.annotations).length,embeddedImages:0,imageBytes:0};
 function ids(array,kind){requireThat(Array.isArray(array),'Missing NPCDex '+kind+' Collection.');const seen=new Set();for(const value of array){requireThat(value&&typeof value.id==='string'&&value.id&&!seen.has(value.id),'Duplicate or Invalid NPCDex '+kind+' Identity.');seen.add(value.id);}return seen;}
 ids(d.towns,'Town');ids(d.stages,'Stage');requireThat(d.stages.every((s,i)=>s.id===String.fromCharCode(65+i)),'NPCDex Story Stages Changed.');
 for(const t of d.towns){ids(t.areas,'Area');ids(t.characters,'Character');ids(t.locations,'Location');summary.characters+=t.characters.length;const elements=new Set(),points=new Set(),blocks=new Set();for(const a of t.areas){summary.areas++;ids(a.elements,'Element');for(const e of a.elements){requireThat(!elements.has(e.id),'Duplicate NPCDex Element Identity.');elements.add(e.id);summary.elements++;ids(e.points,'Point');for(const p of e.points){requireThat(!points.has(p.id),'Duplicate NPCDex Point Identity.');points.add(p.id);summary.points++;ids(p.blocks,'Block');for(const b of p.blocks){requireThat(!blocks.has(b.id),'Duplicate NPCDex Block Identity.');blocks.add(b.id);summary.blocks++;}}}}}
 // Inspection never normalizes JSON, images, receipt hashes or legacy request fields.
 let count=0;function inspect(value){requireThat(++count<=1000000,'NPCDex Source Is Too Complex.');if(typeof value==='string'){
   requireThat(!/^(blob:|file:)/i.test(value),'A Local-Only Asset Needs Review Before Cloud Import.');
   if(value.startsWith('data:')){const m=value.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/);requireThat(m,'An Embedded Asset Is Unsupported.');const encoded=m[2].replace(/\s/g,'');requireThat(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded),'An Embedded Image Is Invalid.');summary.embeddedImages++;summary.imageBytes+=Buffer.from(encoded,'base64').length;}
  }else if(value&&typeof value==='object')for(const [key,child]of Object.entries(value)){if(key==='dataUrl')requireThat(typeof child==='string'&&child.startsWith('data:image/'),'An Image Has No Embedded Bytes.');inspect(child);}}
 inspect(d);return {document:d,summary,sha256:sha256(bytes),bytes:bytes.length};
}
export async function captureSources(service){
 const entries=[];for(const name of NPC_FILES){try{const file=path.join(service,name),stat=await fs.lstat(file);requireThat(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<=MAX_SOURCE_BYTES,'Unexpected NPCDex Source File.');const bytes=await fs.readFile(file);requireThat(bytes.length<=MAX_SOURCE_BYTES,'NPCDex Source Is Too Large.');decode(bytes);entries.push({name,bytes,sha256:sha256(bytes)});}catch(error){if(error.code!=='ENOENT')throw error;}}
 requireThat(entries.some(e=>e.name===NPC_FILES[0]),'The Current NPCDex Save Is Missing. An Archived Baseline Cannot Replace It.');return entries;
}
export async function assertSourcesUnchanged(service,sources){const current=await captureSources(service);requireThat(current.length===sources.length&&sources.every(e=>current.find(c=>c.name===e.name)?.sha256===e.sha256),'NPCDex Changed After Preview. Prepare a New Preview; Nothing Was Replaced.');}
export function buildImport({sources,workspace,device,operation=randomUUID(),createdAt=new Date().toISOString()}){
 requireThat(workspace==='1e267c45-75ae-48a9-b173-5ca3132bb121'&&/^[a-f0-9-]{36}$/.test(device)&&/^[a-f0-9-]{36}$/.test(operation),'Invalid Import Identity.');
 requireThat(Array.isArray(sources)&&sources.length>0&&sources.length<=NPC_FILES.length&&new Set(sources.map(x=>x.name)).size===sources.length,'Invalid Import Sources.');
 const current=sources.find(e=>e.name===NPC_FILES[0]);requireThat(current,'Current NPCDex Source Is Missing.');const inspected=inspectNPC(current.bytes);
 const root=`workspaces/${workspace}`,files=new Map(),documents=[];
 for(const source of sources){requireThat(NPC_FILES.includes(source.name)&&Buffer.isBuffer(source.bytes)&&source.bytes.length<=MAX_SOURCE_BYTES&&sha256(source.bytes)===source.sha256,'Import Source Integrity Failed.');const data=decode(source.bytes);
  // Dirty/held copies must first be resolved in NPCDex; never silently choose a winner.
  if(source.name!==NPC_FILES[0])requireThat(data===null,'A Recovery Copy Needs Review in NPCDex Before Initial Cloud Import.');
  const chunks=[];for(let offset=0;offset<source.bytes.length;offset+=CHUNK_BYTES){const bytes=source.bytes.subarray(offset,offset+CHUNK_BYTES),id=sha256(bytes);files.set(`${root}/objects/${id.slice(0,2)}/${id}`,bytes);chunks.push({sha256:id,bytes:bytes.length});}
  documents.push({name:source.name,sha256:source.sha256,bytes:source.bytes.length,codec:'raw-utf8',chunks});
 }
 const record={format:'ROMDexNPCDexImport/1',workspace,namespace:'npcdex',actor:'32021766',device,operation,createdAt,parents:[],documents,summary:inspected.summary};const bytes=encode(record);requireThat(bytes.length<=DESCRIPTOR_BYTES,'Import Descriptor Is Too Large.');const id=sha256(bytes);
 const recordPath=`${root}/npcdex/records/${id}.json`;files.set(recordPath,bytes);files.set(`${root}/npcdex/genesis.json`,encode({format:'ROMDexNPCDexGenesis/1',workspace,record:id}));
 return {id,record,recordPath,files,summary:inspected.summary};
}
export async function hydrateImport({recordBytes,readObject,workspace,expectedId}){
 requireThat(Buffer.isBuffer(recordBytes)&&recordBytes.length<=DESCRIPTOR_BYTES&&hash(expectedId)&&sha256(recordBytes)===expectedId,'Import Record Integrity Failed.');const r=decode(recordBytes);
 requireThat(r?.format==='ROMDexNPCDexImport/1'&&r.workspace===workspace&&r.namespace==='npcdex'&&r.actor==='32021766'&&Array.isArray(r.parents)&&r.parents.length===0&&Array.isArray(r.documents)&&r.documents.length>0&&r.documents.length<=3,'Import Record Identity Failed.');
 const result=new Map();for(const doc of r.documents){requireThat(NPC_FILES.includes(doc.name)&&!result.has(doc.name)&&hash(doc.sha256)&&doc.codec==='raw-utf8'&&Number.isSafeInteger(doc.bytes)&&doc.bytes>0&&doc.bytes<=MAX_SOURCE_BYTES&&Array.isArray(doc.chunks)&&doc.chunks.length===Math.ceil(doc.bytes/CHUNK_BYTES),'Invalid Import Document Descriptor.');
  const parts=[];let total=0;for(let i=0;i<doc.chunks.length;i++){const chunk=doc.chunks[i];requireThat(hash(chunk.sha256)&&Number.isSafeInteger(chunk.bytes)&&chunk.bytes>0&&chunk.bytes<=CHUNK_BYTES&&(i===doc.chunks.length-1||chunk.bytes===CHUNK_BYTES),'Invalid Import Chunk Descriptor.');const bytes=await readObject(chunk.sha256);requireThat(Buffer.isBuffer(bytes)&&bytes.length===chunk.bytes&&sha256(bytes)===chunk.sha256,'Missing or Damaged Cloud Import Chunk.');parts.push(bytes);total+=bytes.length;requireThat(total<=doc.bytes,'Cloud Import Exceeds Its Declared Size.');}
  const bytes=Buffer.concat(parts);requireThat(total===doc.bytes&&sha256(bytes)===doc.sha256,'Cloud Import Document Integrity Failed.');decode(bytes);result.set(doc.name,bytes);
 }
 requireThat(result.has(NPC_FILES[0]),'Cloud Import Has No Current NPCDex Save.');const summary=inspectNPC(result.get(NPC_FILES[0])).summary;requireThat(JSON.stringify(summary)===JSON.stringify(r.summary),'Cloud Import Summary Differs.');return {record:r,documents:result,summary};
}
async function writeExact(file,bytes){const handle=await fs.open(file,'wx');try{await handle.writeFile(bytes);await handle.sync();}finally{await handle.close();}requireThat((await fs.readFile(file)).equals(bytes),'Local Backup Verification Failed.');}
export async function prepareImport({service,directory,workspace,device,secure=async directory=>fs.mkdir(directory,{recursive:true})}){
 const sources=await captureSources(service),prepared=buildImport({sources,workspace,device});
 await secure(directory);await fs.mkdir(path.join(directory,'originals'));for(const entry of sources)await writeExact(path.join(directory,'originals',entry.name),entry.bytes);
 const state={format:'ROMDexNPCDexImportSession/1',workspace,device,operation:prepared.record.operation,createdAt:prepared.record.createdAt,recordId:prepared.id,recordPath:prepared.recordPath,summary:prepared.summary,sources:sources.map(({name,sha256,bytes})=>({name,sha256,bytes:bytes.length})),phase:'preview',automaticCloudSync:false};
 await new DurableJSONStorage(path.join(directory,'session.json')).save(state);await assertSourcesUnchanged(service,sources);return {state,prepared,sources,directory};
}
export async function restorePreparedImport(directory){
 const state=await new DurableJSONStorage(path.join(directory,'session.json')).load();requireThat(state?.format==='ROMDexNPCDexImportSession/1'&&Array.isArray(state.sources)&&state.sources.length<=3,'Unsupported Import Session.');const sources=[];
 for(const entry of state.sources){requireThat(NPC_FILES.includes(entry.name)&&Number.isSafeInteger(entry.bytes)&&entry.bytes>0&&entry.bytes<=MAX_SOURCE_BYTES,'Invalid Import Backup Entry.');const file=path.join(directory,'originals',entry.name),stat=await fs.lstat(file);requireThat(stat.isFile()&&!stat.isSymbolicLink()&&stat.size===entry.bytes,'Import Backup Changed.');const bytes=await fs.readFile(file);requireThat(sha256(bytes)===entry.sha256,'Import Backup Changed.');sources.push({name:entry.name,bytes,sha256:entry.sha256});}
 const prepared=buildImport({...state,sources});requireThat(prepared.id===state.recordId,'The Staged Import Identity Changed.');return {state,prepared,sources,directory};
}
export async function publishImport({session,service,store,acceptedRecord,markerFile}){
 requireThat(acceptedRecord===session.prepared.id,'Approve This Exact Import Preview First.');const restored=await restorePreparedImport(session.directory);requireThat(restored.prepared.id===acceptedRecord,'The Import Preview Changed.');await assertSourcesUnchanged(service,restored.sources);
 const journal=new DurableJSONStorage(path.join(session.directory,'session.json'));restored.state.phase='publishing';await journal.save(restored.state);
 try{const result=await store.publishInitial(restored.prepared.files),inventory=await store.inventory(result.commit),root=`workspaces/${restored.state.workspace}`;
  const recordBytes=await store.readBlob(inventory.entries.get(restored.prepared.recordPath),DESCRIPTOR_BYTES);const hydrated=await hydrateImport({recordBytes,workspace:restored.state.workspace,expectedId:acceptedRecord,readObject:id=>store.readBlob(inventory.entries.get(`${root}/objects/${id.slice(0,2)}/${id}`))});
  for(const source of restored.sources)requireThat(hydrated.documents.get(source.name)?.equals(source.bytes),'Hydrated NPCDex Source Differs From the Original.');
  await assertSourcesUnchanged(service,restored.sources);
  const marker={format:'ROMDexNPCDexCloudSeed/1',workspace:restored.state.workspace,record:acceptedRecord,commit:result.commit,sourceHashes:restored.state.sources,summary:hydrated.summary,importedAt:new Date().toISOString(),localBackup:session.directory,automaticCloudSync:false,primarySave:'local-service'};
  await new DurableJSONStorage(markerFile).save(marker);restored.state.phase='verified';restored.state.result={commit:result.commit,exactBytes:true,automaticCloudSync:false};await journal.save(restored.state);return marker;
 }catch(error){restored.state.phase='review';restored.state.message=error.message;await journal.save(restored.state);throw error;}
}

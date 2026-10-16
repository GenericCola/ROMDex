import {gzipSync,gunzipSync} from 'node:zlib';
import {sha256,CHUNK_BYTES,DESCRIPTOR_BYTES} from './github-store.mjs';
import {STATES,indexTree,same} from '../public/core.mjs';
export const encode=x=>Buffer.from(JSON.stringify(x));
export const check=(ok,message)=>{if(!ok)throw Error(message);};
export const EMPTY={version:1,images:{},orders:{},assigned:{}};
const fields=['images','orders','assigned'],id=x=>typeof x==='string'&&/^PMON-[1-9]\d*$/.test(x),hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function validateMetadata(value){
 check(value?.version===1&&Object.keys(value).sort().join(',')==='assigned,images,orders,version','Unknown ROMDex Metadata Format.');
 for(const field of fields){const map=value[field];check(map&&typeof map==='object'&&!Array.isArray(map)&&Object.keys(map).length<=10000,'Invalid ROMDex Metadata Collection.');for(const [key,v]of Object.entries(map)){
  check(id(key)||field==='orders'&&key==='ROOT','Invalid Metadata Ticket Identity.');
  if(field==='images'){check(typeof v==='string'&&v.length<=2*1024*1024&&/^data:image\/(png|jpeg|webp|gif);base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(v),'Unsupported Tile Image.');const type=v.slice(11,v.indexOf(';')),bytes=Buffer.from(v.slice(v.indexOf(',')+1),'base64');check(type==='png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||type==='jpeg'&&bytes.subarray(0,3).equals(Buffer.from([255,216,255]))||type==='gif'&&/^GIF8[79]a$/.test(bytes.subarray(0,6).toString())||type==='webp'&&bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP','Tile Image Signature Does Not Match Its Type.');}
  if(field==='orders')check(Array.isArray(v)&&v.length<=10000&&new Set(v).size===v.length&&v.every(id)&&!v.includes(key),'Invalid Sibling Order.');
  if(field==='assigned')check(typeof v==='string'&&v.trim().length>0&&v.length<=256&&!/[\u0000-\u001f]/.test(v),'Unsupported Saved Parent Status.');
 }}check(encode(value).length<=16*1024*1024,'ROMDex Metadata Exceeds the Validated Limit.');return value;
}
export function canonical(value){validateMetadata(value);return {version:1,...Object.fromEntries(fields.map(f=>[f,Object.fromEntries(Object.keys(value[f]).sort().map(k=>[k,value[f][k]]))]))};}
export const metadataHash=value=>sha256(encode(canonical(value)));
export function delta(before,after){validateMetadata(before);validateMetadata(after);const changes=[];for(const field of fields)for(const key of [...new Set([...Object.keys(before[field]),...Object.keys(after[field])])].sort())if(!same(before[field][key],after[field][key]))changes.push({field,key,before:before[field][key]??null,after:after[field][key]??null});return changes;}
export function applyDelta(before,changes){check(Array.isArray(changes)&&changes.length<=30000,'Invalid Metadata Changes.');const result=structuredClone(before),seen=new Set();for(const c of changes){check(fields.includes(c.field)&&(id(c.key)||c.field==='orders'&&c.key==='ROOT')&&Object.keys(c).sort().join(',')==='after,before,field,key','Invalid Metadata Change.');const key=c.field+'/'+c.key;check(!seen.has(key)&&same(result[c.field][c.key],c.before),'Metadata Before-Value Changed.');seen.add(key);if(c.after===null)delete result[c.field][c.key];else result[c.field][c.key]=structuredClone(c.after);}return canonical(result);}
export function genesis(workspace){const record={format:'ROMDexMetadataGenesis/1',workspace,namespace:'romdex-metadata',actor:'32021766',parents:[],after:metadataHash(EMPTY)},bytes=encode(record);return {record,bytes,id:sha256(bytes)};}
export function makeMetadataChange({before,after,parents,base=parents[0],workspace,device,sequence,operation=crypto.randomUUID(),kind='edit',review=null}){
 const changes=delta(before,after);if(!changes.length&&kind==='edit')return null;
 const raw=encode(changes),compressed=gzipSync(raw,{level:6}),chunks=[],files=new Map();check(compressed.length<=16*1024*1024,'Metadata Payload Is Too Large.');
 for(let offset=0;offset<compressed.length;offset+=CHUNK_BYTES){const bytes=compressed.subarray(offset,offset+CHUNK_BYTES),id=sha256(bytes);chunks.push({sha256:id,bytes:bytes.length});files.set(`workspaces/${workspace}/objects/${id.slice(0,2)}/${id}`,bytes);}
 const record={format:'ROMDexMetadataChange/1',workspace,namespace:'romdex-metadata',actor:'32021766',device,sequence,operation,kind,parents:[...parents].sort(),base,before:metadataHash(before),after:metadataHash(after),...(review?{review}:{}),payload:{codec:'gzip',sha256:sha256(compressed),bytes:compressed.length,expandedSha256:sha256(raw),expandedBytes:raw.length,chunks}},bytes=encode(record);check(bytes.length<=DESCRIPTOR_BYTES,'Metadata Descriptor Is Too Large.');const id=sha256(bytes);validateMetadataChange(bytes,id,workspace);files.set(`workspaces/${workspace}/romdex-metadata/records/${id}.json`,bytes);return {id,bytes,record,files};
}
export function validateMetadataChange(bytes,recordId,workspace){
 check(bytes.length<=DESCRIPTOR_BYTES&&sha256(bytes)===recordId,'Metadata Record Integrity Failed.');const r=JSON.parse(bytes);
 check(r?.format==='ROMDexMetadataChange/1'&&r.workspace===workspace&&r.namespace==='romdex-metadata'&&r.actor==='32021766'&&['edit','merge','resolution'].includes(r.kind)&&Array.isArray(r.parents)&&r.parents.length>0&&r.parents.length<=64&&new Set(r.parents).size===r.parents.length&&r.parents.every(hash)&&hash(r.base)&&hash(r.before)&&hash(r.after)&&/^[a-f0-9-]{36}$/.test(r.device)&&/^[a-f0-9-]{36}$/.test(r.operation)&&Number.isSafeInteger(r.sequence)&&r.sequence>0,'Invalid Metadata Revision.');
 check(r.kind!=='edit'||r.parents.length===1&&r.base===r.parents[0],'Invalid Metadata Edit Base.');
 const p=r.payload;check(p?.codec==='gzip'&&hash(p.sha256)&&hash(p.expandedSha256)&&Number.isSafeInteger(p.bytes)&&p.bytes>0&&p.bytes<=16*1024*1024&&Number.isSafeInteger(p.expandedBytes)&&p.expandedBytes>0&&p.expandedBytes<=32*1024*1024&&Array.isArray(p.chunks)&&p.chunks.length<=32&&p.chunks.every(x=>hash(x.sha256)&&Number.isSafeInteger(x.bytes)&&x.bytes>0&&x.bytes<=CHUNK_BYTES)&&p.chunks.reduce((n,x)=>n+x.bytes,0)===p.bytes,'Invalid Metadata Payload.');return r;
}
export async function readMetadataChange(record,readObject){const chunks=[];for(const chunk of record.payload.chunks){const bytes=await readObject(chunk.sha256);check(bytes&&bytes.length===chunk.bytes&&sha256(bytes)===chunk.sha256,'Metadata Dependency Integrity Failed.');chunks.push(bytes);}const payload=Buffer.concat(chunks);check(sha256(payload)===record.payload.sha256,'Metadata Payload Hash Differs.');const raw=gunzipSync(payload,{maxOutputLength:32*1024*1024});check(raw.length===record.payload.expandedBytes&&sha256(raw)===record.payload.expandedSha256,'Expanded Metadata Payload Differs.');return JSON.parse(raw);}
export function captureMetadata(state,records={},known=EMPTY){
 const items=state.remote||[],valid=new Set(items.map(x=>x.id)),tree=indexTree(items),result=structuredClone(EMPTY);
 for(const [key,image]of Object.entries(state.images||{}))if(id(key))result.images[key]=image;
 const hierarchyPending=(state.operations||[]).some(op=>['create','delete'].includes(op.type)||op.patch&&'parentId'in op.patch);
 if(hierarchyPending)result.orders=structuredClone(known.orders);else for(const [parent,siblings]of tree.children){if(!siblings.some(x=>Object.hasOwn(state.order||{},x.id)))continue;result.orders[parent||'ROOT']=[...siblings].sort((a,b)=>(state.order[a.id]??Number.MAX_SAFE_INTEGER)-(state.order[b.id]??Number.MAX_SAFE_INTEGER)||a.id.localeCompare(b.id,undefined,{numeric:true})).map(x=>x.id);}
 const observed={...Object.fromEntries(items.map(item=>[item.id,{assignedState:item.assignedState??item.state,hasChildren:!!tree.children.get(item.id)?.length}])),...records};
 for(const [key,record]of Object.entries(observed))if(id(key)&&valid.has(key)&&(record.hasChildren||record.explicitAssigned||record.cloudManaged||Object.hasOwn(known.assigned,key)))result.assigned[key]=record.assignedState;
 // Missing tickets never delete saved statuses or images. Their dormant metadata remains recoverable.
 for(const [key,value]of Object.entries(known.assigned))if(!valid.has(key))result.assigned[key]=value;
 for(const operation of state.operations||[])if(operation.type==='edit'&&id(operation.issueId)&&Object.hasOwn(operation.patch,'assignedState')&&(observed[operation.issueId]?.hasChildren||Object.hasOwn(result.assigned,operation.issueId)))result.assigned[operation.issueId]=operation.patch.assignedState;
 return canonical(result);
}
export function projectOrder(document,items,current={},previous=EMPTY){
 const tree=indexTree(items,current),next={...current};for(const parent of Object.keys(previous.orders))if(!Object.hasOwn(document.orders,parent))for(const item of tree.children.get(parent==='ROOT'?null:parent)||[])delete next[item.id];for(const [parent,ids]of Object.entries(document.orders)){const siblings=tree.children.get(parent==='ROOT'?null:parent)||[],available=new Set(siblings.map(x=>x.id)),ordered=ids.filter(id=>available.has(id));for(const item of siblings)if(!ordered.includes(item.id))ordered.push(item.id);if(ordered.every((id,index)=>id===siblings[index]?.id))continue;ordered.forEach((id,index)=>next[id]=index);}return next;
}

import {randomUUID} from 'node:crypto';
import {canonical} from '../content/contracts.mjs';
import {requireRom,sha256} from './reader.mjs';
import {validateInventory} from './hgss.mjs';
import {HGSS_ADAPTER} from './profiles.mjs';
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v),id=v=>typeof v==='string'&&/^[a-z][a-z0-9:._-]{0,159}$/.test(v);
const digest=value=>{const copy={...value};delete copy.digest;return sha256(Buffer.from(canonical(copy)));};
const kinds=['area','backgrounds','overworlds','warps','triggers'];
function units(inventory,headers){
 validateInventory(inventory);const selected=new Set(headers),rows=[];
 for(const map of inventory.maps)if(selected.has(map.headerId)){
  rows.push({key:'area/'+map.headerId,kind:'area',headerId:map.headerId,evidenceSHA256:map.sha256});
  for(const kind of kinds.slice(1))for(const row of map.events[kind])rows.push({key:'area/'+map.headerId+'/'+kind+'/'+row.index,kind,headerId:map.headerId,evidenceSHA256:row.sha256});
  requireRom(rows.length<=50000,'LIMIT','Source identity inventory exceeds its bound.');
 }
 return rows;
}
export function validateIdentityManifest(value){
 requireRom(value?.format==='ROMDexROMIdentityManifest/1'&&value.adapter===HGSS_ADAPTER&&id(value.projectId)&&hash(value.sourceSHA256)&&hash(value.inventoryDigest)&&Array.isArray(value.headerIds)&&value.headerIds.length>0&&value.headerIds.length<=10000&&value.headerIds.every((n,i)=>Number.isSafeInteger(n)&&n>=0&&(i===0||n>value.headerIds[i-1]))&&Array.isArray(value.entries)&&value.entries.length<=50000&&value.digest===digest(value),'INTEGRITY','Invalid or changed ROM identity manifest.');
 const keys=new Set(),ids=new Set(),headers=new Set(value.headerIds);
 for(const e of value.entries){
  requireRom(e&&id(e.id)&&kinds.includes(e.kind)&&headers.has(e.headerId)&&hash(e.evidenceSHA256)&&typeof e.key==='string'&&new RegExp('^area/'+e.headerId+(e.kind==='area'?'$':'/'+e.kind+'/[0-9]+$')).test(e.key)&&!keys.has(e.key)&&!ids.has(e.id),'INTEGRITY','Duplicate or invalid source identity binding.');keys.add(e.key);ids.add(e.id);
 }
 requireRom(value.headerIds.every(n=>keys.has('area/'+n)),'INTEGRITY','Identity manifest omits a selected area.');return value;
}
export function previewIdentityUpdate(previous,inventory){
 validateIdentityManifest(previous);validateInventory(inventory);const current=units(inventory,previous.headerIds),before=new Map(previous.entries.map(e=>[e.key,e])),present=new Set(current.map(e=>e.key));
 if(previous.sourceSHA256===inventory.source.sha256){
  requireRom(previous.inventoryDigest===inventory.digest&&current.length===previous.entries.length&&current.every(e=>{const old=before.get(e.key);return old&&old.kind===e.kind&&old.headerId===e.headerId&&old.evidenceSHA256===e.evidenceSHA256;}),'INTEGRITY','The identity baseline differs for the same pinned ROM.');
  return {format:'ROMDexIdentityPreview/1',state:'same-source',previousDigest:previous.digest,inventoryDigest:inventory.digest,sourceSHA256:inventory.source.sha256,assignments:structuredClone(previous.entries),missing:[],requiresReview:false};
 }
 return {format:'ROMDexIdentityPreview/1',state:'needs-review',previousDigest:previous.digest,inventoryDigest:inventory.digest,sourceSHA256:inventory.source.sha256,requiresReview:true,assignments:current.map(e=>({...e,candidateId:before.get(e.key)?.id||null,evidenceUnchanged:before.get(e.key)?.evidenceSHA256===e.evidenceSHA256,reason:'Source revision changed. Matching source indices are candidates, not identity approval.'})),missing:previous.entries.filter(e=>!present.has(e.key)).map(e=>({...e,action:'retain-pending-review'}))};
}
export function createIdentityManifest(inventory,{previous=null,headerIds=null}={}){
 validateInventory(inventory);
 requireRom(headerIds===null||Array.isArray(headerIds),'INVALID','Map header scope must be an array.');
 if(previous){
  requireRom(headerIds===null||canonical(headerIds)===canonical(previous.headerIds),'REVIEW_REQUIRED','Changing the selected map scope needs identity review.');
  const preview=previewIdentityUpdate(previous,inventory);requireRom(!preview.requiresReview,'IDENTITY_REVIEW_REQUIRED','Review changed-source identity candidates before reusing or allocating identities.',{preview});return structuredClone(previous);
 }
 const selected=(headerIds===null?inventory.maps.map(m=>m.headerId):[...headerIds]).sort((a,b)=>a-b),known=new Set(inventory.maps.map(m=>m.headerId));
 requireRom(selected.length>0&&selected.every((v,i)=>Number.isSafeInteger(v)&&known.has(v)&&(i===0||v>selected[i-1])),'INVALID','Select distinct existing map headers.');
 const ambiguous=(inventory.warnings||[]).filter(w=>w.code==='DUPLICATE_LOCAL_ID'&&selected.includes(w.mapHeaderId));
 for(const map of inventory.maps.filter(m=>selected.includes(m.headerId))){const seen=new Set();for(const row of map.events.overworlds){requireRom(Number.isSafeInteger(row.localId)&&row.localId>=0&&row.localId<=65535,'INTEGRITY','Source object ID is invalid.');if(seen.has(row.localId))ambiguous.push({mapHeaderId:map.headerId,localId:row.localId});seen.add(row.localId);}}
 requireRom(!ambiguous.length,'AMBIGUOUS_IDENTITY','Selected maps contain duplicate local-object IDs. Review them before establishing identities.',{ambiguous});
 const value={format:'ROMDexROMIdentityManifest/1',adapter:HGSS_ADAPTER,projectId:'rom-project:'+randomUUID(),sourceSHA256:inventory.source.sha256,inventoryDigest:inventory.digest,headerIds:selected,entries:units(inventory,selected).map(e=>({...e,id:'rom-source:'+randomUUID()}))};
 value.digest=digest(value);return validateIdentityManifest(value);
}

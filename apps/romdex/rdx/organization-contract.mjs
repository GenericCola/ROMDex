import {ensure} from './limits.mjs';
export const ORGANIZATION_CAPABILITY='org.romdex.npcdex.organization-v1';
export const ORGANIZATION_EXTENSION='org.romdex.npcdex.organization';
export function historicalMaps(document){
 const x=document.extensions?.[ORGANIZATION_EXTENSION];if(!x)return new Set();
 ensure(document.capabilities.required.includes(ORGANIZATION_CAPABILITY)&&x.format==='ROMDexMapOrganization/1'&&Array.isArray(x.formerMaps)&&x.formerMaps.length<=64,'INVALID','Invalid Map Organization History.');
 ensure(new Set(x.formerMaps.map(m=>m.recordId)).size===x.formerMaps.length&&new Set(x.formerMaps.map(m=>m.key)).size===x.formerMaps.length,'INVALID','Duplicate Former Map History.');
 const heads=new Map(document.content.recordHeads.map(h=>[h.recordId,h.revisionId]));
 for(const m of x.formerMaps)ensure(/^[a-f0-9]{64}$/.test(m.key)&&/^[a-f0-9]{64}$/.test(m.revision)&&typeof m.recordId==='string'&&document.content.records.some(r=>r.recordId===m.recordId&&r.revisionId===heads.get(m.recordId)&&r.kind==='subzone'&&r.current.payload.mapId===document.scope.mapRecordId),'INVALID','A Former Map Must Be a Current Nested Zone.');
 return new Set(x.formerMaps.map(m=>m.recordId));
}

import {randomUUID} from 'node:crypto';
import {seal,canonical,validateArtifact} from '../content/contracts.mjs';
import {requireRom} from './reader.mjs';
import {validateInventory} from './hgss.mjs';
import {validateIdentityManifest,previewIdentityUpdate} from './identities.mjs';

// Reuses NPCDexROMMapping/1. This does not create a content record or authorize work.
export function createNativeMappingSession(inventory,manifest){
 validateInventory(inventory);validateIdentityManifest(manifest);const preview=previewIdentityUpdate(manifest,inventory);requireRom(!preview.requiresReview,'IDENTITY_REVIEW_REQUIRED','Source identities require review before creating native mappings.');
 const maps=new Map(inventory.maps.map(m=>[m.headerId,m])),prepared=new Map(),projectId=manifest.projectId,sourceSHA256=manifest.sourceSHA256;
 for(const identity of manifest.entries){
  const map=maps.get(identity.headerId),key=identity.key,row=identity.kind==='area'?null:map.events[identity.kind].find(e=>e.index===Number(key.split('/').at(-1))),locator=row?.locator||map.locator;
  requireRom(locator&&(identity.kind==='area'?map.sha256:row?.sha256)===identity.evidenceSHA256,'INTEGRITY','Source mapping evidence differs from its identity.');prepared.set(key,{id:identity.id,evidenceSHA256:identity.evidenceSHA256,locator:structuredClone(locator)});
 }
 // Pin only the selected identity/locator snapshot. Do not retain or rehash the
 // whole ROM catalog for every entity, and do not trust later caller mutation.
 return Object.freeze({mapping(key,{workspaceId,operationId='op:'+randomUUID(),createdAt=new Date().toISOString(),actorClaim='romdex:rom-reader'}={}){
  const identity=prepared.get(key);requireRom(identity,'NOT_FOUND','Source identity is not in this map scope.');const locator=identity.locator;
  const value=seal({schema:'NPCDexROMMapping/1',workspaceId,operationId,createdAt,actorClaim,mappingId:identity.id+':mapping',recordId:identity.id,source:{repositoryId:projectId,revision:'sha256:'+sourceSHA256,artifactSha256:sourceSHA256,verification:'documented'},status:'documented',locators:[structuredClone(locator)],evidence:[{label:'Read-only ROM source selection; not human gameplay verification',sourceId:key,excerpt:'Exact selected-byte SHA-256: '+identity.evidenceSHA256,locator:locator.path+'#'+key}]});
  return validateArtifact(Buffer.from(canonical(value)),workspaceId);
 }});
}
export function nativeMapping(inventory,manifest,key,metadata){return createNativeMappingSession(inventory,manifest).mapping(key,metadata);}

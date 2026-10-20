import {canonical,seal,sha,parseJSON} from '../content/contracts.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {mapDomain,previewMapImport,retainDocument} from '../rdx/map-import.mjs';
import {validateIdentityManifest} from './identities.mjs';
import {requireRom} from './reader.mjs';

// The portable file carries its own lineage. No user-managed sidecar is needed.
export function recoverSourceIdentities(value){
 const source=value.document.extensions?.['org.romdex.rom-source'];
 const entry=value.document.assetInventory.find(a=>a.assetId===source?.sourceAsset);
 requireRom(entry&&value.blobs.has(entry.sha256),'INTEGRITY','This Map Has No Recoverable ROM Source Index.');
 const index=parseJSON(value.blobs.get(entry.sha256));
 requireRom(index.format==='ROMDexExtractionIndex/1'&&index.extractionDigest===source.extractionDigest,'INTEGRITY','The ROM Source Index Differs.');
 const identities=validateIdentityManifest(index.header.identities);
 requireRom(identities.projectId===source.projectId&&identities.sourceSHA256===source.sourceSHA256,'INTEGRITY','The Portable ROM Identity Lineage Differs.');
 return identities;
}

export function recoverSourceScope(value){const source=value.document.extensions?.['org.romdex.rom-source'],entry=value.document.assetInventory.find(a=>a.assetId===source?.sourceAsset);requireRom(entry&&value.blobs.has(entry.sha256),'INTEGRITY','Missing Source Scope.');return structuredClone(parseJSON(value.blobs.get(entry.sha256)).header.testbed);}

export function selectPreparedAreas(value,headers){
 const identities=recoverSourceIdentities(value),selected=[...headers].sort((a,b)=>a-b);
 requireRom(selected.length&&new Set(selected).size===selected.length&&selected.every(h=>identities.headerIds.includes(h)),'INVALID','Choose Distinct Areas in the Reviewed Map.');
 const d=structuredClone(value.document),records=mapDomain(value).records,map=records.find(r=>r.kind==='map');
 const zones=records.filter(r=>r.kind==='subzone'&&selected.includes(r.legacyData?.romExtraction?.headerId)),keep=new Set([map.recordId,...zones.map(r=>r.recordId)]);
 let more=true;while(more){more=false;for(const r of records)if(r.kind!=='subzone'&&r.parentRecordId&&keep.has(r.parentRecordId)&&!keep.has(r.recordId)){keep.add(r.recordId);more=true;}}
 const profiles=new Set(records.filter(r=>keep.has(r.recordId)&&r.kind==='appearance').flatMap(r=>[r.current.payload.profileId,...Object.values(r.current.payload.profileByPlayerGender||{})]).filter(Boolean));
 for(const r of records)if(['region','shared'].includes(r.kind)||profiles.has(r.recordId))keep.add(r.recordId);
 const chosen=records.filter(r=>keep.has(r.recordId)).map(r=>{const n=structuredClone(r),p=n.current.payload;
  if(n.kind==='map'){p.subzoneIds=p.subzoneIds.filter(id=>keep.has(id));n.legacyData.romExtraction.testOnly=false;}
  if(n.kind==='subzone')for(const key of ['appearanceIds','interactiveIds','sceneIds'])p[key]=p[key].filter(id=>keep.has(id));
  return seal(n);
 });
 d.content.records=chosen;d.content.recordHeads=chosen.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));
 const refs=new Set(chosen.flatMap(r=>r.mappingRefs));d.content.mappings=d.content.mappings.filter(m=>refs.has(m.digest));
 d.scope.ownedRecordIds=d.scope.ownedRecordIds.filter(id=>keep.has(id));d.scope.contextRecordIds=d.scope.contextRecordIds.filter(id=>keep.has(id));
 d.extensions['org.romdex.rom-source'].testOnly=false;
 d.extensions['org.romdex.import-preparation']={format:'ROMDexImportPreparation/1',selectedHeaderIds:selected,sourceArchiveHeaderIds:identities.headerIds,sourceReadOnly:true,requiresHumanTesting:true};
 d.revision=documentRevision(d);const documentBytes=Buffer.from(canonical(d));validateDocument(documentBytes,{blobs:value.blobs});return {...value,document:d,documentBytes};
}

export function preparationToken(value){return sha(canonical({revision:value.document.revision,source:value.document.extensions?.['org.romdex.rom-source']}));}

export function mergePreparation(incoming,local){
 requireRom(recoverSourceIdentities(incoming).digest===recoverSourceIdentities(local).digest,'REVIEW_REQUIRED','Changed ROM Source Identities Need Review Before Repreparation.');
 incoming={...incoming,document:structuredClone(incoming.document),blobs:new Map([...incoming.blobs,...local.blobs])};
 const priorMap=mapDomain(local).records.find(r=>r.kind==='map'),sourceMap=mapDomain(incoming).records.find(r=>r.kind==='map');
 if(canonical(priorMap.current.payload.subzoneIds)!==canonical(sourceMap.current.payload.subzoneIds)){
  // An explicit staging-area selection is a local membership edit. It is not
  // an unrelated source root and must not overwrite a renamed map or notes.
  const changedMap=seal({...priorMap,operationId:'content:prepare-membership-'+sha(canonical(sourceMap.current.payload.subzoneIds)).slice(0,32),parents:[priorMap.revisionId],current:{...priorMap.current,payload:{...priorMap.current.payload,subzoneIds:sourceMap.current.payload.subzoneIds}}});
  for(const a of local.document.assetInventory)if(!incoming.document.assetInventory.some(b=>b.assetId===a.assetId))incoming.document.assetInventory.push(a);
  incoming.document.content.history=[...new Map([...incoming.document.content.history,...local.document.content.history].map(h=>[h.sha256,h])).values()];retainDocument(incoming.document,incoming.blobs,local);
  incoming.document.content.records.push(changedMap);incoming.document.content.recordHeads=incoming.document.content.recordHeads.map(h=>h.recordId===changedMap.recordId?{recordId:h.recordId,revisionId:changedMap.revisionId}:h);incoming.document.revision=documentRevision(incoming.document);incoming.documentBytes=Buffer.from(canonical(incoming.document));
 }
 const id='org.romdex.import-preparation',changed=canonical(incoming.document.extensions[id])!==canonical(local.document.extensions[id]);
 const merged=previewMapImport(incoming,local,{choices:changed?{['extensions:'+id]:'incoming'}:{}});
 requireRom(!merged.preview.conflicts.some(c=>!c.choice),'REVIEW_REQUIRED','Reprepared Content Conflicts With Saved Preparation. The Previous Map Is Preserved.');
 const allowed=new Set(incoming.document.content.recordHeads.map(r=>r.recordId)),domain=mapDomain(merged);
 requireRom(![...domain.plans,...domain.reviews].some(a=>!allowed.has(a.target.recordId)),'REVIEW_REQUIRED','An Excluded Area Has Local Plans or Notes. Include It or Review Those Edits Before Repreparing.');
 const d=merged.document,c=d.content,heads=domain.records.filter(r=>allowed.has(r.recordId)).map(r=>{const next=structuredClone(r);let changed=false;for(const field of ['subzoneIds','appearanceIds','interactiveIds','sceneIds'])if(Array.isArray(next.current.payload[field])){const selected=next.current.payload[field].filter(id=>allowed.has(id));if(selected.length!==next.current.payload[field].length){next.current.payload[field]=selected;changed=true;}}if(!changed)return r;next.parents=[r.revisionId];next.operationId='content:import-scope-'+sha(canonical(next.current)).slice(0,32);return seal(next);});
 c.records=[...new Map([...c.records,...heads].map(r=>[r.revisionId,r])).values()];c.recordHeads=heads.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));c.views=c.views.filter(v=>allowed.has(v.recordId));d.scope.ownedRecordIds=d.scope.ownedRecordIds.filter(id=>allowed.has(id));d.scope.contextRecordIds=d.scope.contextRecordIds.filter(id=>allowed.has(id));d.revision=documentRevision(d);const documentBytes=Buffer.from(canonical(d));validateDocument(documentBytes,{blobs:merged.blobs});return {...merged,documentBytes};
}

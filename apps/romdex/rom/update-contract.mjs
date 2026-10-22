import {canonical,parseJSON,sha,verifyDigest} from '../content/contracts.mjs';
import {verifiedJSON} from '../rdx/verified-json.mjs';
import {validateIdentityManifest} from './identities.mjs';
import {requireRom} from './reader.mjs';

export const UPDATE_EXTENSION='org.romdex.cross-build';
export const UPDATE_CAPABILITY='org.romdex.npcdex.cross-build-v1';
export function validateUpdateMetadata(doc,blobs){
 const x=doc.extensions?.[UPDATE_EXTENSION];if(!x)return null;
 requireRom(doc.capabilities.required.includes(UPDATE_CAPABILITY)&&x.format==='ROMDexReviewedROMUpdate/1'&&/^rom-project:[a-f0-9-]{36}$/.test(x.romProjectId)&&/^[a-f0-9]{64}$/.test(x.baseline)&&Array.isArray(x.builds)&&x.builds.every(h=>/^[a-f0-9]{64}$/.test(h)),'INTEGRITY','Invalid Reviewed ROM Update Metadata.');
 requireRom(/^[a-f0-9]{64}$/.test(x.reviewToken)&&(x.catalogGroupId===null||typeof x.catalogGroupId==='string')&&Array.isArray(x.protectedProfileIds)&&x.protectedProfileIds.every(id=>doc.content.records.some(r=>r.recordId===id&&r.kind==='profile')),'INTEGRITY','Invalid Reviewed ROM Project or Profile Bindings.');
 const source=doc.extensions['org.romdex.rom-source'],manifest=validateIdentityManifest(x.identities),asset=doc.assetInventory.find(a=>a.assetId===source?.sourceAsset),index=asset&&parseJSON(blobs.get(asset.sha256));
 requireRom(index?.format==='ROMDexExtractionIndex/1'&&index.extractionDigest===source.extractionDigest&&manifest.projectId===source.projectId&&manifest.sourceSHA256===source.sourceSHA256&&manifest.inventoryDigest===source.inventoryDigest,'INTEGRITY','Reviewed Source Identity Metadata Differs.');
 const original=validateIdentityManifest(index.header.identities),byKey=new Map(original.entries.map(e=>[e.key,e]));
 requireRom(original.sourceSHA256===manifest.sourceSHA256&&original.inventoryDigest===manifest.inventoryDigest&&canonical(original.headerIds)===canonical(manifest.headerIds)&&original.entries.length===manifest.entries.length&&manifest.entries.every(e=>{const o=byKey.get(e.key);return o&&o.kind===e.kind&&o.headerId===e.headerId&&o.evidenceSHA256===e.evidenceSHA256;}),'INTEGRITY','Reviewed Bindings Do Not Match the Extracted Source Evidence.');
 const base=doc.assetInventory.find(a=>a.assetId===x.sourceBaselineAsset),body=base&&parseJSON(blobs.get(base.sha256));
 requireRom(body?.format==='ROMDexSourceBaseline/1'&&Array.isArray(body.heads),'INTEGRITY','Missing Reviewed ROM Source Baseline.');
 // Later local edits and normal factoring move former heads into exact history.
 // They remain valid baseline evidence, not current heads or a weaker fallback.
 const pins=new Set(doc.content.records.map(r=>r.recordId+':'+r.revisionId)),missing=()=>body.heads.some(h=>!pins.has(h.recordId+':'+h.revisionId));
 if(missing())for(const a of doc.assetInventory.filter(a=>a.purpose==='history')){
  const old=verifiedJSON(blobs.get(a.sha256),a.sha256).value,records=old.format==='RDXDocument/1'&&old.datasetId===doc.datasetId?old.content.records||[]:old.schema==='NPCDexContentRevision/1'?[old]:[];
  for(const record of records)if(body.heads.some(h=>h.recordId===record.recordId&&h.revisionId===record.revisionId)){requireRom(record.workspaceId===doc.datasetId,'INTEGRITY','Reviewed Source Baseline Workspace Differs.');verifyDigest(record);pins.add(record.recordId+':'+record.revisionId);}
  if(!missing())break;
 }
 requireRom(!missing(),'INTEGRITY','Missing Reviewed ROM Source Baseline.');
 const oldAsset=doc.assetInventory.find(a=>a.assetId===x.baselineDocumentAsset&&a.purpose==='history'),old=oldAsset&&parseJSON(blobs.get(oldAsset.sha256));requireRom(old?.format==='RDXDocument/1'&&old.revision===x.baseline&&old.datasetId===doc.datasetId&&old.documentId===doc.documentId&&old.scope.mapRecordId===doc.scope.mapRecordId,'INTEGRITY','Missing Exact Reviewed Map Baseline.');
 return x;
}
export function sealIdentities(value){const copy={...value};delete copy.digest;return {...copy,digest:sha(canonical(copy))};}

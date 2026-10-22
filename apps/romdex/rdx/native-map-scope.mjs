// A portable map contains one map and referenced dependencies. Catalog-wide
// recovery exports and presentation archives stay in protected application Data.
import {canonical,sha} from '../content/contracts.mjs';import {viewHeads} from '../content/view-contract.mjs';import {ensure} from './limits.mjs';
const contextKinds=new Set(['region','profile','shared']);
function strings(value,visit){if(typeof value==='string')visit(value);else if(Array.isArray(value))for(const x of value)strings(x,visit);else if(value&&typeof value==='object')for(const x of Object.values(value))strings(x,visit);}
const subset=(object,predicate)=>Object.fromEntries(Object.entries(object||{}).filter(([k,v])=>predicate(k,v)));
export function scopeNativeMap(domain,mapRecordId){
 const byId=new Map(domain.records.map(r=>[r.recordId,r])),map=byId.get(mapRecordId);ensure(map?.kind==='map','INVALID','Select a Native Map.');
 const owned=new Set([mapRecordId]);let grew=true;while(grew){grew=false;for(const r of domain.records)if(owned.has(r.parentRecordId)&&!owned.has(r.recordId)){ensure(r.kind!=='map','INVALID','Nested Maps Are Not Portable.');owned.add(r.recordId);grew=true;}}
 const selected=new Set(owned),needed=[];for(const r of domain.revisions.filter(r=>owned.has(r.recordId)))needed.push(r.current);
 for(const a of [...domain.plans,...domain.reviews].filter(a=>owned.has(a.target.recordId)))needed.push(a.baseline,...a.readSet||[]);
 for(let i=0;i<needed.length;i++)strings(needed[i],id=>{const r=byId.get(id);if(!r||selected.has(id))return;ensure(contextKinds.has(r.kind),'REVIEW_REQUIRED','A Cross-Map Entity Dependency Needs Explicit Review: '+id);ensure(!r.current.payload.definitions?.migration,'REVIEW_REQUIRED','A Map Cannot Depend on a Whole-Catalog Recovery Export.');selected.add(id);needed.push(r.current);});
 const records=domain.records.filter(r=>selected.has(r.recordId)),revisions=domain.revisions.filter(r=>selected.has(r.recordId)),plans=domain.plans.filter(a=>selected.has(a.target.recordId)),reviews=domain.reviews.filter(a=>selected.has(a.target.recordId)),mappings=domain.mappings.filter(a=>selected.has(a.recordId));
 for(const a of [...plans,...reviews])for(const ref of [a.baseline,...a.readSet||[]])ensure(selected.has(ref.recordId),'REVIEW_REQUIRED','A Map Proposal Reads Content Outside Its Portable Scope.');
 const sourceViews=(domain.views||[]).filter(v=>v.recordId===null||selected.has(v.recordId)),root=viewHeads(sourceViews).find(v=>v.recordId===null);ensure(root,'INVALID','Native Root Metadata Is Missing.');
 const mapView=viewHeads(sourceViews).find(v=>v.recordId===mapRecordId),townId=mapView?.payload.fields?.id||mapRecordId,fields=root.payload.fields;
 const reviewIds=new Set(reviews.map(r=>r.reviewId)),reviewBindings=root.payload.reviewBindings.filter(b=>reviewIds.has(b.reviewId)),annotationKeys=new Set(reviewBindings.map(b=>b.legacyKey));
 const identityKeys=new Set(records.filter(r=>r.kind==='profile').map(r=>r.legacyData.identityKey).filter(Boolean));for(const v of sourceViews)if(v.payload.identityKey)identityKeys.add(v.payload.identityKey);
 const targetHere=value=>value?.townId===townId||value?.mapRecordId===mapRecordId||value?.recordId&&selected.has(value.recordId);
 const annotations=subset(fields.annotations,k=>annotationKeys.has(k)),changePlans=subset(fields.changePlans,(k,v)=>targetHere(v.target)),characterImages=subset(fields.characterImages,k=>identityKeys.has(k)),characterNames=subset(fields.characterNames,k=>identityKeys.has(k));
 const collectionIds=new Set(domain.records.filter(r=>r.kind==='map'||r.kind==='shared'&&r.current.payload.sharedType==='global-dialogue').map(r=>viewHeads(domain.views||[]).find(v=>v.recordId===r.recordId)?.payload.fields?.id||r.recordId));
 function valueHere(v){if(Array.isArray(v)){if(v.some(x=>x&&typeof x==='object'&&Array.isArray(x.areas)&&Array.isArray(x.characters)))return v.filter(x=>x?.id===townId).map(valueHere);return v.map(valueHere).filter(x=>x!==undefined);}if(v&&typeof v==='object'){if(v.townId&&collectionIds.has(v.townId)&&v.townId!==townId)return undefined;if(Array.isArray(v.areas)&&Array.isArray(v.characters)&&v.id&&collectionIds.has(v.id)&&v.id!==townId)return undefined;return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,valueHere(x)]).filter(([,x])=>x!==undefined));}return v;}
 function patchHere(p){const parts=p.path.split('/').slice(1).map(x=>x.replace(/~1/g,'/').replace(/~0/g,'~'));let rootKey=parts[0];if(rootKey==='annotations'&&parts[1]&&!annotationKeys.has(parts[1]))return null;if(rootKey==='changePlans'&&parts[1]&&!Object.hasOwn(changePlans,parts[1]))return null;if(['characterImages','characterNames'].includes(rootKey)&&parts[1]&&!identityKeys.has(parts[1]))return null;
  const patch=structuredClone(p);if(rootKey==='towns'&&parts.length>1)patch.path='/towns/0'+p.path.replace(/^\/towns\/[^/]+/,'');
  for(const side of ['before','after'])if(patch[side]?.exists){let value=valueHere(patch[side].value);if(parts.length===1&&['characterImages','characterNames'].includes(rootKey))value=subset(value,k=>identityKeys.has(k));if(parts.length===1&&rootKey==='annotations')value=subset(value,k=>annotationKeys.has(k));if(parts.length===1&&rootKey==='changePlans')value=subset(value,(k,v)=>targetHere(v.target));if(value===undefined)return null;patch[side].value=value;}return patch;}
 const history=[];for(const entry of fields.history||[]){if(entry.target?.townId&&entry.target.townId!==townId)continue;const sharedPatch=entry.patches?.some(p=>['characterImages','characterNames'].some(k=>p.path.startsWith('/'+k+'/')&&identityKeys.has(p.path.split('/')[2])));if(!targetHere(entry.target)&&!annotationKeys.has(entry.annotationKey)&&!sharedPatch)continue;const patches=entry.patches.map(patchHere).filter(Boolean);if(patches.length)history.push({...structuredClone(entry),patches});}
 const ownedStrings=new Set();for(const r of [...records,...sourceViews.filter(v=>v.recordId!==null)])strings(r,v=>ownedStrings.add(v));
 const portableFields={version:2,revision:fields.revision||0,annotations,changePlans,history,characterImages,characterNames,preferences:structuredClone(fields.preferences||{gender:'male'}),implementationReceipts:(fields.implementationReceipts||[]).filter(targetHere),legacyChangePlans:subset(fields.legacyChangePlans,(k,v)=>targetHere(v.target)),liveMappings:subset(fields.liveMappings,k=>ownedStrings.has(k)),decisionConflicts:subset(fields.decisionConflicts,(k,v)=>targetHere(v.target)||annotationKeys.has(v.promptKey)),romReversalResolutions:subset(fields.romReversalResolutions,k=>history.some(h=>h.id===k)),promptStatusUnset:subset(fields.promptStatusUnset,k=>k.startsWith(townId+'|'))};
 for(const k of ['contentRevision','savedAt','annotationFormat','changeFormat','interfaceBuild','standardNotesSuite'])if(fields[k]!==undefined)portableFields[k]=structuredClone(fields[k]);
 portableFields.index=subset(fields.index,(k,v)=>ownedStrings.has(k)||targetHere(v));
 const payload={fields:portableFields,collectionOrder:[mapRecordId],reviewBindings};
 const assetIds=new Set(),inventory=new Map(domain.assets.map(a=>[a.assetId,a]));strings([records,revisions,plans,reviews,mappings,sourceViews.filter(v=>v.recordId!==null),payload],s=>{if(inventory.has(s))assetIds.add(s);});
 const assets=domain.assets.filter(a=>assetIds.has(a.assetId));
 const contentSHA256=sha(canonical({records,revisions,plans,reviews,mappings,views:sourceViews.filter(v=>v.recordId!==null),payload,assets}));
 return {map,townId,owned,selected,records,revisions,plans,reviews,mappings,sourceViews,root,payload,assets,contentSHA256};
}

export function assertOneMapPayload(document,blobs,otherTownIds=[]){
 const map=document.scope.mapRecordId,foreign=new Set(otherTownIds);let foreignPayload=false;
 const inspect=v=>{if(!v||typeof v!=='object')return;if(v.schema==='NPCDexContentRevision/1'&&v.kind==='map'&&v.recordId!==map)foreignPayload=true;if(Array.isArray(v.towns)&&v.towns.some(t=>foreign.has(t?.id)))foreignPayload=true;if(v.id&&foreign.has(v.id)&&Array.isArray(v.areas)&&Array.isArray(v.characters))foreignPayload=true;for(const x of Object.values(v))if(x&&typeof x==='object')inspect(x);};inspect(document);
 for(const a of document.assetInventory)if(a.mime==='application/json'){const value=JSON.parse(blobs.get(a.sha256));inspect(value);}
 ensure(!foreignPayload,'INVALID','A Portable Map Contains Another Map Payload.');return true;
}

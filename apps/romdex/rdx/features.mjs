import '../content/condition-core.js';
import {previewViews,validateLocationPreview} from '../content/location-previews.mjs';
import {canonical,sha,requireThat} from '../content/contracts.mjs';
import {validateFeatureShape} from './schema.mjs';
export const CONDITION_CAPABILITY='org.romdex.npcdex.condition-effects-v1';
export const PREVIEW_CAPABILITY='org.romdex.npcdex.location-previews-v1';
export const FEATURE_EXTENSION='org.romdex.npcdex.features';
export const locatorKey=locator=>'locator:'+sha(canonical(locator)).slice(0,40);
export const conditionIndex=records=>records.find(r=>r.kind==='shared'&&r.current.payload.definitions?.conditionIndex)?.current.payload.definitions.conditionIndex||null;
export function validateMapFeatures(doc,records,mappings){
 const byId=new Map(records.map(r=>[r.recordId,r])),indexes=records.filter(r=>r.kind==='shared'&&r.current.payload.definitions?.conditionIndex),bindings=doc.extensions?.[FEATURE_EXTENSION],required=doc.capabilities.required;
 if(bindings)validateFeatureShape(bindings,'featureBindings');
 const previews=previewViews(doc.content.views);requireThat(!previews.length&&!required.includes(PREVIEW_CAPABILITY)||previews.length&&bindings&&required.includes(PREVIEW_CAPABILITY),'Location Previews Need a Required Feature Binding and Explicit Coverage.');
 requireThat(canonical(previews.map(v=>v.viewId).sort())===canonical([...(bindings?.locationPreviewViewIds||[])].sort()),'Location Preview Bindings Differ from Active Views.');
 for(const v of previews){const p=validateLocationPreview(v.payload.locationPreviews,records,doc.assetInventory);requireThat(v.recordId===p.targetRecordId,'Location Preview View Target Differs.');for(const c of p.candidates)if(c.origin==='generated'){const locators=new Map(mappings.filter(m=>m.source.artifactSha256===c.sourceRomSha256).flatMap(m=>m.locators).map(l=>[locatorKey(l),l]));for(const dep of c.dependencies)requireThat(locators.get(dep.locatorKey)?.selectors.selectionSHA256===dep.sha256,'Location Preview Resource Evidence Is Missing or Changed.');}}

 if(!indexes.length){requireThat(!required.includes(CONDITION_CAPABILITY)&&!bindings?.conditionIndexRecordId,'Missing Required Condition Index.');return;}
 requireThat(indexes.length===1&&required.includes(CONDITION_CAPABILITY)&&bindings,'Condition Data Needs One Required Feature Binding.');validateFeatureShape(bindings,'featureBindings');
 const record=indexes[0],index=record.current.payload.definitions.conditionIndex,map=byId.get(doc.scope.mapRecordId);
 requireThat(bindings.conditionIndexRecordId===record.recordId&&map.current.payload.timelineRef===record.recordId&&index.mapRecordId===map.recordId,'Condition Index Map Binding Differs.');
 validateFeatureShape(index,'conditionIndex');
 const source=doc.extensions?.['org.romdex.rom-source'];if(source)requireThat(index.sourceRomSha256===source.sourceSHA256,'Condition Evidence Comes From Another ROM Build.');
 const mapSet=new Set([map.recordId,...map.current.payload.subzoneIds,...records.filter(r=>['appearance','interactive','scene'].includes(r.kind)).map(r=>r.recordId)]),ids=new Set(index.conditions.map(c=>c.id));
 requireThat(ids.size===index.conditions.length&&new Set(index.effects.map(e=>e.id)).size===index.effects.length,'Duplicate Condition or Effect Identity.');
 requireThat(canonical([...ids].sort())===canonical([...index.displayOrder].sort()),'Condition Display Order Must Preserve Every Identity.');
 const sources=new Map(mappings.map(m=>[m.digest,{source:m.source,keys:new Set(m.locators.map(locatorKey))}]));
 function sourceRefs(refs){requireThat(refs.length>0,'Condition Evidence Is Required.');for(const ref of refs){const m=sources.get(ref.mappingDigest);requireThat(m&&m.source.artifactSha256===index.sourceRomSha256&&m.keys.has(ref.locatorKey),'Condition Source Locator Is Missing or Changed.');}}
 function expr(v,depth=0){requireThat(depth<60,'Condition Expression Exceeds Its Bound.');if(v.op==='unknown')sourceRefs(v.sourceRefs);if(v.op==='not')expr(v.arg,depth+1);if(['all','any'].includes(v.op))v.args.forEach(a=>expr(a,depth+1));}
 for(const c of index.conditions){sourceRefs(c.sourceRefs);expr(c.expression);requireThat(index.effects.some(e=>e.conditionIds.includes(c.id)),'An Unrelated Condition Has No Local Effect.');}
 for(const e of index.effects){const r=byId.get(e.target.recordId),p=r?.current.payload.points?.[e.target.pointId];requireThat(mapSet.has(e.target.recordId),'Condition Effect References Another Map.');requireThat(!e.target.pointId||p,'Condition Effect Point Is Missing.');for(const id of e.target.blockIds)requireThat(p?.blocks[id],'Condition Effect Block Is Missing.');requireThat(e.conditionIds.every(id=>ids.has(id)),'Condition Effect References Unknown Conditions.');sourceRefs(e.sourceRefs);expr(e.requires);}
 const covered=new Set();for(const c of index.coverage){requireThat(mapSet.has(c.recordId)&&!covered.has(c.recordId),'Duplicate or Foreign Condition Coverage.');covered.add(c.recordId);requireThat(c.status==='complete'||c.reason.trim(),'Unresolved Coverage Needs an Explanation.');sourceRefs(c.sourceRefs);}
 for(const r of records.filter(r=>['appearance','interactive','scene'].includes(r.kind)))requireThat(covered.has(r.recordId),'Content Has No Condition Coverage Record.');
}

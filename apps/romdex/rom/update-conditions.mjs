import {canonical,seal,sha} from '../content/contracts.mjs';
import {previewViews} from '../content/location-previews.mjs';
import {locatorKey,FEATURE_EXTENSION} from '../rdx/features.mjs';

export function rebindConditionSources(record,original,mapped,ids){
 const index=record.current.payload.definitions?.conditionIndex;if(!index)return record;
 const refs=new Map(original.map((m,i)=>[m.digest,{digest:mapped[i].digest,locators:new Map(m.locators.map((l,n)=>[locatorKey(l),locatorKey(mapped[i].locators[n])]))}]));
 function visit(value){if(!value||typeof value!=='object')return;if(typeof value.mappingDigest==='string'){const ref=refs.get(value.mappingDigest);if(ref){value.mappingDigest=ref.digest;value.locatorKey=ref.locators.get(value.locatorKey)||value.locatorKey;}}for(const v of Object.values(value))visit(v);}
 visit(index);for(const e of index.effects)if(e.target.promptKey?.startsWith('prompt:'))e.target.promptKey='prompt:'+(ids.get(e.target.promptKey.slice(7))||e.target.promptKey.slice(7));return record;
}

// A new source replaces its condition graph, while old source text remains an
// explicitly unresolved reference. It must never inherit old-build access rules.
export function finishUpdatedConditions(heads,oldTimeline){
 const timeline=[...heads.values()].find(r=>r.current.payload.definitions?.conditionIndex);if(!timeline)return;
 const def=timeline.current.payload.definitions,index=def.conditionIndex,previous=oldTimeline?.current.payload.definitions?.conditionIndex;
 const remap=new Map(),oldByExpression=new Map((previous?.conditions||[]).filter(c=>!globalThis.romdexConditions.hasUnknown(c.expression)).map(c=>[canonical(c.expression),c]));
 for(const c of index.conditions){const old=oldByExpression.get(canonical(c.expression));if(old){remap.set(c.id,old.id);c.id=old.id;if(old.labelOrigin==='owner'){c.label=old.label;c.labelOrigin='owner';}}}
 const id=v=>remap.get(v)||v;index.displayOrder=index.displayOrder.map(id);for(const e of index.effects)e.conditionIds=e.conditionIds.map(id);
 if(previous){const ids=new Set(index.displayOrder);index.displayOrder=[...previous.displayOrder.filter(id=>ids.has(id)),...index.displayOrder.filter(id=>!previous.displayOrder.includes(id))];}
 def.stages=globalThis.romdexConditions.stages(index);const known=new Set(def.stages.map(s=>s.id)),covered=new Set(index.coverage.map(c=>c.recordId)),fallback=index.coverage[0]?.sourceRefs||index.effects[0]?.sourceRefs||[];
 for(const r of heads.values()){
  if(['appearance','interactive','scene'].includes(r.kind)&&!covered.has(r.recordId))index.coverage.push({recordId:r.recordId,status:'partial',reason:'Retained older-build content has no confirmed current-build association. Inspect its original mapping before using it.',sourceRefs:structuredClone(fallback)});
  for(const p of Object.values(r.current.payload.points||{})){p.stageIds=p.stageIds.map(id).filter(v=>known.has(v));p.legacyData.conditionModel=true;}
 }
}

export function updateFeatureBinding(document,incoming,ids){
 const binding=incoming.extensions?.[FEATURE_EXTENSION];if(binding)document.extensions[FEATURE_EXTENSION]={...structuredClone(binding),conditionIndexRecordId:ids.get(binding.conditionIndexRecordId)||binding.conditionIndexRecordId,locationPreviewViewIds:previewViews(document.content.views).map(v=>v.viewId)};
}

export function updateLocationFeatures(document,incoming,ids,heads,rewrite,original,mapped){
 const final=new Map(heads.map(r=>[r.recordId,r])),prior=new Map(previewViews(document.content.views).map(v=>[v.recordId,v])),keys=new Map(original.flatMap((m,i)=>m.locators.map((l,n)=>[locatorKey(l),locatorKey(mapped[i].locators[n])])));
 for(const v of previewViews(incoming.content.views)){const target=ids.get(v.recordId)||v.recordId;if(!final.has(target))continue;const old=prior.get(target),p=rewrite(v.payload.locationPreviews,ids);for(const c of p.candidates)for(const dep of c.dependencies)dep.locatorKey=keys.get(dep.locatorKey)||dep.locatorKey;const selected=old?.payload.locationPreviews.ownerOverride?structuredClone(old.payload.locationPreviews):p;const next=seal({...v,workspaceId:document.datasetId,viewId:'view:'+target,recordId:target,operationId:'content:updated-location-'+sha(canonical({target,baseline:old?.digest||null,payload:selected})).slice(0,40),actorClaim:'romdex:reviewed-update',parents:old?[old.digest]:[],source:{sha256:selected.candidates.find(c=>c.id===selected.selectedCandidateId)?.sourceRomSha256||old?.source.sha256||v.source.sha256,recordRevision:final.get(target).revisionId},payload:{...(old?.payload||{}),locationPreviews:selected}});document.content.views.push(next);}
}

import {canonical,seal,sha} from '../content/contracts.mjs';
import {CONDITION_CAPABILITY,FEATURE_EXTENSION,locatorKey} from '../rdx/features.mjs';
import {requireRom} from './reader.mjs';
import {sourceEventLabel} from './event-labels.mjs';

export function compileConditions({extraction:x,records,mappings,id,base,mapId,timelineId,sites,points}){
 const a=x.conditionAnalysis;if(!a)return null;
 const timeline=records.find(r=>r.recordId===timelineId),byId=new Map(records.map(r=>[r.recordId,r])),fallback=x.areas[0].locator;
 const locators=new Map(),sourceKeys=new Map(),eventLabels=new Map(a.conditions.map(c=>[c.id,sourceEventLabel(x,c)]));
 for(const [sourceId,evidence]of Object.entries(a.evidence)){const locator=evidence.locator||fallback;requireRom(locator,'INVALID_REFERENCE','Condition Evidence Has No Source Locator.');const key=locatorKey(locator);locators.set(key,locator);sourceKeys.set(sourceId,key);}
 for(const label of eventLabels.values())for(const locator of label?.locators||[])locators.set(locatorKey(locator),locator);
 if(!locators.size)locators.set(locatorKey(fallback),fallback);
 const mapping=seal({schema:'NPCDexROMMapping/1',...base,operationId:id('condition-mapping-operation'),mappingId:id('condition-mapping'),recordId:timelineId,source:{repositoryId:x.identities.projectId,revision:'sha256:'+x.source.sha256,artifactSha256:x.source.sha256,verification:'documented'},status:'documented',locators:[...locators.values()],evidence:[{label:'Source-pinned map condition branches and call contexts; not in-game verification',sourceId:x.testbed.key,excerpt:'Condition extraction '+a.digest,locator:null}]});
 mappings.push(mapping);timeline.mappingRefs.push(mapping.digest);
 const refs=values=>[...new Map(values.map(v=>{const key=sourceKeys.get(v);requireRom(key,'INVALID_REFERENCE','Condition Source Evidence Is Missing.');return[key,{mappingDigest:mapping.digest,locatorKey:key}];})).values()];
 const expr=v=>v.op==='unknown'?{...v,sourceRefs:refs(v.sourceRefs)}:v.op==='not'?{...v,arg:expr(v.arg)}:['all','any'].includes(v.op)?{...v,args:v.args.map(expr)}:structuredClone(v);
 const effects=[];
 for(const e of a.effects){
  const root=points.get(e.rootKey),site=sites.get(canonical([e.rootKey,e.flow,e.offset,e.messageIndex])),recordId=e.sourceId||root?.owner;
  requireRom(byId.has(recordId),'INVALID_REFERENCE','A Bound Condition Effect Has No Compiled Target.');
  const dialogue=e.kind==='dialogue';requireRom(!dialogue||site,'INVALID_REFERENCE','A Dialogue Branch Has No Compiled Block.');
  const pointId=dialogue?site.pointId:e.kind==='presence'?null:root?.pointId||null;
  effects.push({id:e.id,kind:e.kind,target:{recordId,pointId,blockIds:dialogue?[site.blockId]:[],promptKey:dialogue?'prompt:'+site.blockId:null,gender:dialogue?site.gender:'both'},variantId:id('condition-variant',e.id),requires:expr(e.requires),conditionIds:e.conditionIds,sourceRefs:refs(e.sourceRefs)});
 }
 const used=new Set(effects.flatMap(e=>e.conditionIds)),conditions=a.conditions.filter(c=>used.has(c.id)).map(c=>{const label=eventLabels.get(c.id);return {...c,...(label?{label:label.label,labelOrigin:'source'}:{}),expression:expr(c.expression),sourceRefs:[...refs(c.sourceRefs),...(label?.locators||[]).map(l=>({mappingDigest:mapping.digest,locatorKey:locatorKey(l)}))]};});
 const coverage=records.filter(r=>['appearance','interactive','scene'].includes(r.kind)).map(r=>{
  const related=a.coverage.filter(c=>c.sourceId===r.recordId||points.get(c.rootKey)?.owner===r.recordId||a.effects.some(e=>e.rootKey===c.rootKey&&e.sourceId===r.recordId)),unbound=Object.values(r.current.payload.points||{}).some(p=>p.legacyData.romRoot?.unbound),reasons=[...new Set(related.flatMap(c=>c.reasons))];
  if(unbound)reasons.push('Unbound source entries remain reference candidates, not confirmed gameplay dialogue.');
  if(!related.length)reasons.push('Source archive or record has no confirmed bound interaction.');
  const sourceRefs=effects.filter(e=>e.target.recordId===r.recordId).flatMap(e=>e.sourceRefs);
  return {recordId:r.recordId,status:reasons.length?'partial':'complete',reason:reasons.join(' '),sourceRefs:sourceRefs.length?[...new Map(sourceRefs.map(r=>[canonical(r),r])).values()]:[{mappingDigest:mapping.digest,locatorKey:locators.keys().next().value}]};
 });
 const index={schema:'NPCDexConditionIndex/1',mapRecordId:mapId,sourceRomSha256:x.source.sha256,conditions,displayOrder:conditions.map(c=>c.id),effects,coverage},definitions=timeline.current.payload.definitions;
 definitions.legacyTimeline={stages:definitions.stages,meaning:'Prior observed scene-value labels; retained as source context, not verified access requirements.'};definitions.conditionIndex=index;definitions.stages=globalThis.romdexConditions.stages(index);timeline.current.payload.name=byId.get(mapId).current.payload.name+' — Map Conditions';
 const visible=new Set(definitions.stages.map(s=>s.id));
 for(const r of records){for(const p of Object.values(r.current.payload.points||{})){
  const relevant=effects.filter(e=>e.target.recordId===r.recordId&&e.target.pointId===p.id);p.legacyData.originalCondition=p.condition;p.legacyData.conditionModel=true;p.stageIds=[...new Set(relevant.flatMap(e=>e.conditionIds).filter(id=>visible.has(id)))];p.condition=p.legacyData.romRoot?.unbound?'Unbound source reference — gameplay use unresolved.':'Inspect the source-derived access requirements for each dialogue alternative.';
  for(const b of Object.values(p.blocks)){b.legacyData.conditionEffectIds=relevant.filter(e=>e.target.blockIds.includes(b.id)).map(e=>e.id);}
 }Object.assign(r,seal(r));}
 return {capability:CONDITION_CAPABILITY,extension:FEATURE_EXTENSION,binding:{schema:'NPCDexFeatureBindings/1',conditionIndexRecordId:timelineId,locationPreviewViewIds:[]},index};
}

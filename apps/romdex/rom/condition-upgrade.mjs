import {compactRecords} from '../rdx/compact-records.mjs';
import {canonical,seal,sha} from '../content/contracts.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {mapDomain,retainDocument} from '../rdx/map-import.mjs';
import {conditionIndex,CONDITION_CAPABILITY,FEATURE_EXTENSION} from '../rdx/features.mjs';
import {extractionFromDocument} from './source-context.mjs';
import {extractConditions,conditionRootKey} from './condition-extraction.mjs';
import {validateExtraction} from './extract.mjs';
import {compileConditions} from './condition-compilation.mjs';

// Only upgrade retained, pinned ROM evidence. Absence of source analysis never
// becomes a guessed timeline. Managed store retains the original document bytes.
export function upgradeMapConditions(value){
 const d=structuredClone(value.document);
 if(d.kind!=='map'||d.origin.role==='agent-result'||conditionIndex(mapDomain(value).records))return value;
 const x=extractionFromDocument(value);if(!x?.roots||!x?.flows||!x?.source?.sha256)return value;
 validateExtraction(x);
 const records=structuredClone(mapDomain(value).records),map=records.find(r=>r.recordId===d.scope.mapRecordId),timeline=records.find(r=>r.recordId===map.current.payload.timelineRef);
 if(!timeline)return value;
 const allowed=new Set(records.filter(r=>r.kind==='subzone').map(r=>r.legacyData?.romExtraction?.headerId).filter(Number.isSafeInteger));
 const filtered={...x,roots:x.roots.filter(r=>allowed.has(r.headerId)),appearances:x.appearances.filter(a=>allowed.has(a.headerId))};
 filtered.conditionAnalysis=extractConditions(filtered);
 const points=new Map(),sites=new Map(),flows=new Map(x.flows.map(f=>[f.key,f]));
 for(const r of records)for(const p of Object.values(r.current.payload.points||{})){
  const root=p.legacyData.romRoot;if(!root)continue;const key=conditionRootKey(root);points.set(key,{owner:r.recordId,pointId:p.id});
  for(const b of Object.values(p.blocks)){const raw=b.rawMessageData;if(raw?.format!=='ROMDexSourceMessage/1')continue;
   const row=flows.get(raw.flow)?.instructions.find(i=>i.offset===raw.instructionOffset),n=row?.messageReferences.findIndex(ref=>canonical(ref)===canonical(raw.reference));
   if(n>=0)sites.set(canonical([key,raw.flow,raw.instructionOffset,n]),{owner:r.recordId,pointId:p.id,blockId:b.id,gender:b.gender});
  }
 }
 const mappings=structuredClone(d.content.mappings),id=(...parts)=>'rom-content:'+sha(canonical([x.identities.projectId,...parts])).slice(0,40),base={workspaceId:d.datasetId,createdAt:d.createdAt,actorClaim:'romdex:condition-upgrade'};
 const feature=compileConditions({extraction:filtered,records,mappings,id,base,mapId:map.recordId,timelineId:timeline.recordId,sites,points});
 if(!feature)return value;
 const prior=new Map(mapDomain(value).records.map(r=>[r.recordId,r]));
 for(const r of records){const old=prior.get(r.recordId);r.current.payload.name=old.current.payload.name;if(canonical(r)!==canonical(old)){r.parents=[old.revisionId];r.operationId=id('condition-upgrade',old.revisionId);r.actorClaim=base.actorClaim;Object.assign(r,seal(r));}}
 const blobs=new Map(value.blobs);retainDocument(d,blobs,value);d.content.records=records;d.content.recordHeads=records.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));d.content.mappings=mappings;
 d.capabilities.required.push(CONDITION_CAPABILITY);d.extensions[FEATURE_EXTENSION]={...feature.binding,locationPreviewViewIds:d.extensions[FEATURE_EXTENSION]?.locationPreviewViewIds||[]};d.parents=[value.document.revision];compactRecords(d,blobs);d.revision=documentRevision(d);
 const documentBytes=Buffer.from(canonical(d));validateDocument(documentBytes,{blobs});return {...value,document:d,documentBytes,blobs};
}

export function restrictConditionScope(records){
 const ids=new Set(records.map(r=>r.recordId)),timeline=records.find(r=>r.current.payload.definitions?.conditionIndex);if(!timeline)return;
 const def=timeline.current.payload.definitions,index=def.conditionIndex;
 index.effects=index.effects.filter(e=>ids.has(e.target.recordId));index.coverage=index.coverage.filter(c=>ids.has(c.recordId));
 const used=new Set(index.effects.flatMap(e=>e.conditionIds));index.conditions=index.conditions.filter(c=>used.has(c.id));index.displayOrder=index.displayOrder.filter(id=>used.has(id));
 def.stages=globalThis.romdexConditions.stages(index);const visible=new Set(def.stages.map(s=>s.id));
 for(const r of records){for(const p of Object.values(r.current.payload.points||{}))p.stageIds=p.stageIds.filter(id=>visible.has(id));Object.assign(r,seal(r));}
}

export function preserveConditionLabels(next,old){
 const a=next?.current.payload.definitions?.conditionIndex,b=old?.current.payload.definitions?.conditionIndex;if(!a)return;if(!b){if(old?.current.payload.definitions?.stages)next.current.payload.definitions.legacyTimeline={stages:structuredClone(old.current.payload.definitions.stages),meaning:'Retained prior source-state labels; not verified access requirements.'};return;}
 const previous=new Map(b.conditions.map(c=>[c.id,c]));for(const c of a.conditions){const before=previous.get(c.id);if(before?.labelOrigin==='owner'){c.label=before.label;c.labelOrigin='owner';}}
 const ids=new Set(a.conditions.map(c=>c.id));a.displayOrder=[...b.displayOrder.filter(id=>ids.has(id)),...a.displayOrder.filter(id=>!b.displayOrder.includes(id))];next.current.payload.definitions.stages=globalThis.romdexConditions.stages(a);
}

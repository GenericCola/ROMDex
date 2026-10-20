import {createHash} from 'node:crypto';
import './timeline-core.js';
export const {validId,roman,validateStages,definitionStages,snapshotStages,validateSnapshot,chooseStage,label}=globalThis.romdexTimelines;
const legacyProgressionId='content:shared-'+createHash('sha256').update('["progression"]').digest('hex').slice(0,32);
export function timelineCatalog(records){
 for(const r of records.filter(r=>r.kind==='shared'&&r.current.payload.sharedType==='progression'))if(!validId(r.recordId))throw Error('Timeline Needs a Safe Stable Record Identity.');
 const timelines=Object.fromEntries(records.filter(r=>r.kind==='shared'&&r.current.payload.sharedType==='progression').map(r=>[r.recordId,{id:r.recordId,name:r.current.payload.name,stages:structuredClone(definitionStages(r.current.payload.definitions))}]));
 const keys=Object.keys(timelines),defaultTimelineRef=timelines[legacyProgressionId]?legacyProgressionId:keys.length===1?keys[0]:null;
 return {timelines,defaultTimelineRef,stages:structuredClone(defaultTimelineRef?timelines[defaultTimelineRef].stages:[])};
}
export function collectionTimeline(record,catalog){
 const ref=record.kind==='map'?record.current.payload.timelineRef:record.current.payload.definitions?.timelineRef||catalog.defaultTimelineRef;
 if(ref!==null&&!catalog.timelines[ref])throw Error('Collection Timeline Is Missing.');return ref;
}
export function applySnapshotTimelines(snapshot,records){
 const catalog=timelineCatalog(records),maps=new Map(records.map(r=>[r.recordId,r]));
 const bindings=snapshot.towns.map(town=>maps.get(town.contentRecordId||town.id)||records.find(r=>r.legacyData?.legacyTownId===town.id&&['map','shared'].includes(r.kind)));
 // Preserve the exact historical view shape for an unchanged legacy catalog.
 // Map-scoped or newly authored content gets explicit timeline references.
 const legacyShape=Object.keys(catalog.timelines).length===1&&catalog.defaultTimelineRef===legacyProgressionId&&snapshot.timelines===undefined&&snapshot.defaultTimelineRef===undefined&&snapshot.towns.every((t,i)=>t.timelineRef===undefined&&bindings[i]?.legacyData?.legacyTownId);
 if(legacyShape){snapshot.stages=catalog.stages;return validateSnapshot(snapshot);}
 Object.assign(snapshot,catalog);
 for(const [i,town]of snapshot.towns.entries()){const record=bindings[i];if(!record)throw Error('Timeline Map Binding Is Missing.');town.timelineRef=collectionTimeline(record,catalog);}
 return validateSnapshot(snapshot);
}

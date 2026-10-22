// Non-destructive navigation links. Source events remain their own records and
// keep their original point/block IDs, conditions, reviews and ROM locators.
const normalized=value=>String(value||'').normalize('NFKC').replace(/ · Placement \d+$/,'').trim().toLocaleLowerCase('en');
export function eventAssociations(records){
 const profiles=new Map(records.filter(r=>r.kind==='profile').map(r=>[r.recordId,r])),aliases=new Map();
 for(const r of records.filter(r=>r.kind==='appearance'&&r.current.lifecycle!=='archived')){
  const profile=r.current.payload.profileId;for(const label of [profiles.get(profile)?.current.payload.name,r.current.payload.overrides?.displayName,r.current.payload.name]){
   for(const part of String(label||'').split(' / ')){const key=normalized(part);if(!key)continue;if(!aliases.has(key))aliases.set(key,new Set());aliases.get(key).add(profile);}
  }
 }
 const links=[],fullyAssociatedRecordIds=[];
 for(const r of records.filter(r=>['scene','interactive'].includes(r.kind)&&r.current.lifecycle!=='archived')){
  const event=r.legacyData?.romExtraction,eventKind=event?.eventKind||event?.event?.locator?.selectors?.eventKind;
  const spoken=[];for(const pid of r.current.payload.pointOrder||[]){const p=r.current.payload.points[pid],root=p.legacyData?.romRoot,blocks=p.blockOrder.map(id=>p.blocks[id]).filter(b=>b.kind==='dialogue'&&!b.archived);if(!blocks.length)continue;spoken.push(pid);
   if(root?.unbound||!(eventKind==='triggers'||['scene-hook','load-hook'].includes(root?.kind)))continue;
   const participants=new Set();for(const b of blocks){if(b.speaker&&profiles.has(b.speaker))participants.add(b.speaker);const label=b.text.match(/^\s*([\p{L}][\p{L}\p{N} .’'\-]{0,59}):(?:\s|$)/u)?.[1],matches=label&&aliases.get(normalized(label));if(matches?.size===1)participants.add([...matches][0]);}
   for(const profileId of participants)links.push({recordId:r.recordId,pointId:pid,profileId,label:eventKind==='triggers'?'Step-based event':'Scene event',basis:'Explicit speaker identity in source dialogue; other speakers and access conditions remain separately identified.'});
  }
  if(spoken.length&&spoken.every(id=>links.some(l=>l.recordId===r.recordId&&l.pointId===id)))fullyAssociatedRecordIds.push(r.recordId);
 }
 return {links,fullyAssociatedRecordIds};
}
export function associateSnapshotEvents(snapshot,records){
 const associations=eventAssociations(records);
 for(const town of snapshot.towns){const elements=town.areas.flatMap(a=>a.elements);for(const character of town.characters){const profiles=new Set(character.elementIds.map(id=>elements.find(e=>e.id===id)?.contentRecordId||id).map(id=>records.find(r=>r.recordId===id)?.current.payload.profileId).filter(Boolean));character.sourceEvents=[];
   for(const link of associations.links.filter(l=>profiles.has(l.profileId))){const element=elements.find(e=>e.contentRecordId===link.recordId||e.id===link.recordId),record=records.find(r=>r.recordId===link.recordId),point=record.current.payload.points[link.pointId],pointId=point.legacyData?.legacyId||link.pointId;if(!element||!element.points.some(p=>p.id===pointId))continue;character.sourceEvents.push({...link,elementId:element.id,pointId});if(!character.sceneIds.includes(element.id))character.sceneIds.push(element.id);}
  }
  for(const element of elements)if(associations.fullyAssociatedRecordIds.includes(element.contentRecordId||element.id))element.associatedEventOnly=true;
 }
 return snapshot;
}

// One-time, preview-only translation of presentation metadata. Never used by the
// normal projector; original export bytes remain an unchanged recovery object.
import {seal,sha,requireThat} from './contracts.mjs';
import {recoverLegacyOriginal} from './migration.mjs';
const clone=structuredClone,omit=(value,keys)=>Object.fromEntries(Object.entries(clone(value)).filter(([key])=>!keys.includes(key)));
export function prepareNativeViews(domain,{assetBytes,workspace,operationId,createdAt}){
 requireThat(!(domain.views||[]).length,'Native Presentation Metadata Already Exists.');
 const {bytes,manifest}=recoverLegacyOriginal(domain,assetBytes),original=JSON.parse(bytes),records=new Map(domain.records.map(r=>[r.recordId,r])),source=manifest.index;
 const lookup=(town,kind,id)=>source.find(x=>x.townId===town&&x.kind===kind&&x.id===id);
 const images=new Map(manifest.imageOccurrences.map(i=>[i.sha256,i.assetId]));
 function encode(value){if(typeof value==='string'&&value.startsWith('data:image/')){const match=value.match(/^data:(image\/(?:png|jpeg|gif|webp));base64,([\s\S]+)$/);requireThat(match,'Unsupported Image in View Metadata.');const id=images.get(sha(Buffer.from(match[2].replace(/\s/g,''),'base64')));requireThat(id,'A Presentation Image Has No Verified Asset.');return {format:'NPCDexViewImage/1',assetId:id};}if(Array.isArray(value))return value.map(encode);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encode(v)]));return value;}
 const views=[],make=(recordId,payload)=>{const view=seal({schema:'NPCDexViewRevision/1',workspaceId:workspace,operationId:operationId+':view-'+views.length,createdAt,actorClaim:'content:owner',viewId:recordId?'view:'+recordId:'view:root',recordId,parents:[],source:{sha256:sha(bytes),recordRevision:manifest.baselineRevisions[recordId]||null},payload});views.push(view);return view;};
 const root=make(null,{fields:encode(omit(original,['towns','stages','timelines','defaultTimelineRef'])),collectionOrder:original.towns.map(t=>lookup(t.id,'town',t.id).recordId),reviewBindings:clone(manifest.reviewIndex)});
 for(const town of original.towns){const mapId=lookup(town.id,'town',town.id).recordId,map=records.get(mapId);const roster=town.characters.map(c=>({fields:encode(omit(c,['elementIds','sceneIds'])),elements:c.elementIds.map(id=>{const ref=lookup(town.id,'element',id);requireThat(ref,'A Roster Appearance Is Unmapped.');return ref.recordId;}),scenes:c.sceneIds.map(id=>{const ref=lookup(town.id,'element',id);requireThat(ref,'A Roster Scene Is Unmapped.');return ref.recordId;})}));
  const order=areas=>areas.flatMap(a=>town.areas.find(x=>x.id===a.id).elements.map(e=>lookup(town.id,'element',e.id).recordId));
  const m=make(mapId,{fields:encode(omit(town,['areas','locations','characters'])),roster,areaOrder:town.areas.map(a=>a.id),locationOrder:town.locations.map(l=>l.id)});
  if(map.kind==='shared'){m.payload.locations=encode(town.locations);m.payload.areas=encode(town.areas.map(a=>omit(a,['elements'])));m.payload.entityOrder=order(town.areas);views[views.length-1]=seal(m);}
  else for(const zid of map.current.payload.subzoneIds){const zone=records.get(zid),areaIds=zone.legacyData.sourceAreas?.map(a=>a.id),locationIds=zone.legacyData.sourceLocations?.map(l=>l.id);requireThat(areaIds&&locationIds,'A Sub-zone Is Missing Its Documented View Metadata.');const areas=town.areas.filter(a=>areaIds.includes(a.id)),locations=town.locations.filter(l=>locationIds.includes(l.id));make(zid,{locations:encode(locations),areas:encode(areas.map(a=>omit(a,['elements']))),entityOrder:order(areas)});}
  for(const area of town.areas)for(const element of area.elements){const ref=lookup(town.id,'element',element.id);make(ref.recordId,{fields:encode(omit(element,['points'])),areaKey:area.id,collectionId:mapId,rawMessageBlocks:element.points.flatMap(p=>p.blocks.filter(b=>Object.hasOwn(b,'rawMessageData')).map(b=>lookup(town.id,'block',b.id).blockId))});}
 }
 for(const r of domain.records.filter(r=>r.kind==='profile'))make(r.recordId,{identityKey:r.legacyData.identityKey||null});
 return {views,sourceSHA256:sha(bytes),rootViewId:root.viewId,recordCount:records.size,viewCount:views.length};
}

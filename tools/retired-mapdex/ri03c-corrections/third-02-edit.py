from pathlib import Path
p=Path('outputs/ROMDex/public/area-presentation.mjs');s=p.read_text(encoding='utf-8-sig');s+='''
// Group only a catalog-confirmed HGSS interior code. Numeric IDs alone are not evidence.
export function areaBuilding(area,mapName){
 const code=area.internalName??area.name,entry=names.get(code);if(!entry||entry[0]!==area.headerId)return null;
 const match=code.match(/^([TRW]\\d+R\\d{2})\\d{2}$/);if(!match)return null;
 const label=areaDisplayName(area,mapName),floor=label.match(/ — (B?\\d+F)$/);
 return {key:match[1],name:floor?label.slice(0,-floor[0].length):label,floor:floor?.[1]||null};
}
''';p.write_text(s,encoding='utf-8',newline='\n')
Path('outputs/ROMDex/rom/building-hierarchy.mjs').write_text('''import {canonical,seal,sha} from '../content/contracts.mjs';
import {mapDomain,retainDocument} from '../rdx/map-import.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {areaBuilding} from '../public/area-presentation.mjs';
const CAPABILITY='org.romdex.npcdex.nested-zones-v1';
// Add logical building parents; physical rooms, source identities and all edits remain intact.
export function upgradeBuildingHierarchy(value){
 if(!value.document.extensions?.['org.romdex.rom-source'])return value;
 const domain=mapDomain(value),byId=new Map(domain.records.map(r=>[r.recordId,r])),groups=new Map();
 for(const room of domain.records.filter(r=>r.kind==='subzone')){
  const source=room.legacyData?.romExtraction,code=room.legacyData?.romPresentation?.originalName||room.current.payload.name,parent=byId.get(room.parentRecordId),map=domain.records.find(r=>r.recordId===room.current.payload.mapId);
  if(source?.headerId===undefined||!parent||!(parent.kind==='map'||parent.legacyData?.romGroup))continue;
  const b=areaBuilding({headerId:source.headerId,internalName:code},map?.current.payload.name);if(!b)continue;
  const key=parent.recordId+'|'+b.key;if(!groups.has(key))groups.set(key,{...b,parent,map,rooms:[]});groups.get(key).rooms.push(room);
 }
 if(!groups.size)return value;
 const document=structuredClone(value.document),blobs=new Map(value.blobs),changes=[],heads=new Map();
 const revise=(before,edit)=>{const next=structuredClone(before);edit(next);next.parents=[before.revisionId];next.actorClaim='romdex:building-hierarchy';next.operationId='content:building-'+sha(canonical({parent:before.revisionId,current:next.current,parentId:next.parentRecordId})).slice(0,40);const sealed=seal(next);changes.push(sealed);heads.set(before.recordId,sealed.revisionId);return sealed;};
 const parentChildren=new Map();
 for(const [key,g]of groups){const id='rom-content:building-'+sha(canonical([document.datasetId,key])).slice(0,40);if(byId.has(id))continue;
  const building=seal({schema:'NPCDexContentRevision/1',workspaceId:document.datasetId,operationId:'content:building-seed-'+sha(id).slice(0,40),recordId:id,kind:'subzone',parentRecordId:g.parent.recordId,parents:[],createdAt:g.rooms[0].createdAt,actorClaim:'romdex:building-hierarchy',current:{lifecycle:'active',payload:{name:g.name,mapId:g.map.recordId,sourceAreaKeys:[],appearanceIds:[],sceneIds:[],interactiveIds:[],aliasRefs:[],subzoneIds:g.rooms.map(r=>r.recordId)}},mappingRefs:[],legacyRefs:[],legacyData:{romBuilding:{format:'ROMDexBuilding/1',sourceCode:g.key}}});changes.push(building);heads.set(id,building.revisionId);document.scope.ownedRecordIds.push(id);
  for(const room of g.rooms)revise(room,r=>{r.parentRecordId=id;});
  if(!parentChildren.has(g.parent.recordId))parentChildren.set(g.parent.recordId,[]);parentChildren.get(g.parent.recordId).push({building:id,rooms:g.rooms.map(r=>r.recordId)});
 }
 if(!changes.length)return value;
 for(const [id,added]of parentChildren){const before=byId.get(id);revise(before,r=>{if(r.kind==='map')r.current.payload.subzoneIds.push(...added.map(a=>a.building));else{const children=r.current.payload.subzoneIds||[];r.current.payload.subzoneIds=[...children.filter(id=>!added.some(a=>a.rooms.includes(id))),...added.map(a=>a.building)];}});}
 // The map inventory lists every descendant, including building containers.
 for(const map of domain.records.filter(r=>r.kind==='map')){const ids=changes.filter(r=>r.legacyData?.romBuilding&&r.current.payload.mapId===map.recordId).map(r=>r.recordId);if(!ids.length||heads.has(map.recordId))continue;revise(map,r=>r.current.payload.subzoneIds.push(...ids));}
 retainDocument(document,blobs,value);document.content.records.push(...changes);document.content.recordHeads=document.content.recordHeads.map(h=>({recordId:h.recordId,revisionId:heads.get(h.recordId)||h.revisionId}));for(const r of changes)if(!byId.has(r.recordId))document.content.recordHeads.push({recordId:r.recordId,revisionId:r.revisionId});
 document.capabilities.required=[...new Set([...document.capabilities.required,CAPABILITY])];document.parents=[value.document.revision];document.revision=documentRevision(document);const documentBytes=Buffer.from(canonical(document));validateDocument(documentBytes,{blobs});return {...value,document,documentBytes,blobs};
}
''',encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/rom/presentation.mjs');s=p.read_text(encoding='utf-8-sig');s="import {upgradeBuildingHierarchy} from './building-hierarchy.mjs';\n"+s;s=s.replace('if(!changes.length)return value;','if(!changes.length)return upgradeBuildingHierarchy(value);').replace('return {...value,document,documentBytes,blobs};','return upgradeBuildingHierarchy({...value,document,documentBytes,blobs});');p.write_text(s,encoding='utf-8',newline='\n')
# Display direct child selectors only. Their room/floor inventory is preserved beneath the parent.
p=Path('outputs/ROMDex/content/projection.mjs');s=p.read_text(encoding='utf-8-sig');s=s.replace('name:zonePath(zone,records),parentAreaId:', 'name:z.name,parentAreaId:').replace('name:zonePath(zone,records),parentLocationId:', 'name:z.name,parentLocationId:');p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/content/workspace-runtime.js');s=p.read_text(encoding='utf-8-sig');s=s.replace("t.locations.filter(l=>!l.aliasOf&&!l.archived)","t.locations.filter(l=>!l.aliasOf&&!l.archived&&!l.parentLocationId)");s=s.replace("const areas=t.areas.filter(a=>l.areaIds.includes(a.id));", "const areas=t.areas.filter(a=>a.id!==l.id&&l.areaIds.includes(a.id));");p.write_text(s,encoding='utf-8',newline='\n')
# Existing native view metadata is kept verbatim; only the source-backed nesting fields are added.
p=Path('outputs/ROMDex/content/native-projection.mjs');s=p.read_text(encoding='utf-8-sig');s=s.replace('town.locations.push(location);','location.parentLocationId=zone.parentRecordId===map.recordId?null:zone.parentRecordId;town.locations.push(location);');p.write_text(s,encoding='utf-8',newline='\n')
p=Path('work/ri03c-corrections/third-review.json');import json;d=json.loads(p.read_text(encoding='utf-8'));d['items'][0].update(status='implemented',proof='third-01-proof.json');p.write_text(json.dumps(d,indent=2),encoding='utf-8',newline='\n')

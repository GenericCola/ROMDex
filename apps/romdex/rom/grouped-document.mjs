import {canonical,seal,sha} from '../content/contracts.mjs';
import {mapDomain,retainDocument} from '../rdx/map-import.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {recoverSourceIdentities} from './staging-document.mjs';
import {requireRom} from './reader.mjs';

export const NESTED_CAPABILITY='org.romdex.npcdex.nested-zones-v1';
// The source is unchanged. Extend a preparation's source inventory while keeping
// every previously edited current record; only reviewed physical membership moves.
export function prepareGroupedDocument(incoming,local,{rootId,nodes}){
 const source=recoverSourceIdentities(incoming),old=local&&recoverSourceIdentities(local),raw=mapDomain(incoming),prior=local?mapDomain(local):null;
 if(old)requireRom(old.projectId===source.projectId&&old.sourceSHA256===source.sourceSHA256&&old.inventoryDigest===source.inventoryDigest&&old.entries.every(a=>source.entries.some(b=>canonical(a)===canonical(b))),'REVIEW_REQUIRED','Grouped Preparation Must Preserve Every Existing Source Identity.');
 requireRom(nodes.length&&nodes[0].id===rootId&&!nodes[0].parentId,'INVALID','Choose One Parent Map.');
 const groupById=new Map(nodes.map(n=>[n.id,n])),map=raw.records.find(r=>r.kind==='map'),byPrior=new Map((prior?.records||[]).map(r=>[r.recordId,r])),byRaw=new Map(raw.records.map(r=>[r.recordId,r]));
 requireRom(!local||local.document.datasetId===incoming.document.datasetId&&local.document.scope.mapRecordId===map.recordId,'REVIEW_REQUIRED','Independent Prepared Maps Need a Separate Migration Review.');
 const id=group=>'rom-content:group-'+sha(canonical([incoming.document.datasetId,group])).slice(0,40),groupId=g=>g===rootId?map.recordId:id(g),selectedZones=raw.records.filter(r=>r.kind==='subzone'),areaOwner=new Map();
 for(const n of nodes)for(const h of n.ownHeaders){requireRom(!areaOwner.has(h),'INVALID','An Area Belongs to More Than One Group.');areaOwner.set(h,n.id);}
 const needed=new Set([rootId]);for(const zone of selectedZones){let owner=areaOwner.get(zone.legacyData?.romExtraction?.headerId);requireRom(owner,'INVALID','A Selected Area Has No Group.');while(owner){needed.add(owner);owner=groupById.get(owner)?.parentId;}}
 const groups=nodes.filter(n=>n.id!==rootId&&needed.has(n.id));
 const records=raw.records.map(r=>structuredClone(byPrior.get(r.recordId)||r));
 // The archive expands when additional message banks enter the group. Keep old
 // notes verbatim and append new source blocks; preserving the old head alone
 // would omit the newly extracted unassigned text from the visible archive.
 for(const record of records){const next=byRaw.get(record.recordId);if(next?.kind!=='interactive'||next.current.payload.name!=='Unassigned Source Text (Review Required)')continue;const p=record.current.payload,source=next.current.payload;for(const pid of source.pointOrder){if(!p.points[pid]){p.points[pid]=structuredClone(source.points[pid]);p.pointOrder.push(pid);continue;}const point=p.points[pid],incomingPoint=source.points[pid];for(const bid of incomingPoint.blockOrder)if(!point.blocks[bid]){point.blocks[bid]=structuredClone(incomingPoint.blocks[bid]);point.blockOrder.push(bid);}}}
 // Keep the original shared profiles and timeline history, including user edits.
 for(const r of prior?.records||[])if(['profile','shared','region'].includes(r.kind)&&!records.some(x=>x.recordId===r.recordId))records.push(structuredClone(r));
 const byId=new Map(records.map(r=>[r.recordId,r]));
 for(const group of groups){const rid=id(group.id),before=byPrior.get(rid),record=before?structuredClone(before):{schema:'NPCDexContentRevision/1',workspaceId:incoming.document.datasetId,operationId:'content:group-seed-'+sha(rid).slice(0,40),createdAt:map.createdAt,actorClaim:'romdex:map-grouping',recordId:rid,kind:'subzone',parentRecordId:groupId(group.parentId),parents:[],current:{lifecycle:'active',payload:{name:group.name,mapId:map.recordId,sourceAreaKeys:[],appearanceIds:[],sceneIds:[],interactiveIds:[],aliasRefs:[],subzoneIds:[]}},mappingRefs:[],legacyRefs:[],legacyData:{romGroup:{format:'ROMDexMapGroup/1',id:group.id,sourceSHA256:source.sourceSHA256}}};records.push(record);byId.set(rid,record);}
 for(const zone of selectedZones){const next=byId.get(zone.recordId);next.parentRecordId=groupId(areaOwner.get(zone.legacyData.romExtraction.headerId));}
 for(const group of groups){const next=byId.get(id(group.id));next.parentRecordId=groupId(group.parentId);next.current.payload.subzoneIds=records.filter(r=>r.kind==='subzone'&&r.parentRecordId===next.recordId).map(r=>r.recordId);}
 const root=byId.get(map.recordId);root.current.payload.subzoneIds=records.filter(r=>r.kind==='subzone').map(r=>r.recordId);
 const timeline=byId.get(root.current.payload.timelineRef),rawTimeline=byRaw.get(root.current.payload.timelineRef);if(timeline&&rawTimeline&&Array.isArray(timeline.current.payload.definitions.stages))for(const stage of rawTimeline.current.payload.definitions.stages){const current=timeline.current.payload.definitions.stages.find(s=>s.id===stage.id);if(!current)timeline.current.payload.definitions.stages.push(structuredClone(stage));else if(Array.isArray(current.evidence)&&Array.isArray(stage.evidence))for(const e of stage.evidence)if(!current.evidence.some(a=>canonical(a)===canonical(e)))current.evidence.push(structuredClone(e));}
 const keep=new Set(records.map(r=>r.recordId));for(const artifact of [...(prior?.plans||[]),...(prior?.reviews||[])])requireRom([artifact.target.recordId,...(artifact.readSet||[]).map(r=>r.recordId),...(artifact.changes||[]).map(r=>r.recordId)].every(id=>keep.has(id)),'REVIEW_REQUIRED','An Excluded Area Has Plans or Notes. Keep It Included Before Preparing This Group.');
 const heads=records.map(r=>{const before=byPrior.get(r.recordId)||byRaw.get(r.recordId);if(before&&canonical(r)===canonical(before))return r;if(before){r.parents=[before.revisionId];r.operationId='content:group-membership-'+sha(canonical({parent:before.revisionId,current:r.current,parentId:r.parentRecordId})).slice(0,40);r.actorClaim='romdex:map-grouping';}return seal(r);});
 const document=structuredClone(local?.document||incoming.document),blobs=new Map([...(local?.blobs||[]),...incoming.blobs]);
 for(const a of incoming.document.assetInventory)if(!document.assetInventory.some(b=>b.assetId===a.assetId))document.assetInventory.push(a);
 if(local)retainDocument(document,blobs,local);retainDocument(document,blobs,incoming);
 document.content.records=heads;document.content.recordHeads=heads.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));document.content.mappings=[...new Map([...(local?.document.content.mappings||[]),...incoming.document.content.mappings].map(m=>[m.digest,m])).values()];
 document.scope.ownedRecordIds=heads.filter(r=>!['region','shared','profile'].includes(r.kind)).map(r=>r.recordId);document.scope.contextRecordIds=heads.filter(r=>['region','shared','profile'].includes(r.kind)).map(r=>r.recordId);
 for(const key of ['org.romdex.rom-source','org.romdex.import-preparation'])document.extensions[key]=structuredClone(incoming.document.extensions[key]);
 document.extensions['org.romdex.map-groups']={format:'ROMDexMapGroups/1',rootId,nodes:structuredClone(nodes)};
 if(groups.length&&!document.capabilities.required.includes(NESTED_CAPABILITY))document.capabilities.required.push(NESTED_CAPABILITY);
 document.parents=[(local||incoming).document.revision];document.revision=documentRevision(document);const documentBytes=Buffer.from(canonical(document));validateDocument(documentBytes,{blobs});return {...incoming,document,documentBytes,blobs};
}

import {canonical,seal,sha,validateGraph} from '../content/contracts.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {packRdx} from '../rdx/container.mjs';
import {validateExtraction,extractHGSS} from './extract.mjs';
import {createNativeMappingSession} from './native-mapping.mjs';
import {inventoryHGSS} from './hgss.mjs';
import {requireRom} from './reader.mjs';
import {stagePresentation} from './source-context.mjs';
import {conditionRootKey} from './condition-extraction.mjs';
import {compileLocationPreviews} from './location-compilation.mjs';
import {compileConditions} from './condition-compilation.mjs';

// Deterministic translation of a pinned extraction, never a ROM interpreter or
// an AI-generated account of gameplay. Source bindings must survive recompiles.
export async function compileMapExtraction(extraction,assets,inventory,{createdAt='2026-10-20T00:00:00.000Z'}={}){
 const x=validateExtraction(extraction),project=x.identities.projectId;
 requireRom(typeof x.testbed.key==='string'&&x.testbed.key.length>0&&x.inventoryDigest===inventory.digest,'SOURCE_CHANGED','Compilation Requires the Selected Map Inventory.');
 const mapKey=x.testbed.key,mapName=x.testbed.name||'Violet City',regionKey=x.testbed.regionKey||'johto',regionName=x.testbed.regionName||'Johto';
 const session=createNativeMappingSession(inventory,x.identities),id=(...parts)=>'rom-content:'+sha(canonical([project,...parts])).slice(0,40),dataset=id('dataset'),mapId=id('map',mapKey),timelineId=id('timeline',mapKey),regionId=id('region',regionKey);
 const base={workspaceId:dataset,createdAt,actorClaim:'romdex:rom-extractor'},records=[],mappings=[],blobs=new Map(),assetInventory=[];
 const attachment=(bytes,mime,purpose='attachment')=>{const hash=sha(bytes),assetId='content:asset-'+hash;if(!blobs.has(hash)){blobs.set(hash,bytes);assetInventory.push({assetId,sha256:hash,bytes:bytes.length,mime,purpose});}return assetId;};
 for(const a of x.appearances)for(const frame of a.assets){const bytes=assets.get(frame.path);requireRom(Buffer.isBuffer(bytes)&&sha(bytes)===frame.sha256,'INTEGRITY','An extracted sprite frame is missing or changed.');attachment(bytes,'image/png','image');}
 // Keep the existing bounded JSON parser. A complete extraction can exceed its
 // node budget even when each source section is small: factor it, don't raise
 // the application's limits or hide a large JSON behind an opaque MIME type.
 const sourceHeader=structuredClone(x),sections={};for(const [key,value]of Object.entries(x))if(Array.isArray(value)){delete sourceHeader[key];const refs=[];for(let offset=0;offset<value.length;offset+=64)refs.push(attachment(Buffer.from(canonical({format:'ROMDexExtractionSection/1',section:key,offset,items:value.slice(offset,offset+64)})),'application/json'));sections[key]=refs;}
 const sourceAsset=attachment(Buffer.from(canonical({format:'ROMDexExtractionIndex/1',extractionDigest:x.digest,header:sourceHeader,sections})),'application/json');
 const evidence=(source,label='Read-only ROM evidence; runtime reachability is unverified')=>[{label,sourceId:source?.path||project,excerpt:'Source extraction '+x.digest,locator:source?source.path+'#'+canonical(source.selectors):null}];
 function add(recordId,kind,parent,payload,{sourceKey=null,source=null,extra={}}={}){
  const refs=[];if(sourceKey){const m=session.mapping(sourceKey,{workspaceId:dataset,operationId:id('mapping-op',sourceKey),createdAt,actorClaim:base.actorClaim});mappings.push(m);refs.push(m.digest);}
  const r=seal({...base,schema:'NPCDexContentRevision/1',operationId:id('seed',recordId),recordId,kind,parentRecordId:parent,parents:[],current:{lifecycle:'active',payload},mappingRefs:refs,legacyRefs:[],legacyData:{romExtraction:{format:'ROMDexCompiledSource/1',sourceAsset,sourceSHA256:x.source.sha256,extractionDigest:x.digest,...(source?{locator:source}:{}),...extra}}});records.push(r);return r;
 }
 const sceneVariables=new Set(x.roots.filter(r=>r.kind==='scene-hook'&&r.predicate).map(r=>r.predicate.left)),writes=x.mutations.filter(m=>m.kind==='SetVar'&&m.operands[0]>=0x4000&&m.operands[0]<0x8000&&(!sceneVariables.size||sceneVariables.has(m.operands[0]))),states=new Map();
 for(const m of writes){const [variable,value]=m.operands,key=variable+':'+value;if(!states.has(key))states.set(key,{variable,value,evidence:[]});states.get(key).evidence.push(m.locator);}
 const stages=[...states.values()].sort((a,b)=>a.variable-b.variable||a.value-b.value).map(s=>({id:id('scene-value',s.variable,s.value),name:'Scene variable 0x'+s.variable.toString(16)+' = '+s.value,event:'Observed '+mapName+' source state. Numeric display order is not verified gameplay chronology; independent flags are retained separately.',uncertain:true,condition:{variable:s.variable,value:s.value},evidence:s.evidence}));
 const region=add(regionId,'region',null,{name:regionName,regionKey});region.legacyData={romRegion:{format:'ROMDexRegion/1',projectId:project,regionKey}};Object.assign(region,seal(region));
 add(timelineId,'shared',null,{name:mapName+' — Map Scenes (Story Order Needs Review)',sharedType:'progression',definitions:{stages:stages.map(s=>stagePresentation(x,s)),scope:'this-map-only',chronologyVerified:false,initialStateNotInferred:true,milestoneCandidates:x.timeline.milestoneCandidates,warning:x.timeline.warning}});
 const zoneIds=x.areas.map(a=>a.sourceId);add(mapId,'map',regionId,{name:mapName,regionId,sourceMapKeys:[mapKey],subzoneIds:zoneIds,timelineRef:timelineId},{extra:{testOnly:true,excludes:x.testbed.excludes||'Areas outside the selected map / zone group',coverage:x.coverage,warnings:x.warnings}});
 const flows=new Map(x.flows.map(f=>[f.key,f])),messages=new Map(x.messages.map(m=>[m.key,m])),links=new Map();for(const link of x.flowReferences){if(!links.has(link.from))links.set(link.from,[]);links.get(link.from).push(link.flow);}
 const assignedMessages=new Set(),sourceId=key=>x.identities.entries.find(e=>e.key===key)?.id,conditionSites=new Map(),conditionPoints=new Map();
 function point(owner,root,profile=null){
  const pid=id('point',owner,root.flow,root.kind,root.predicate||null),blocks={},order=[],reachable=new Set(),todo=[root.flow];
  const rootKey=conditionRootKey(root);conditionPoints.set(rootKey,{owner,pointId:pid});
  while(todo.length){const key=todo.shift();if(reachable.has(key))continue;const flow=flows.get(key);requireRom(flow,'INVALID_REFERENCE','A source root or call has no extracted flow.');reachable.add(key);for(const next of links.get(key)||[])todo.push(next);}
  const block=(key,text,kind='note',gender='both',raw=null,sourceBlockId=null)=>{const bid=id('block',pid,key);requireRom(!blocks[bid],'INTEGRITY','Duplicate compiled block identity.');if(root.unbound&&x.conditionAnalysis)kind='note';blocks[bid]={id:bid,kind,text,speaker:kind==='dialogue'?profile:null,gender,reviewKey:x.conditionAnalysis?bid:pid,sourceBlockId,sourceIds:[root.flow],rawMessageData:raw,legacyData:{},archived:false};order.push(bid);if(Array.isArray(key))conditionSites.set(canonical([rootKey,...key]),{owner,pointId:pid,blockId:bid,gender});};
  for(const key of reachable){const flow=flows.get(key);for(const row of flow.instructions)for(const [n,ref]of row.messageReferences.entries()){
   const raw={format:'ROMDexSourceMessage/1',flow:key,instructionOffset:row.offset,command:row.name,sourceLocator:row.locator,reference:ref,executionOrder:'static possible sites; not a linear playback',sourceAsset};
   if(ref.message){const m=messages.get(ref.message);requireRom(m,'INVALID_REFERENCE','A message reference is missing.');assignedMessages.add(m.key);block([key,row.offset,n],m.text,['dialogue','sign'].includes(ref.role)?'dialogue':'note',ref.gender||'both',{...raw,message:{key:m.key,locator:m.locator,wordSHA256:m.wordSHA256,encryptedSHA256:m.encryptedSHA256,compressed:m.compressed}},m.key);}
   else block([key,row.offset,n],'[Runtime-dependent text: '+row.name+'] '+(ref.reason||'Native/caller state is required. No dialogue is guessed.'),'note','both',raw);
  }}
  if(!order.length)block('no-static-text','No statically resolved dialogue at this entry. Event scripts and source mappings are retained for review.');
  const predicate=root.predicate,stage=predicate&&predicate.operator==='equal'?stages.find(s=>s.condition.variable===predicate.left&&s.condition.value===predicate.right):null;
  const condition=[root.unbound?'Unbound source entry; runtime use is not established':root.kind,root.flow,predicate?canonical(predicate):'', 'Possible branches/shared calls; not a guaranteed spoken sequence'].filter(Boolean).join(' · ');
  return {id:pid,condition,stageIds:stage?[stage.id]:[],sourceIds:[root.flow],participantIds:profile?[owner]:[],evidence:evidence(root.locator||flows.get(root.flow).instructions[0]?.locator),blocks,blockOrder:order,legacyData:{romRoot:root,reachableFlows:[...reachable],nativeBehaviorUnverified:true}};
 }
 const pointsFor=(owner,roots,profile=null)=>{const points={};for(const root of roots){const p=point(owner,root,profile);requireRom(!points[p.id],'INTEGRITY','Duplicate root scope.');points[p.id]=p;}return {points,pointOrder:Object.keys(points)};};
 for(const area of x.areas){
  const zone=area.sourceId,appearanceIds=[],interactiveIds=[],sceneIds=[],roots=x.roots.filter(r=>r.headerId===area.headerId),bound=new Set(roots.filter(r=>r.kind!=='local-entry').map(r=>r.flow));
  for(const event of area.events.overworlds){
   const key='area/'+area.headerId+'/overworlds/'+event.index,rid=sourceId(key),a=x.appearances.find(a=>a.sourceId===rid),profile=id('profile',rid),name=area.internalName+' · Object '+event.localId;
   requireRom(rid&&a,'INVALID_REFERENCE','A placed object has no source identity or sprite binding.');
   const sole=a.assets.filter(f=>f.paletteBinding==='sole-palette'),defaultFrame=sole[0];
   add(profile,'profile',null,{name,baseImageId:defaultFrame?'content:asset-'+defaultFrame.sha256:null,identityEvidence:evidence(event.locator,'Individual placed object; shared sprite does not prove shared character identity')},{extra:{appearanceSourceId:rid,frameBindings:a.assets,paletteUncertain:!defaultFrame}});
   add(rid,'appearance',zone,{name,profileId:profile,profileByPlayerGender:{male:null,female:null},sourceAreaKeys:[zone],sourceElementIds:[key],...pointsFor(rid,roots.filter(r=>r.kind==='event'&&r.sourceId===rid),profile),sceneIds:[],overrides:{displayName:null,imageAssetId:null}},{sourceKey:key,source:event.locator,extra:{event,visibility:a.visibility,sprite:a.reference,paletteUncertain:!defaultFrame}});appearanceIds.push(rid);
  }
  for(const kind of ['backgrounds','triggers'])for(const event of area.events[kind]){const key='area/'+area.headerId+'/'+kind+'/'+event.index,rid=sourceId(key);add(rid,'interactive',zone,{name:area.internalName+' · '+(kind==='triggers'?'Trigger ':'Background ')+event.index,...pointsFor(rid,roots.filter(r=>r.kind==='event'&&r.sourceId===rid))},{sourceKey:key,source:event.locator,extra:{event,eventKind:kind}});interactiveIds.push(rid);}
  const scene=id('source-scene',zone),sceneRoots=roots.filter(r=>r.kind==='scene-hook'||r.kind==='load-hook'||r.kind==='local-entry'&&!bound.has(r.flow));
  if(sceneRoots.length){add(scene,'scene',zone,{name:area.internalName+' · Scene Hooks and Unbound Scripts',participantIds:[],...pointsFor(scene,sceneRoots)},{source:area.locator,extra:{unboundEntriesAreNotSpokenDialogue:true}});sceneIds.push(scene);}
  add(zone,'subzone',mapId,{name:area.internalName,mapId,sourceAreaKeys:['area/'+area.headerId],appearanceIds,sceneIds,interactiveIds,aliasRefs:[]},{sourceKey:'area/'+area.headerId,source:area.locator,extra:{headerId:area.headerId,hooks:area.hooks,warps:area.events.warps}});
 }
 // Retain every decoded source message without assigning unused/trainer/menu
 // candidates to a character or claiming that they are spoken in this map.
 const archiveId=id('source-text-catalog'),archivePoint=id('source-text-catalog-point'),unassigned=x.messages.filter(m=>!assignedMessages.has(m.key)),zone=records.find(r=>r.recordId===zoneIds[0]);
 const blocks=Object.fromEntries(unassigned.map(m=>{const bid=id('unassigned-message',m.key);return [bid,{id:bid,kind:'note',text:m.text,speaker:null,gender:'both',reviewKey:archivePoint,sourceBlockId:m.key,sourceIds:[m.key],rawMessageData:{format:'ROMDexUnassignedSourceMessage/1',message:{key:m.key,locator:m.locator,wordSHA256:m.wordSHA256,encryptedSHA256:m.encryptedSHA256,compressed:m.compressed},sourceAsset,meaning:'Unassigned source text; not asserted map dialogue'},legacyData:{},archived:false}];}));
 const ap={id:archivePoint,condition:'Unassigned local text and shared/trainer candidates — source archive, not a confirmed NPC prompt',stageIds:[],sourceIds:[sourceAsset],participantIds:[],evidence:[],blocks,blockOrder:Object.keys(blocks),legacyData:{}};
 add(archiveId,'interactive',zone.recordId,{name:'Unassigned Source Text (Review Required)',points:{[archivePoint]:ap},pointOrder:[archivePoint]});zone.current.payload.interactiveIds.push(archiveId);Object.assign(zone,seal(zone));
 const features=compileConditions({extraction:x,records,mappings,id,base,mapId,timelineId,sites:conditionSites,points:conditionPoints});
 validateGraph(records);
 const doc={format:'RDXDocument/1',schemaVersion:1,datasetId:dataset,documentId:id('document',mapKey),revision:'',parents:[],createdAt,origin:{role:'extractor',generator:'romdex-rom-compiler/1',synthetic:false},namespace:'org.romdex.npcdex',kind:'map',capabilities:{required:['org.romdex.rdx.map-v1','org.romdex.npcdex.content-v1'],optional:[]},scope:{mode:'partial',mapRecordId:mapId,ownedRecordIds:records.filter(r=>!['region','shared','profile'].includes(r.kind)).map(r=>r.recordId),contextRecordIds:records.filter(r=>['region','shared','profile'].includes(r.kind)).map(r=>r.recordId),completeForParentIds:[],baselineInventory:[]},content:{records,recordHeads:records.map(r=>({recordId:r.recordId,revisionId:r.revisionId})),mappings,plans:[],reviews:[],views:[],history:[],archivalRequests:[]},assetInventory,result:null,extensions:{'org.romdex.rom-source':{format:'ROMDexCompilation/1',projectId:project,sourceSHA256:x.source.sha256,inventoryDigest:x.inventoryDigest,extractionDigest:x.digest,sourceAsset,testOnly:true,requiresHumanTesting:true,chronologyVerified:false,limitations:['Static source graph is not runtime reachability proof.','Neutral source-object labels are not verified character names.','Ambiguous sprite palettes have no guessed default image; all alternatives are retained.','Roman numerals number observed scene states, not an asserted complete gameplay sequence.']}}};
 if(features){doc.capabilities.required.push(features.capability);doc.extensions[features.extension]=features.binding;doc.extensions['org.romdex.rom-source'].limitations=doc.extensions['org.romdex.rom-source'].limitations.filter(s=>!s.startsWith('Roman numerals')).concat(['Map conditions retain exact source guards; unsupported native/dynamic checks require review.']);}
 doc.revision=documentRevision(doc);const documentBytes=Buffer.from(canonical(doc));validateDocument(documentBytes,{blobs});const bytes=await packRdx(documentBytes,blobs);
 return {document:doc,documentBytes,blobs,bytes,identities:x.identities,summary:{map:mapName,sourceSHA256:x.source.sha256,extractionDigest:x.digest,records:records.length,areas:x.areas.length,appearances:x.appearances.length,images:assetInventory.filter(a=>a.purpose==='image').length,decodedMessages:x.messages.length,mappedSourceMessages:assignedMessages.size,unassignedSourceMessages:unassigned.length,rdxBytes:bytes.length,rdxSHA256:sha(bytes),documentRevision:doc.revision,requiresHumanTesting:true,chronologyVerified:false,productionDataAccess:false}};
}

export async function compileRomMap(rom,{previousIdentities=null,headerIds=null,scope=null,allowScopeExtension=false,compatibility=[],progress=()=>{},locationCacheDirectory=null}={}){
 const inventory=await inventoryHGSS(rom,{progress,compatibility}),{extraction,assets}=await extractHGSS(rom,{inventory,previousIdentities,headerIds,scope,allowScopeExtension,progress});
 let result=await compileMapExtraction(extraction,assets,inventory);if(locationCacheDirectory)result=await compileLocationPreviews(result,rom,inventory,{cacheDirectory:locationCacheDirectory,progress});await rom.assertUnchanged();return {...result,inventory};
}

import {upgradeMapConditions} from './condition-upgrade.mjs';
import {rebindConditionSources,finishUpdatedConditions,updateFeatureBinding,updateLocationFeatures} from './update-conditions.mjs';
import {canonical,parseJSON,sha,seal,same} from '../content/contracts.mjs';
import {mapDomain,retainDocument} from '../rdx/map-import.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {viewHeads} from '../content/view-contract.mjs';
import {recoverSourceIdentities} from './staging-document.mjs';
import {UPDATE_EXTENSION,UPDATE_CAPABILITY,sealIdentities} from './update-contract.mjs';
import {requireRom} from './reader.mjs';

const clone=v=>structuredClone(v),ref=r=>({recordId:r.recordId,revisionId:r.revisionId});
const equal=(a,b)=>a===undefined||b===undefined?a===b:same(a,b);
const textOf=r=>(r.current.payload.pointOrder||[]).flatMap(p=>r.current.payload.points[p].blockOrder.map(b=>r.current.payload.points[p].blocks[b].text));
function sourceBaseline(value,domain){const x=value.document.extensions[UPDATE_EXTENSION],a=value.document.assetInventory.find(a=>a.assetId===x?.sourceBaselineAsset);if(a){const rows=parseJSON(value.blobs.get(a.sha256)).heads;return new Map(rows.map(h=>[h.recordId,domain.revisions.find(r=>r.revisionId===h.revisionId)]));}const map=new Map();for(const r of domain.revisions)if(r.actorClaim==='romdex:rom-extractor'&&!map.has(r.recordId)||r.actorClaim==='romdex:source-presentation'&&(!map.has(r.recordId)||r.parents.includes(map.get(r.recordId).revisionId)))map.set(r.recordId,r);return map;}
function rewrite(value,ids,key=''){
 if(typeof value==='string')return ['name','text','condition','instructions','proposedDialogue','sourceBlockId','sourceIds','sourceElementIds','sourceAreaKeys','sourceMapKeys'].includes(key)?value:ids.get(value)||value;
 if(Array.isArray(value))return value.map(v=>rewrite(v,ids,key));
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[ids.get(k)||k,rewrite(v,ids,k)]));
}
function pointSignature(p){return canonical({kind:p.legacyData?.romRoot?.kind||null,predicate:p.legacyData?.romRoot?.predicate||null,blocks:p.blockOrder.map(id=>{const b=p.blocks[id];return [b.kind,b.gender,b.text];})});}
const withoutAsset=value=>{if(!value)return value;const {sourceAsset,...rest}=value;return rest;};
const blockSignature=b=>canonical([b.kind,b.gender,b.text]);
function describe(r,records){let parent=records?.get(r.parentRecordId),parts=[];while(parent){parts.unshift(parent.current.payload.name);parent=records.get(parent.parentRecordId);}return {path:parts.join(' / '),... {id:r.recordId,kind:r.kind,parent:r.parentRecordId,name:r.current.payload.overrides?.displayName||r.current.payload.name,dialogue:textOf(r),imageAssetId:r.current.payload.overrides?.imageAssetId||r.current.payload.baseImageId||null}};}
// Pure review. It never writes, publishes, changes a package or grants agent authority.
export function previewMapUpdate(incoming,local,{romProjectId,catalogGroupId=null,matches={},passages={},missing={},conflicts:decisions={},implemented=[]}={}){
 incoming=upgradeMapConditions(incoming);
 requireRom(/^rom-project:[a-f0-9-]{36}$/.test(romProjectId),'INVALID','Link This ROM Build to a Project First.');
 requireRom(incoming.document.origin.role==='extractor'&&local.document.kind==='map','INVALID','Update Existing Map Requires a ROM Extraction and an Existing Map.');
 const next=mapDomain(incoming),old=mapDomain(local),original=recoverSourceIdentities(incoming),prior=recoverSourceIdentities(local),ids=new Map(),used=new Set(),rows=[],unresolved=[],validMatch=new Set(),validPassage=new Set(),oldBy=new Map(old.records.map(r=>[r.recordId,r])),newBy=new Map(next.records.map(r=>[r.recordId,r]));
 const bound=local.document.extensions[UPDATE_EXTENSION]?.romProjectId;requireRom(!bound||bound===romProjectId,'CONFLICT','The Target Map Belongs to Another ROM Project.');
 const pair=(fresh,existing)=>{requireRom(fresh&&existing&&fresh.kind===existing.kind&&!used.has(existing.recordId),'CONFLICT','A Content Identity Was Matched More Than Once or Has a Different Kind.');ids.set(fresh.recordId,existing.recordId);used.add(existing.recordId);};
 for(const kind of ['map','region'])pair(next.records.find(r=>r.kind===kind),old.records.find(r=>r.kind===kind));
 const nm=next.records.find(r=>r.kind==='map'),om=old.records.find(r=>r.kind==='map');pair(newBy.get(nm.current.payload.timelineRef),oldBy.get(om.current.payload.timelineRef));
 const evidence=new Map(original.entries.map(e=>[e.id,e])),oldEvidence=new Map(prior.entries.map(e=>[e.id,e]));
 const remaining=next.records.filter(r=>!ids.has(r.recordId)&&r.kind!=='profile');
 // Parents before children. A parent may remain unresolved; never guess through it.
 remaining.sort((a,b)=>{const depth=r=>{let n=0;while(r.parentRecordId){r=newBy.get(r.parentRecordId);if(!r)break;n++;}return n;};return depth(a)-depth(b);});
 for(const r of remaining){const candidates=old.records.filter(o=>o.kind===r.kind&&!used.has(o.recordId));validMatch.add(r.recordId);const explicit=matches[r.recordId];let match;
  if(explicit!==undefined){requireRom(explicit==='new'||candidates.some(o=>o.recordId===explicit),'INVALID','Choose an Existing Item of the Same Kind or New Item.');match=candidates.find(o=>o.recordId===explicit);}
  else {const e=evidence.get(r.recordId);const exact=candidates.filter(o=>{const p=ids.get(r.parentRecordId),before=oldEvidence.get(o.recordId);if(p!==o.parentRecordId)return false;if(e&&before)return e.kind===before.kind&&e.evidenceSHA256===before.evidenceSHA256&&(prior.sourceSHA256!==original.sourceSHA256||e.key===before.key);if(r.legacyData?.romGroup)return r.legacyData.romGroup.id===o.legacyData?.romGroup?.id;return ['scene','interactive'].includes(r.kind)&&!e&&!before&&pointSignatureList(r)===pointSignatureList(o);});if(exact.length===1)match=exact[0];}
  if(match)pair(r,match);else if(explicit==='new')ids.set(r.recordId,r.recordId);else unresolved.push('item:'+r.recordId);
  rows.push({incoming:describe(r,newBy),existing:match?describe(match,oldBy):null,choice:match?.recordId|| (explicit==='new'?'new':null),automatic:explicit===undefined&&!!match,candidates:candidates.map(o=>{const {dialogue,imageAssetId,...v}=describe(o,oldBy);return v;})});
 }
 for(const r of next.records.filter(r=>r.kind==='appearance')){const target=oldBy.get(ids.get(r.recordId)),fresh=newBy.get(r.current.payload.profileId),before=oldBy.get(target?.current.payload.profileId);if(fresh&&!ids.has(fresh.recordId)){if(before){ids.set(fresh.recordId,before.recordId);used.add(before.recordId);}else ids.set(fresh.recordId,fresh.recordId);}}
 for(const r of next.records.filter(r=>r.kind==='profile'))if(!ids.has(r.recordId))ids.set(r.recordId,r.recordId);
 const pointRows=[];
 for(const r of next.records){const o=oldBy.get(ids.get(r.recordId));if(!r.current.payload.points||!o?.current.payload.points)continue;const taken=new Set();
  for(const pid of r.current.payload.pointOrder){const p=r.current.payload.points[pid],key=r.recordId+':'+pid,options=o.current.payload.pointOrder.filter(id=>!taken.has(id)),explicit=passages[key];validPassage.add(key);let id;
   if(explicit!==undefined){requireRom(explicit==='new'||options.includes(explicit),'INVALID','Choose an Existing Prompt or New Prompt.');id=explicit==='new'?null:explicit;}
   else{const exact=options.filter(id=>{const op=o.current.payload.points[id];return prior.sourceSHA256===original.sourceSHA256?equal(op.legacyData?.romRoot?.flow,p.legacyData?.romRoot?.flow)&&equal(op.legacyData?.romRoot?.kind,p.legacyData?.romRoot?.kind)&&equal(op.legacyData?.romRoot?.predicate,p.legacyData?.romRoot?.predicate):pointSignature(op)===pointSignature(p);});if(exact.length===1)id=exact[0];}
   if(id){ids.set(pid,id);taken.add(id);}else if(explicit!=='new')unresolved.push('prompt:'+key);
   pointRows.push({key,kind:'prompt',incoming:{id:pid,text:p.blockOrder.map(b=>p.blocks[b].text).join('\n\n')},existing:id?{id,text:o.current.payload.points[id].blockOrder.map(b=>o.current.payload.points[id].blocks[b].text).join('\n\n')}:null,choice:id|| (explicit==='new'?'new':null),candidates:options.map(id=>({id,text:o.current.payload.points[id].blockOrder.map(b=>o.current.payload.points[id].blocks[b].text).join('\n\n').slice(0,280)}))});
   if(!id)continue;const before=o.current.payload.points[id],blocksTaken=new Set();
   for(const bid of p.blockOrder){const b=p.blocks[bid],bkey=r.recordId+':'+pid+':'+bid,opts=before.blockOrder.filter(id=>!blocksTaken.has(id)&&before.blocks[id].kind===b.kind),choice=passages[bkey];validPassage.add(bkey);let target;
    if(choice!==undefined){requireRom(choice==='new'||opts.includes(choice),'INVALID','Choose an Existing Passage or New Passage.');target=choice==='new'?null:choice;}
    else{const exact=opts.filter(id=>{const ob=before.blocks[id];return prior.sourceSHA256===original.sourceSHA256&&b.rawMessageData?equal(withoutAsset(ob.rawMessageData),withoutAsset(b.rawMessageData)):blockSignature(ob)===blockSignature(b);});if(exact.length===1)target=exact[0];}
    if(target){ids.set(bid,target);blocksTaken.add(target);}else if(choice!=='new')unresolved.push('block:'+bkey);
    pointRows.push({key:bkey,kind:'passage',incoming:{id:bid,text:b.text},existing:target?{id:target,text:before.blocks[target].text}:null,choice:target|| (choice==='new'?'new':null),candidates:opts.map(id=>({id,text:before.blocks[id].text.slice(0,280)}))});
   }
  }
 }
 // Scene-state conditions, not display labels or ordinal positions, identify stages.
 const timeline=newBy.get(nm.current.payload.timelineRef),oldTimeline=oldBy.get(om.current.payload.timelineRef);
 for(const s of timeline.current.payload.definitions.stages){const candidates=oldTimeline.current.payload.definitions.stages.filter(o=>equal(o.condition,s.condition));if(candidates.length===1)ids.set(s.id,candidates[0].id);}
 requireRom(Object.keys(matches).every(k=>validMatch.has(k))&&Object.keys(passages).every(k=>validPassage.has(k)),'INVALID','A Saved Identity Choice Is Outside This Review.');
 const omitted=old.records.filter(r=>!used.has(r.recordId)&&!['profile','shared','region'].includes(r.kind)).map(r=>({...describe(r,oldBy),action:missing[r.recordId]||'retain'}));
 requireRom(Object.entries(missing).every(([id,action])=>omitted.some(r=>r.id===id)&&['retain','archive'].includes(action)),'INVALID','Invalid Missing-Record Review Choice.');
 const preview={format:'ROMDexMapUpdatePreview/1',baseline:local.document.revision,incomingRevision:incoming.document.revision,romProjectId,oldBuild:prior.sourceSHA256,newBuild:original.sourceSHA256,map:om.current.payload.name,rows,passages:pointRows,omitted,unresolved,conflicts:[],appearsImplemented:[],requiresHumanTesting:true};
 const options={romProjectId,catalogGroupId,matches,passages,missing,conflicts:decisions,implemented};preview.token=sha(canonical({baseline:preview.baseline,incoming:preview.incomingRevision,options}));
 if(unresolved.length)return {preview};
 const doc=clone(local.document),blobs=new Map(local.blobs);
 // Fresh extraction/presentation history belongs to its temporary document ID.
 // Retain the source bytes and selected source heads, never embed a second map.
 for(const a of incoming.document.assetInventory.filter(a=>a.purpose!=='history')){const prior=doc.assetInventory.find(o=>o.assetId===a.assetId);requireRom(!prior||same(prior,a),'INTEGRITY','An Asset Identity Has Different Bytes.');if(!prior)doc.assetInventory.push(clone(a));blobs.set(a.sha256,incoming.blobs.get(a.sha256));}
 retainDocument(doc,blobs,local);
 const mappings=next.mappings.map(m=>seal({...rewrite(m,ids),workspaceId:doc.datasetId,source:{...m.source,repositoryId:prior.projectId}})),mappingIds=new Map(next.mappings.map((m,i)=>[m.digest,mappings[i].digest]));
 const protectedProfiles=new Set(local.document.extensions[UPDATE_EXTENSION]?.protectedProfileIds||[]);
 const sharedProfiles=new Set(next.records.filter(r=>r.kind==='profile'&&next.records.filter(o=>o.kind==='profile'&&ids.get(o.recordId)===ids.get(r.recordId)).length>1).map(r=>ids.get(r.recordId)));for(const id of protectedProfiles)sharedProfiles.add(id);
 const baseline=sourceBaseline(local,old),sourceRows=[...new Map(next.records.map(r=>{let result;if(r.kind==='profile'&&sharedProfiles.has(ids.get(r.recordId)))result=oldBy.get(ids.get(r.recordId));else{result=rebindConditionSources(rewrite(r,ids),next.mappings,mappings,ids);if(r.kind==='appearance')result.legacyData.romExtraction.frameBindings=newBy.get(r.current.payload.profileId)?.legacyData?.romExtraction?.frameBindings||[];result=seal({...result,workspaceId:doc.datasetId,parents:[],operationId:'content:source-update-'+sha(preview.token+r.recordId).slice(0,40),mappingRefs:r.mappingRefs.map(h=>mappingIds.get(h))});}return [result.recordId,result];})).values()];
 const heads=new Map(old.records.map(r=>[r.recordId,clone(r)])),validConflicts=new Set();
 function merge(base,local,newer,path){
  if(equal(local,newer)||equal(newer,base))return clone(local);if(equal(local,base))return clone(newer);
  if([base,local,newer].every(v=>v&&typeof v==='object'&&!Array.isArray(v))){const result={};for(const k of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(newer)])){const value=merge(base[k],local[k],newer[k],path+'/'+k.replace(/~/g,'~0').replace(/\//g,'~1'));if(value!==undefined)result[k]=value;}return result;}
  validConflicts.add(path);const choice=decisions[path];requireRom(choice===undefined||['local','incoming'].includes(choice),'INVALID','Invalid Content Conflict Choice.');preview.conflicts.push({id:path,local:local??null,incoming:newer??null,choice:choice||null});return clone(choice==='incoming'?newer:local);
 }
 for(const source of sourceRows){const before=heads.get(source.recordId);if(!before){heads.set(source.recordId,source);continue;}const current=clone(source.current),p=current.payload,b=before.current.payload,base=baseline.get(before.recordId)?.current.payload;
  // User names/images and explicit overrides survive changing source presentation.
  p.name=b.name;if(Object.hasOwn(b,'overrides'))p.overrides=clone(b.overrides);if(b.profileByPlayerGender)p.profileByPlayerGender=clone(b.profileByPlayerGender);if(source.kind==='subzone'&&before.parentRecordId!==om.recordId&&!incoming.document.extensions['org.romdex.map-groups'])source.parentRecordId=before.parentRecordId;
  if(b.baseImageId&&b.baseImageId!==base?.baseImageId)p.baseImageId=b.baseImageId;
  if(p.points){for(const pid of p.pointOrder){const np=p.points[pid],op=b.points?.[pid],bp=base?.points?.[pid];if(!op)continue;for(const bid of np.blockOrder){const nb=np.blocks[bid],ob=op.blocks[bid],bb=bp?.blocks?.[bid];if(ob){nb.reviewKey=ob.reviewKey;nb.text=merge(bb?.text,ob.text,nb.text,source.recordId+'/points/'+pid+'/blocks/'+bid+'/text');}}for(const bid of op.blockOrder)if(!np.blocks[bid]){np.blocks[bid]=clone(op.blocks[bid]);np.blocks[bid].legacyData={...np.blocks[bid].legacyData,retainedFromOlderBuild:true};np.blockOrder.push(bid);}}
   for(const pid of b.pointOrder||[])if(!p.points[pid]){p.points[pid]=clone(b.points[pid]);p.points[pid].legacyData={...p.points[pid].legacyData,retainedFromOlderBuild:true};p.pointOrder.push(pid);}
  }
  if(source.recordId===om.current.payload.timelineRef&&!p.definitions.conditionIndex){const stages=p.definitions.stages;for(const s of stages){const prev=b.definitions.stages.find(o=>o.id===s.id);if(prev)s.name=prev.name;}for(const s of b.definitions.stages)if(!stages.some(n=>n.id===s.id))stages.push(clone(s));const order=b.definitions.stages.map(s=>s.id);stages.sort((a,z)=>(order.includes(a.id)?order.indexOf(a.id):9999)-(order.includes(z.id)?order.indexOf(z.id):9999));}
  current.lifecycle=before.current.lifecycle;heads.set(source.recordId,seal({...source,parents:[before.revisionId],current,legacyRefs:before.legacyRefs,legacyData:{...before.legacyData,...source.legacyData}}));
 }
 for(const row of omitted)if(row.action==='archive'){const r=heads.get(row.id);r.current.lifecycle='archived';}
 // Membership follows reviewed parent changes, including retained old members.
 for(const r of heads.values()){const p=r.current.payload;if(r.kind==='map')p.subzoneIds=[...heads.values()].filter(x=>x.kind==='subzone').map(x=>x.recordId);if(r.kind==='subzone'){for(const [field,kind]of [['appearanceIds','appearance'],['interactiveIds','interactive'],['sceneIds','scene']])p[field]=[...heads.values()].filter(x=>x.kind===kind&&x.parentRecordId===r.recordId).map(x=>x.recordId);if([...heads.values()].some(x=>x.kind==='subzone'&&x.parentRecordId===r.recordId)||p.subzoneIds)p.subzoneIds=[...heads.values()].filter(x=>x.kind==='subzone'&&x.parentRecordId===r.recordId).map(x=>x.recordId);}}
 requireRom(Object.keys(decisions).every(k=>validConflicts.has(k)),'INVALID','A Saved Conflict Choice Is Outside This Review.');
 for(const [id,r]of heads)heads.set(id,clone(r));finishUpdatedConditions(heads,oldBy.get(om.current.payload.timelineRef));
 const final=[...heads.values()].map(r=>{const before=oldBy.get(r.recordId);return before&&same(r.current,before.current)&&r.parentRecordId===before.parentRecordId&&same(r.legacyData,before.legacyData)?before:seal({...r,parents:before?[before.revisionId]:[],operationId:'content:rom-update-'+sha(preview.token+r.recordId).slice(0,40),actorClaim:'romdex:reviewed-update'});});
 doc.content.records=[...new Map([...old.revisions,...sourceRows,...final].map(r=>[r.revisionId,r])).values()];doc.content.recordHeads=final.map(ref);doc.content.mappings=[...new Map([...old.mappings,...mappings].map(m=>[m.digest,m])).values()];
 const valueAt=(record,path)=>{let value=record?.current;for(const k of path.split('/').slice(1)){if(!value||typeof value!=='object'||!Object.hasOwn(value,k.replace(/~1/g,'/').replace(/~0/g,'~')))return {exists:false};value=value[k.replace(/~1/g,'/').replace(/~0/g,'~')];}return {exists:true,value};};
 for(const plan of viewHeads(old.plans).filter(p=>!['implemented','superseded','final'].includes(p.workflow)&&p.intent!=='FINAL'&&p.changes.some(c=>!same(c.before,c.after)))){const exact=plan.changes.every(c=>same(valueAt(final.find(r=>r.recordId===c.recordId),c.path),c.after));if(!exact)continue;preview.appearsImplemented.push({id:plan.planId,target:plan.target.recordId,instructions:plan.instructions,confirmed:implemented.includes(plan.planId)});if(implemented.includes(plan.planId))doc.content.plans.push(seal({...plan,parents:[plan.digest],version:plan.version+1,workflow:'implemented',actorClaim:'romdex:owner-confirmed-source',operationId:'content:confirm-source-'+sha(preview.token+plan.planId).slice(0,40)}));}
 requireRom(implemented.every(id=>preview.appearsImplemented.some(p=>p.id===id)),'INVALID','Implementation Confirmation Requires an Exact Structured Match.');
 const manifest=sealIdentities({...original,projectId:prior.projectId,entries:original.entries.map(e=>({...e,id:ids.get(e.id)||e.id}))});
 const raw=Buffer.from(canonical({format:'ROMDexSourceBaseline/1',heads:sourceRows.map(ref)})),hash=sha(raw),assetId='content:source-baseline-'+hash;
 doc.assetInventory.push({assetId,sha256:hash,bytes:raw.length,mime:'application/json',purpose:'attachment'});blobs.set(hash,raw);
 doc.extensions['org.romdex.rom-source']={...clone(incoming.document.extensions['org.romdex.rom-source']),projectId:prior.projectId,requiresHumanTesting:true};
 for(const k of ['org.romdex.import-preparation','org.romdex.map-groups'])if(incoming.document.extensions[k])doc.extensions[k]=clone(incoming.document.extensions[k]);
 doc.extensions[UPDATE_EXTENSION]={format:'ROMDexReviewedROMUpdate/1',romProjectId,catalogGroupId,protectedProfileIds:[...sharedProfiles],baseline:local.document.revision,baselineDocumentAsset:'history:rdx-'+sha(local.documentBytes),reviewToken:preview.token,builds:[...new Set([...(local.document.extensions[UPDATE_EXTENSION]?.builds||[]),prior.sourceSHA256,original.sourceSHA256])],identities:manifest,sourceBaselineAsset:assetId,review:{matches:clone(matches),passages:clone(passages),missing:clone(missing),conflicts:clone(decisions),implemented:clone(implemented)},requiresHumanTesting:true};
 updateLocationFeatures(doc,incoming.document,ids,final,rewrite,next.mappings,mappings);updateFeatureBinding(doc,incoming.document,ids);
 doc.capabilities.required=[...new Set([...doc.capabilities.required,...incoming.document.capabilities.required,UPDATE_CAPABILITY])];
 doc.scope.ownedRecordIds=final.filter(r=>!['region','shared','profile'].includes(r.kind)).map(r=>r.recordId);doc.scope.contextRecordIds=final.filter(r=>['region','shared','profile'].includes(r.kind)).map(r=>r.recordId);doc.scope.mode='partial';doc.scope.completeForParentIds=[];doc.scope.baselineInventory=[];doc.parents=[local.document.revision];doc.result=null;doc.origin={...doc.origin,role:'user',generator:'ROMDex Managed Documents/1'};doc.revision=documentRevision(doc);
 const documentBytes=Buffer.from(canonical(doc));if(preview.conflicts.every(c=>c.choice))validateDocument(documentBytes,{blobs});return {preview,document:doc,documentBytes,blobs};
}
function pointSignatureList(r){return canonical((r.current.payload.pointOrder||[]).map(id=>pointSignature(r.current.payload.points[id])));}

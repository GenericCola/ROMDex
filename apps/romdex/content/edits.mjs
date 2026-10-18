import {randomUUID} from 'node:crypto';
import {checkImageBounds} from './image-bounds.mjs';
import {seal,sha,same,conforms,requireThat,validateArtifact,pointPayload} from './contracts.mjs';
import {applyPublication,resolvePublication,versionHeads} from './materialize.mjs';
const uid=kind=>'content:'+kind+'-'+randomUUID();
const ref=r=>({recordId:r.recordId,revisionId:r.revisionId});
const target=(r,c)=>({recordId:r.recordId,pointId:c.pointId||null,blockIds:c.blockId?[c.blockId]:[],promptKey:c.promptKey||null,gender:c.gender||null});
const base=(schema,ctx,suffix)=>({schema,workspaceId:ctx.workspace,operationId:ctx.operationId+':'+suffix,createdAt:ctx.createdAt,actorClaim:'fixture:owner'});
const text=(s,label,limit=65536)=>{requireThat(typeof s==='string'&&s.length<=limit,label+' Is Too Long or Invalid.');return s;};
function image(value){if(!value)return null;requireThat(value&&['image/png','image/jpeg','image/gif','image/webp'].includes(value.mime)&&typeof value.base64==='string'&&value.base64.length<=700000,'Unsupported Planning Image.');const bytes=Buffer.from(value.base64,'base64');requireThat(bytes.length>0&&bytes.length<=512*1024&&bytes.toString('base64')===value.base64,'Invalid Planning Image Bytes.');const mime=value.mime,valid=mime==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/gif'?/^GIF8[79]a$/.test(bytes.subarray(0,6).toString()):bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';requireThat(valid,'Planning Image Signature Differs.');checkImageBounds(bytes,mime);return {assetId:'content:asset-'+sha(bytes),mime,base64:value.base64,sha256:sha(bytes),bytes:bytes.length};}
export function buildEdit(domain,command,ctx){
 requireThat(ctx.workspace.startsWith('fixture:')&&command&&typeof command==='object','An Isolated Edit Context Is Required.');
 const byId=new Map(domain.records.map(r=>[r.recordId,r])),r=byId.get(command.recordId);const assets=[],artifacts=[];let kind='planning',resultDigest=null;
 const get=()=>{requireThat(r,'The Selected Content Record Is Missing.');if(command.expectedRevision)requireThat(r.revisionId===command.expectedRevision,'The Selected Content Has Changed. Review the Latest Version.');return r;};
 const asset=image(command.image);if(asset)assets.push(asset);const pointPath=record=>record.kind==='shared'?'/payload/definitions/points/':'/payload/points/';
 if(command.type==='plan'||command.type==='review'){
  get();requireThat(!asset||command.type==='plan','Use a Plan or Definition for an Image.');const t=target(r,command);const identity=command.type==='plan'?'planId':'reviewId',key=command.type==='plan'?'plans':'reviews',id=command[identity]||uid(command.type),heads=versionHeads(domain[key],identity,id);
  requireThat(same(heads.map(h=>h.digest).sort(),[...(command.expectedParents||[])].sort()),'This Draft Has Newer or Conflicting Versions.');
  if(heads.length>1)requireThat(command.reviewedHeads===true,'Review All Conflicting Draft Versions Before Saving.');
  const prior=heads[0];if(prior)requireThat(same(t,prior.target),'A Draft Must Keep Its Original Prompt Scope.');
  let a={...base(command.type==='plan'?'NPCDexPlanRevision/1':'NPCDexReviewRevision/1',ctx,command.type),[identity]:id,parents:heads.map(h=>h.digest),target:t,baseline:ref(r)};
  if(command.type==='plan'){
   requireThat(heads.every(h=>same(h.baseline,prior?.baseline)),'Conflicting Drafts Have Different Baselines. Keep Them Separate for Explicit Rescoping.');const baselineRecord=prior?domain.revisions.find(x=>x.revisionId===prior.baseline.revisionId):r;requireThat(baselineRecord,'The Original Plan Baseline Is Missing.');
   const intent=command.intent||'UPDATE',workflow=command.workflow||'draft',instructions=text(command.instructions||'','Instructions'),dialogue=text(command.proposedDialogue||'','Proposed Dialogue');let changes=[];
   if(intent==='UPDATE'){const byPath=new Map(),explicit=new Set([...(command.blockId?[pointPath(r)+command.pointId+'/blocks/'+command.blockId+'/text']:[]),...(command.proposedName!==undefined?['/payload/name']:[]),...(asset?[r.kind==='profile'?'/payload/baseImageId':'/payload/overrides/imageAssetId']:[])]);for(const head of heads.filter(h=>h.intent==='UPDATE'))for(const change of head.changes){const key=change.recordId+':'+change.path,old=byPath.get(key);requireThat(!old||same(old,change)||explicit.has(change.path),'Conflicting Scoped Changes Need an Explicit Choice.');for(const priorChange of byPath.values())requireThat(priorChange.path===change.path||!(priorChange.path.startsWith(change.path+'/')||change.path.startsWith(priorChange.path+'/')),'Overlapping Draft Scopes Need Explicit Rescoping.');byPath.set(key,structuredClone(change));}changes=[...byPath.values()];}
   const patch=(path,before,after)=>{changes=changes.filter(c=>!(c.recordId===r.recordId&&c.path===path));if(!same(before,after))changes.push({recordId:r.recordId,path,before:{exists:true,value:before},after:{exists:true,value:after}});};
   if(intent==='REMOVE'||intent==='ADD')changes=[{recordId:r.recordId,path:'/lifecycle',before:{exists:true,value:baselineRecord.current.lifecycle},after:{exists:true,value:intent==='REMOVE'?'archived':'active'}}];
   else if(intent==='UPDATE'){if(command.blockId){const block=pointPayload(baselineRecord)?.points[command.pointId]?.blocks?.[command.blockId];requireThat(block,'The Prompt Block Is Missing from the Original Baseline.');patch(pointPath(r)+command.pointId+'/blocks/'+command.blockId+'/text',block.text,dialogue);}
    if(command.proposedName!==undefined)patch('/payload/name',baselineRecord.current.payload.name,text(command.proposedName,'Proposed Name',1024));
    if(asset){requireThat(['profile','appearance'].includes(r.kind),'A Proposed Picture Requires a Profile or Appearance.');patch(r.kind==='profile'?'/payload/baseImageId':'/payload/overrides/imageAssetId',r.kind==='profile'?baselineRecord.current.payload.baseImageId:baselineRecord.current.payload.overrides.imageAssetId,asset.assetId);}
   }
   if(intent==='ADD')requireThat(r.current.lifecycle==='planned','ADD Must Target a Planned Addition.');
   if(r.kind==='profile')requireThat(command.sharedAcknowledged===true,'Acknowledge the Shared Character Scope Before Staging This Plan.');
   const union=key=>[...new Map(heads.flatMap(h=>h[key]).map(x=>[JSON.stringify(x),x])).values()];
   a={...a,version:1+Math.max(0,...domain.plans.filter(p=>p.planId===id).map(p=>p.version)),intent,workflow,instructions,proposedDialogue:dialogue,baseline:prior?.baseline||ref(r),readSet:prior?union('readSet'):[ref(r)],changes,requiredAssetIds:[...new Set([...union('requiredAssetIds'),...(asset?[asset.assetId]:[])])],reviewRefs:union('reviewRefs'),legacyRefs:union('legacyRefs')};
  }else a={...a,flag:command.flag||'none',note:text(command.note||'','Note'),testStatus:command.testStatus||'unreviewed'};
  artifacts.push(seal(a));
 }else if(command.type==='addCharacter'){
  get();requireThat(r.kind==='subzone'&&r.current.lifecycle!=='archived','Choose an Available Sub-zone.');const name=text(command.name,'Name',1024);requireThat(name.trim(),'Enter a Character Name.');
  const id=uid('appearance'),profileId=command.profileId||uid('profile');if(command.profileId)requireThat(byId.get(profileId)?.kind==='profile'&&byId.get(profileId).current.lifecycle!=='archived'&&!asset,'Choose an Available Shared Profile; Edit Its Image Separately.');
  const record=(recordId,recordKind,parent,payload)=>seal({...base('NPCDexContentRevision/1',ctx,recordKind),recordId,kind:recordKind,parentRecordId:parent,parents:[],current:{lifecycle:'planned',payload},mappingRefs:[],legacyRefs:[],legacyData:{}});
  if(!command.profileId)artifacts.push(record(profileId,'profile',null,{name,baseImageId:asset?.assetId||null,identityEvidence:[]}));
  const pointId=uid('point'),blockId=uid('block'),dialogue=text(command.dialogue||'','Dialogue');const point={id:pointId,condition:'',stageIds:[],sourceIds:[],participantIds:[id],blockOrder:[blockId],blocks:{[blockId]:{id:blockId,kind:'dialogue',text:dialogue,speaker:profileId,gender:'both',reviewKey:uid('prompt'),archived:false,sourceBlockId:null,sourceIds:[],rawMessageData:{},legacyData:{}}},evidence:[],legacyData:{}};
  artifacts.push(record(id,'appearance',r.recordId,{name,profileId,profileByPlayerGender:{male:null,female:null},sourceAreaKeys:[],sourceElementIds:[],points:{[pointId]:point},pointOrder:[pointId],sceneIds:[],overrides:{displayName:command.profileId&&name!==byId.get(profileId).current.payload.name?name:null,imageAssetId:null}}));
  const parent=structuredClone(r);parent.operationId=ctx.operationId+':membership';parent.createdAt=ctx.createdAt;parent.actorClaim='fixture:owner';parent.parents=[r.revisionId];parent.current.payload.appearanceIds.push(id);artifacts.push(seal(parent));
 }else if(command.type==='definition'||command.type==='archivePlanned'){
  get();const after=structuredClone(r);after.operationId=ctx.operationId+':record';after.createdAt=ctx.createdAt;after.actorClaim='fixture:owner';after.parents=[r.revisionId];
  if(command.type==='archivePlanned'){requireThat(r.current.lifecycle==='planned','Existing ROM Content Needs a Removal Proposal or Explicit Documentation Correction.');after.current.lifecycle='archived';}
  else{
   requireThat(command.documentationCorrection===true||r.current.lifecycle==='planned','Choose Documentation Correction Explicitly.');
   const p=after.current.payload;if(command.name!==undefined){const name=text(command.name,'Name',1024);requireThat(name.trim(),'Enter a Name.');if(r.kind==='appearance')p.overrides.displayName=name;else p.name=name;}
   if(command.clearOverride===true){requireThat(r.kind==='appearance','Only a Local Appearance Has Overrides.');p.overrides={displayName:null,imageAssetId:null};}
   if(asset){if(r.kind==='profile')p.baseImageId=asset.assetId;else{requireThat(r.kind==='appearance','An Image Requires a Profile or Local Appearance.');p.overrides.imageAssetId=asset.assetId;}}
   if(command.profileId!==undefined||command.profileByPlayerGender!==undefined){requireThat(r.kind==='appearance','Profile Links Belong to an Appearance.');if(command.profileId!==undefined)p.profileId=command.profileId;if(command.profileByPlayerGender!==undefined)p.profileByPlayerGender=structuredClone(command.profileByPlayerGender);}
   if(command.dialogue!==undefined){requireThat(pointPayload(after)?.points[command.pointId]?.blocks?.[command.blockId],'The Selected Dialogue Block Is Missing.');pointPayload(after).points[command.pointId].blocks[command.blockId].text=text(command.dialogue,'Dialogue');}
   if(command.lifecycle!==undefined){requireThat(command.documentationCorrection===true,'Lifecycle Corrections Need Explicit Documentation Intent.');after.current.lifecycle=command.lifecycle;}
   if(r.kind==='profile')requireThat(command.sharedAcknowledged===true,'Acknowledge That This Corrects Every Appearance Using This Profile.');
  }
  const updated=seal(after);if(r.current.lifecycle==='planned'&&command.documentationCorrection!==true)artifacts.push(updated);
  else{kind='correction';const reason=text(command.reason||'','Correction Reason',8192);requireThat(reason.trim()&&typeof command.evidence==='string'&&command.evidence.trim(),'A Documentation Correction Needs a Reason and Evidence.');const updates=[{before:ref(r),after:updated}];
   if(r.kind==='profile'){const affected=new Set(domain.records.filter(x=>x.kind==='appearance'&&[x.current.payload.profileId,...Object.values(x.current.payload.profileByPlayerGender)].includes(r.recordId)).map(x=>x.recordId));for(const dependent of domain.records){if(dependent.recordId===r.recordId||!affected.has(dependent.recordId)&&!dependent.current.payload.participantIds?.some(id=>affected.has(id))&&!Object.values(pointPayload(dependent)?.points||{}).some(p=>Object.values(p.blocks).some(b=>b.speaker===r.recordId)))continue;const next=structuredClone(dependent);next.operationId=ctx.operationId+':dependent-'+updates.length;next.createdAt=ctx.createdAt;next.actorClaim='fixture:owner';next.parents=[dependent.revisionId];updates.push({before:ref(dependent),after:seal(next)});}}
   const correction=seal({...base('NPCDexDocumentationCorrection/1',ctx,'correction'),correctionId:ctx.operationId,reason,evidence:[{label:'Owner Documentation Evidence',sourceId:'fixture:owner',excerpt:text(command.evidence,'Correction Evidence'),locator:null}],readSet:updates.map(u=>u.before),recordUpdates:updates,romChangeRequested:false});artifacts.push(correction,...updates.map(u=>u.after));resultDigest=correction.digest;}
 }else throw Error('Unsupported Content Edit.');
 for(const a of artifacts)validateArtifact(Buffer.from(JSON.stringify(a)),ctx.workspace);
 const publication=seal({...base('NPCDexPublication/1',ctx,'publication'),operationId:ctx.operationId,publicationId:ctx.operationId,kind,parentPublications:[ctx.head],artifactDigests:artifacts.map(a=>a.revisionId||a.digest),baseRevisions:kind==='correction'?artifacts[0].readSet:r?[ref(r)]:[],resultDigest,groupId:null});
 const mapped=assets.map(({base64,...a})=>a);const preview=applyPublication(domain,publication,artifacts,mapped);return {publication,artifacts,assets,preview};
}
export function buildResolution(domains,publications,choices,ctx){
 requireThat(publications.length>=2&&publications.length<=16,'Choose the Observed Conflict Heads.');const all=new Map();for(const domain of domains)for(const r of domain.records){if(!all.has(r.recordId))all.set(r.recordId,[]);all.get(r.recordId).push(r);}
 const artifacts=[...all].map(([id,records])=>{const revisions=[...new Set(records.map(r=>r.revisionId))];const chosen=choices[id]||(revisions.length===1?revisions[0]:null);requireThat(chosen,'Choose a Current Version for '+id+'.');const record=records.find(r=>r.revisionId===chosen);requireThat(record,'Resolution Choice Is Not an Observed Revision.');return record;});
 const refs=new Map(domains.flatMap(d=>d.records.map(r=>[r.recordId+':'+r.revisionId,ref(r)])));
 const publication=seal({...base('NPCDexPublication/1',ctx,'resolution'),operationId:ctx.operationId,publicationId:ctx.operationId,kind:'resolution',parentPublications:[...publications].sort(),artifactDigests:artifacts.map(a=>a.revisionId),baseRevisions:[...refs.values()],resultDigest:null,groupId:null});
 const preview=resolvePublication(domains,publication,artifacts,[]);return {publication,artifacts,assets:[],preview};
}

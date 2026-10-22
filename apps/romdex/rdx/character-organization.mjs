import {ORGANIZATION_CAPABILITY} from './organization-contract.mjs';
import {canonical,sha,same} from '../content/contracts.mjs';
import {mapDomain} from './map-import.mjs';
import {documentRevision} from './document.mjs';
import {buildEdit} from '../content/edits.mjs';
import {localDocumentAuthority} from '../content/authorization.mjs';
import {ensure} from './limits.mjs';

export class CharacterOrganization{
 constructor(maps){this.maps=maps;}
 async inventory(){
  const out=[];
  for(const row of this.maps.store.db.prepare("SELECT key,head FROM documents WHERE kind='map' ORDER BY key").all()){
   if(this.maps.get('retired-map:'+row.key))continue;
   const value=await this.maps.store.view(row.key),domain=mapDomain(value),map=domain.records.find(r=>r.kind==='map');
   out.push({key:row.key,head:row.head,saved:value.status.saved,value,domain,map});
  }return out;
 }
 async list(){return (await this.inventory()).map(({key,head,value,domain,map})=>({key,head,datasetId:value.document.datasetId,mapId:map.recordId,name:map.current.payload.name,placements:domain.records.filter(r=>r.kind==='appearance'&&r.current.lifecycle!=='archived').map(r=>({recordId:r.recordId,revision:r.revisionId,profileId:r.current.payload.profileId,name:r.current.payload.overrides.displayName||r.current.payload.name,area:domain.records.find(x=>x.recordId===r.parentRecordId)?.current.payload.name,dialogue:Object.values(r.current.payload.points).flatMap(p=>p.blockOrder.map(id=>p.blocks[id].text)).join('\n').slice(0,4096),sharedName:domain.records.find(x=>x.recordId===r.current.payload.profileId)?.current.payload.name}))}));}
 async preview(request){
  ensure(request&&['reassign','detach','profile'].includes(request.mode),'INVALID','Choose an Identity Action.');
  const rows=await this.inventory(),source=rows.find(r=>r.key===request.key),record=source?.domain.records.find(r=>r.recordId===request.recordId);
  ensure(source&&source.saved&&record?.kind==='appearance'&&record.current.lifecycle!=='archived','INVALID','Choose a Saved Current Placement.');
  const profileId=record.current.payload.profileId,scope=rows.filter(r=>r.value.document.datasetId===source.value.document.datasetId),target=scope.find(r=>r.key===request.targetKey),targetRecord=target?.domain.records.find(r=>r.recordId===request.targetRecordId);
  if(request.mode==='reassign')ensure(target?.saved&&targetRecord?.kind==='appearance'&&targetRecord.current.lifecycle!=='archived'&&targetRecord.current.payload.profileId!==profileId,'INVALID','Choose Another Character in the Same ROM Project.');
  if(request.mode!=='profile')ensure(Object.values(record.current.payload.profileByPlayerGender).every(v=>!v),'REVIEW_REQUIRED','Review Gender-Specific Identities Before Moving This Placement.');
  if(request.mode!=='reassign')ensure(typeof request.name==='string'&&request.name.trim()&&request.name.length<=1024,'INVALID','Enter the Character Name.');
  const affected=request.mode==='profile'?scope.filter(r=>r.domain.records.some(x=>x.recordId===profileId)):[source];
  const dependencies=request.mode==='reassign'?[...new Set([...affected,target])]:affected;
  for(const row of dependencies){const cloud=this.maps.cloud?.get(row.key);ensure(!cloud?.intent&&!cloud?.review&&!cloud?.held&&!this.maps.adoption?.owns(row.key),'REVIEW_REQUIRED','Finish Pending Publication or Native-Catalog Review Before Organizing These Maps.');}
  const baselines=dependencies.map(r=>({key:r.key,head:r.head,cloud:this.maps.cloud?.get(r.key)||null}));
  const normalized={mode:request.mode,key:request.key,recordId:request.recordId,...(request.mode==='reassign'?{targetKey:request.targetKey,targetRecordId:request.targetRecordId}:{name:request.name.trim()})};
  const token=sha(canonical({request:normalized,baselines})),placements=scope.flatMap(r=>r.domain.records.filter(x=>x.kind==='appearance'&&x.current.payload.profileId===profileId).map(x=>({key:r.key,map:r.map.current.payload.name,id:x.recordId,name:x.current.payload.overrides.displayName||x.current.payload.name,area:r.domain.records.find(z=>z.recordId===x.parentRecordId)?.current.payload.name})));
  const preview={token,request:normalized,baselines,createdAt:new Date().toISOString(),affectedMaps:affected.map(r=>({key:r.key,name:r.map.current.payload.name})),placements,notice:request.mode==='profile'?'Changes the shared definition in every listed map. Placement names/images, dialogue, notes, conditions and mappings remain local.':'Changes only the selected placement’s identity. Other placements, dialogue, conditions, local images, proposals and mappings are retained. No ROM change or agent dispatch.'};
  this.maps.set('character-organization-preview',preview);return preview;
 }
 async commit(input){
  const preview=this.maps.get('character-organization-preview');ensure(input?.approved===true&&preview&&input.token===preview.token,'REVIEW_REQUIRED','Review the Exact Identity Scope First.');
  const rows=await this.inventory();for(const baseline of preview.baselines){const row=rows.find(r=>r.key===baseline.key);ensure(row?.head===baseline.head&&same(this.maps.cloud?.get(row.key)||null,baseline.cloud),'CONFLICT','An Affected Map or Cloud Binding Changed. Preview Again.');}
  const request=preview.request,source=rows.find(r=>r.key===request.key),original=source.domain.records.find(r=>r.recordId===request.recordId),ctx={workspace:source.value.document.datasetId,authorization:localDocumentAuthority(source.value.document.datasetId),operationId:'content:organization-'+preview.token.slice(0,40),createdAt:preview.createdAt,head:source.head};
  const inputs=[];let linkedProfile;
  for(const affected of preview.affectedMaps){
   const row=rows.find(r=>r.key===affected.key),document=structuredClone(row.value.document),blobs=new Map(row.value.blobs);let domain=mapDomain(row.value),command;
   if(request.mode==='reassign'){
    const target=rows.find(r=>r.key===request.targetKey),appearance=target.domain.records.find(r=>r.recordId===request.targetRecordId);linkedProfile=appearance.current.payload.profileId;
    const revisions=target.domain.revisions.filter(r=>r.recordId===linkedProfile),profile=target.domain.records.find(r=>r.recordId===linkedProfile),existing=domain.records.find(r=>r.recordId===linkedProfile);
    ensure(!existing||existing.revisionId===profile.revisionId,'REVIEW_REQUIRED','The Shared Profile Has Conflicting Copies.');
    if(!existing){document.content.records.push(...revisions);document.content.recordHeads.push({recordId:linkedProfile,revisionId:profile.revisionId});document.scope.contextRecordIds.push(linkedProfile);for(const a of target.domain.assets.filter(a=>a.purpose==='image'&&revisions.some(r=>canonical(r).includes(a.assetId)||canonical(r).includes(a.sha256)))){const old=document.assetInventory.find(b=>b.assetId===a.assetId);ensure(!old||same(old,a),'INTEGRITY','Shared Image Identity Changed.');if(!old)document.assetInventory.push(a);blobs.set(a.sha256,target.value.blobs.get(a.sha256));}domain=mapDomain({...row.value,document,blobs});}
    command={type:'definition',recordId:original.recordId,expectedRevision:original.revisionId,profileId:linkedProfile,documentationCorrection:true,reason:'Owner-reviewed placement reassignment',evidence:preview.notice};
   }else if(request.mode==='detach')command={type:'detachCharacter',recordId:original.recordId,expectedRevision:original.revisionId,name:request.name,approved:true,documentationCorrection:true};
   else {const profile=domain.records.find(r=>r.recordId===original.current.payload.profileId),baseline=source.domain.records.find(r=>r.recordId===profile.recordId);ensure(profile.revisionId===baseline.revisionId,'REVIEW_REQUIRED','Shared Profile Copies Differ; Resolve Them First.');command={type:'definition',recordId:profile.recordId,expectedRevision:profile.revisionId,name:request.name,documentationCorrection:true,sharedAcknowledged:true,reason:'Owner-reviewed shared profile scope',evidence:preview.notice};}
   const edit=buildEdit(domain,command,ctx);document.content.records=edit.preview.revisions;document.content.recordHeads=edit.preview.records.map(r=>({recordId:r.recordId,revisionId:r.revisionId}));for(const key of ['plans','reviews','mappings','views'])document.content[key]=edit.preview[key]||[];
   for(const a of edit.artifacts){const bytes=Buffer.from(canonical(a)),hash=sha(bytes),assetId='history:artifact-'+hash;if(!document.assetInventory.some(a=>a.assetId===assetId)){document.assetInventory.push({assetId,sha256:hash,bytes:bytes.length,mime:'application/json',purpose:'history'});document.content.history.push({sha256:hash,mediaType:'application/json',schema:a.schema,purpose:'Reviewed Character Organization'});blobs.set(hash,bytes);}}
   if(request.mode==='detach')document.capabilities.required=[...new Set([...document.capabilities.required,ORGANIZATION_CAPABILITY])];document.scope.contextRecordIds=edit.preview.records.filter(r=>['region','profile','shared'].includes(r.kind)).map(r=>r.recordId);document.revision=documentRevision(document);inputs.push({key:row.key,documentBytes:Buffer.from(canonical(document)),blobs,expectedRevision:row.head});
  }
  const result=await this.maps.store.saveBatch(inputs,{metadata:heads=>{this.maps.set('character-organization:'+preview.token,{...preview,heads,committedAt:new Date().toISOString()});this.maps.set('character-organization-preview',null);}});this.maps.changed();return {saved:true,documents:result.map(r=>({key:r.key,revision:r.revision})),profileId:linkedProfile||null};
 }
}

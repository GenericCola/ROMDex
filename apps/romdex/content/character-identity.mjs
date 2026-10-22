import {seal,sha,canonical,same,requireThat} from './contracts.mjs';

export function placementProfile(record,profileId){
 const next=structuredClone(record),old=next.current.payload.profileId;
 next.current.payload.profileId=profileId;
 for(const point of Object.values(next.current.payload.points))for(const block of Object.values(point.blocks))if(block.speaker===old)block.speaker=profileId;
 return next;
}
export function detachCharacter(domain,command,ctx){
 const source=domain.records.find(r=>r.recordId===command.recordId),profile=domain.records.find(r=>r.recordId===source?.current.payload.profileId);
 requireThat(source?.kind==='appearance'&&source.revisionId===command.expectedRevision&&source.current.lifecycle!=='archived'&&profile?.kind==='profile'&&command.approved===true&&command.documentationCorrection===true,'Review the Current Placement Before Detaching It.');
 requireThat(Object.values(source.current.payload.profileByPlayerGender).every(v=>!v),'Review Gender-Specific Identity Overrides Before Detaching.');
 requireThat(typeof command.name==='string'&&command.name.trim()&&command.name.length<=1024,'Enter the Detached Character Name.');
 const base={workspaceId:ctx.workspace,createdAt:ctx.createdAt,actorClaim:'content:owner'},id='content:profile-'+sha(ctx.operationId).slice(0,40);
 const clone=seal({...profile,...base,recordId:id,parents:[],operationId:ctx.operationId+':profile',current:{...profile.current,payload:{...profile.current.payload,name:command.name.trim()}},mappingRefs:[],legacyRefs:[],legacyData:{}});
 const after=seal({...placementProfile(source,id),...base,parents:[source.revisionId],operationId:ctx.operationId+':placement'});
 const receipt=seal({schema:'NPCDexCatalogRevision/1',...base,operationId:ctx.operationId+':identity',catalogId:ctx.operationId,mode:'character-identity',source:{repositoryId:profile.recordId,revision:source.recordId,artifactSha256:sha(canonical(profile)),verification:'documented'},reason:'Owner detached one placement; dialogue, mappings, local images and other placements are retained.',recordChanges:[{recordId:source.recordId,beforeRevision:source.revisionId,afterRevision:after.revisionId},{recordId:id,beforeRevision:null,afterRevision:clone.revisionId}],viewDigests:[],mappingDigests:[],romChangeRequested:false});
 return [receipt,clone,after];
}
export function applyCharacterIdentity(domain,parent,receipt,records,views,mappings){
 requireThat(!views.length&&!mappings.length&&records.length===2,'An Identity Detach Cannot Change Other Content.');
 const source=parent.records.find(r=>r.recordId===receipt.source.revision),old=parent.records.find(r=>r.recordId===receipt.source.repositoryId),profile=records.find(r=>r.kind==='profile'),after=records.find(r=>r.kind==='appearance');
 requireThat(source?.kind==='appearance'&&old?.kind==='profile'&&source.current.payload.profileId===old.recordId&&profile&&after&&sha(canonical(old))===receipt.source.artifactSha256,'The Identity Baseline Changed.');
 requireThat(!parent.records.some(r=>r.recordId===profile.recordId)&&!profile.parents.length&&!profile.mappingRefs.length&&!profile.legacyRefs.length&&!Object.keys(profile.legacyData).length&&same(profile.current,{...old.current,payload:{...old.current.payload,name:profile.current.payload.name}})&&profile.current.payload.name.trim(),'A Detached Profile Must Preserve the Original Shared Definition.');
 const expected=placementProfile(source,profile.recordId);
 for(const key of ['recordId','kind','parentRecordId','mappingRefs','legacyRefs','legacyData','current'])requireThat(same(after[key],expected[key]),'Detach Cannot Change Placement Content or Mapping.');
 requireThat(same(after.parents,[source.revisionId])&&receipt.recordChanges.every(c=>records.some(r=>r.recordId===c.recordId&&r.revisionId===c.afterRevision&&(c.beforeRevision===null?r.kind==='profile':c.beforeRevision===source.revisionId))),'Detach Revision Pins Differ.');
 domain.records=domain.records.map(r=>r.recordId===source.recordId?after:r);domain.records.push(profile);domain.revisions.push(...records);
}

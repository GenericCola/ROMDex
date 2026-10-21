import {requireThat,seal} from './contracts.mjs';
export function characterLinkUpdates(domain,command,ctx){
 const records=new Map(domain.records.map(r=>[r.recordId,r])),source=records.get(command.recordId),target=records.get(command.targetRecordId);
 const mapOf=r=>records.get(r?.parentRecordId)?.current.payload.mapId;
 requireThat(source?.kind==='appearance'&&target?.kind==='appearance'&&source.current.lifecycle!=='archived'&&target.current.lifecycle!=='archived'&&mapOf(source)&&mapOf(source)===mapOf(target),'Choose Two Current Character Placements in This Map.');
 requireThat(source.revisionId===command.expectedRevision&&source.current.payload.profileId!==target.current.payload.profileId,'Refresh the Placements; They May Already Be Linked.');
 const oldId=source.current.payload.profileId,newId=target.current.payload.profileId,profile=records.get(newId),name=command.name;
 requireThat(profile?.kind==='profile'&&typeof name==='string'&&name.trim()&&name.length<=1024,'Enter the Shared Character Name.');
 const members=domain.records.filter(r=>r.kind==='appearance'&&mapOf(r)===mapOf(source)&&[oldId,newId].includes(r.current.payload.profileId));
 requireThat(members.every(r=>!Object.values(r.current.payload.profileByPlayerGender).some(Boolean)),'Review Gender-Specific Character Identities Before Linking These Placements.');
 const changed=[];for(const r of [...members,...(profile.current.payload.name!==name.trim()?[profile]:[])]){
  const next=structuredClone(r);next.parents=[r.revisionId];next.operationId=ctx.operationId+':link-'+changed.length;next.createdAt=ctx.createdAt;next.actorClaim=ctx.workspace.startsWith('fixture:')?'fixture:owner':'content:owner';
  if(r.kind==='profile')next.current.payload.name=name.trim();else if(r.current.payload.profileId===oldId){next.current.payload.profileId=newId;for(const point of Object.values(next.current.payload.points))for(const block of Object.values(point.blocks))if(block.speaker===oldId)block.speaker=newId;}
  changed.push({before:{recordId:r.recordId,revisionId:r.revisionId},after:seal(next)});
 }
 return changed;
}

const fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url');
require('./u20c-live-support.cjs').start(async context=>{
 const {api,state,save,work,root,report,assert}=context;state.projectIds=[state.project.id];assert.equal(state.project.id,'0-2');await save();
 const preflight=JSON.parse(await fs.readFile(path.join(work,'content-preflight.json'),'utf8'));assert(Date.now()-Date.parse(preflight.finishedAt)<3600000);assert(preflight.projectVisibleRoles.complete&&preflight.team.complete&&preflight.groupsComplete);
 const trusted=new Set(['2-1','2-2']);assert(preflight.team.items.every(u=>trusted.has(u.id)));
 for(const grant of preflight.projectVisibleRoles.items){if(!grant.role.permissions.some(p=>p.id==='JetBrains.YouTrack.READ_ISSUE'))continue;if(grant.holder.login)assert(trusted.has(grant.holder.id));else{const group=preflight.groupMembership.find(g=>g.group.id===grant.holder.id);assert(group?.complete&&!group.group.allUsersGroup&&group.userIds.every(id=>trusted.has(id)));}}
 const pkg=JSON.parse(await fs.readFile(path.join(root,'outputs/U20A-Contracts/examples/map-package.json'),'utf8'));
 const registry=await api.create('registry',state.project);state.content=state.content||{bindings:[]};
 for(let i=0;i<pkg.recordSnapshots.length;i++){const record=pkg.recordSnapshots[i],issue=await api.create('record-'+i,state.project);if(!state.content.bindings.some(b=>b.recordId===record.recordId))state.content.bindings.push({recordId:record.recordId,issueId:issue.id});await save();}
 for(const record of pkg.recordSnapshots){if(!record.parentRecordId)continue;const childId=state.content.bindings.find(b=>b.recordId===record.recordId).issueId,parentId=state.content.bindings.find(b=>b.recordId===record.parentRecordId).issueId;const value=await api.requireFixture(childId),link=value.links.find(l=>l.direction==='INWARD'&&l.linkType.name==='Subtask');assert(link);assert(link.issues.every(i=>i.id===parentId));if(!link.issues.some(i=>i.id===parentId))await api.request('POST','/api/issues/'+childId+'/links/'+link.id+'/issues',{id:parentId});}
 const {fixtureTools}=await import(pathToFileURL(path.join(root,'work/u20c-fixture-tools.mjs'))),{publish}=await fixtureTools(context);
 const artifacts=[...pkg.recordSnapshots,...pkg.plans,...pkg.mappings,...pkg.observations.map(o=>o.review)],assets=pkg.assets.map(a=>({assetId:a.assetId,mime:a.mime,bytes:Buffer.from(a.delivery.base64,'base64')}));
 state.content.seed=await publish('baseline',{kind:'bootstrap',artifacts,assets});state.stage='seeded';await save();
 for(const issue of Object.values(state.issues)){const value=await api.requireFixture(issue.id);assert.deepEqual(value.visibility.permittedUsers.map(u=>u.id),['2-2']);assert.equal(value.visibility.permittedGroups.length,0);}
 report.checks.push({label:'Owner-only marked NPCD fixtures and domain/native hierarchy seeded',projectId:'0-2',issues:Object.keys(state.issues).length,recordBindings:state.content.bindings.length,artifacts:artifacts.length,bootstrap:state.content.seed.pub.digest,PMONWrites:0});
});

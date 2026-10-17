// Authorized U20B: marked, private fixture issues only. No production provider changes.
const fs=require('node:fs/promises'),path=require('node:path');
const {start}=require('./u20b-live-support.cjs');
start(async({api,state,save,work,root,report,assert,sha,saveJSON})=>{
 const check=(label,detail)=>report.checks.push({label,detail});
 const preflight=JSON.parse(await fs.readFile(path.join(work,'content-preflight.json'),'utf8'));
 assert(Date.now()-Date.parse(preflight.finishedAt)<3600000,'Fresh grants required');
 assert.equal(state.project.id,'0-2');assert.equal(state.pmon.id,'0-1');
 assert(preflight.projectVisibleRoles.complete&&preflight.team.complete&&preflight.groupsComplete);
 const trusted=new Set(['2-1','2-2']);
 assert(preflight.team.items.every(u=>trusted.has(u.id)));
 for(const grant of preflight.projectVisibleRoles.items){
  if(!grant.role.permissions.some(p=>p.id==='JetBrains.YouTrack.READ_ISSUE'))continue;
  if(grant.holder.login)assert(trusted.has(grant.holder.id),'Unexpected issue reader');
  else{const group=preflight.groupMembership.find(g=>g.group.id===grant.holder.id);assert(group?.complete);assert(!group.group.allUsersGroup);assert(group.userIds.every(id=>trusted.has(id)),'Broad issue-reader group');}
 }
 const own=preflight.projectVisibleRoles.items.find(g=>g.holder.id==='2-2'&&g.scope.project?.id===state.project.id);
 for(const permission of ['CREATE_ISSUE','UPDATE_ISSUE','DELETE_ISSUE','CREATE_ATTACHMENT_ISSUE','LINK_ISSUE'])assert(own.role.permissions.some(p=>p.id==='JetBrains.YouTrack.'+permission));
 check('Fresh NPCD identity and visible grant boundary inspected',{owner:'2-2',trustedTeam:[...trusted],noGlobalGrantsChanged:true});
 const registry=await api.create('registry',state.project),a=await api.create('record-a',state.project),b=await api.create('record-b',state.project),task=await api.create('task-binding',state.pmon);
 for(const issue of [registry,a,b,task]){const current=await api.requireFixture(issue.id);assert.deepEqual(current.visibility?.permittedUsers.map(u=>u.id),['2-2']);assert.equal(current.visibility?.permittedGroups.length,0);}
 check('Four fixture issues created with explicit LimitedVisibility',Object.fromEntries(Object.entries(state.issues).map(([k,v])=>[k,v.idReadable])));
 for(const issue of [registry,task]){let status;try{await api.request('GET','/api/issues/'+issue.id+'?fields=id',undefined,{anonymous:true});}catch(e){status=e.status;}assert([401,403,404].includes(status));check('Anonymous issue read denied',{issue:issue.idReadable,status});}
 const fixtureDir=path.join(root,'outputs/U20A-Contracts/examples');
 const packageBytes=await fs.readFile(path.join(fixtureDir,'map-package.json'));
 const resultBytes=await fs.readFile(path.join(fixtureDir,'dependent-removal-result.json'));
 const publicationBytes=await fs.readFile(path.join(fixtureDir,'group-publication.json'));
 const result=JSON.parse(resultBytes),publication=JSON.parse(publicationBytes);
 const afterA=Buffer.from(JSON.stringify(result.recordUpdates[0].after,null,2)+'\n'),afterB=Buffer.from(JSON.stringify(result.recordUpdates[1].after,null,2)+'\n');
 await api.upload('map-package',task,packageBytes,'map-changes.json');
 await api.upload('result',registry,resultBytes,'implementation-result.json');
 await api.upload('publication',registry,publicationBytes,'publication.json');
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvWQAAAAASUVORK5CYII=','base64');
 await api.upload('image',a,png,'fixture-sprite.png');
 const binary=Buffer.alloc(512*1024);for(let i=0;i<binary.length;i++)binary[i]=i%251;
 await api.upload('capacity',registry,binary,'fixture-512k.bin');
 check('Exact JSON, PNG and 512 KiB byte round trips',{largestMeasuredBytes:binary.length,configuredCeiling:'unknown',remainingStorage:'unknown'});
 // Both clients carry the same semantic base, but append separate revisions. No winner is selected.
 const payload=id=>Buffer.from(JSON.stringify({schema:'U20BFixtureOperation/1',workspaceId:state.workspace,operationId:state.marker+'/'+id,base:'fixture:same-base',value:id})+'\n');
 const append=await Promise.allSettled([api.upload('writer-a',a,payload('writer-a'),'revision.json'),api.upload('writer-b',a,payload('writer-b'),'revision.json')]);
 assert(append.every(x=>x.status==='fulfilled'),'Concurrent append did not complete; inspect intents before retry');
 const all=await api.attachments(a.id);assert(all.some(x=>x.id===state.uploads['writer-a'].id)&&all.some(x=>x.id===state.uploads['writer-b'].id));
 check('Concurrent same-name append preserves both competing versions',{attachmentIds:append.map(x=>x.value.id),chosenWinner:null,pageSize:2,listed:all.length});
 const uncertain=payload('uncertain-response');
 if(!state.uploadIntents.uncertain)await api.upload('uncertain',a,uncertain,'uncertain.json',{discardResponse:true});
 const recovered=await api.rediscover('uncertain',uncertain);assert.equal(recovered.length,1);
 check('Accepted write with deliberately discarded response rediscovered exactly',{injection:'Client discarded successful response; not a physical network failure',matchingPhysicalAttachments:recovered.length});
 // Relate the PMON fixture task to the NPCD registry, and establish one hierarchy edge.
 const links=await api.request('GET','/api/issueLinkTypes?fields=id,name,directed,aggregation,sourceToTarget,targetToSource&$top=100');assert(Array.isArray(links));
 const current=await api.requireFixture(a.id);
 const parentLink=current.links.find(l=>l.linkType.name==='Subtask'&&l.direction==='INWARD');assert(parentLink,'Subtask inward link not exposed');
 if(!parentLink.issues.some(i=>i.id===registry.id))await api.request('POST','/api/issues/'+a.id+'/links/'+parentLink.id+'/issues',{id:registry.id});
 const taskLinks=(await api.requireFixture(task.id)).links;
 const relates=taskLinks.find(l=>l.linkType.name==='Relates');assert(relates,'Relates link not exposed');
 if(!relates.issues.some(i=>i.id===registry.id))await api.request('POST','/api/issues/'+task.id+'/links/'+relates.id+'/issues',{id:registry.id});
 assert((await api.requireFixture(a.id)).links.some(l=>l.direction==='INWARD'&&l.issues.some(i=>i.id===registry.id)));
 assert((await api.requireFixture(task.id)).links.some(l=>l.issues.some(i=>i.id===registry.id)));
 check('Stable cross-project and parent/child issue bindings read back',{task:task.idReadable,registry:registry.idReadable,child:a.idReadable});
 await api.upload('group-a',a,afterA,'content-revision.json');
 const members=[{issueId:a.id,name:'content-revision.json',sha256:sha(afterA),bytes:afterA.length},{issueId:b.id,name:'content-revision.json',sha256:sha(afterB),bytes:afterB.length}];
 const carrier={schema:'U20BFixtureCarrier/1',workspaceId:state.workspace,operationId:state.marker+'/group',publicationDigest:publication.digest,resultDigest:result.digest,registryIssueId:registry.id,taskIssueId:task.id,members};
 await api.upload('carrier',registry,Buffer.from(JSON.stringify(carrier,null,2)+'\n'),'carrier.json');
 assert(!(await api.attachments(b.id)).some(x=>x.name==='content-revision.json'));
 state.group={carrier,accepted:'fixture:last-good',status:'pending',stageProcess:process.pid,missing:[b.id]};await save();
 await saveJSON(path.join(work,'group-projection.json'),{accepted:'fixture:last-good',status:'pending',reason:'Second member has not arrived',process:process.pid});
 check('Interrupted dependent group leaves last accepted projection intact',{status:'pending',missing:b.idReadable,visibleState:'fixture:last-good',resumeRequiresNewProcess:true});
 // Signed URLs are deliberately omitted from all evidence.
 let anonymousFile;try{const read=await api.download(a.id,state.uploads.image.id,{anonymous:true});anonymousFile={status:200,matchingBytes:sha(read.bytes)===sha(png)};}catch(e){anonymousFile={status:e.status};}
 check('Signed attachment capability access observed',{...anonymousFile,urlLogged:false,interpretation:anonymousFile.status===200?'Anyone possessing a fresh signed URL can read its bytes; never publish these URLs.':'Anonymous signed-file fetch denied in this probe'});
 state.stage='interrupted-group-created';await save();
 await saveJSON(path.join(work,'fixture-expected.json'),{packageSha256:sha(packageBytes),afterBSha256:sha(afterB),group:carrier});
});

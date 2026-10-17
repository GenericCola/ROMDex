// Second Windows process: rediscover persisted bytes before completing a dependent fixture group.
const fs=require('node:fs/promises'),path=require('node:path');
const {start}=require('./u20b-live-support.cjs');
start(async({api,state,save,work,root,report,assert,sha,saveJSON})=>{
 const check=(label,detail)=>report.checks.push({label,detail});
 assert.equal(state.stage,'interrupted-group-created');assert.notEqual(process.pid,state.group.stageProcess);
 const projection=JSON.parse(await fs.readFile(path.join(work,'group-projection.json'),'utf8'));assert.equal(projection.accepted,'fixture:last-good');assert.equal(projection.status,'pending');
 const {registry,'record-a':a,'record-b':b,'task-binding':task}=state.issues;
 const downloaded={};for(const key of ['map-package','result','publication','carrier','group-a']){const binding=state.uploads[key];const read=await api.download(binding.issueId,binding.id);assert.equal(sha(read.bytes),binding.sha256);downloaded[key]=read.bytes;}
 const carrier=JSON.parse(downloaded.carrier),result=JSON.parse(downloaded.result),publication=JSON.parse(downloaded.publication),pkg=JSON.parse(downloaded['map-package']);
 assert.equal(carrier.workspaceId,'fixture:workspace');assert.equal(carrier.publicationDigest,publication.digest);assert.equal(carrier.resultDigest,result.digest);assert.equal(result.packageDigest,pkg.digest);assert.equal(carrier.taskIssueId,task.id);assert.equal(carrier.registryIssueId,registry.id);
 assert(!(await api.attachments(b.id)).some(x=>x.name==='content-revision.json'));
 check('Separate-process restart rediscovers exact bindings and incomplete group',{oldProcess:state.group.stageProcess,newProcess:process.pid,visible:'fixture:last-good',missingMember:b.id});
 // A later independent process appends against the same recorded base. Both prior versions remain.
 const stale=Buffer.from(JSON.stringify({schema:'U20BFixtureOperation/1',workspaceId:state.workspace,operationId:state.marker+'/writer-after-restart',base:'fixture:same-base',value:'writer-after-restart'})+'\n');
 await api.upload('writer-after-restart',a,stale,'revision.json');
 const revisions=await api.attachments(a.id);for(const key of ['writer-a','writer-b','writer-after-restart'])assert(revisions.some(x=>x.id===state.uploads[key].id));
 check('Independent process stale-base append preserves all heads',{processes:2,serverIdentity:'2-2',versions:3,winnerChosen:false,notProven:'Separate authenticated agent isolation'});
 const afterB=Buffer.from(JSON.stringify(result.recordUpdates[1].after,null,2)+'\n');assert.equal(sha(afterB),carrier.members[1].sha256);
 await api.upload('group-b',b,afterB,'content-revision.json');
 const accepted=[];
 for(const member of carrier.members){
  assert([a.id,b.id].includes(member.issueId));const matches=[];
  for(const meta of (await api.attachments(member.issueId)).filter(x=>x.name===member.name&&x.size===member.bytes)){const read=await api.download(member.issueId,meta.id);if(sha(read.bytes)===member.sha256)matches.push(read);}
  assert.equal(matches.length,1);const artifact=JSON.parse(matches[0].bytes);assert.equal(artifact.workspaceId,'fixture:workspace');assert(publication.artifactDigests.includes(artifact.revisionId));assert.equal(matches[0].metadata.author.id,'2-2');accepted.push(artifact);
 }
 const expected=result.recordUpdates.map(x=>x.after);assert.deepEqual(accepted,expected);
 const rejected=Buffer.from(downloaded['group-a']);rejected[rejected.length-2]^=1;assert.notEqual(sha(rejected),carrier.members[0].sha256);
 check('Injected altered download bytes rejected by pinned digest',{injection:true,serverBytesUnmodified:true});
 // Carrier validation is all-or-nothing locally; the server has no multi-issue transaction.
 await saveJSON(path.join(work,'group-projection.json'),{accepted:result.digest,status:'complete',recordRevisions:accepted.map(x=>({recordId:x.recordId,revisionId:x.revisionId})),process:process.pid});
 state.group.status='complete';state.group.accepted=result.digest;state.stage='roundtrip-complete';await save();
 check('All members verified before replacing the local fixture projection',{records:accepted.length,serverTransactionClaimed:false,actualROMModified:false});
 const dir=path.join(work,'downloaded-contracts');await fs.mkdir(dir,{recursive:true});
 for(const key of ['map-package','result','publication'])await fs.writeFile(path.join(dir,key+'.json'),downloaded[key]);
 for(let i=0;i<accepted.length;i++)await fs.writeFile(path.join(dir,'record-'+i+'.json'),JSON.stringify(accepted[i],null,2)+'\n');
 const image=await api.download(a.id,state.uploads.image.id);assert.equal(image.metadata.author.id,'2-2');
 check('Server author recorded separately from untrusted artifact actorClaim',{observedAuthor:'2-2',jsonActorClaim:result.actorClaim,authenticatedAgentRoute:'Deferred to U23; this is an owner-only fixture'});
 report.downloadedContractFiles=5;report.carrier='Readable issue metadata plus append-only versioned attachment references; filename/time never selects current data';
});

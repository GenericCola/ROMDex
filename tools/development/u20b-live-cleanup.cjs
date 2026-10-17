// Delete only pinned U20B fixture tickets after the reviewed reports pass.
const fs=require('node:fs/promises'),path=require('node:path');
const {start}=require('./u20b-live-support.cjs');
start(async({api,state,save,work,report,assert})=>{
 assert.equal(state.stage,'roundtrip-complete');
 for(const name of ['live-stage.json','live-resume.json','downloaded-schema-check.json']){const r=JSON.parse(await fs.readFile(path.join(work,name),'utf8'));assert.equal(r.status,'passed',name+' must pass before cleanup');}
 const knownIds=new Set(Object.values(state.issues).map(i=>i.id));
 // Preflight all fixtures before deleting any: refuse unexpected user comments or links.
 for(const issue of Object.values(state.issues)){
  const current=await api.requireFixture(issue.id);const comments=await api.list('/api/issues/'+issue.id+'/comments?fields=id,author(id)');assert.equal(comments.length,0,'Unexpected comment; preserve fixture for review');
  assert(current.links.every(l=>l.issues.every(i=>knownIds.has(i.id))),'Unexpected link to real data; preserve fixture for review');
  assert.deepEqual(current.visibility.permittedUsers.map(u=>u.id),['2-2']);assert.equal(current.visibility.permittedGroups.length,0);
  const attachments=await api.attachments(issue.id);const expectedIds=new Set(Object.values(state.uploads).filter(a=>a.issueId===issue.id).map(a=>a.id));
  assert(attachments.every(a=>a.author?.id==='2-2'&&expectedIds.has(a.id)),'Unexpected attachment; preserve fixture for review');
 }
 state.deleted=state.deleted||[];await save();
 for(const key of ['record-a','record-b','task-binding','registry']){
  const issue=state.issues[key];if(state.deleted.includes(issue.id))continue;
  await api.requireFixture(issue.id);await api.request('DELETE','/api/issues/'+issue.id);state.deleted.push(issue.id);await save();
  let status;try{await api.request('GET','/api/issues/'+issue.id+'?fields=id');}catch(e){status=e.status;}assert.equal(status,404);
  report.checks.push({label:'Deleted exact marked fixture and verified absence',issue:issue.idReadable,status});
 }
 const remaining=await api.list('/api/issues?query='+encodeURIComponent('"'+state.marker+'"')+'&fields=id,description');
 assert(!remaining.some(i=>i.description?.includes(state.marker)));
 state.stage='cleaned';state.cleanedAt=new Date().toISOString();await save();
 report.checks.push({label:'No active fixture-marker issues remain',count:0});
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {BASE} from '../youtrack.mjs';
import {indexTree} from '../public/core.mjs';
import {COMPLEXITY_VALUES} from '../complexity-field.mjs';
// No requests in this suite reach real YouTrack. It exercises the service against a controlled provider.
const realFetch=globalThis.fetch,issues=new Map(),states=['To do','In Progress','Done'],comments=new Map();let counter=400,clock=1000,loseCreation=false,loseStateResponse=false,providerCalls=0,providerDown=false;
function raw(id,summary,parentId=null,state='To do'){return {id:'db-'+id,idReadable:id,summary,description:'Original notes',updated:++clock,project:{id:'p',shortName:'PMON'},parent:parentId?{issues:[{id:'db-'+parentId,idReadable:parentId}]}:null,customFields:[{name:'State',$type:'StateIssueCustomField',value:{name:state}},{name:'Priority',$type:'SingleEnumIssueCustomField',value:{name:'Normal'}},{name:'Type',$type:'SingleEnumIssueCustomField',value:{name:'Task'}}],commentsCount:comments.get(id)?.length||0,links:[{id:'sub-in',direction:'INWARD',linkType:{name:'Subtask'},issues:parentId?[{id:'db-'+parentId,idReadable:parentId}]:[]},{id:'sub-out',direction:'OUTWARD',linkType:{name:'Subtask'},issues:[]}]};}
issues.set('PMON-1',raw('PMON-1','Epic'));issues.set('PMON-2',raw('PMON-2','Task','PMON-1'));issues.set('PMON-3',raw('PMON-3','Other epic',null,'Done'));
const response=x=>new Response(x===null?null:JSON.stringify(x),{status:x===null?204:200,headers:{'Content-Type':'application/json'}});
const prototypeFields=[],enumBundles=[];let complexitySpec=null;
globalThis.fetch=async(input,options={})=>{
 const url=new URL(input);if(url.origin!==BASE)return realFetch(input,options);
 providerCalls++;if(providerDown)throw new Error('Fixture YouTrack is unreachable');
 const p=url.pathname.replace(/^\/api\//,''),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;
 if(p==='users/me')return response({login:'fixture',fullName:'Fixture'});
 if(p==='admin/projects')return response(Number(url.searchParams.get('$skip'))?[]:[{id:'p',shortName:'PMON'}]);
 if(p==='admin/projects/p/customFields'){
  if(method==='POST'){complexitySpec={...body,id:'pc',field:prototypeFields.find(x=>x.id===body.field.id),bundle:enumBundles.find(x=>x.id===body.bundle.id)};for(const issue of issues.values())issue.customFields.push({name:'Complexity',$type:'SingleEnumIssueCustomField',value:null});return response(complexitySpec);}
  return response(Number(url.searchParams.get('$skip'))?[]:[{field:{name:'State'},bundle:{id:'state'}},{field:{name:'Priority'},bundle:{id:'priority',values:[{name:'Normal'},{name:'Major'}]}},...(complexitySpec?[complexitySpec]:[])]);
 }
 if(p==='admin/customFieldSettings/customFields'){if(method==='POST'){const x={...body,id:'cf'};prototypeFields.push(x);return response(x);}return response(Number(url.searchParams.get('$skip'))?[]:prototypeFields);}
 if(p==='admin/customFieldSettings/bundles/enum'){if(method==='POST'){const x={...body,id:'bundle'};enumBundles.push(x);return response(x);}return response(Number(url.searchParams.get('$skip'))?[]:enumBundles);}
 if(p==='admin/customFieldSettings/bundles/state/state/values'){if(method==='POST'){states.push(body.name);return response({id:body.name,name:body.name});}return response(Number(url.searchParams.get('$skip'))?[]:states.map(name=>({id:name,name,isResolved:name==='Done'})));}
 if(p==='issues'&&method==='GET')return response(Number(url.searchParams.get('$skip'))?[]:[...issues.values()]);
 if(p==='issues'&&method==='POST'){const id='PMON-'+(++counter),issue=raw(id,body.summary);if(complexitySpec)issue.customFields.push({name:'Complexity',$type:'SingleEnumIssueCustomField',value:null});issue.description=body.description;for(const f of body.customFields||[]){const target=issue.customFields.find(x=>x.name===f.name);if(target)target.value=f.value;}issues.set(id,issue);if(loseCreation){loseCreation=false;throw new Error('Fixture lost the creation response');}return response(issue);}
 const match=p.match(/^issues\/(PMON-\d+)(?:\/(.*))?$/);if(!match)throw new Error('Unimplemented fixture route '+p);
 const [,id,tail]=match,issue=issues.get(id);if(!issue)return new Response(JSON.stringify({error_description:'Not found'}),{status:404});
 if(!tail){if(method==='GET')return response(issue);if(method==='DELETE'){issues.delete(id);return response(null);}if(method==='POST'){for(const k of ['summary','description'])if(k in body)issue[k]=body[k];for(const f of body.customFields||[]){const target=issue.customFields.find(x=>x.name===f.name);if(target)target.value=f.value;}issue.updated=++clock;if(loseStateResponse&&body.customFields?.some(x=>x.name==='State')){loseStateResponse=false;throw new Error('Fixture lost the status response');}return response(issue);}}
 if(tail==='comments'){if(method==='GET')return response(Number(url.searchParams.get('$skip'))?[]:comments.get(id)||[]);const comment={id:'comment-'+clock,text:body.text,created:++clock,author:{login:'fixture'}};comments.set(id,[...(comments.get(id)||[]),comment]);issue.commentsCount=comments.get(id).length;issue.updated=++clock;return response(comment);}
 if(tail.startsWith('links/')){const link=issue.links[0];if(method==='DELETE'){link.issues=[];issue.parent=null;}else{const parent=[...issues.values()].find(x=>x.id===body.id);link.issues=[{id:parent.id,idReadable:parent.idReadable}];issue.parent={issues:link.issues};}issue.updated=++clock;return response(null);}
 throw new Error('Unimplemented fixture route '+p);
};
const scratch=process.env.ROMDEX_TEST_SCRATCH||os.tmpdir();await fs.mkdir(scratch,{recursive:true});
process.env.ROMDEX_PORT='4399';process.env.ROMDEX_DATA_DIR=await fs.mkdtemp(path.join(scratch,'romdex-test-'));process.env.YOUTRACK_TOKEN='fixture-token';
const {server,protectCredential}=await import('../server.mjs');if(!server.listening)await once(server,'listening');
const origin='http://127.0.0.1:4399';
async function api(p,body){const r=await realFetch(origin+'/api/'+p,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{Origin:origin,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const v=await r.json();assert.equal(r.status,200,JSON.stringify(v));if(v.blocked?.error)console.log('Fixture operation error:',v.blocked.error);return v;}
test('bidirectional service integration, conflicts, retry safety, comments and hierarchy',async t=>{
 try{
  await t.test('connection and missing status preparation',async()=>{const status=await api('status');assert.equal(status.connected,true);await api('prepare',{});assert.ok(states.includes('Standby'));assert.ok(states.includes('Critical / Debugging'));});
  await t.test('Complexity setup attaches an optional field once and each value round-trips in both directions',async()=>{
   assert.equal((await api('complexity-setup',{})).connection.complexity.ready,true);await api('complexity-setup',{});assert.equal(prototypeFields.length,1);assert.equal(enumBundles.length,1);assert.equal(complexitySpec.canBeEmpty,true);
   for(const [i,value]of [...COMPLEXITY_VALUES,null].entries()){const base=(await api('snapshot')).items.find(x=>x.id==='PMON-3');const result=await api('sync',{operations:[{opId:'complexity-'+i,type:'edit',issueId:base.id,base,patch:{complexity:value}}]});assert.deepEqual(result.completed,['complexity-'+i]);assert.equal(result.items.find(x=>x.id===base.id).complexity,value);assert.deepEqual(issues.get(base.id).customFields.find(x=>x.name==='Complexity').value,value===null?null:{name:value});}
   for(const value of [...COMPLEXITY_VALUES,null]){issues.get('PMON-3').customFields.find(x=>x.name==='Complexity').value=value===null?null:{name:value};issues.get('PMON-3').updated=++clock;assert.equal((await api('snapshot')).items.find(x=>x.id==='PMON-3').complexity,value);}
  });
  await t.test('a native Complexity edit conflicts with pending work rather than being overwritten',async()=>{
   const base=(await api('snapshot')).items.find(x=>x.id==='PMON-3');issues.get(base.id).customFields.find(x=>x.name==='Complexity').value={name:'MID'};issues.get(base.id).updated=++clock;
   const op={opId:'complexity-conflict',type:'edit',issueId:base.id,base,patch:{complexity:'HIGH'}};const result=await api('sync',{operations:[op]});assert.equal(result.blocked.conflicts[0].field,'complexity');assert.equal(result.items.find(x=>x.id===base.id).complexity,'MID');op.base={...base,complexity:'MID'};assert.deepEqual((await api('sync',{operations:[op]})).completed,[op.opId]);
  });
  await t.test('Complexity survives creation and priority writes preserve unrelated fields and native Show-stopper',async()=>{
   const created=await api('sync',{operations:[{opId:'complexity-create',type:'create',issueId:'local-complexity',item:{summary:'Complexity fixture',parentId:null,state:'To do',priority:'Normal',complexity:'INSANE'}}]});const id=created.mapping['local-complexity'];assert.equal(created.items.find(x=>x.id===id).complexity,'INSANE');issues.delete(id);
   const issue=issues.get('PMON-3');issue.customFields.find(x=>x.name==='Priority').value={name:'Show-stopper'};issue.updated=++clock;let base=(await api('snapshot')).items.find(x=>x.id===issue.idReadable);await api('sync',{operations:[{opId:'keep-show-stopper',type:'edit',issueId:base.id,base,patch:{description:'Unrelated notes'}}]});assert.equal(issue.customFields.find(x=>x.name==='Priority').value.name,'Show-stopper');
   for(const [i,priority]of ['Minor','Normal','Major','Critical'].entries()){base=(await api('snapshot')).items.find(x=>x.id===issue.idReadable);assert.deepEqual((await api('sync',{operations:[{opId:'priority-map-'+i,type:'edit',issueId:base.id,base,patch:{priority}}]})).completed,['priority-map-'+i]);assert.equal(issue.customFields.find(x=>x.name==='Priority').value.name,priority);assert.equal(issue.customFields.find(x=>x.name==='Complexity').value.name,'HIGH');}
  });
  if(process.platform==='win32')await t.test('optional remembered connection uses Windows encryption and can be restored',async()=>{await api('connect',{token:'fixture-token',remember:true});const encrypted=await fs.readFile(path.join(process.env.ROMDEX_DATA_DIR,'connection.encrypted'),'utf8');assert.ok(!encrypted.includes('fixture-token'));assert.equal(await protectCredential(encrypted,true),'fixture-token');await api('connect',{token:'fixture-token',remember:false});await assert.rejects(fs.access(path.join(process.env.ROMDEX_DATA_DIR,'connection.encrypted')));});
  await t.test('shared off switch blocks all automatic data routes, including stale windows, with zero provider calls',async()=>{
   await api('sync-settings',{enabled:false});assert.equal((await api('status')).automaticSyncEnabled,false);
   assert.deepEqual(JSON.parse(await fs.readFile(path.join(process.env.ROMDEX_DATA_DIR,'sync-settings.json'),'utf8')),{enabled:false});
   const count=providerCalls;
   for(const route of ['snapshot','comments?id=PMON-2'])assert.equal((await api(route)).syncDisabled,true);
   for(const route of ['sync','prepare','acknowledge'])assert.equal((await api(route,route==='sync'?{operations:[]}:{})).syncDisabled,true);
   assert.equal(providerCalls,count);await api('sync-settings',{enabled:true});
  });
  await t.test('manual sync while off pushes edits and pulls native data once without changing the shared preference',async()=>{
   const base=(await api('snapshot')).items.find(x=>x.id==='PMON-3');await api('sync-settings',{enabled:false});
   issues.get(base.id).description='Native during pause';issues.get(base.id).updated=++clock;
   const result=await api('sync',{manual:true,operations:[{opId:'one-time',type:'edit',issueId:base.id,base,patch:{summary:'Manual while off'}}]});
   assert.deepEqual(result.completed,['one-time']);assert.equal(result.items.find(x=>x.id===base.id).description,'Native during pause');assert.equal(issues.get(base.id).summary,'Manual while off');assert.equal(result.automaticSyncEnabled,false);
   const count=providerCalls;assert.equal((await api('snapshot')).syncDisabled,true);assert.equal(providerCalls,count);await api('sync-settings',{enabled:true});
  });
  await t.test('manual sync while off detects a native same-field conflict before writing',async()=>{
   const base=(await api('snapshot')).items.find(x=>x.id==='PMON-3');await api('sync-settings',{enabled:false});
   issues.get(base.id).description='Native conflict during pause';issues.get(base.id).updated=++clock;
   const op={opId:'paused-conflict',type:'edit',issueId:base.id,base,patch:{description:'Local during pause'}};
   const result=await api('sync',{manual:true,operations:[op]});assert.equal(result.blocked.conflicts[0].field,'description');assert.equal(result.blocked.conflicts[0].remote,'Native conflict during pause');assert.equal(issues.get(base.id).description,'Native conflict during pause');assert.equal(result.automaticSyncEnabled,false);
   op.base={...base,description:'Native conflict during pause'};const resolved=await api('sync',{manual:true,operations:[op]});assert.deepEqual(resolved.completed,[op.opId]);assert.equal(resolved.automaticSyncEnabled,false);await api('sync-settings',{enabled:true});
  });
  await t.test('connection health records provider loss and recovery independently of queued data',async()=>{
   providerDown=true;const lost=await api('sync',{operations:[],manual:true});assert.ok(lost.error);assert.equal(lost.youtrackAvailable,false);assert.equal((await api('status')).youtrackAvailable,false);
   providerDown=false;assert.equal((await api('sync',{operations:[],manual:true})).youtrackAvailable,true);
  });
  await t.test('native provider edits, comments, creation and deletion appear in snapshots',async()=>{issues.get('PMON-2').summary='Changed natively';comments.set('PMON-2',[{id:'native',text:'Native comment',created:++clock,author:{login:'other'}}]);issues.get('PMON-2').commentsCount=1;issues.get('PMON-2').updated=++clock;issues.set('PMON-4',raw('PMON-4','Native new task','PMON-3'));let snapshot=await api('snapshot');assert.equal(snapshot.items.find(x=>x.id==='PMON-2').summary,'Changed natively');assert.equal(snapshot.items.find(x=>x.id==='PMON-2').comments[0].text,'Native comment');assert.equal(snapshot.items.find(x=>x.id==='PMON-4').parentId,'PMON-3');issues.delete('PMON-4');snapshot=await api('snapshot');assert.ok(!snapshot.items.some(x=>x.id==='PMON-4'));});
  let base;
  await t.test('dashboard edits push and subsequent native edits pull',async()=>{base=(await api('snapshot')).items.find(x=>x.id==='PMON-2');const result=await api('sync',{operations:[{opId:'edit-title',type:'edit',issueId:base.id,base,patch:{summary:'Dashboard title'}}]});assert.deepEqual(result.completed,['edit-title']);assert.equal(issues.get('PMON-2').summary,'Dashboard title');issues.get('PMON-2').description='Native notes';issues.get('PMON-2').updated=++clock;assert.equal((await api('snapshot')).items.find(x=>x.id==='PMON-2').description,'Native notes');});
  await t.test('overlapping edits block writes but still return incoming provider data',async()=>{const result=await api('sync',{operations:[{opId:'conflict',type:'edit',issueId:base.id,base,patch:{description:'Dashboard notes'}}]});assert.equal(result.blocked.conflicts[0].remote,'Native notes');assert.equal(result.items.find(x=>x.id==='PMON-2').description,'Native notes');assert.equal(issues.get('PMON-2').description,'Native notes');});
  await t.test('reparenting writes the relation and rollup follows the new tree',async()=>{base=(await api('snapshot')).items.find(x=>x.id==='PMON-2');const result=await api('sync',{operations:[{opId:'move',type:'edit',issueId:base.id,base,patch:{parentId:'PMON-3',state:'Standby'}}]});assert.deepEqual(result.completed,['move']);assert.equal(result.items.find(x=>x.id==='PMON-2').parentId,'PMON-3');assert.equal(result.items.find(x=>x.id==='PMON-3').state,'Standby');});
  await t.test('own parent status is local, remains hidden, and restores after the last child moves',async()=>{
   let own=(await api('snapshot')).items.find(x=>x.id==='PMON-3');
   let result=await api('sync',{operations:[{opId:'assign-parent',type:'edit',issueId:own.id,base:own,patch:{assignedState:'Critical / Debugging'}}]});
   own=result.items.find(x=>x.id==='PMON-3');assert.equal(own.assignedState,'Critical / Debugging');assert.equal(own.state,'Standby');assert.equal(indexTree(result.items).colors.get(own.id),'blue');
   assert.ok(!issues.get(own.id).customFields.some(x=>x.name==='Assigned Status'));
   let kid=result.items.find(x=>x.id==='PMON-2');result=await api('sync',{operations:[{opId:'detach-final',type:'edit',issueId:kid.id,base:kid,patch:{parentId:null}}]});
   own=result.items.find(x=>x.id==='PMON-3');assert.equal(own.state,'Critical / Debugging');assert.equal(own.assignedState,'Critical / Debugging');
   kid=result.items.find(x=>x.id==='PMON-2');result=await api('sync',{operations:[{opId:'reattach-final',type:'edit',issueId:kid.id,base:kid,patch:{parentId:'PMON-3'}}]});
   assert.equal(result.items.find(x=>x.id==='PMON-3').state,'Standby');assert.equal(result.items.find(x=>x.id==='PMON-3').assignedState,'Critical / Debugging');
  });
  await t.test('native parent edits update the saved assignment and conflict with a queued own edit',async()=>{
   const own=(await api('snapshot')).items.find(x=>x.id==='PMON-3'),native=issues.get(own.id);
   native.customFields.find(x=>x.name==='State').value={name:'In Progress'};native.updated=++clock;
   let snapshot=await api('snapshot');assert.equal(snapshot.items.find(x=>x.id===own.id).assignedState,'In Progress');assert.equal(indexTree(snapshot.items).colors.get(own.id),'blue');
   let result=await api('sync',{operations:[{opId:'own-conflict',type:'edit',issueId:own.id,base:own,patch:{assignedState:'Done'}}]});
   assert.equal(result.blocked.conflicts[0].field,'assignedState');assert.equal(result.blocked.conflicts[0].remote,'In Progress');assert.equal(result.blocked.conflicts[0].local,'Done');
   result=await api('sync',{operations:[]});assert.equal(result.items.find(x=>x.id===own.id).state,'Standby');assert.equal(result.items.find(x=>x.id===own.id).assignedState,'In Progress');
   const records=JSON.parse(await fs.readFile(path.join(process.env.ROMDEX_DATA_DIR,'assigned-statuses.json'),'utf8'));assert.equal(records[own.id].assignedState,'In Progress');
  });
  await t.test('native leaf edits stay visible and collide with pending own assignments',async()=>{
   const kid=(await api('snapshot')).items.find(x=>x.id==='PMON-2'),native=issues.get(kid.id);
   native.customFields.find(x=>x.name==='State').value={name:'Done'};native.updated=++clock;
   const snapshot=await api('snapshot');assert.equal(snapshot.items.find(x=>x.id===kid.id).assignedState,'Done');assert.equal(indexTree(snapshot.items).colors.get(kid.id),'green');
   const result=await api('sync',{operations:[{opId:'leaf-own-conflict',type:'edit',issueId:kid.id,base:kid,patch:{assignedState:'Critical / Debugging'}}]});
   assert.equal(result.blocked.conflicts[0].field,'assignedState');assert.equal(result.blocked.conflicts[0].remote,'Done');
  });
  await t.test('an ambiguous inherited write never replaces the saved own status',async()=>{
   loseStateResponse=true;let result=await api('sync',{operations:[]});assert.equal(result.error,'Fixture lost the status response');
   const snapshot=await api('snapshot'),parent=snapshot.items.find(x=>x.id==='PMON-3');assert.equal(parent.state,'Done');assert.equal(parent.assignedState,'In Progress');
   result=await api('sync',{operations:[]});assert.equal(result.error,null);assert.equal(result.items.find(x=>x.id==='PMON-3').assignedState,'In Progress');
  });
  await t.test('journaled comments are not duplicated by retry',async()=>{const op={opId:'comment-once',type:'comment',issueId:'PMON-2',text:'Dashboard comment'};await api('sync',{operations:[op]});await api('sync',{operations:[op]});assert.equal(comments.get('PMON-2').filter(x=>x.text==='Dashboard comment').length,1);});
  await t.test('ambiguous task creation requires review instead of blindly replaying',async()=>{loseCreation=true;const op={opId:'uncertain-create',type:'create',issueId:'local-test',item:{summary:'Uncertain create',parentId:'PMON-3',state:'To do',priority:'Normal',type:'Task'}};let result=await api('sync',{operations:[op]});assert.ok(result.blocked.error);result=await api('sync',{operations:[op]});assert.equal(result.blocked.uncertain,true);const created=[...issues.values()].filter(x=>x.summary==='Uncertain create');assert.equal(created.length,1);await api('acknowledge',{opId:op.opId,action:'created',issueId:created[0].idReadable});result=await api('sync',{operations:[op]});assert.equal(result.mapping['local-test'],created[0].idReadable);assert.equal(result.items.find(x=>x.id===created[0].idReadable).parentId,'PMON-3');});
  await t.test('deleting a natively modified task requires renewed review',async()=>{base=(await api('snapshot')).items.find(x=>x.id==='PMON-2');issues.get('PMON-2').description='Changed after deletion review';issues.get('PMON-2').updated=++clock;const result=await api('sync',{operations:[{opId:'delete-conflict',type:'delete',issueId:base.id,ids:[base.id],bases:{[base.id]:base}}]});assert.equal(result.blocked.conflicts[0].field,'__delete__');assert.ok(issues.has(base.id));});
 }finally{await new Promise(resolve=>server.close(resolve));globalThis.fetch=realFetch;}
});

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
import {stageBulk} from '../public/bulk-hierarchy.mjs';
import {dateTimestamp} from '../public/item-editor.mjs';
// No requests in this suite reach real YouTrack. It exercises the service against a controlled provider.
const realFetch=globalThis.fetch,issues=new Map(),states=['To do','In Progress','Done'],comments=new Map();let counter=400,clock=1000,loseCreation=false,loseStateResponse=false,providerCalls=0,providerDown=false,failLinkOn=null,failTagOn=null,denyEditorWrites=false;
function rawBase(id,summary,parentId=null,state='To do'){return {id:'db-'+id,idReadable:id,summary,description:'Original notes',updated:++clock,project:{id:'p',shortName:'PMON'},parent:parentId?{issues:[{id:'db-'+parentId,idReadable:parentId}]}:null,customFields:[{name:'State',$type:'StateIssueCustomField',value:{name:state}},{name:'Priority',$type:'SingleEnumIssueCustomField',value:{name:'Normal'}},{name:'Type',$type:'SingleEnumIssueCustomField',value:{name:'Task'}}],commentsCount:comments.get(id)?.length||0,links:[{id:'sub-in',direction:'INWARD',linkType:{name:'Subtask'},issues:parentId?[{id:'db-'+parentId,idReadable:parentId}]:[]},{id:'sub-out',direction:'OUTWARD',linkType:{name:'Subtask'},issues:[]}]};}
const editorUsers=[{id:'u1',login:'alpha',fullName:'Alpha User'},{id:'u2',login:'beta',fullName:'Beta User'}],editorTags=[{id:'tag-A',name:'Artwork'},{id:'tag-B',name:'Ready'},{id:'tag-C',name:'Review'}];
const spec=(id,name,type,values=null)=>({id,canBeEmpty:true,field:{name,fieldType:{id:type}},...(values?{bundle:{id:id+'-bundle',values}}:{})});
const editorSpecs=[spec('assignee','Assignee','user[1]',[]),spec('date','Due Date','date'),spec('type','Type','enum[1]',[{id:'task',name:'Task'},{id:'feature',name:'Feature'},{id:'epic',name:'Epic'}]),spec('stage','Stage','state[1]',[{id:'planning',name:'Planning'},{id:'building',name:'Building'}]),spec('kanban','Kanban State','enum[1]',[{id:'ready',name:'Ready to pull'},{id:'blocked',name:'Blocked'}]),spec('estimate','Estimation','period'),spec('spent','Spent time','period'),spec('days','Ideal days','integer'),spec('points','Story points','integer')];
function raw(...args){const issue=rawBase(...args);issue.tags=[];issue.customFields.find(x=>x.name==='Type').id='type';issue.customFields.find(x=>x.name==='Type').value={id:'task',name:'Task'};
 issue.customFields.push({id:'assignee',name:'Assignee',$type:'SingleUserIssueCustomField',value:editorUsers[0]},{id:'date',name:'Due Date',$type:'DateIssueCustomField',value:null},{id:'stage',name:'Stage',$type:'StateIssueCustomField',value:{id:'planning',name:'Planning'}},{id:'kanban',name:'Kanban State',$type:'SingleEnumIssueCustomField',value:{id:'ready',name:'Ready to pull'}},{id:'estimate',name:'Estimation',$type:'PeriodIssueCustomField',value:{minutes:60}},{id:'spent',name:'Spent time',$type:'PeriodIssueCustomField',value:{minutes:0}},{id:'days',name:'Ideal days',$type:'SimpleIssueCustomField',value:2},{id:'points',name:'Story points',$type:'SimpleIssueCustomField',value:3});return issue;}
function setFixtureField(target,field){let value=field.value;if(value?.id&&target.name==='Assignee')value=editorUsers.find(x=>x.id===value.id);else if(value&&(value.id||value.name)&&editorSpecs.find(x=>x.field.name===target.name)?.bundle?.values.length)value=editorSpecs.find(x=>x.field.name===target.name).bundle.values.find(x=>x.id===value.id||x.name===value.name)||value;target.value=value;}
issues.set('PMON-1',raw('PMON-1','Epic'));issues.set('PMON-2',raw('PMON-2','Task','PMON-1'));issues.set('PMON-3',raw('PMON-3','Other epic',null,'Done'));
const response=x=>new Response(x===null?null:JSON.stringify(x),{status:x===null?204:200,headers:{'Content-Type':'application/json'}});
const prototypeFields=[],enumBundles=[];let complexitySpec=null;
globalThis.fetch=async(input,options={})=>{
 const url=new URL(input);if(url.origin!==BASE)return realFetch(input,options);
 providerCalls++;if(providerDown)throw new Error('Fixture YouTrack is unreachable');
 const p=url.pathname.replace(/^\/api\//,''),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;
 if(p==='admin/customFieldSettings/bundles/user/assignee-bundle/aggregatedUsers')return response(Number(url.searchParams.get('$skip'))?[]:editorUsers);
 if(p==='admin/projects/p/timeTrackingSettings')return response({enabled:true,timeSpent:{id:'spent'}});
 if(p==='tags')return response(Number(url.searchParams.get('$skip'))?[]:editorTags);
 if(p==='users/me')return response({login:'fixture',fullName:'Fixture'});
 if(p==='admin/projects')return response(Number(url.searchParams.get('$skip'))?[]:[{id:'p',shortName:'PMON'}]);
 if(p==='admin/projects/p/customFields'){
  if(method==='POST'){complexitySpec={...body,id:'pc',field:prototypeFields.find(x=>x.id===body.field.id),bundle:enumBundles.find(x=>x.id===body.bundle.id)};for(const issue of issues.values())issue.customFields.push({name:'Complexity',$type:'SingleEnumIssueCustomField',value:null});return response(complexitySpec);}
  return response(Number(url.searchParams.get('$skip'))?[]:[{field:{name:'State'},bundle:{id:'state'}},{field:{name:'Priority'},bundle:{id:'priority',values:[{name:'Normal'},{name:'Major'}]}},...editorSpecs,...(complexitySpec?[complexitySpec]:[])]);
 }
 if(p==='admin/customFieldSettings/customFields'){if(method==='POST'){const x={...body,id:'cf'};prototypeFields.push(x);return response(x);}return response(Number(url.searchParams.get('$skip'))?[]:prototypeFields);}
 if(p==='admin/customFieldSettings/bundles/enum'){if(method==='POST'){const x={...body,id:'bundle'};enumBundles.push(x);return response(x);}return response(Number(url.searchParams.get('$skip'))?[]:enumBundles);}
 if(p==='admin/customFieldSettings/bundles/state/state/values'){if(method==='POST'){states.push(body.name);return response({id:body.name,name:body.name});}return response(Number(url.searchParams.get('$skip'))?[]:states.map(name=>({id:name,name,isResolved:name==='Done'})));}
 if(p==='issues'&&method==='GET')return response(Number(url.searchParams.get('$skip'))?[]:[...issues.values()]);
 if(p==='issues'&&method==='POST'){const id='PMON-'+(++counter),issue=raw(id,body.summary);if(complexitySpec)issue.customFields.push({name:'Complexity',$type:'SingleEnumIssueCustomField',value:null});issue.description=body.description;for(const f of body.customFields||[]){const target=issue.customFields.find(x=>x.name===f.name||f.id!==undefined&&x.id===f.id);if(target)setFixtureField(target,f);}issues.set(id,issue);if(loseCreation){loseCreation=false;throw new Error('Fixture lost the creation response');}return response(issue);}
 const match=p.match(/^issues\/(PMON-\d+)(?:\/(.*))?$/);if(!match)throw new Error('Unimplemented fixture route '+p);
 const [,id,tail]=match,issue=issues.get(id);if(!issue)return new Response(JSON.stringify({error_description:'Not found'}),{status:404});
 if(!tail){if(method==='GET')return response(issue);if(method==='DELETE'){issues.delete(id);return response(null);}if(method==='POST'){if(denyEditorWrites)return new Response(JSON.stringify({error_description:'Fixture update permission denied'}),{status:403});for(const k of ['summary','description'])if(k in body)issue[k]=body[k];for(const f of body.customFields||[]){const target=issue.customFields.find(x=>x.name===f.name);if(target)target.value=f.value;}issue.updated=++clock;if(loseStateResponse&&body.customFields?.some(x=>x.name==='State')){loseStateResponse=false;throw new Error('Fixture lost the status response');}return response(issue);}}
 if(tail?.startsWith('tags')){const tagId=tail.split('/')[1]||body?.id;if(method==='GET')return response(issue.tags);if(failTagOn===tagId){failTagOn=null;throw Error('Fixture interrupted tag update');}if(method==='DELETE')issue.tags=issue.tags.filter(x=>x.id!==tagId);else if(!issue.tags.some(x=>x.id===tagId))issue.tags.push(editorTags.find(x=>x.id===tagId));issue.updated=++clock;return response(method==='DELETE'?null:editorTags.find(x=>x.id===tagId));}
 if(tail==='comments'){if(method==='GET')return response(Number(url.searchParams.get('$skip'))?[]:comments.get(id)||[]);const comment={id:'comment-'+clock,text:body.text,created:++clock,author:{login:'fixture'}};comments.set(id,[...(comments.get(id)||[]),comment]);issue.commentsCount=comments.get(id).length;issue.updated=++clock;return response(comment);}
 if(tail.startsWith('links/')){if(method==='POST'&&failLinkOn===id){failLinkOn=null;throw Error('Fixture interrupted parent attachment');}const link=issue.links[0];if(method==='DELETE'){link.issues=[];issue.parent=null;}else{const parent=[...issues.values()].find(x=>x.id===body.id);link.issues=[{id:parent.id,idReadable:parent.idReadable}];issue.parent={issues:link.issues};}issue.updated=++clock;return response(null);}
 throw new Error('Unimplemented fixture route '+p);
};
const scratch=process.env.ROMDEX_TEST_SCRATCH||os.tmpdir();await fs.mkdir(scratch,{recursive:true});
process.env.ROMDEX_PORT='4399';process.env.ROMDEX_DATA_DIR=await fs.mkdtemp(path.join(scratch,'romdex-test-'));process.env.YOUTRACK_TOKEN='fixture-token';
const {server,protectCredential}=await import('../server.mjs');if(!server.listening)await once(server,'listening');
const origin='http://127.0.0.1:4399';
async function api(p,body){const r=await realFetch(origin+'/api/'+p,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{Origin:origin,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const v=await r.json();assert.equal(r.status,200,JSON.stringify(v));if(v.blocked?.error)console.log('Fixture operation error:',v.blocked.error);return v;}
test('bidirectional service integration, conflicts, retry safety, comments and hierarchy',async t=>{
 try{
  await t.test('connection and missing status preparation',async()=>{const status=await api('status');assert.equal(status.connected,true);await api('prepare',{});assert.ok(states.includes('Standby'));assert.ok(states.includes('In Development'));assert.ok(states.includes('Critical / Debugging'));});
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
  await t.test('all-untouched descendants write grey to both ancestor levels while native progress restores yellow',async()=>{
   const ids=['PMON-800','PMON-801','PMON-802'];
   issues.set(ids[0],raw(ids[0],'Untouched root',null,'In Progress'));issues.set(ids[1],raw(ids[1],'Untouched parent',ids[0],'In Progress'));issues.set(ids[2],raw(ids[2],'Untouched leaf',ids[1]));
   try{
    let result=await api('sync',{operations:[]});
    for(const id of ids){assert.equal(result.items.find(x=>x.id===id).state,'To do');assert.equal(indexTree(result.items).colors.get(id),'grey');}
    assert.equal(result.items.find(x=>x.id===ids[0]).assignedState,'In Progress');
    const leaf=issues.get(ids[2]);leaf.customFields.find(x=>x.name==='State').value={name:'In Progress'};leaf.updated=++clock;
    result=await api('sync',{operations:[]});for(const id of ids)assert.equal(result.items.find(x=>x.id===id).state,'In Progress');
    leaf.customFields.find(x=>x.name==='State').value={name:'To do'};leaf.updated=++clock;
    const own=(await api('snapshot')).items.find(x=>x.id===ids[0]);
    result=await api('sync',{operations:[{opId:'untouched-own',type:'edit',issueId:own.id,base:own,patch:{assignedState:'To do'}}]});
    assert.deepEqual(result.completed,['untouched-own']);for(const id of ids)assert.equal(result.items.find(x=>x.id===id).state,'To do');
   }finally{for(const id of ids)issues.delete(id);}
  });
  await t.test('development assignments write through the service and native critical overrides purple ancestors',async()=>{
   const ids=['PMON-810','PMON-811','PMON-812','PMON-813'];
   issues.set(ids[0],raw(ids[0],'Development root',null));issues.set(ids[1],raw(ids[1],'Development parent',ids[0]));issues.set(ids[2],raw(ids[2],'Development leaf',ids[1]));issues.set(ids[3],raw(ids[3],'Untouched sibling',ids[1]));
   try{
    const leaf=(await api('snapshot')).items.find(x=>x.id===ids[2]);
    let result=await api('sync',{operations:[{opId:'development-assignment',type:'edit',issueId:leaf.id,base:leaf,patch:{assignedState:'In Development'}}]});
    assert.deepEqual(result.completed,['development-assignment']);assert.equal(result.error,null);
    for(const id of ids.slice(0,3)){assert.equal(result.items.find(x=>x.id===id).state,'In Development');assert.equal(indexTree(result.items).colors.get(id),'purple');}
    const sibling=issues.get(ids[3]);sibling.customFields.find(x=>x.name==='State').value={name:'Critical / Debugging'};sibling.updated=++clock;
    result=await api('sync',{operations:[]});assert.equal(result.items.find(x=>x.id===ids[0]).state,'Critical / Debugging');
    sibling.customFields.find(x=>x.name==='State').value={name:'Done'};sibling.updated=++clock;
    const native=issues.get(ids[2]);native.customFields.find(x=>x.name==='State').value={name:'Standby'};native.updated=++clock;
    result=await api('sync',{operations:[]});assert.equal(result.items.find(x=>x.id===ids[0]).state,'Standby');assert.equal(result.items.find(x=>x.id===ids[2]).assignedState,'Standby');
   }finally{for(const id of ids)issues.delete(id);}
  });
  await t.test('bulk moves retain selected parent subtrees and recover after a detached link interruption',async()=>{
   const ids=['PMON-700','PMON-701','PMON-702','PMON-703','PMON-704'];
   issues.set(ids[0],raw(ids[0],'Source'));issues.set(ids[1],raw(ids[1],'Selected Parent',ids[0]));issues.set(ids[2],raw(ids[2],'Child Stays Attached',ids[1],'Done'));issues.set(ids[3],raw(ids[3],'Selected Sibling',ids[0]));issues.set(ids[4],raw(ids[4],'Destination'));
   try{const state={remote:(await api('snapshot')).items,operations:[],order:{},expanded:[]};let n=0;const group=stageBulk(state,[ids[1],ids[3]],{parentId:ids[4],groupId:'service-bulk-move',makeOpId:()=> 'bulk-link-'+(++n)});
    failLinkOn=ids[3];let result=await api('sync',{operations:state.operations});assert.deepEqual(result.completed,[group.opIds[0]]);assert.match(result.blocked.error,/interrupted/);assert.equal(result.items.find(x=>x.id===ids[1]).parentId,ids[4]);assert.equal(result.items.find(x=>x.id===ids[2]).parentId,ids[1]);assert.equal(result.items.find(x=>x.id===ids[2]).assignedState,'Done');
    result=await api('sync',{operations:state.operations});assert.deepEqual(result.completed,group.opIds);assert.equal(result.blocked,null);assert.equal(result.items.find(x=>x.id===ids[3]).parentId,ids[4]);assert.equal(result.items.find(x=>x.id===ids[2]).parentId,ids[1]);
   }finally{failLinkOn=null;for(const id of ids)issues.delete(id);}
  });
  await t.test('native parent drift rejects the whole grouping before parent creation',async()=>{
   const ids=['PMON-710','PMON-711','PMON-712','PMON-713'];issues.set(ids[0],raw(ids[0],'Source'));issues.set(ids[1],raw(ids[1],'A',ids[0]));issues.set(ids[2],raw(ids[2],'B',ids[0]));issues.set(ids[3],raw(ids[3],'Other'));
   try{const state={remote:(await api('snapshot')).items,operations:[],order:{},expanded:[]};let n=0;stageBulk(state,[ids[1],ids[2]],{title:'Should Not Be Created',newId:'local-native-drift',groupId:'service-native-drift',makeOpId:()=> 'drift-'+(++n)});issues.set(ids[2],raw(ids[2],'B',ids[3]));const before=issues.size,result=await api('sync',{operations:state.operations});assert.equal(result.completed.length,0);assert.equal(result.blocked.conflicts[0].field,'__group__');assert.equal(issues.size,before);assert.equal(result.items.find(x=>x.id===ids[1]).parentId,ids[0]);
   }finally{for(const id of ids)issues.delete(id);}
  });
  await t.test('ambiguous group parent creation is reconciled once before linking every selected child',async()=>{
   const ids=['PMON-720','PMON-721','PMON-722','PMON-723'];issues.set(ids[0],raw(ids[0],'Source'));issues.set(ids[1],raw(ids[1],'Parent A',ids[0]));issues.set(ids[2],raw(ids[2],'Nested Child',ids[1],'Standby'));issues.set(ids[3],raw(ids[3],'Sibling B',ids[0]));let createdId;
   try{const state={remote:(await api('snapshot')).items,operations:[],order:{},expanded:[]};let n=0;const group=stageBulk(state,[ids[1],ids[3]],{title:'Recoverable Group Parent',newId:'local-bulk-parent',groupId:'service-group-create',makeOpId:()=> 'group-create-'+(++n)});loseCreation=true;let result=await api('sync',{operations:state.operations});assert.ok(result.blocked.error);result=await api('sync',{operations:state.operations});assert.equal(result.blocked.uncertain,true);const matches=[...issues.values()].filter(x=>x.summary==='Recoverable Group Parent');assert.equal(matches.length,1);createdId=matches[0].idReadable;await api('acknowledge',{opId:group.opIds[0],action:'created',issueId:createdId});result=await api('sync',{operations:state.operations});assert.deepEqual(result.completed,group.opIds);assert.equal(result.mapping['local-bulk-parent'],createdId);assert.equal(result.items.find(x=>x.id===ids[1]).parentId,createdId);assert.equal(result.items.find(x=>x.id===ids[3]).parentId,createdId);assert.equal(result.items.find(x=>x.id===ids[2]).parentId,ids[1]);assert.equal(result.items.find(x=>x.id===createdId).parentId,ids[0]);
   }finally{loseCreation=false;if(createdId)issues.delete(createdId);for(const id of ids)issues.delete(id);}
  });
  await t.test('full editor metadata exposes eligible users, project fields and calculated time',async()=>{const result=await api('edit-options?id=PMON-2');assert.equal(result.options.assignee.ready,true);assert.equal(result.options.dueDate.ready,true);assert.deepEqual(result.options.assignee.options.map(x=>x.id),['u1','u2']);assert.equal(result.options.custom.find(x=>x.id==='spent').readOnly,true);assert.equal(result.options.custom.find(x=>x.id==='estimate').readOnly,false);assert.equal(result.item.assignee,'u1');});
  await t.test('assignee/date/custom-field changes round trip independently with native edits and clearing',async()=>{
   const id='PMON-800';issues.set(id,raw(id,'Editor Fixture'));try{let base=(await api('snapshot')).items.find(x=>x.id===id);let patch={assignee:'u2',dueDate:'2026-11-01','custom:type':'feature','custom:stage':'building','custom:kanban':'blocked','custom:estimate':150,'custom:days':4,'custom:points':8};let result=await api('sync',{operations:[{opId:'all-editor-fields',type:'edit',issueId:id,base,patch}]});assert.deepEqual(result.completed,['all-editor-fields']);for(const [key,value]of Object.entries(patch))assert.deepEqual(result.items.find(x=>x.id===id)[key],value);assert.equal(issues.get(id).customFields.find(x=>x.name==='Due Date').value,dateTimestamp('2026-11-01'));
    const native=issues.get(id);native.customFields.find(x=>x.name==='Assignee').value=editorUsers[0];native.customFields.find(x=>x.name==='Due Date').value=dateTimestamp('2026-12-20');native.customFields.find(x=>x.id==='points').value=13;native.updated=++clock;base=(await api('snapshot')).items.find(x=>x.id===id);assert.equal(base.assignee,'u1');assert.equal(base.dueDate,'2026-12-20');assert.equal(base['custom:points'],13);
    result=await api('sync',{operations:[{opId:'clear-editor-fields',type:'edit',issueId:id,base,patch:{assignee:null,dueDate:null,'custom:estimate':null}}]});assert.deepEqual(result.completed,['clear-editor-fields']);assert.equal(result.items.find(x=>x.id===id).assignee,null);assert.equal(result.items.find(x=>x.id===id).dueDate,null);assert.equal(result.items.find(x=>x.id===id)['custom:points'],13);
   }finally{issues.delete(id);}
  });
  await t.test('nullable native conflicts and invalid/read-only choices prevent unreviewed overwrites',async()=>{
   const id='PMON-801';issues.set(id,raw(id,'Conflict Fixture'));try{const base=(await api('snapshot')).items.find(x=>x.id===id);issues.get(id).customFields.find(x=>x.name==='Due Date').value=dateTimestamp('2026-12-01');issues.get(id).updated=++clock;let result=await api('sync',{operations:[{opId:'date-native-conflict',type:'edit',issueId:id,base,patch:{dueDate:'2026-12-02'}}]});assert.equal(result.blocked.conflicts[0].field,'dueDate');
    for(const [suffix,patch]of [['assignee',{assignee:'not-eligible',description:'Must Stay Original'}],['spent',{'custom:spent':120,description:'Must Stay Original'}]]){const current=(await api('snapshot')).items.find(x=>x.id===id);result=await api('sync',{operations:[{opId:'invalid-editor-'+suffix,type:'edit',issueId:id,base:current,patch}]});assert.ok(result.blocked.error);assert.equal(issues.get(id).description,'Original notes');}
    const current=(await api('snapshot')).items.find(x=>x.id===id);denyEditorWrites=true;result=await api('sync',{operations:[{opId:'permission-editor',type:'edit',issueId:id,base:current,patch:{assignee:'u2'}}]});assert.match(result.blocked.error,/permission denied/);assert.equal(result.completed.length,0);
   }finally{denyEditorWrites=false;issues.delete(id);}
  });
  await t.test('tag add/remove, incoming tags and interrupted retries preserve confirmed changes',async()=>{
   const id='PMON-802';issues.set(id,raw(id,'Tag Fixture'));issues.get(id).tags=[editorTags[0]];try{let base=(await api('snapshot')).items.find(x=>x.id===id);const op={opId:'tag-recovery',type:'edit',issueId:id,base,patch:{tags:['tag-B','tag-C'],description:'Saved Before Tag Interruption'}};failTagOn='tag-C';let result=await api('sync',{operations:[op]});assert.ok(result.blocked.error);assert.deepEqual(result.items.find(x=>x.id===id).tags,['tag-B']);assert.equal(result.items.find(x=>x.id===id).description,'Saved Before Tag Interruption');result=await api('sync',{operations:[op]});assert.deepEqual(result.completed,[op.opId]);assert.deepEqual(result.items.find(x=>x.id===id).tags,['tag-B','tag-C']);
    issues.get(id).tags=[editorTags[0],editorTags[2]];issues.get(id).updated=++clock;base=(await api('snapshot')).items.find(x=>x.id===id);assert.deepEqual(base.tags,['tag-A','tag-C']);result=await api('sync',{operations:[{opId:'clear-tags',type:'edit',issueId:id,base,patch:{tags:[]}}]});assert.equal(result.items.find(x=>x.id===id).tags.length,0);
   }finally{failTagOn=null;issues.delete(id);}
  });
  await t.test('journaled comments are not duplicated by retry',async()=>{const op={opId:'comment-once',type:'comment',issueId:'PMON-2',text:'Dashboard comment'};await api('sync',{operations:[op]});await api('sync',{operations:[op]});assert.equal(comments.get('PMON-2').filter(x=>x.text==='Dashboard comment').length,1);});
  await t.test('ambiguous task creation requires review instead of blindly replaying',async()=>{loseCreation=true;const op={opId:'uncertain-create',type:'create',issueId:'local-test',item:{summary:'Uncertain create',parentId:'PMON-3',state:'To do',priority:'Normal',type:'Task'}};let result=await api('sync',{operations:[op]});assert.ok(result.blocked.error);result=await api('sync',{operations:[op]});assert.equal(result.blocked.uncertain,true);const created=[...issues.values()].filter(x=>x.summary==='Uncertain create');assert.equal(created.length,1);await api('acknowledge',{opId:op.opId,action:'created',issueId:created[0].idReadable});result=await api('sync',{operations:[op]});assert.equal(result.mapping['local-test'],created[0].idReadable);assert.equal(result.items.find(x=>x.id===created[0].idReadable).parentId,'PMON-3');});
  await t.test('deleting a natively modified task requires renewed review',async()=>{base=(await api('snapshot')).items.find(x=>x.id==='PMON-2');issues.get('PMON-2').description='Changed after deletion review';issues.get('PMON-2').updated=++clock;const result=await api('sync',{operations:[{opId:'delete-conflict',type:'delete',issueId:base.id,ids:[base.id],bases:{[base.id]:base}}]});assert.equal(result.blocked.conflicts[0].field,'__delete__');assert.ok(issues.has(base.id));});
 }finally{await new Promise(resolve=>server.close(resolve));globalThis.fetch=realFetch;}
});

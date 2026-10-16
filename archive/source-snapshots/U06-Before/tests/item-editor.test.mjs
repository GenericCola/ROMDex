import test from 'node:test';
import assert from 'node:assert/strict';
import {dateText,dateTimestamp,editorValues,editorConfiguration,editorPatch} from '../public/item-editor.mjs';
import {customDefinitions,customPayload,customValue,parseCustomInput,periodText} from '../public/custom-editor.mjs';
import {reconcile} from '../public/core.mjs';
import {Workspace} from '../public/store.mjs';
const users=[{id:'u1',login:'alpha',fullName:'Alpha'},{id:'u2',login:'beta',fullName:'Beta'}];
const schema=[{id:'assignee',field:{name:'Assignee',fieldType:{id:'user[1]'}},canBeEmpty:true},{id:'date',field:{name:'Due Date',fieldType:{id:'date'}},canBeEmpty:true}];
const config={...editorConfiguration(schema,users),tags:{ready:true,options:[{id:'t1',name:'Art'},{id:'t2',name:'Ready'}]}};
const item={summary:'Original',description:'Notes ',state:'To do',assignedState:'Critical / Debugging',priority:'Show-stopper',complexity:null,assignee:'u1',dueDate:null,tags:['t1']};
test('date-only values use midday UTC and retain their day across DST and timezones',()=>{
 for(const value of ['2026-03-08','2026-11-01','2028-02-29','0001-01-01','9999-12-31']){const stamp=dateTimestamp(value);assert.equal(new Date(stamp).getUTCHours(),12);assert.equal(dateText(stamp),value);}
 for(const value of ['2026-02-29','2026-04-31','tomorrow',0,'2026-1-1'])assert.throws(()=>dateTimestamp(value));assert.equal(dateTimestamp(null),null);
});
test('legacy raw fields normalize stable assignee identity and due date without changing content',()=>{
 const base=editorValues({summary:'Legacy',state:'Done',_custom:[{name:'Assignee',value:{id:'u1',login:'alpha',name:'Alpha'}},{name:'Due Date',value:dateTimestamp('2026-10-20')}]});assert.equal(base.assignee,'u1');assert.equal(base.dueDate,'2026-10-20');assert.deepEqual(base.tags,[]);
});
test('untouched fields remain untouched, including native Show-stopper and saved parent status',()=>{
 const base=editorValues(item);assert.deepEqual(editorPatch(base,{...base},config),{});assert.deepEqual(editorPatch(base,{...base,summary:'  New Name  ',description:'New Notes '},config),{summary:'New Name',description:'New Notes '});assert.equal(base.priority,'Show-stopper');assert.equal(base.assignedState,'Critical / Debugging');
});
test('eligible assignments, reassignment, unassignment and clearing dates are deliberate changes',()=>{
 const base=editorValues({...item,dueDate:'2026-10-20'});assert.deepEqual(editorPatch(base,{...base,assignee:'u2',dueDate:''},config),{assignee:'u2',dueDate:null});assert.equal(editorPatch(base,{...base,assignee:''},config).assignee,null);assert.throws(()=>editorPatch(base,{...base,assignee:'other'},config),/Eligible/);
 const required={...config,assignee:{...config.assignee,canBeEmpty:false},dueDate:{...config.dueDate,canBeEmpty:false}};assert.throws(()=>editorPatch(base,{...base,assignee:''},required),/Requires an Assignee/);assert.throws(()=>editorPatch(base,{...base,dueDate:''},required),/Requires a Due Date/);
});
test('unsupported cardinalities and datetime fields do not masquerade as editable single/date-only fields',()=>{
 const result=editorConfiguration([{field:{name:'Assignee',fieldType:{id:'user[*]'}},canBeEmpty:true},{field:{name:'Due Date',fieldType:{id:'date and time',valueType:'date'}},canBeEmpty:true}],users);assert.equal(result.assignee.ready,false);assert.equal(result.dueDate.ready,false);
});
test('custom fields remain separate conflict targets; unrelated native edits are preserved',()=>{
 const result=reconcile({'custom:stage':'planning','custom:points':2},{'custom:stage':'ready'},{'custom:stage':'planning','custom:points':9});assert.deepEqual(result.patch,{'custom:stage':'ready'});assert.equal(result.conflicts.length,0);assert.equal(reconcile({'custom:stage':'planning'},{'custom:stage':'ready'},{'custom:stage':'blocked'}).conflicts[0].field,'custom:stage');
});
test('typed numeric, enum and period payloads use native field identities and reject calculated time',()=>{
 const specs=[{id:'points',field:{name:'Story points',fieldType:{id:'integer'}},canBeEmpty:true},{id:'type',field:{name:'Type',fieldType:{id:'enum[1]'}},bundle:{values:[{id:'feature',name:'Feature'}]},canBeEmpty:false},{id:'estimate',field:{name:'Estimation',fieldType:{id:'period'}},canBeEmpty:true},{id:'spent',field:{name:'Spent time',fieldType:{id:'period'}},canBeEmpty:true}];
 const defs=customDefinitions(specs,{enabled:true,timeSpent:{id:'spent'}});assert.equal(customPayload(defs[0],4).value,4);assert.deepEqual(customPayload(defs[1],'feature').value,{id:'feature'});assert.deepEqual(customPayload(defs[2],150).value,{minutes:150});assert.throws(()=>customPayload(defs[3],90),/Work Logs/);assert.throws(()=>customPayload(defs[0],1.5),/Invalid/);assert.throws(()=>customPayload(defs[1],'other'),/Configured/);assert.throws(()=>customPayload(defs[1],null),/Cannot Be Empty/);
 assert.equal(parseCustomInput(defs[2],'2h 30m'),150);assert.equal(periodText(150),'2h 30m');assert.throws(()=>parseCustomInput(defs[2],'2 days'),/Hours and Minutes/);assert.equal(customValue({$type:'PeriodIssueCustomField',value:{minutes:150,presentation:'2h 30m'}}),150);
});
test('tag choices are explicit sets and unchanged tags do not create edits',()=>{
 const base=editorValues(item);assert.deepEqual(editorPatch(base,{...base,tags:['t1','t2']},config).tags,['t1','t2']);assert.throws(()=>editorPatch(base,{...base,tags:['unknown']},config),/Available Tag/);assert.deepEqual(editorPatch(base,{...base},config),{});
});
test('spent-time protection survives incomplete project settings and field identity variations',()=>{
 const spec={id:'project-spent',field:{id:'global-spent',name:'Spent time',fieldType:{id:'period'}},canBeEmpty:true};
 for(const settings of [null,{enabled:false},{enabled:true,timeSpent:{id:'another-id'}}])assert.equal(customDefinitions([spec],settings)[0].readOnly,true);
 const renamed={...spec,field:{...spec.field,name:'Recorded Time'}};assert.equal(customDefinitions([renamed],{enabled:true,timeSpent:{id:'another-id',field:{id:'global-spent',name:'Recorded Time'}}})[0].readOnly,true);
});
test('nullable editor baselines survive coalescing with an earlier queued edit',async t=>{
 const ws=new Workspace({storage:{save:async()=>{}}});ws.state={remote:[{id:'PMON-1',...item}],operations:[],order:{},images:{},expanded:[],selectorExpanded:[]};ws.automaticSyncEnabled=false;t.after(()=>{clearTimeout(ws.backupTimer);clearTimeout(ws.timer);});await ws.edit('PMON-1',{description:'Earlier Notes'});ws.state.remote[0].dueDate='2026-11-20';await ws.edit('PMON-1',{dueDate:'2026-12-20'},{dueDate:null});assert.equal(ws.state.operations[0].base.dueDate,null);assert.equal(reconcile(ws.state.operations[0].base,ws.state.operations[0].patch,ws.state.remote[0]).conflicts[0].field,'dueDate');
});

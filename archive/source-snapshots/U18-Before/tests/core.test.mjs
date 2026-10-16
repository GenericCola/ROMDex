import test from 'node:test';
import assert from 'node:assert/strict';
import {rollup,indexTree,validateMove,reconcile,materialize,remapOperation,mergeIncoming,applySyncResult,hasMeaningfulNotes,statusOf,STATUS,STATES} from '../public/core.mjs';
test('every status combination follows the agreed parent rules',()=>{
 const colors=['grey','yellow','red','green','blue','purple'];
 for(const a of colors)for(const b of colors)for(const c of colors){const list=[a,b,c];const expected=list.every(x=>x==='grey')?'grey':list.includes('red')?'red':list.includes('purple')?'purple':list.some(x=>['grey','yellow'].includes(x))?'yellow':list.includes('blue')?'blue':'green';assert.equal(rollup(list),expected);}
 assert.equal(rollup([]),null);
});
test('development menu follows preparation, readiness, implementation, and completion order',()=>{
 assert.deepEqual(Object.values(STATUS),['Untouched','In Progress','Standby','In Development','Complete','Critical']);
 assert.equal(statusOf('In Development'),'purple');assert.equal(STATES.purple,'In Development');
});
test('purple propagates recursively, red overrides it, and removing children restores the saved assignment',()=>{
 const nodes=[{id:'root',parentId:null,state:'Done',assignedState:'Standby'},{id:'parent',parentId:'root',state:'Done',assignedState:'To do'},{id:'dev',parentId:'parent',state:'In Development'},{id:'untouched',parentId:'parent',state:'To do'}];
 assert.equal(indexTree(nodes).colors.get('root'),'purple');assert.equal(indexTree(nodes).colors.get('parent'),'purple');
 assert.equal(indexTree([...nodes,{id:'critical',parentId:'parent',state:'Critical / Debugging'}]).colors.get('root'),'red');
 assert.equal(indexTree(nodes.slice(0,2)).colors.get('root'),'grey');assert.equal(indexTree(nodes.slice(0,1)).colors.get('root'),'blue');
});
const items=[{id:'a',parentId:null,state:'Done'},{id:'b',parentId:'a',state:'Done'},{id:'c',parentId:'b',state:'Critical / Debugging'}];
test('red and all-grey descendants propagate through every ancestor',()=>{assert.equal(indexTree(items).colors.get('a'),'red');const grey=items.map(x=>({...x,state:'To do'}));assert.deepEqual([...indexTree(grey).colors.values()],['grey','grey','grey']);});
test('untouched children override retained parent assignments; mixed progress still rolls up yellow',()=>{
 const nodes=[{id:'parent',parentId:null,state:'In Progress',assignedState:'In Progress'},{id:'child',parentId:'parent',state:'To do'}];
 assert.equal(indexTree(nodes).colors.get('parent'),'grey');
 for(const state of ['Done','Standby','In Progress'])assert.equal(indexTree([...nodes,{id:'sibling',parentId:'parent',state}]).colors.get('parent'),'yellow');
 assert.equal(indexTree([...nodes,{id:'sibling',parentId:'parent',state:'Critical / Debugging'}]).colors.get('parent'),'red');
 assert.equal(rollup(['grey']),'grey');
});
test('moving parents prevents cycles but allows cross-epic and root moves',()=>{assert.throws(()=>validateMove(items,'a','c'));validateMove(items,'c','a');validateMove(items,'c',null);assert.throws(()=>indexTree([{id:'a',parentId:'b'},{id:'b',parentId:'a'}]));});
test('three-way merge preserves separate remote edits and detects overlapping edits',()=>{const base={summary:'Before',description:'Old',priority:'Normal'};let result=reconcile(base,{description:'Local'},{...base,priority:'Major'});assert.deepEqual(result,{patch:{description:'Local'},conflicts:[]});result=reconcile(base,{description:'Local'},{...base,description:'Remote'});assert.equal(result.conflicts[0].remote,'Remote');assert.deepEqual(reconcile(base,{description:'Local'},{...base,description:'Local'}),{patch:{},conflicts:[]});});
test('remote deletion never silently resurrects an edited item',()=>{assert.equal(reconcile({summary:'A'},{summary:'B'},null).conflicts[0].field,'__missing__');});
test('id remapping updates dependent child creation and parent edits',()=>{assert.equal(remapOperation({type:'edit',issueId:'tmp-a',base:{parentId:null},patch:{parentId:'tmp-b'}},{'tmp-a':'PMON-300','tmp-b':'PMON-301'}).patch.parentId,'PMON-301');});
test('pending creates, moves, deletes survive serialization in their original order',()=>{const ops=[{type:'create',issueId:'d',item:{id:'d',parentId:'a',summary:'New'}},{type:'edit',issueId:'d',patch:{parentId:'b'}},{type:'delete',ids:['c']}];const output=materialize(items,JSON.parse(JSON.stringify(ops)));assert.equal(output.find(x=>x.id==='d').parentId,'b');assert.equal(output.some(x=>x.id==='c'),false);});
function workspace(){return {remote:[{id:'PMON-1',parentId:null,summary:'Original',description:'Original notes',state:'To do',priority:'Normal',comments:[]}],operations:[],images:{},order:{},expanded:[],selectorExpanded:[],selected:null,blocked:null};}
test('migration metadata does not falsely indicate that an otherwise blank task has notes',()=>{assert.equal(hasMeaningfulNotes('_Migrated from ClickUp: [id](https://app.clickup.com/t/id) · List: Custom Features_'),false);assert.equal(hasMeaningfulNotes('Actual instructions\n\n---\n_Migrated from ClickUp: [id](https://app.clickup.com/t/id)_'),true);assert.equal(hasMeaningfulNotes(''),false);});
test('native YouTrack edits are visible while a different local field is pending',()=>{
 const s=workspace();s.operations=[{opId:'op',type:'edit',issueId:'PMON-1',base:structuredClone(s.remote[0]),patch:{description:'My notes'}}];
 mergeIncoming(s,[{...s.remote[0],summary:'Native rename',priority:'Major',comments:[{text:'Native comment'}]}]);
 const visible=materialize(s.remote,s.operations)[0];assert.equal(visible.summary,'Native rename');assert.equal(visible.priority,'Major');assert.equal(visible.description,'My notes');assert.equal(visible.comments[0].text,'Native comment');assert.equal(s.operations[0].base.description,'Original notes');
});
test('native edits still arrive during a conflict and preserve both conflicting values',()=>{
 const s=workspace();const base=structuredClone(s.remote[0]);s.operations=[{opId:'op',type:'edit',issueId:'PMON-1',base,patch:{description:'Local'}}];s.blocked={opId:'op',conflicts:[]};
 mergeIncoming(s,[{...base,description:'Remote',priority:'Critical'}]);assert.equal(s.remote[0].description,'Remote');assert.equal(materialize(s.remote,s.operations)[0].description,'Local');assert.equal(materialize(s.remote,s.operations)[0].priority,'Critical');assert.equal(reconcile(base,s.operations[0].patch,s.remote[0]).conflicts.length,1);assert.equal(s.blocked.opId,'op');
});
test('native creation, deletion and reparenting refresh the hierarchy',()=>{
 const s=workspace();mergeIncoming(s,[{id:'PMON-2',parentId:null,state:'Done'},{id:'PMON-3',parentId:'PMON-2',state:'Standby'}]);const t=indexTree(materialize(s.remote,s.operations));assert.equal(t.byId.has('PMON-1'),false);assert.equal(t.depths.get('PMON-3'),1);assert.equal(t.colors.get('PMON-2'),'blue');
});
test('a native move that invalidates a queued move leaves the visible tree usable and retains the queued intent',()=>{const remote=[{id:'a',parentId:null,state:'To do'},{id:'b',parentId:'a',state:'To do'}];const ops=[{type:'edit',issueId:'a',base:{parentId:null},patch:{parentId:'b',description:'My pending notes'}}];const visible=materialize(remote,ops);assert.equal(visible.find(x=>x.id==='a').parentId,null);assert.equal(visible.find(x=>x.id==='a').description,'My pending notes');assert.equal(ops[0].patch.parentId,'b');assert.doesNotThrow(()=>indexTree(visible));});
test('acknowledging an in-flight save preserves edits made after the request started',()=>{
 const s=workspace();const base=structuredClone(s.remote[0]);s.operations=[{opId:'sent',type:'edit',issueId:'PMON-1',base,patch:{summary:'First'}},{opId:'later',type:'edit',issueId:'PMON-1',base:{...base,summary:'First'},patch:{summary:'Second'}}];
 applySyncResult(s,{completed:['sent'],mapping:{},items:[{...base,summary:'First'}],at:100});assert.deepEqual(s.operations.map(x=>x.opId),['later']);assert.equal(materialize(s.remote,s.operations)[0].summary,'Second');
});
test('server IDs replace temporary IDs everywhere without losing new child edits',()=>{
 const s=workspace();s.operations=[{opId:'create-parent',type:'create',issueId:'local-a',item:{id:'local-a',parentId:'PMON-1',summary:'Parent'}},{opId:'create-child',type:'create',issueId:'local-b',item:{id:'local-b',parentId:'local-a',summary:'Child'}}];s.images['local-a']='data:image/png;base64,test';s.selected='local-a';s.order['local-a']=3;
 applySyncResult(s,{completed:['create-parent'],mapping:{'local-a':'PMON-300'},items:[...s.remote,{id:'PMON-300',parentId:'PMON-1',summary:'Parent'}],at:100});assert.equal(s.operations[0].item.parentId,'PMON-300');assert.equal(s.selected,'PMON-300');assert.equal(s.images['PMON-300'],'data:image/png;base64,test');assert.equal(s.order['PMON-300'],3);
});

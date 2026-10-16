import test from 'node:test';
import assert from 'node:assert/strict';
import {AssignedStatuses,observeAssignedStatus} from '../assigned-statuses.mjs';
import {indexTree,materialize,reconcile,applySyncResult} from '../public/core.mjs';
const parent={id:'PMON-1',parentId:null,state:'Done'},child={id:'PMON-2',parentId:'PMON-1',state:'Done'};

test('a saved parent status stays hidden until its final child moves away, including after restart',async()=>{
 let saved;const store=new AssignedStatuses({},async records=>{saved=JSON.parse(JSON.stringify(records));});
 await store.observeAll([parent,child]);await store.assign(parent.id,'Standby');
 let items=[store.annotate(parent),store.annotate(child)];assert.equal(indexTree(items).colors.get(parent.id),'green');
 const restored=new AssignedStatuses(saved);items=[restored.annotate(parent),restored.annotate({...child,parentId:null})];
 assert.equal(indexTree(items).colors.get(parent.id),'blue');assert.equal(restored.records[parent.id].assignedState,'Standby');
});

test('inherited writes preserve grey own status and do not turn it into inherited green',async()=>{
 const store=new AssignedStatuses();await store.observe(parent,true);await store.assign(parent.id,'To do');
 await store.prepareWrite(parent.id,'In Progress');const during=await store.observe({...parent,state:'In Progress'},true);
 assert.equal(during.assignedState,'To do');assert.equal(store.records[parent.id].pendingState,null);
 assert.equal(indexTree([during,child]).colors.get(parent.id),'green');assert.equal(indexTree([during]).colors.get(parent.id),'grey');
});

test('native State edits become the own assignment for both parents and leaves',()=>{
 const record={assignedState:'Standby',lastState:'Done',hasChildren:true,pendingState:null};
 assert.equal(observeAssignedStatus({...parent,state:'Critical / Debugging'},record,true).assignedState,'Critical / Debugging');
 assert.equal(observeAssignedStatus({...parent,state:'In Progress'},record,false).assignedState,'In Progress');
});

test('an older issue snapshot cannot replace a more recent native assignment',()=>{
 const record={assignedState:'Standby',lastState:'Standby',lastUpdated:20,hasChildren:false,pendingState:null};
 const older=observeAssignedStatus({...parent,state:'Done',updated:10},record,true);
 assert.equal(older.assignedState,'Standby');assert.equal(older.lastState,'Standby');assert.equal(older.hasChildren,false);assert.equal(older.lastUpdated,20);
});

test('ambiguous rollup responses preserve intent while a different native edit is retained',()=>{
 const record={assignedState:'Standby',lastState:'In Progress',hasChildren:true,pendingState:'Done'};
 assert.equal(observeAssignedStatus({...parent,state:'Done'},record,true).assignedState,'Standby');
 assert.equal(observeAssignedStatus({...parent,state:'In Progress'},record,true).pendingState,'Done');
 const native=observeAssignedStatus({...parent,state:'Critical / Debugging'},record,true);
 assert.equal(native.assignedState,'Critical / Debugging');assert.equal(native.pendingState,null);
});

test('a failed local disk commit does not replace the durable assignment',async()=>{
 const record={assignedState:'Done',lastState:'Done',hasChildren:false,pendingState:null};
 const store=new AssignedStatuses({[parent.id]:record},async()=>{throw new Error('Disk full');});
 await assert.rejects(store.assign(parent.id,'Standby'),/Disk full/);assert.equal(store.records[parent.id].assignedState,'Done');
});

test('concurrent own assignments use the same three-way conflict rules',()=>{
 const base={assignedState:'Done'},patch={assignedState:'Standby'},remote={assignedState:'Critical / Debugging'};
 const result=reconcile(base,patch,remote);assert.equal(result.conflicts[0].field,'assignedState');
 assert.equal(result.conflicts[0].remote,'Critical / Debugging');assert.equal(result.conflicts[0].local,'Standby');
});

test('legacy pending State edits retain their visible color after the new schema is loaded',()=>{
 const remote=[{...parent,assignedState:'Done'}];
 const items=materialize(remote,[{type:'edit',issueId:parent.id,patch:{state:'Standby'}}]);
 assert.equal(indexTree(items).colors.get(parent.id),'blue');
});

test('assigned status on an unsaved item survives ID remapping and later pending edits',()=>{
 const state={remote:[],operations:[{opId:'create',type:'create',issueId:'local-a',item:{id:'local-a',parentId:null,state:'To do',assignedState:'Standby'}},{opId:'later',type:'edit',issueId:'local-a',base:{assignedState:'Standby'},patch:{assignedState:'Done'}}],images:{},order:{},expanded:[],selectorExpanded:[],selected:'local-a'};
 applySyncResult(state,{completed:['create'],mapping:{'local-a':'PMON-1'},items:[{...parent,assignedState:'Standby'}],at:1});
 assert.equal(state.operations[0].issueId,'PMON-1');assert.equal(state.operations[0].base.assignedState,'Standby');
 assert.equal(indexTree(materialize(state.remote,state.operations)).colors.get('PMON-1'),'green');
});

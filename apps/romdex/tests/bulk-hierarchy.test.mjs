import test from 'node:test';
import assert from 'node:assert/strict';
import {siblingSelection,bulkMovePlan,stageBulk} from '../public/bulk-hierarchy.mjs';
import {materialize,indexTree,applySyncResult,remapOperation} from '../public/core.mjs';
import {Workspace} from '../public/store.mjs';
const item=(id,parentId=null,state='To do')=>({id,parentId,state,assignedState:state,summary:id,description:'Notes '+id,priority:'Normal',updated:1});
const list=[item('P'),item('A','P'),item('A1','A','Done'),item('B','P'),item('C','P'),item('D','P'),item('Q'),item('Q1','Q')];
const initial=()=>({remote:structuredClone(list),operations:[],order:{A:0,B:1,C:2,D:3},images:{},expanded:['P'],selectorExpanded:[],blocked:null});
const options=()=>{let n=0;return {groupId:'fixture',makeOpId:()=>`op-${++n}`};};
test('same-parent selection retains manual sibling order, including nonconsecutive items',()=>{
 assert.deepEqual(siblingSelection(list,{D:0,B:1},['B','D']).members.map(x=>x.id),['D','B']);
 assert.throws(()=>siblingSelection(list,{},['A','A1']),/Same Parent/);assert.throws(()=>siblingSelection(list,{},['A','Q1']),/Same Parent/);assert.throws(()=>siblingSelection(list,{},['A','missing']),/No Longer Exists/);
});
test('bulk insertion is a stable block and handles an insertion boundary inside selection',()=>{
 assert.deepEqual(bulkMovePlan(list,{},['B','D'],'P','B').destination.map(x=>x.id),['A','B','D','C']);
 assert.deepEqual(bulkMovePlan(list,{},['B','D'],'Q','Q1').destination.map(x=>x.id),['B','D','Q1']);
 assert.throws(()=>bulkMovePlan(list,{},['A','B'],'A1'),/descendants/);assert.throws(()=>bulkMovePlan(list,{},['A','B'],'missing'),/destination/);
});
test('grouping creates one parent at first selected position and preserves subtrees, text and states',()=>{
 const s=initial(),g=stageBulk(s,['A','C'],{...options(),title:'  New Parent  ',newId:'local-parent',type:'Feature'}),items=materialize(s.remote,s.operations),tree=indexTree(items,s.order);
 assert.equal(g.opIds.length,3);assert.equal(s.operations[0].type,'create');assert.equal(s.operations[0].item.summary,'New Parent');assert.deepEqual(tree.children.get('P').map(x=>x.id),['local-parent','B','D']);assert.deepEqual(tree.children.get('local-parent').map(x=>x.id),['A','C']);assert.equal(tree.byId.get('A1').parentId,'A');assert.equal(tree.byId.get('A').description,'Notes A');assert.equal(tree.byId.get('A1').state,'Done');assert.ok(s.expanded.includes('local-parent'));
});
test('same-parent reorder is local only and does not stage needless YouTrack writes',()=>{
 const s=initial(),g=stageBulk(s,['B','D'],{...options(),parentId:'P',beforeId:'A'});assert.equal(g.opIds.length,0);assert.equal(s.operations.length,0);assert.deepEqual(indexTree(materialize(s.remote,s.operations),s.order).children.get('P').map(x=>x.id),['B','D','A','C']);
});
test('new parent mapping reaches remaining group links, metadata, expansion and progress',()=>{
 const s=initial(),g=stageBulk(s,['A','C'],{...options(),title:'Group',newId:'local-parent'});applySyncResult(s,{completed:[g.opIds[0]],mapping:{'local-parent':'PMON-900'},blocked:{opId:g.opIds[1],error:'Interrupted'},items:null,at:2});
 assert.equal(s.operations[0].patch.parentId,'PMON-900');assert.equal(s.operations[0].group.destinationParentId,'PMON-900');assert.equal(s.bulkGroups.fixture.createdParentId,'PMON-900');assert.deepEqual(s.bulkGroups.fixture.completed,['op-1']);assert.equal(s.bulkGroups.fixture.status,'blocked');assert.ok(s.expanded.includes('PMON-900'));
 applySyncResult(s,{completed:['op-2','op-3'],mapping:{},items:null,at:3});assert.equal(s.bulkGroups.fixture.status,'complete');assert.equal(s.operations.length,0);
});
test('failure publishing a staged group leaves no local parent, links or order changes',async t=>{
 const ws=new Workspace({storage:{save:async()=>{throw Error('Disk full');}}});ws.state=initial();const before=structuredClone(ws.state);t.after(()=>clearTimeout(ws.backupTimer));await assert.rejects(ws.groupItems(['A','C'],'Group'),/Disk full/);assert.deepEqual(ws.state,before);
});
test('cancelling an interrupted group keeps completed remote moves and unrelated note edits',async t=>{
 const ws=new Workspace({storage:{save:async()=>{}},transport:async()=>({connected:false})});ws.state=initial();ws.automaticSyncEnabled=false;ws.connected=false;t.after(()=>{clearTimeout(ws.backupTimer);clearTimeout(ws.timer);});
 const g=await ws.moveMany(['A','C'],'Q');await ws.edit('C',{description:'Later Notes'});assert.equal(ws.state.operations.length,3);assert.equal(ws.state.operations[2].group,undefined);
 const remote=structuredClone(list);remote.find(x=>x.id==='A').parentId='Q';applySyncResult(ws.state,{completed:[g.opIds[0]],mapping:{},items:remote,blocked:{opId:g.opIds[1],error:'Interrupted'},at:2});await ws.resolve({discard:true});assert.equal(ws.state.bulkGroups[g.id].status,'cancelled');assert.equal(ws.items.find(x=>x.id==='A').parentId,'Q');assert.equal(ws.items.find(x=>x.id==='C').parentId,'P');assert.equal(ws.items.find(x=>x.id==='C').description,'Later Notes');assert.equal(ws.state.operations.length,1);
});
test('group metadata remapping and renewed validation reject native parent changes before local commit',()=>{
 const s=initial();s.remote.find(x=>x.id==='C').parentId='Q';assert.throws(()=>stageBulk(s,['A','C'],{...options(),title:'Group',newId:'local-parent'}),/Same Parent/);assert.equal(s.operations.length,0);
 const op={opId:'x',type:'edit',issueId:'local-a',base:{parentId:'local-p'},patch:{parentId:'local-q'},group:{id:'g',members:['local-a','B'],originParentId:'local-p',destinationParentId:'local-q'}};const mapped=remapOperation(op,{'local-a':'A','local-p':'P','local-q':'Q'});assert.deepEqual(mapped.group.members,['A','B']);assert.equal(mapped.group.originParentId,'P');assert.equal(mapped.group.destinationParentId,'Q');
});
test('deleting a queued offline parent removes its group links before confirmed subtree deletion',async t=>{
 const ws=new Workspace({storage:{save:async()=>{}},transport:async()=>({connected:false})});ws.state=initial();ws.automaticSyncEnabled=false;t.after(()=>{clearTimeout(ws.backupTimer);clearTimeout(ws.timer);});
 const group=await ws.groupItems(['A','C'],'Offline Parent');await ws.remove([group.createdParentId,'A','A1','C']);assert.equal(ws.state.bulkGroups[group.id].status,'cancelled');assert.equal(ws.state.operations.length,1);assert.equal(ws.state.operations[0].type,'delete');assert.deepEqual(ws.state.operations[0].ids,['A','A1','C']);assert.equal(ws.items.some(x=>x.id==='A'),false);
});
test('an in-flight group cannot be deleted or partly cancelled while YouTrack is processing it',async t=>{
 const ws=new Workspace({storage:{save:async()=>{}}});ws.state=initial();ws.automaticSyncEnabled=false;t.after(()=>{clearTimeout(ws.backupTimer);clearTimeout(ws.timer);});const group=await ws.moveMany(['A','C'],'Q');ws.inflight.add(group.opIds[0]);const before=structuredClone(ws.state);await assert.rejects(ws.remove(['A','A1']),/Current Group Sync/);assert.deepEqual(ws.state,before);
});
test('a 1,000-item group crosses the service batch limit without losing mapping or progress',async t=>{
 let remote=[item('P'),...Array.from({length:1000},(_,i)=>item('T'+i,'P'))],sizes=[];
 const ws=new Workspace({storage:{save:async()=>{}},transport:async(path,body)=>{
  if(path==='/api/backup')return {ok:true};assert.equal(path,'/api/sync');sizes.push(body.operations.length);const mapping={};for(const op of body.operations)if(op.type==='create')mapping[op.issueId]='PMON-NEW';
  remote=materialize(remote,body.operations.map(op=>remapOperation(op,mapping)));
  return {items:remote,completed:body.operations.map(op=>op.opId),mapping,at:1,connected:true,automaticSyncEnabled:false,connection:{missingStates:[]}};
 }});ws.state={...initial(),remote};ws.connected=true;ws.automaticSyncEnabled=false;t.after(()=>{clearTimeout(ws.backupTimer);clearTimeout(ws.timer);});
 const group=await ws.groupItems(remote.slice(1).map(x=>x.id),'Large Parent');await ws.sync(true);assert.equal(ws.state.operations.length,1);assert.equal(ws.state.operations[0].patch.parentId,'PMON-NEW');assert.equal(ws.state.bulkGroups[group.id].completed.length,1000);await ws.sync(true);assert.deepEqual(sizes,[1000,1]);assert.equal(ws.state.operations.length,0);assert.equal(ws.state.bulkGroups[group.id].status,'complete');assert.equal(ws.items.filter(x=>x.parentId==='PMON-NEW').length,1000);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {indexTree,clone} from '../public/core.mjs';
import {workRows} from '../public/work-view.mjs';
import {rowDropTarget} from '../public/drop-target.mjs';
const item=(id,parentId,state,summary=id)=>({id,parentId,state,summary,description:''});
const items=[item('A',null,'Done'),item('A1','A','Done','Finished Match'),item('A2','A','In Progress','Active Match'),item('B',null,'Done'),item('B1','B','Done'),item('C',null,'Standby'),item('D',null,'To do')];
const tree=indexTree(items),expanded=new Set(items.map(x=>x.id));
const ids=options=>workRows({tree,expanded,...options}).map(x=>x.id);

test('completed items start visible; hiding uses inherited status and retains unfinished ancestors',()=>{
 assert.deepEqual(ids(),['A','A1','A2','B','B1','C','D']);
 assert.equal(tree.colors.get('A'),'yellow');
 assert.deepEqual(ids({hideCompleted:true}),['A','A2','C','D']);
});
test('completion filtering respects selector scope and saved expansion state',()=>{
 assert.deepEqual(ids({selected:'A',hideCompleted:true}),['A2']);
 assert.deepEqual(ids({expanded:new Set(),hideCompleted:true}),['A','C','D']);
 assert.deepEqual(ids({selected:'B',hideCompleted:true}),[]);
});
test('search includes context for unfinished matches but excludes completed-only matches',()=>{
 assert.deepEqual(ids({search:'active',hideCompleted:true,expanded:new Set()}),['A','A2']);
 assert.deepEqual(ids({search:'finished',hideCompleted:true}),[]);
 assert.deepEqual(ids({search:'finished'}),['A','A1']);
 assert.deepEqual(ids({search:'active',selected:'B',hideCompleted:true}),[]);
});
test('active editing and draft insertion paths stay reachable without revealing completed siblings',()=>{
 assert.deepEqual(ids({hideCompleted:true,expanded:new Set(),keepIds:['B1']}),['A','B','B1','C','D']);
 assert.deepEqual(ids({hideCompleted:true,search:'absent',keepIds:['A1']}),['A','A1']);
});
test('native completion and reopening immediately update the filtered view without rewriting saved statuses',()=>{
 const completed=clone(items);completed.find(x=>x.id==='A2').state='Done';
 assert.deepEqual(workRows({tree:indexTree(completed),expanded,hideCompleted:true}).map(x=>x.id),['C','D']);
 completed.find(x=>x.id==='B1').state='Critical / Debugging';
 assert.deepEqual(workRows({tree:indexTree(completed),expanded,hideCompleted:true}).map(x=>x.id),['B','B1','C','D']);
 assert.equal(completed.find(x=>x.id==='B').state,'Done');
});
test('toggling preserves hierarchy, manual order and full-tree colors',()=>{
 const order={A:3,A1:2,A2:1,B:2,C:1,D:0},ordered=indexTree(items,order),before=clone(items),colors=[...ordered.colors];
 const all=workRows({tree:ordered,expanded}).map(x=>x.id);
 workRows({tree:ordered,expanded,hideCompleted:true});
 assert.deepEqual(workRows({tree:ordered,expanded}).map(x=>x.id),all);
 assert.deepEqual(items,before);assert.deepEqual([...ordered.colors],colors);assert.equal(order.A1,2);
});
test('filtered drag guides retain the real hidden sibling boundary used by the committed move',()=>{
 const list=[item('P',null,'Done'),item('P1','P','Done'),item('P2','P','To do'),item('P3','P','Done'),item('X',null,'To do')],t=indexTree(list);
 const visibleIds=workRows({tree:t,expanded:new Set(['P']),hideCompleted:true}).map(x=>x.id);
 const target=rowDropTarget({items:list,tree:t,dragId:'X',targetId:'P2',delta:0,after:true,visibleIds});
 assert.equal(target.parentId,'P');assert.equal(target.beforeId,'P3');assert.equal(target.anchorId,'P2');assert.equal(target.displayDepth,1);
 assert.equal(list.find(x=>x.id==='X').parentId,null);
});

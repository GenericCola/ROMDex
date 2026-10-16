import test from 'node:test';
import assert from 'node:assert/strict';
import {indexTree} from '../public/core.mjs';
import {SELECTOR_TIERS,SELECTOR_MAX_DEPTH,normalizeSelectorExpansion,toggleSelectorExpansion,selectorPath} from '../public/selector-state.mjs';
import {workRows} from '../public/work-view.mjs';
const items=[['e1',null],['e2',null],['g1','e1'],['g2','e1'],['g3','e2'],['s1','g1'],['s2','g1'],['s3','g2'],['s4','g3'],['v1','s1'],['v2','s2'],['v3','s3'],['v4','s4'],['t1','v1'],['t2','v2'],['t3','v3'],['t4','v4']].map(([id,parentId])=>({id,parentId,summary:id,state:'To do'}));
const tree=indexTree(items);
test('four selector tiers relabel existing levels without changing parent links',()=>{
 assert.deepEqual(SELECTOR_TIERS,['Epic','Saga','Story','Verse']);assert.equal(SELECTOR_MAX_DEPTH,3);
 assert.equal(SELECTOR_TIERS[tree.depths.get('g1')],'Saga');assert.equal(SELECTOR_TIERS[tree.depths.get('s1')],'Story');assert.equal(SELECTOR_TIERS[tree.depths.get('v1')],'Verse');assert.equal(SELECTOR_TIERS[tree.depths.get('t1')]||'Task','Task');assert.equal(tree.byId.get('v1').parentId,'s1');
});
test('Verse is selectable depth four but only Epic/Saga/Story belong to disclosure state',()=>{
 assert.deepEqual([...selectorPath(tree,'t1')],['e1','g1','s1']);assert.deepEqual([...selectorPath(tree,'v1')],['e1','g1','s1']);assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'v1')],['e1','g1','s1']);
});
test('opening a different Epic discards the old Saga and Story state',()=>{
 assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'e2')],['e2']);
});
test('opening another Saga keeps the Epic and discards the prior Saga/Story',()=>{
 assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'g2')],['e1','g2']);
});
test('opening another Story keeps its Epic and Saga but replaces the prior Story',()=>{
 assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'s2')],['e1','g1','s2']);
});
test('opening a Story in another Epic reveals exactly its new ancestor path',()=>{
 assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'s4')],['e2','g3','s4']);
});
test('collapse prunes all descendants rather than retaining hidden expansion',()=>{
 assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'s1')],['e1','g1']);assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'g1')],['e1']);assert.deepEqual([...toggleSelectorExpansion(tree,['e1','g1','s1'],'e1')],[]);assert.deepEqual([...toggleSelectorExpansion(tree,[],'e1')],['e1']);
});
test('old multi-expanded preferences choose one path containing the selected item',()=>{
 assert.deepEqual([...normalizeSelectorExpansion(tree,['e1','g1','s1','e2','g3','s4','v4','missing'],'v1')],['e1','g1','s1']);assert.deepEqual([...normalizeSelectorExpansion(tree,['e1','g1','s1','s2'],'v2')],['e1','g1','s2']);
});
test('empty preferences stay collapsed and missing selected items are safe',()=>{
 assert.deepEqual([...normalizeSelectorExpansion(tree,[],'v1')],[]);assert.deepEqual([...normalizeSelectorExpansion(tree,['missing'],'missing')],[]);
});
test('native reparenting repairs the path and deleted nodes vanish',()=>{
 const moved=indexTree(items.map(x=>x.id==='s1'?{...x,parentId:'g3'}:x));assert.deepEqual([...normalizeSelectorExpansion(moved,['e1','g1','s1'],'v1')],['e2','g3','s1']);const deleted=indexTree(items.filter(x=>!['s1','v1','t1'].includes(x.id)));assert.deepEqual([...normalizeSelectorExpansion(deleted,['e1','g1','s1'],'v1')],['e1','g1']);
});
test('branches without children never get disclosure state',()=>{
 const leafTree=indexTree([{id:'empty',parentId:null,state:'To do'}]);assert.deepEqual([...toggleSelectorExpansion(leafTree,[],'empty')],[]);
});
test('a parent outside the imported project does not make its visible root unexpandable',()=>{
 const orphaned=indexTree(items.map(x=>x.id==='e1'?{...x,parentId:'outside-project'}:x));
 assert.deepEqual([...normalizeSelectorExpansion(orphaned,['e1','g1','s1'],'v1')],['e1','g1','s1']);
});
test('selector normalization does not alter images or unrestricted Work expansion',()=>{
 const ids=['e1','g1','s1','e2','g3','s4'],images={e1:'saved-image'},expanded=new Set(items.map(x=>x.id)),before=workRows({tree,expanded}).map(x=>x.id);normalizeSelectorExpansion(tree,ids,'v1');assert.deepEqual(ids,['e1','g1','s1','e2','g3','s4']);assert.deepEqual(images,{e1:'saved-image'});assert.deepEqual(workRows({tree,expanded}).map(x=>x.id),before);assert.ok(before.includes('t1')&&before.includes('t2')&&before.includes('t3')&&before.includes('t4'));
});

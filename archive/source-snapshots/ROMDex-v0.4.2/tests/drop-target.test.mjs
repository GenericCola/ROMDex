import test from 'node:test';
import assert from 'node:assert/strict';
import {indexTree} from '../public/core.mjs';
import {rowDropTarget} from '../public/drop-target.mjs';
const item=(id,parentId=null)=>({id,parentId,state:'To do'});
const items=[item('A'),item('B','A'),item('C','B'),item('D','C'),item('E','B'),item('F','A'),item('G')];
const tree=indexTree(items),visibleIds=['A','B','C','D','E','F','G'];
const target=options=>rowDropTarget({items,tree,dragId:'G',targetId:'B',delta:0,after:false,visibleIds,...options});

test('sibling insertion guide brackets the whole expanded branch, matching the committed order',()=>{
 assert.deepEqual(target({after:false}),{parentId:'A',beforeId:'B',depth:1,displayDepth:1,anchorId:'B',after:false});
 assert.deepEqual(target({after:true}),{parentId:'A',beforeId:'F',depth:1,displayDepth:1,anchorId:'E',after:true});
});
test('nesting previews the new child level and appends beyond visible descendants',()=>{
 assert.deepEqual(target({delta:1}),{parentId:'B',beforeId:null,depth:2,displayDepth:2,anchorId:'E',after:true});
 assert.equal(target({delta:1,visibleIds:['A','B','F','G']}).anchorId,'B');
});
test('outdenting previews the ancestor boundary and actual root/sibling destination',()=>{
 assert.deepEqual(target({targetId:'D',delta:-1,after:false}),{parentId:'B',beforeId:'C',depth:2,displayDepth:2,anchorId:'C',after:false});
 assert.deepEqual(target({targetId:'D',delta:-10,after:true}),{parentId:null,beforeId:'G',depth:0,displayDepth:0,anchorId:'F',after:true});
});
test('selector scope makes the guide indentation relative to the displayed hierarchy',()=>{
 assert.equal(target({selected:'A'}).displayDepth,0);
 assert.equal(target({selected:'A',delta:1}).displayDepth,1);
 assert.equal(target({selected:'B',targetId:'D',delta:-10}).displayDepth,0);
 const scoped={selected:'B',targetId:'D',delta:-10,visibleIds:['C','D','E']};
 assert.equal(target({...scoped,after:false}).anchorId,'C');
 assert.equal(target({...scoped,after:true}).anchorId,'E');
});
test('self/descendant targets never produce a valid guide or move',()=>{
 assert.equal(target({dragId:'B'}),null);
 assert.throws(()=>target({dragId:'B',targetId:'D',delta:0}),/descendants/);
 assert.throws(()=>target({dragId:'A',delta:1}),/descendants/);
 assert.equal(target({targetId:'missing'}),null);
});
test('leaf/root boundaries and filtered visible branches retain their actual insertion order',()=>{
 assert.deepEqual(target({targetId:'F',after:true}),{parentId:'A',beforeId:null,depth:1,displayDepth:1,anchorId:'F',after:true});
 assert.deepEqual(target({dragId:'F',targetId:'G',after:false}),{parentId:null,beforeId:'G',depth:0,displayDepth:0,anchorId:'G',after:false});
 assert.equal(target({after:true,visibleIds:['A','B','C','D','F','G']}).anchorId,'D');
});

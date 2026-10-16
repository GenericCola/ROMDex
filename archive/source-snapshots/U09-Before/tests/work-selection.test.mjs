import test from 'node:test';
import assert from 'node:assert/strict';
import {WorkSelection} from '../public/work-selection.mjs';
import {indexTree} from '../public/core.mjs';
import {workRows} from '../public/work-view.mjs';
const visible=['A','B','C','D'];
test('checkbox toggles and Ctrl-click preserve nonconsecutive selections',()=>{
 const s=new WorkSelection();s.toggle('A',visible);s.toggle('D',visible,{ctrlKey:true});assert.deepEqual([...s.ids],['A','D']);s.toggle('A',visible,{ctrlKey:true});assert.deepEqual([...s.ids],['D']);s.toggle('D',visible);assert.equal(s.ids.size,0);
});
test('Shift ranges use visible order in both directions and retain the anchor',()=>{
 const s=new WorkSelection();s.toggle('D',visible);s.toggle('B',visible,{shiftKey:true});assert.deepEqual([...s.ids],['B','C','D']);assert.equal(s.anchor,'D');s.toggle('C',visible,{shiftKey:true});assert.deepEqual([...s.ids],['C','D']);
});
test('Ctrl Shift extends a range while ordinary Shift replaces prior selection',()=>{
 const s=new WorkSelection();s.toggle('A',visible);s.toggle('C',visible);s.toggle('D',visible,{ctrlKey:true,shiftKey:true});assert.deepEqual([...s.ids],['A','C','D']);s.toggle('D',visible,{shiftKey:true});assert.deepEqual([...s.ids],['C','D']);
});
test('range excludes collapsed, filtered, and out-of-scope rows',()=>{
 const list=[['P',null,'To do'],['A','P','To do'],['H','A','To do'],['B','P','Done'],['C','P','To do'],['X',null,'To do']].map(([id,parentId,state])=>({id,parentId,state,summary:id,description:''}));
 const ids=workRows({tree:indexTree(list),selected:'P',hideCompleted:true}).map(x=>x.id);assert.deepEqual(ids,['A','C']);const s=new WorkSelection();s.toggle('A',ids);s.toggle('C',ids,{shiftKey:true});assert.deepEqual([...s.ids],['A','C']);
});
test('native deletion, filtering, and collapse prune selection and invalid anchors',()=>{
 const s=new WorkSelection();s.toggle('A',visible);s.toggle('D',visible);s.reconcile(['A','C']);assert.deepEqual([...s.ids],['A']);assert.equal(s.anchor,null);s.toggle('C',['A','C'],{shiftKey:true});assert.deepEqual([...s.ids],['A','C']);s.reconcile([]);assert.equal(s.ids.size,0);
});
test('scope clearing resets range anchor; unknown click cannot select hidden item',()=>{
 const s=new WorkSelection();s.toggle('A',visible);s.clear();s.toggle('X',visible);assert.equal(s.ids.size,0);assert.equal(s.anchor,null);s.toggle('D',visible,{shiftKey:true});assert.deepEqual([...s.ids],['D']);
});
test('local issue ID replacement preserves checkbox identity and range anchor',()=>{
 const s=new WorkSelection();s.toggle('local-a',['local-a','B']);s.toggle('B',['local-a','B'],{shiftKey:true});s.remap({'local-a':'PMON-1'});assert.deepEqual([...s.ids],['PMON-1','B']);assert.equal(s.anchor,'PMON-1');
});

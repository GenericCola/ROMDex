import test from 'node:test';
import assert from 'node:assert/strict';
import {tabAction,nextDetailsMode,renameNestingTarget,escapeAction,nextEscapeDetailsMode} from '../public/workspace-keyboard.mjs';
import {indexTree} from '../public/core.mjs';

test('a normal workspace cycles default, full, collapsed, then default',()=>{
 let state={ratio:null,collapsed:false,full:false};
 state=nextDetailsMode(state);assert.equal(state.full,true);assert.equal(state.collapsed,false);
 state=nextDetailsMode(state);assert.equal(state.full,false);assert.equal(state.collapsed,true);
 state=nextDetailsMode(state);assert.deepEqual(state,{ratio:null,full:false,collapsed:false});
});
test('cycling a custom split returns to the default after collapsed mode',()=>{
 const custom={ratio:.57,collapsed:false,full:false},full=nextDetailsMode(custom);
 assert.equal(full.ratio,.57);assert.deepEqual(custom,{ratio:.57,collapsed:false,full:false});
 assert.equal(nextDetailsMode(nextDetailsMode(full)).ratio,null);
});
test('workspace TAB cycles but ordinary form focus does not',()=>{
 assert.equal(tabAction({key:'Tab',navigation:true}),'cycle');
 assert.equal(tabAction({key:'Tab',navigation:false}),null);
});
test('inline name editing takes precedence over pane cycling and grouping',()=>{
 assert.equal(tabAction({key:'Tab',inlineName:true,navigation:true,selectedCount:3}),'indent');
 assert.equal(tabAction({key:'Tab',inlineName:true,shiftKey:true}),'outdent');
});
test('multi-selection reserves TAB for grouping without intercepting forms',()=>{
 assert.equal(tabAction({key:'Tab',navigation:true,selectedCount:2}),'group');
 assert.equal(tabAction({key:'Tab',navigation:false,selectedCount:2}),null);
});
test('modifier keys, composition and non-TAB keys do not cycle',()=>{
 for(const flag of ['ctrlKey','altKey','metaKey','isComposing'])assert.equal(tabAction({key:'Tab',navigation:true,[flag]:true}),null);
 assert.equal(tabAction({key:'Enter',navigation:true}),null);
 assert.equal(tabAction({key:'Tab',navigation:true,shiftKey:true}),null);
});
test('modal menus and active drag/resize suppress list shortcuts',()=>{
 assert.equal(tabAction({key:'Tab',navigation:true,modal:true}),null);
 assert.equal(tabAction({key:'Tab',inlineName:true,busy:true}),null);
});
const items=[{id:'root',parentId:null},{id:'next-root',parentId:null},{id:'a',parentId:'root'},{id:'b',parentId:'root'},{id:'child',parentId:'a'}];
test('existing names indent under the preceding sibling, not its descendant',()=>{
 assert.deepEqual(renameNestingTarget(indexTree(items),'b'),{parentId:'a',beforeId:null,expandId:'a'});
});
test('outdent inserts after the original parent and before its next sibling',()=>{
 assert.deepEqual(renameNestingTarget(indexTree(items),'child',true),{parentId:'root',beforeId:'b',expandId:null});
 assert.deepEqual(renameNestingTarget(indexTree(items,{root:0,'next-root':1}),'b',true),{parentId:null,beforeId:'next-root',expandId:null});
});
test('unavailable nesting targets leave the hierarchy unchanged',()=>{
 const tree=indexTree(items);
 assert.throws(()=>renameNestingTarget(tree,'a'),/preceding sibling/);
 assert.throws(()=>renameNestingTarget(tree,'root',true),/top level/);
 assert.throws(()=>renameNestingTarget(tree,'missing'),/no longer exists/);
 assert.equal(tree.byId.get('a').parentId,'root');
});
test('ESC clears a selected item or field before it is allowed to toggle panes',()=>{
 assert.equal(escapeAction({key:'Escape',hasSelection:true}),'clear');
 assert.equal(escapeAction({key:'Escape',fieldFocused:true}),'clear');
 assert.equal(escapeAction({key:'Escape',hasSelection:true,fieldFocused:true}),'clear');
 assert.equal(escapeAction({key:'Escape'}),'toggle');
});
test('ESC leaves modal dismissal, composition, drag/resize and modified shortcuts alone',()=>{
 for(const flag of ['modal','busy','isComposing','ctrlKey','altKey','metaKey'])assert.equal(escapeAction({key:'Escape',[flag]:true}),null);
 assert.equal(escapeAction({key:'Tab'}),null);
});
test('ESC with no selection toggles Collapsed and Default, resetting a custom split',()=>{
 const state={ratio:.6,collapsed:false,full:false},closed=nextEscapeDetailsMode(state);
 assert.equal(closed.collapsed,true);assert.equal(closed.full,false);
 assert.deepEqual(nextEscapeDetailsMode(closed),{ratio:null,full:false,collapsed:false});
 assert.deepEqual(state,{ratio:.6,collapsed:false,full:false});
});
test('ESC from Expanded with no selection collapses before restoring Default',()=>{
 const closed=nextEscapeDetailsMode({ratio:.5,collapsed:false,full:true});
 assert.equal(closed.collapsed,true);assert.equal(closed.full,false);
 assert.deepEqual(nextEscapeDetailsMode(closed),{ratio:null,full:false,collapsed:false});
});

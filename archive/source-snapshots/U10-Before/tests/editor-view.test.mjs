import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshEditor} from '../public/editor-view.mjs';

function field(text){let value=text;return {selectionStart:text.length,selectionEnd:text.length,get value(){return value;},set value(next){value=next;this.selectionStart=this.selectionEnd=next.length;}};}
test('typing words across normalized autosaves preserves their separating spaces',()=>{
 const title=field('First');let saved=title.value;
 for(const character of ' Second Word'){
  title.value+=character;saved=title.value.trim();
  refreshEditor(title,saved,{activeElement:title});
 }
 assert.equal(title.value,'First Second Word');assert.equal(saved,'First Second Word');
});
test('an incoming refresh cannot erase a focused trailing space or reset a mid-title caret',()=>{
 const title=field('First ');title.selectionStart=title.selectionEnd=3;
 refreshEditor(title,'First',{activeElement:title});
 assert.equal(title.value,'First ');assert.equal(title.selectionStart,3);
 refreshEditor(title,'Native Rename',{activeElement:title});assert.equal(title.value,'First ');
});
test('leaving the editor permits normalized or native text, while item navigation replaces the old draft',()=>{
 const title=field('First ');refreshEditor(title,'First');assert.equal(title.value,'First');
 refreshEditor(title,'Remote Title',{dirty:true});assert.equal(title.value,'First');
 refreshEditor(title,'Other Item',{fresh:true,dirty:true,activeElement:title});assert.equal(title.value,'Other Item');
});
test('an unchanged notes refresh preserves selection even without focus',()=>{
 const notes=field('Long prompt');notes.selectionStart=2;notes.selectionEnd=5;
 refreshEditor(notes,'Long prompt');assert.equal(notes.selectionStart,2);assert.equal(notes.selectionEnd,5);
});

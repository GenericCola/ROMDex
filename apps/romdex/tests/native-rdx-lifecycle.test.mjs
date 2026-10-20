import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNativeRdx} from '../public/native-rdx.mjs';

const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(t,rdxOpen){
 const original={document:globalThis.document,window:globalThis.window},jobs=new Map(),events=new Map(),warnings=[];let next=0,receive;
 const dialog={setAttribute(){},addEventListener(){},close(){this.open=false;},open:false};
 globalThis.document={body:{inert:false,append(){}},createElement:()=>dialog,querySelector:()=>null};
 globalThis.window={addEventListener:(name,fn)=>events.set(name,fn)};
 t.after(()=>{globalThis.document=original.document;globalThis.window=original.window;});
 const ui=mountNativeRdx({desktop:{rdxOpen,onEvent(fn){receive=fn;return()=>{};}},host:{views:new Map()},tell:message=>warnings.push(message),timers:{setTimeout(fn){jobs.set(++next,fn);return next;},clearTimeout(id){jobs.delete(id);}}});
 t.after(()=>ui.dispose());return {jobs,warnings,emit:e=>receive(e),focus:()=>events.get('focus')(),run:async()=>{const [id,fn]=jobs.entries().next().value;jobs.delete(id);fn();await settle();}};
}

test('Quit stops polling, ignores an in-flight list response and resumes after cancelled Quit',async t=>{
 let calls=0,resolve;const s=setup(t,action=>{calls++;assert.equal(action,'list');return new Promise(r=>resolve=r);});
 await s.run();s.emit({type:'lifecycle',busy:true});resolve([{id:'kept',name:'Map.rdx'}]);await settle();
 assert.equal(calls,1);assert.equal(s.jobs.size,0);assert.deepEqual(s.warnings,[]);
 s.focus();s.emit({type:'rdx-open'});assert.equal(s.jobs.size,0);
 s.emit({type:'lifecycle',busy:false});assert.equal(s.jobs.size,1);await s.run();resolve([]);await settle();assert.equal(calls,2);assert.deepEqual(s.warnings,[]);
});

test('a pending inspector cannot open import UI after Quit starts; ordinary errors remain visible',async t=>{
 let inspect,inspections=0;const s=setup(t,action=>action==='list'?Promise.resolve([{id:'kept',name:'Map.rdx'}]):(inspections++,new Promise(r=>inspect=r)));
 await s.run();assert.equal(inspections,1);s.emit({type:'lifecycle',busy:true});inspect({workspace:'npcdex'});await settle();assert.deepEqual(s.warnings,[]);assert.equal(s.jobs.size,0);
});

test('normal polling failures are reported when no lifecycle operation is active',async t=>{
 const s=setup(t,()=>Promise.reject(Error('Actual connection failure')));await s.run();assert.deepEqual(s.warnings,['Actual connection failure']);
});

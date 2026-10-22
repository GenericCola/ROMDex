import test from 'node:test';
import assert from 'node:assert/strict';
import {extractConditions,validateConditionExtraction,combine,negate} from '../rom/condition-extraction.mjs';
const loc={path:'fictional/script.bin',selectors:{byteOffset:0,byteLength:2}};
const row=(offset,name,params=[],extra={})=>({offset,bytes:1,name,params,locator:{...loc,selectors:{...loc.selectors,byteOffset:offset}},messageReferences:[],...extra});
const msg=offset=>row(offset,'NPCMsg',[],{messageReferences:[{role:'dialogue',message:'fictional/'+offset,gender:'both'}]});
function fixture(instructions,extra={}){return{source:{sha256:'a'.repeat(64)},identities:{projectId:'project:fixture'},testbed:{key:'map-a'},flows:[{key:'1/1/0',entryOffset:0,instructions}],roots:[{kind:'event',headerId:1,sourceId:'npc:one',flow:'1/1/0',locator:loc}],flowReferences:[],appearances:[{sourceId:'npc:one',headerId:1,visibility:{flag:7,locator:loc}}],...extra};}
const dialogue=x=>x.effects.filter(e=>e.kind==='dialogue');
const find=(v,fn)=>fn(v)||v.op==='not'&&find(v.arg,fn)||['all','any'].includes(v.op)&&v.args.some(x=>find(x,fn));
const hasFlag=(e,id,state)=>find(e.requires,x=>x.op==='flag'&&x.flagId===id&&x.state===state);
test('flag taken and fallthrough branches retain placement presence and exact alternatives',()=>{
 const x=extractConditions(fixture([row(0,'CheckFlag',[12]),row(1,'GoToIf',[1],{target:4}),msg(2),row(3,'End'),msg(4),row(5,'End')]));
 const a=dialogue(x).find(e=>e.offset===2),b=dialogue(x).find(e=>e.offset===4);
 assert(hasFlag(a,'0x000C','unset'));assert(hasFlag(b,'0x000C','set'));assert(hasFlag(a,'0x0007','unset'));assert(hasFlag(b,'0x0007','unset'));
 assert.equal(x.coverage[0].status,'complete');assert.equal(x.conditions.length,2);
});
test('VM flag result uses 0/1 rather than treating all six branch codes as flag set',()=>{
 for(const code of [0,1,2,3,4,5]){
  const x=extractConditions(fixture([row(0,'CheckFlag',[12]),row(1,'GoToIf',[code],{target:4}),msg(2),row(3,'End'),msg(4),row(5,'End')]));
  const taken=dialogue(x).find(e=>e.offset===4);if(code===2)assert.equal(taken,undefined);else if(code===3)assert(!hasFlag(taken,'0x000C','set'));else assert(hasFlag(taken,'0x000C',[0,5].includes(code)?'unset':'set'));
 }
});
test('variable comparisons and nested negative branch guards remain compound',()=>{
 const x=extractConditions(fixture([row(0,'CompareVarToValue',[0x4040,2]),row(1,'GoToIf',[1],{target:4}),row(2,'End'),row(4,'CheckFlag',[13]),row(5,'GoToIf',[1],{target:8}),msg(6),row(7,'End'),msg(8),row(9,'End')]));
 const e=dialogue(x).find(e=>e.offset===6);assert(find(e.requires,p=>p.op==='variable'&&p.variableId==='0x4040'&&p.value===2));assert(hasFlag(e,'0x000D','unset'));
});
test('writes and unbound/shared-bank predicates do not create unrelated Timeline entries',()=>{
 const x=fixture([row(0,'SetFlag',[99]),msg(1),row(2,'End')]);x.flows.push({key:'2/2/0',entryOffset:0,instructions:[row(0,'CheckFlag',[88]),row(1,'End')]});x.roots.push({kind:'local-entry',unbound:true,headerId:1,flow:'2/2/0'});
 const result=extractConditions(x);assert.equal(result.excludedUnboundRoots,1);assert(!result.conditions.some(c=>['0x0063','0x0058'].includes(c.expression.flagId)));assert.equal(result.conditions.length,1);
});
test('local calls return before continuation; called writes update subsequent predicates',()=>{
 const x=extractConditions(fixture([row(0,'Call',[],{target:10}),row(1,'CheckFlag',[12]),row(2,'GoToIf',[1],{target:5}),msg(3),row(4,'End'),msg(5),row(6,'End'),row(10,'SetFlag',[12]),row(11,'Return')]));
 assert.deepEqual(dialogue(x).map(e=>e.offset),[5]);assert(!x.conditions.some(c=>c.expression.flagId==='0x000C'));
});
test('shared calls receive caller variables, preserve guards and resume on child End',()=>{
 const value=fixture([row(0,'SetVar',[0x8000,5]),row(1,'CallStd',[2000]),msg(2),row(3,'End')]);
 value.flows.push({key:'2/2/0',entryOffset:10,instructions:[row(10,'CompareVarToValue',[0x8000,5]),row(11,'GoToIf',[1],{target:14}),msg(12),row(13,'End'),msg(14),row(15,'End')]});value.flowReferences=[{from:'1/1/0',offset:1,flow:'2/2/0',kind:'CallStd'}];
 const x=extractConditions(value);assert.deepEqual(dialogue(x).map(e=>e.offset).sort((a,b)=>a-b),[2,14]);assert.equal(x.coverage[0].status,'complete');
});
test('conditional calls preserve the false continuation and source call context',()=>{
 const x=extractConditions(fixture([row(0,'CheckFlag',[12]),row(1,'CallIf',[1],{target:10}),msg(2),row(3,'End'),msg(10),row(11,'Return')]));
 const called=dialogue(x).find(e=>e.offset===10);assert(hasFlag(called,'0x000C','set'));assert(called.sourceRefs.some(s=>x.evidence[s].offset===1));
 const tail=dialogue(x).find(e=>e.offset===2);assert.equal(hasFlag(tail,'0x000C','set'),false);assert(hasFlag(tail,'0x0007','unset'));
});
test('dynamic flag checks and opaque native outputs remain unknown with source evidence',()=>{
 const x=extractConditions(fixture([row(0,'CheckFlagVar',[0x8000,0x8001]),row(1,'CompareVarToValue',[0x8001,1]),row(2,'GoToIf',[1],{target:5}),msg(3),row(4,'End'),msg(5),row(6,'End')]));
 assert(dialogue(x).every(e=>find(e.requires,p=>p.op==='unknown')));assert.equal(x.coverage[0].status,'partial');assert(x.conditions.some(c=>c.expression.op==='unknown'));
});
test('known variable-flag writes are not read back as initial-state prerequisites',()=>{
 const x=extractConditions(fixture([row(0,'SetVar',[0x8000,12]),row(1,'ClearFlag',[12]),row(2,'CheckFlagVar',[0x8000,0x8001]),row(3,'CompareVarToValue',[0x8001,1]),row(4,'GoToIf',[1],{target:7}),msg(5),row(6,'End'),msg(7),row(8,'End')]));assert.deepEqual(dialogue(x).map(e=>e.offset),[5]);
});
test('scene-hook root variables constrain every shared dialogue effect',()=>{
 const x=fixture([msg(0),row(1,'End')]);x.roots=[{kind:'scene-hook',headerId:1,flow:'1/1/0',predicate:{left:0x4050,right:3,operator:'equal'},locator:loc}];
 const result=extractConditions(x);assert(result.effects.some(e=>e.kind==='scene'));assert(find(dialogue(result)[0].requires,p=>p.op==='variable'&&p.variableId==='0x4050'&&p.value===3));
});
test('unconditional maps have no invented conditions',()=>{
 const value=fixture([msg(0),row(1,'End')]);value.appearances[0].visibility.flag=0;const x=extractConditions(value);assert.equal(x.conditions.length,0);assert.deepEqual(dialogue(x)[0].requires,{op:'constant',value:true});
});
test('loops, recursion and missing instruction spans terminate with incomplete coverage',()=>{
 for(const rows of [[row(0,'GoTo',[],{target:0})],[row(0,'Call',[],{target:0})],[row(0,'GoTo',[],{target:999})]]){
  const x=extractConditions(fixture(rows),{maxCallDepth:3,maxStatesPerRoot:20});assert.equal(x.coverage[0].status,'partial');assert(x.states<=20);
 }
});
test('unknown guards do not simplify to true or false through excluded-middle shortcuts',()=>{
 const x={op:'unknown',reason:'Fixture',sourceRefs:[{flow:'a',offset:1,locator:loc}]};assert.equal(combine('any',[x,negate(x)]).op,'any');assert.equal(combine('all',[x,negate(x)]).op,'all');assert.deepEqual(combine('all',[{op:'constant',value:false},x]),{op:'constant',value:false});
});
test('global work cancellation remains active',()=>{
 const rows=Array.from({length:150},(_,i)=>row(i,'Noop'));rows.push(row(150,'End'));assert.throws(()=>extractConditions(fixture(rows),{check(){throw Error('Cancelled');}}),/Cancelled/);
});
test('gender and weekday results retain typed runtime access checks',()=>{
 for(const [name,check]of [['GetPlayerGender','gender'],['GetWeekday','time']]){
  const x=extractConditions(fixture([row(0,name,[0x8000]),row(1,'CompareVarToValue',[0x8000,1]),row(2,'GoToIf',[1],{target:5}),msg(3),row(4,'End'),msg(5),row(6,'End')]));
  assert(find(dialogue(x).find(e=>e.offset===5).requires,v=>v.op==='runtime'&&v.check===check&&v.value===1));assert.equal(x.coverage[0].status,'complete');
 }
});
test('a shared child has its own comparison state and End unwinds its local calls',()=>{
 const value=fixture([row(0,'CheckFlag',[12]),row(1,'CallStd',[2000]),msg(2),row(3,'End')]);
 value.flows.push({key:'2/2/0',entryOffset:10,instructions:[row(10,'Call',[],{target:20}),msg(11),row(12,'End'),row(20,'End')]});value.flowReferences=[{from:'1/1/0',offset:1,flow:'2/2/0',kind:'CallStd'}];
 const x=extractConditions(value);assert.deepEqual(dialogue(x).map(e=>e.offset),[2]);
 value.flows[1].instructions=[row(10,'GoToIf',[1],{target:14}),msg(11),row(12,'End'),msg(14),row(15,'End')];
 const y=extractConditions(value);assert(dialogue(y).filter(e=>e.flow==='2/2/0').every(e=>find(e.requires,v=>v.op==='unknown')));
});
test('condition evidence is interned, integrity pinned and checked against actual sites',()=>{
 const fixtureValue=fixture([msg(0),row(1,'End')]),x=extractConditions(fixtureValue);validateConditionExtraction(x,fixtureValue);assert(Object.keys(x.evidence).length);assert.throws(()=>validateConditionExtraction({...x,digest:'0'.repeat(64)},fixtureValue),{code:'INTEGRITY'});
});
test('script show/hide effects target the referenced placement, retaining caller prerequisites',()=>{
 const x=fixture([row(0,'SetVar',[0x8000,2]),row(1,'ShowPerson',[0x8000]),row(2,'End')]);x.appearances.push({sourceId:'npc:two',headerId:1,localId:2,visibility:{flag:9,locator:loc}});
 const e=extractConditions(x).effects.find(e=>e.action==='ShowPerson');assert.equal(e.kind,'presence');assert.equal(e.sourceId,'npc:two');assert(hasFlag(e,'0x0007','unset'));assert(!hasFlag(e,'0x0009','unset'));
});
test('dynamic text is unresolved and opaque native evidence retains its producer',()=>{
 const x=fixture([row(0,'ScrCmd_999',[0x8000]),row(1,'CheckFlag',[12]),row(2,'GoToIf',[1],{target:5}),msg(3),row(4,'End'),msg(5),row(6,'End')]),result=extractConditions(x);
 const unknown=result.conditions.find(c=>c.expression.op==='unknown');assert(unknown.expression.sourceRefs.some(id=>result.evidence[id].offset===0));
 const dynamic=fixture([row(0,'NPCMsgVar',[0x8000],{messageReferences:[{dynamic:true,kind:'NPCMsgVar'}]}),row(1,'End')]);const y=extractConditions(dynamic);assert.equal(y.coverage[0].status,'partial');assert(find(dialogue(y)[0].requires,v=>v.op==='unknown'));
});
test('uninitialized scratch variables are not advertised as persistent map requirements',()=>{
 const x=extractConditions(fixture([row(0,'CompareVarToValue',[0x8000,1]),row(1,'GoToIf',[1],{target:4}),msg(2),row(3,'End'),msg(4),row(5,'End')]));assert(!x.conditions.some(c=>c.expression.op==='variable'&&c.expression.variableId==='0x8000'));assert.equal(x.coverage[0].status,'partial');
});

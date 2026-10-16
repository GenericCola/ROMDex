import test from 'node:test';
import assert from 'node:assert/strict';
import {PRIORITIES,COMPLEXITIES,fieldPresentation} from '../public/field-tags.mjs';
import {YouTrack} from '../youtrack.mjs';
import {reconcile,materialize,applySyncResult} from '../public/core.mjs';
const schema=[{id:'pc',field:{id:'cf',name:'Complexity',fieldType:{id:'enum[1]'}},$type:'EnumProjectCustomField',canBeEmpty:true,bundle:{id:'b',values:COMPLEXITIES.map(x=>({name:x.value}))}}];
test('all priority tags use the approved labels, colors and native mappings',()=>{
 assert.deepEqual(PRIORITIES.map(x=>[x.label,x.value,x.color]),[['LOW','Minor','green'],['NORMAL','Normal','blue'],['HIGH','Major','yellow'],['URGENT','Critical','red']]);
 for(const x of PRIORITIES)assert.equal(fieldPresentation('priority',x.value).label,x.label);
 assert.deepEqual(fieldPresentation('priority','Show-stopper'),{label:'URGENT',value:'Show-stopper',color:'red',nativeOnly:true});
});
test('Complexity maps each value without treating an unset value as LOW',()=>{
 for(const x of COMPLEXITIES)assert.equal(fieldPresentation('complexity',x.value).color,x.color);
 assert.equal(fieldPresentation('complexity',null).label,'—');assert.equal(fieldPresentation('complexity','Other').unsupported,true);
});
test('custom payload round-trips each Complexity value and clears it with null',()=>{
 const yt=new YouTrack('fixture');yt.schema=schema;
 for(const value of [...COMPLEXITIES.map(x=>x.value),null]){
  const [f]=yt.customPayload({complexity:value});assert.equal(f.name,'Complexity');assert.equal(f.$type,'SingleEnumIssueCustomField');assert.deepEqual(f.value,value===null?null:{name:value});
  const normalized=yt.normalize({idReadable:'PMON-1',project:{shortName:'PMON'},customFields:[f]});assert.equal(normalized.complexity,value);
 }
 assert.throws(()=>yt.customPayload({complexity:'medium'}),/Choose LOW/);
});
test('unrelated edits preserve native Show-stopper and unknown native Complexity',()=>{
 const yt=new YouTrack('fixture');yt.schema=schema;
 const row=yt.normalize({idReadable:'PMON-1',project:{shortName:'PMON'},customFields:[{name:'Priority',value:{name:'Show-stopper'}},{name:'Complexity',value:{name:'Other'}}]});
 assert.equal(row.priority,'Show-stopper');assert.equal(row.complexity,'Other');assert.deepEqual(yt.customPayload({summary:'Unrelated'},row),[]);
 assert.deepEqual(yt.customPayload({priority:'Critical'},row)[0].value,{name:'Critical'});
});
test('Complexity uses three-way conflicts while unrelated native edits remain visible',()=>{
 assert.equal(reconcile({complexity:null},{complexity:'HIGH'},{complexity:'MID'}).conflicts[0].field,'complexity');
 const remote=[{id:'PMON-1',parentId:null,summary:'Native',complexity:'MID'}],op={opId:'a',type:'edit',issueId:'PMON-1',base:{complexity:null},patch:{complexity:'HIGH'}};
 const row=materialize(remote,[op])[0];assert.equal(row.summary,'Native');assert.equal(row.complexity,'HIGH');
});
test('Complexity on a newly created item survives remapping and subsequent edits',()=>{
 const state={remote:[],operations:[{opId:'c',type:'create',issueId:'local-a',item:{id:'local-a',parentId:null,complexity:'LOW'}},{opId:'e',type:'edit',issueId:'local-a',base:{complexity:'LOW'},patch:{complexity:'INSANE'}}],order:{},images:{},expanded:[],selectorExpanded:[],selected:null};
 applySyncResult(state,{completed:['c'],mapping:{'local-a':'PMON-1'},items:[{id:'PMON-1',parentId:null,complexity:'LOW'}],at:1});assert.equal(materialize(state.remote,state.operations)[0].complexity,'INSANE');assert.equal(state.operations[0].issueId,'PMON-1');
});

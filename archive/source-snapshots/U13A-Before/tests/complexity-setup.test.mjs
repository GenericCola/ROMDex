import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureComplexity,COMPLEXITY_VALUES} from '../complexity-field.mjs';
function fixture({project=[],global=[],bundles=[]}={}){
 const changes=[];const yt={projectId:'p',schema:project,list:async route=>structuredClone(route.includes('projects/')?project:route.endsWith('/enum')?bundles:global),request:async(route,{body})=>{
  changes.push({route,body});if(route.includes('bundles/enum')){const x={...body,id:'b'};bundles.push(x);return x;}
  if(route.includes('customFieldSettings/customFields')){const x={...body,id:'cf'};global.push(x);return x;}
  if(route.includes('projects/p/customFields/')){project[0].canBeEmpty=body.canBeEmpty;return project[0];}
  const spec={...body,id:'pc',field:global.find(x=>x.id===body.field.id),bundle:bundles.find(x=>x.id===body.bundle.id)};project.push(spec);return spec;
 }};return {yt,changes,project,global,bundles};
}
const spec=(names=COMPLEXITY_VALUES)=>({id:'pc',field:{id:'cf',name:'Complexity',fieldType:{id:'enum[1]'}},$type:'EnumProjectCustomField',canBeEmpty:true,bundle:{id:'shared',values:names.map(name=>({name}))}});
test('creates a dedicated optional PMON field and is idempotent after setup',async()=>{
 const {yt,changes,project}=fixture();assert.equal((await ensureComplexity(yt)).ready,true);assert.equal(changes.length,3);assert.equal(project[0].canBeEmpty,true);assert.equal(changes[1].body.isAutoAttached,false);await ensureComplexity(yt);assert.equal(changes.length,3);
});
test('reuses a suitable global field without editing its defaults or attaching it elsewhere',async()=>{
 const field={id:'existing',name:'Complexity',fieldType:{id:'enum[1]'},fieldDefaults:{bundle:{id:'other'}}};const {yt,changes}=fixture({global:[field]});await ensureComplexity(yt);assert.equal(changes.length,2);assert.equal(changes[1].body.field.id,'existing');assert.equal(field.fieldDefaults.bundle.id,'other');
});
test('an interrupted attachment retry reuses the prepared field and bundle',async()=>{
 const {yt,changes}=fixture({global:[{id:'cf',name:'Complexity',fieldType:{id:'enum[1]'}}],bundles:[{id:'b',name:'ROMDex PMON Complexity',values:COMPLEXITY_VALUES.map(name=>({name}))}]});await ensureComplexity(yt);assert.equal(changes.length,1);assert.ok(changes[0].route.includes('projects/p/customFields'));
});
test('existing suitable project field is reused without mutation',async()=>{
 const {yt,changes}=fixture({project:[spec()]});assert.equal((await ensureComplexity(yt)).ready,true);assert.equal(changes.length,0);
});
test('required Complexity can become optional without changing its existing shared bundle',async()=>{
 const s={...spec(),canBeEmpty:false};const {yt,changes}=fixture({project:[s]});await ensureComplexity(yt);assert.equal(changes.length,1);assert.equal(changes[0].body.bundle,undefined);assert.equal(s.bundle.id,'shared');
});
test('different shared values and incompatible field types are refused without mutation',async()=>{
 for(const project of [[spec(['Other'])],[{...spec(),field:{name:'Complexity',fieldType:{id:'integer'}}}]]){const {yt,changes}=fixture({project});await assert.rejects(ensureComplexity(yt));assert.equal(changes.length,0);}
 const {yt,changes}=fixture({global:[{name:'Complexity',fieldType:{id:'integer'}}]});await assert.rejects(ensureComplexity(yt));assert.equal(changes.length,0);
});

import fs from 'node:fs';const p='outputs/ROMDex/tests/integration.test.mjs';let s=fs.readFileSync(p,'utf8');
s=s.replace("import {COMPLEXITY_VALUES} from '../complexity-field.mjs';", "import {COMPLEXITY_VALUES} from '../complexity-field.mjs';\nimport {stageBulk} from '../public/bulk-hierarchy.mjs';");
s=s.replace('providerDown=false;', 'providerDown=false,failLinkOn=null;');
s=s.replace("if(tail.startsWith('links/')){const link=issue.links[0];", "if(tail.startsWith('links/')){if(method==='POST'&&failLinkOn===id){failLinkOn=null;throw Error('Fixture interrupted parent attachment');}const link=issue.links[0];");
const marker="  await t.test('journaled comments are not duplicated by retry'";
if(!s.includes(marker))throw Error('Missing test insertion');
s=s.replace(marker,`  await t.test('bulk moves retain selected parent subtrees and recover after a detached link interruption',async()=>{
   const ids=['PMON-700','PMON-701','PMON-702','PMON-703','PMON-704'];
   issues.set(ids[0],raw(ids[0],'Source'));issues.set(ids[1],raw(ids[1],'Selected Parent',ids[0]));issues.set(ids[2],raw(ids[2],'Child Stays Attached',ids[1],'Done'));issues.set(ids[3],raw(ids[3],'Selected Sibling',ids[0]));issues.set(ids[4],raw(ids[4],'Destination'));
   try{const state={remote:(await api('snapshot')).items,operations:[],order:{},expanded:[]};let n=0;const group=stageBulk(state,[ids[1],ids[3]],{parentId:ids[4],groupId:'service-bulk-move',makeOpId:()=> 'bulk-link-'+(++n)});
    failLinkOn=ids[3];let result=await api('sync',{operations:state.operations});assert.deepEqual(result.completed,[group.opIds[0]]);assert.match(result.blocked.error,/interrupted/);assert.equal(result.items.find(x=>x.id===ids[1]).parentId,ids[4]);assert.equal(result.items.find(x=>x.id===ids[2]).parentId,ids[1]);assert.equal(result.items.find(x=>x.id===ids[2]).assignedState,'Done');
    result=await api('sync',{operations:state.operations});assert.deepEqual(result.completed,group.opIds);assert.equal(result.blocked,null);assert.equal(result.items.find(x=>x.id===ids[3]).parentId,ids[4]);assert.equal(result.items.find(x=>x.id===ids[2]).parentId,ids[1]);
   }finally{failLinkOn=null;for(const id of ids)issues.delete(id);}
  });
  await t.test('native parent drift rejects the whole grouping before parent creation',async()=>{
   const ids=['PMON-710','PMON-711','PMON-712','PMON-713'];issues.set(ids[0],raw(ids[0],'Source'));issues.set(ids[1],raw(ids[1],'A',ids[0]));issues.set(ids[2],raw(ids[2],'B',ids[0]));issues.set(ids[3],raw(ids[3],'Other'));
   try{const state={remote:(await api('snapshot')).items,operations:[],order:{},expanded:[]};let n=0;stageBulk(state,[ids[1],ids[2]],{title:'Should Not Be Created',newId:'local-native-drift',groupId:'service-native-drift',makeOpId:()=> 'drift-'+(++n)});issues.set(ids[2],raw(ids[2],'B',ids[3]));const before=issues.size,result=await api('sync',{operations:state.operations});assert.equal(result.completed.length,0);assert.equal(result.blocked.conflicts[0].field,'__group__');assert.equal(issues.size,before);assert.equal(result.items.find(x=>x.id===ids[1]).parentId,ids[0]);
   }finally{for(const id of ids)issues.delete(id);}
  });
  await t.test('ambiguous group parent creation is reconciled once before linking every selected child',async()=>{
   const ids=['PMON-720','PMON-721','PMON-722','PMON-723'];issues.set(ids[0],raw(ids[0],'Source'));issues.set(ids[1],raw(ids[1],'Parent A',ids[0]));issues.set(ids[2],raw(ids[2],'Nested Child',ids[1],'Standby'));issues.set(ids[3],raw(ids[3],'Sibling B',ids[0]));let createdId;
   try{const state={remote:(await api('snapshot')).items,operations:[],order:{},expanded:[]};let n=0;const group=stageBulk(state,[ids[1],ids[3]],{title:'Recoverable Group Parent',newId:'local-bulk-parent',groupId:'service-group-create',makeOpId:()=> 'group-create-'+(++n)});loseCreation=true;let result=await api('sync',{operations:state.operations});assert.ok(result.blocked.error);result=await api('sync',{operations:state.operations});assert.equal(result.blocked.uncertain,true);const matches=[...issues.values()].filter(x=>x.summary==='Recoverable Group Parent');assert.equal(matches.length,1);createdId=matches[0].idReadable;await api('acknowledge',{opId:group.opIds[0],action:'created',issueId:createdId});result=await api('sync',{operations:state.operations});assert.deepEqual(result.completed,group.opIds);assert.equal(result.mapping['local-bulk-parent'],createdId);assert.equal(result.items.find(x=>x.id===ids[1]).parentId,createdId);assert.equal(result.items.find(x=>x.id===ids[3]).parentId,createdId);assert.equal(result.items.find(x=>x.id===ids[2]).parentId,ids[1]);assert.equal(result.items.find(x=>x.id===createdId).parentId,ids[0]);
   }finally{loseCreation=false;if(createdId)issues.delete(createdId);for(const id of ids)issues.delete(id);}
  });
`+marker);
fs.writeFileSync(p,s);

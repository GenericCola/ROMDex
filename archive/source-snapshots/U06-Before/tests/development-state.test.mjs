import test from 'node:test';
import assert from 'node:assert/strict';
import {YouTrack} from '../youtrack.mjs';
import {STATES,statusOf,indexTree} from '../public/core.mjs';
import {observeAssignedStatus} from '../assigned-statuses.mjs';

test('project setup adds In Development once as an unresolved State, preserving existing values',async()=>{
 const yt=new YouTrack('fixture-token-not-used'),values=Object.values(STATES).filter(name=>name!=='In Development').map(name=>({name})),writes=[];
 yt.stateBundle='existing-bundle';yt.stateValues=structuredClone(values);
 yt.request=async(route,options)=>{writes.push({route,...options});values.push({name:options.body.name,isResolved:options.body.isResolved});};
 yt.list=async()=>structuredClone(values);
 await yt.ensureStates();await yt.ensureStates();
 assert.equal(writes.length,1);assert.match(writes[0].route,/bundles\/state\/existing-bundle\/values/);
 assert.deepEqual(writes[0].body,{name:'In Development',isResolved:false});assert.equal(values.length,6);
 assert.deepEqual(yt.customPayload({state:'In Development'},{_custom:[{name:'State',$type:'StateIssueCustomField'}]}),[{name:'State',$type:'StateIssueCustomField',value:{name:'In Development'}}]);
});
test('native development assignment maps to purple without changing saved parent intent on inherited reads',()=>{
 const parent={id:'PMON-1',parentId:null,state:'In Development',updated:2};
 const record={assignedState:'To do',lastState:'To do',lastUpdated:1,hasChildren:true,pendingState:'In Development'};
 const inherited=observeAssignedStatus(parent,record,true);assert.equal(inherited.assignedState,'To do');
 const native=observeAssignedStatus(parent,{...record,pendingState:null},true);assert.equal(native.assignedState,'In Development');assert.equal(statusOf(native.assignedState),'purple');
 assert.equal(indexTree([{...parent,assignedState:'To do'},{id:'PMON-2',parentId:'PMON-1',state:'In Development'}]).colors.get(parent.id),'purple');
});

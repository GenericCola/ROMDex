import {materialize,indexTree,statusOf} from '../public/core.mjs';

export async function queueReadiness(engine,entry,intent){
 if(engine.state.resultReadiness?.[intent.receipt.digest])return;
 const marker='[ROMDex Ready for Testing '+intent.receipt.digest+']',commentId='rdx-ready-'+intent.receipt.digest;
 await engine.transaction(state=>{
  state.resultReadiness??={};if(state.resultReadiness[intent.receipt.digest])return;
  const item=materialize(state.remote,state.operations).find(i=>i.id===entry.issueId);if(!item)throw Error('The Accepted Result Task Is Missing. Readiness Notice Is Preserved for Retry.');
  const tree=indexTree(materialize(state.remote,state.operations)),color=tree.colors.get(item.id);
  if(!['red','purple'].includes(color)&&!['red','purple'].includes(statusOf(item.assignedState??item.state))&&item.assignedState!=='Needs Testing'&&item.state!=='Needs Testing')state.operations.push({opId:'rdx-testing-'+intent.receipt.digest,type:'edit',issueId:item.id,base:structuredClone(item),patch:{assignedState:'Needs Testing'}});
  const source=JSON.parse(intent.receipt.resultJSON).source;
  state.operations.push({opId:commentId,type:'comment',issueId:item.id,text:marker+'\nReady for Human Review and Testing.\nMap: '+entry.mapName+'\nPackage: '+entry.packageId+' v'+entry.version+'\nGroup: '+intent.groupId+'\nReturned file SHA-256: '+intent.sourceHash+'\nSource before: '+source.beforeRevision+'\nSource after: '+source.afterRevision+'\nAccepted NPCDex/RDX data is published. The task remains open. Human testing of the affected current content and build is required; agent claims and State edits do not verify it.'});
  state.resultReadiness[intent.receipt.digest]={taskId:item.id,commentId,queuedAt:Date.now()};
 });engine.schedule();
}

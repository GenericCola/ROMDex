import {clone,indexTree,same} from './public/core.mjs';

// An ordinary native State edit assigns a new own status. Our journaled rollup writes do not.
export function observeAssignedStatus(item,previous,hasChildren=previous?.hasChildren??false) {
  const lastUpdated=Number.isFinite(item.updated)?item.updated:previous?.lastUpdated;
  if(!previous)return {assignedState:item.assignedState??item.state,lastState:item.state,lastUpdated,hasChildren,pendingState:null};
  if(Number.isFinite(item.updated)&&Number.isFinite(previous.lastUpdated)&&item.updated<previous.lastUpdated)return {...previous};
  const ours=previous.pendingState!==null&&previous.pendingState!==undefined&&item.state===previous.pendingState;
  const changed=!same(item.state,previous.lastState);
  return {...previous,assignedState:changed&&!ours?item.state:previous.assignedState,lastState:item.state,lastUpdated,hasChildren,
    pendingState:ours||changed?null:previous.pendingState??null};
}

export class AssignedStatuses {
  constructor(records={},persist=async()=>{}) {this.records=clone(records);this.persist=persist;}
  annotate(item){return {...item,assignedState:this.records[item.id]?.assignedState??item.state};}
  async commit(next){await this.persist(clone(next));this.records=next;}
  async observe(item,hasChildren){
    const next=observeAssignedStatus(item,this.records[item.id],hasChildren);
    if(!same(next,this.records[item.id]))await this.commit({...this.records,[item.id]:next});
    return this.annotate(item);
  }
  async observeAll(items){
    const tree=indexTree(items),next={...this.records};
    for(const item of items)next[item.id]=observeAssignedStatus(item,this.records[item.id],(tree.children.get(item.id)||[]).length>0);
    if(!same(next,this.records))await this.commit(next);
    return items.map(item=>this.annotate(item));
  }
  async assign(id,value){const previous=this.records[id];if(!previous)throw new Error('Read the item before assigning its status.');await this.commit({...this.records,[id]:{...previous,assignedState:value,pendingState:null}});}
  async prepareWrite(id,state){await this.commit({...this.records,[id]:{...this.records[id],pendingState:state}});}
  async confirmWrite(id,state){await this.commit({...this.records,[id]:{...this.records[id],lastState:state,pendingState:null}});}
}

export class AssignedStatusConflict extends Error {
  constructor(base,local,remote){super('The assigned status changed. Review both values before saving.');this.remote=remote;this.conflicts=[{field:'assignedState',base,local,remote:remote.assignedState}];}
}

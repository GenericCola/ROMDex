import {captureMetadata,projectOrder,EMPTY,encode} from './metadata-core.mjs';
export class MetadataProjection{
 constructor({storage,records=()=>({}),applyAssigned=async()=>({})}){Object.assign(this,{storage,records,applyAssigned});this.projecting=false;this.recovering=false;}
 attach(engine,manager){this.engine=engine;this.manager=manager;this.recovering=!!manager?.state.sourcePending;}
 load(){return this.storage.load();}
 known(){return this.manager?JSON.parse(this.manager.journal.document('capture')):EMPTY;}
 capture(state){return captureMetadata(state,this.records(),this.known());}
 async save(state){
  // A native response may have been annotated before a later cloud-owned assignment committed.
  if(this.manager){const records=this.records();state.remote=state.remote.map(item=>records[item.id]?.cloudManaged?{...item,assignedState:records[item.id].assignedState}:item);}
  let captured;if(this.manager&&!this.projecting&&!this.recovering){captured=this.capture(state);await this.manager.capture(captured,{sourcePending:true});}await this.storage.save(state);if(captured)await this.manager.acknowledgeSource(captured);
 }
 async project(manager){if(!this.engine?.state)return;if(this.held)throw Object.assign(Error('Incoming Metadata Waits for the Open ROMDex Editor.'),{deferred:true});let projection;try{
  await this.engine.transaction(async next=>{
   if(this.held)throw Object.assign(Error('Incoming Metadata Waits for the Open ROMDex Editor.'),{deferred:true});
   this.projecting=true;
   if(!this.recovering){const capture=this.capture(next),known=this.known(),records=this.records(),doc=manager.document();
    // A newly discovered saved parent status must not silently replace a different native leaf status.
    for(const [id,value]of Object.entries(doc.assigned)){const record=records[id];if(record&&!record.hasChildren&&!record.explicitAssigned&&!record.cloudManaged&&!Object.hasOwn(known.assigned,id)&&record.assignedState!==value){const pending=[...next.operations].reverse().find(op=>op.type==='edit'&&op.issueId===id&&Object.hasOwn(op.patch,'assignedState'));capture.assigned[id]=pending?.patch.assignedState??record.assignedState;}}
    await manager.capture(capture,{sourcePending:true});
   }
   await manager.exclusive(async()=>{
    const doc=manager.document(),head=manager.state.tip,previous=this.known(),expected=this.records(),state=manager.state;
    if(!state.review){const shared=new Set([...Object.keys(previous.assigned),...Object.keys(doc.assigned)]),superseded=next.operations.filter(op=>op.type==='edit'&&shared.has(op.issueId)&&Object.hasOwn(op.patch,'assignedState')&&op.patch.assignedState!==(doc.assigned[op.issueId]??expected[op.issueId]?.lastState));
     if(superseded.some(op=>this.engine.inflight.has(op.opId)))throw Object.assign(Error('Incoming Metadata Waits for the Current Native Status Save.'),{deferred:true});
     const supersededIds=new Set(superseded.map(op=>op.opId));next.operations=next.operations.flatMap(op=>{if(!supersededIds.has(op.opId))return [op];const {assignedState,...patch}=op.patch;return Object.keys(patch).length?[{...op,patch}]:[];});
     if(supersededIds.has(next.blocked?.opId)){if(!next.operations.some(op=>op.opId===next.blocked.opId))next.blocked=null;else if(next.blocked.conflicts){next.blocked.conflicts=next.blocked.conflicts.filter(c=>c.field!=='assignedState');if(!next.blocked.conflicts.length&&!next.blocked.uncertain)next.blocked=null;}}
    }
    state.sourcePending=true;manager.journal.transaction(()=>manager.journal.setState(state));
    const removed=Object.keys(previous.assigned).filter(id=>!Object.hasOwn(doc.assigned,id)),records=await this.applyAssigned(doc.assigned,expected,removed);
    next.remote=next.remote.map(item=>({...item,assignedState:doc.assigned[item.id]??records[item.id]?.assignedState??item.assignedState}));
    if(doc.version===2)next.packageAuthorizations=structuredClone(doc.authorizations);
    else if(Object.hasOwn(next,'packageAuthorizations'))next.packageAuthorizations={};
    const localImages=Object.fromEntries(Object.entries(next.images||{}).filter(([id])=>id.startsWith('local-')));next.images={...doc.images,...localImages};
    const hierarchyPending=next.operations.some(op=>['create','delete'].includes(op.type)||op.patch&&'parentId'in op.patch);
    if(!hierarchyPending)next.order=projectOrder(doc,next.remote,next.order,previous);
    projection={head,captured:captureMetadata(next,records,doc)};
   });
  });
  await manager.exclusive(async()=>{const state=manager.state;state.captureTip=projection.head;state.projectedTip=projection.head;state.sourcePending=false;manager.journal.transaction(()=>{manager.journal.setDocument('capture',encode(projection.captured));manager.journal.setState(state);});});this.recovering=false;return projection.head;
 }finally{this.projecting=false;}}
}

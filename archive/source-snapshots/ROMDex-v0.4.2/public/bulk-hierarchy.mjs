import {clone,indexTree,materialize,validateMove} from './core.mjs';

export function siblingSelection(items,order,ids){
 const tree=indexTree(items,order),unique=[...new Set(ids)];
 if(unique.length<2)throw Error('Select at Least Two Items.');
 if(unique.length>1000)throw Error('Select No More Than 1,000 Items at a Time.');
 const selected=unique.map(id=>tree.byId.get(id));if(selected.some(x=>!x))throw Error('A Selected Item No Longer Exists.');
 const parentId=selected[0].parentId??null;
 if(selected.some(x=>(x.parentId??null)!==parentId))throw Error('Select Items with the Same Parent to Group or Move Them Together.');
 if(parentId&&!tree.byId.has(parentId))throw Error('The Current Parent No Longer Exists.');
 const keys=new Set(unique),members=(tree.children.get(parentId)||[]).filter(x=>keys.has(x.id));
 return {tree,parentId,members};
}

export function bulkMovePlan(items,order,ids,parentId,beforeId=null){
 const selection=siblingSelection(items,order,ids),keys=new Set(ids);
 for(const item of selection.members)validateMove(items,item.id,parentId);
 const siblings=selection.tree.children.get(parentId)||[];
 if(beforeId&&!siblings.some(x=>x.id===beforeId))throw Error('The Insertion Target No Longer Exists.');
 const boundary=beforeId?siblings.findIndex(x=>x.id===beforeId):siblings.length;
 const next=siblings.slice(boundary).find(x=>!keys.has(x.id))?.id??null;
 const remaining=siblings.filter(x=>!keys.has(x.id)),at=next?remaining.findIndex(x=>x.id===next):remaining.length;
 remaining.splice(at,0,...selection.members);
 return {...selection,destinationParentId:parentId,beforeId:next,destination:remaining};
}

// One local transaction publishes the entire group or none of it.
export function stageBulk(state,ids,{parentId,beforeId=null,title=null,type='Task',groupId,newId,makeOpId}){
 const items=materialize(state.remote,state.operations),selection=siblingSelection(items,state.order,ids),grouping=title!==null;
 if(grouping&&!title.trim())throw Error('Enter a Parent Title.');
 const group={id:groupId,kind:grouping?'group':'move',members:selection.members.map(x=>x.id),originParentId:selection.parentId,destinationParentId:grouping?newId:parentId,createdParentId:grouping?newId:null,opIds:[],entries:[],completed:[],status:'pending'};
 const add=op=>{op.group={id:group.id,kind:group.kind,members:group.members,originParentId:group.originParentId,destinationParentId:group.destinationParentId};state.operations.push(op);group.opIds.push(op.opId);group.entries.push({opId:op.opId,issueId:op.issueId,label:op.item?.summary||selection.tree.byId.get(op.issueId)?.summary||op.issueId});};
 let destination;
 if(grouping){
  const item={id:newId,summary:title.trim(),description:'',parentId:selection.parentId,state:'To do',priority:'Normal',type,updated:null,comments:[],commentCount:0,dependencies:0,fields:{}};
  const siblings=selection.tree.children.get(selection.parentId)||[],keys=new Set(group.members);destination=[];let inserted=false;
  for(const sibling of siblings){if(keys.has(sibling.id)){if(!inserted){destination.push(item);inserted=true;}}else destination.push(sibling);}
  add({opId:makeOpId(),type:'create',issueId:newId,item});
  state.expanded=[...new Set([...(state.expanded||[]),newId])];
  selection.members.forEach((item,i)=>{state.order[item.id]=i;});
 }else destination=bulkMovePlan(items,state.order,ids,parentId,beforeId).destination;
 for(const item of selection.members)if(item.parentId!==group.destinationParentId)add({opId:makeOpId(),type:'edit',issueId:item.id,base:clone(item),patch:{parentId:group.destinationParentId}});
 destination.forEach((item,i)=>{state.order[item.id]=i;});
 // Revalidate the complete projected tree before making the transaction durable.
 indexTree(materialize(state.remote,state.operations),state.order);
 state.bulkGroups??={};if(group.opIds.length)state.bulkGroups[group.id]=group;
 return group;
}

export function remapGroup(group,mapping){
 const id=value=>mapping[value]||value;
 return {...group,members:group.members.map(id),originParentId:id(group.originParentId),destinationParentId:id(group.destinationParentId),createdParentId:id(group.createdParentId),entries:group.entries.map(x=>({...x,issueId:id(x.issueId)}))};
}

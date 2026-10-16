import {validateMove} from './core.mjs';

// The committed destination and its insertion guide share this result.
export function rowDropTarget({items,tree,dragId,targetId,delta,after,selected=null,visibleIds=[]}){
 const target=tree.byId.get(targetId);
 if(!target||targetId===dragId)return null;
 let anchor=target,parentId=target.parentId,beforeId=null;
 if(delta>0){parentId=target.id;after=true;}
 else{
  for(let step=0;step<-delta&&anchor.parentId;step++)anchor=tree.byId.get(anchor.parentId);
  parentId=anchor.parentId;
  const siblings=tree.children.get(parentId)||[],at=siblings.findIndex(item=>item.id===anchor.id);
  beforeId=siblings[at+(after?1:0)]?.id||null;
 }
 validateMove(items,dragId,parentId);
 const depth=parentId?tree.depths.get(parentId)+1:0;
 const displayDepth=Math.max(0,depth-(selected?tree.depths.get(selected)+1:0));
 let anchorId=anchor.id;
 if(after){
  const start=visibleIds.indexOf(anchorId),anchorDepth=tree.depths.get(anchorId);
  if(start>=0)for(let i=start+1;i<visibleIds.length&&tree.depths.get(visibleIds[i])>anchorDepth;i++)anchorId=visibleIds[i];
 }
 // The selected category itself is outside the table. Its visible descendants
 // still provide a boundary when a drop promotes an item beyond that scope.
 if(!visibleIds.includes(anchorId)){
  const branch=visibleIds.filter(id=>{let item=tree.byId.get(id);while(item){if(item.id===anchor.id)return true;item=tree.byId.get(item.parentId);}return false;});
  if(branch.length)anchorId=after?branch.at(-1):branch[0];
 }
 return {parentId,beforeId,depth,displayDepth,anchorId,after};
}

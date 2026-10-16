export const SELECTOR_TIERS=['Epic','Saga','Story','Verse'];
export const SELECTOR_MAX_DEPTH=SELECTOR_TIERS.length-1;
function expandable(tree,id){return tree.byId.has(id)&&tree.depths.get(id)<SELECTOR_MAX_DEPTH&&(tree.children.get(id)||[]).length>0;}

// The last selector tier is a selectable leaf, never a disclosure parent.
export function selectorPath(tree,id,includeSelf=true){
 const path=[];let item=tree.byId.get(id);
 if(!includeSelf)item=tree.byId.get(item?.parentId);
 while(item){if(expandable(tree,item.id))path.unshift(item.id);item=tree.byId.get(item.parentId);}
 return new Set(path);
}

export function normalizeSelectorExpansion(tree,ids,preferredId=null){
 const candidates=[...new Set([...ids].filter(id=>expandable(tree,id)).flatMap(id=>[...selectorPath(tree,id)]))];
 const preferred=[...selectorPath(tree,preferredId)];
 const result=[];let parentId=null;
 for(let depth=0;depth<SELECTOR_MAX_DEPTH;depth++){
  const childIds=new Set((tree.children.get(parentId)||[]).map(item=>item.id));
  const level=candidates.filter(id=>tree.depths.get(id)===depth&&childIds.has(id));
  const chosen=level.includes(preferred[depth])?preferred[depth]:level.at(-1);
  if(!chosen)break;result.push(chosen);parentId=chosen;
 }
 return new Set(result);
}

export function toggleSelectorExpansion(tree,ids,id){
 const current=normalizeSelectorExpansion(tree,ids,id);
 if(!expandable(tree,id))return current;
 // Collapsing a parent also discards disclosure state below it.
 return current.has(id)?selectorPath(tree,id,false):selectorPath(tree,id);
}

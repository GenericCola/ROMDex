// Filter the existing full tree; visibility never changes inherited status or ordering.
export function workRows({tree,selected=null,search='',expanded=new Set(),hideCompleted=false,keepIds=[]}) {
 const query=search.toLowerCase().trim(),matching=new Set(),protectedIds=new Set();
 function addTrail(id,set){let item=tree.byId.get(id);while(item){set.add(item.id);item=tree.byId.get(item.parentId);}}
 for(const id of keepIds)if(id)addTrail(id,protectedIds);
 if(query)for(const item of tree.byId.values()){
  if(hideCompleted&&tree.colors.get(item.id)==='green')continue;
  if(`${item.summary} ${item.id} ${item.description}`.toLowerCase().includes(query))addTrail(item.id,matching);
 }
 const rows=[];
 function walk(parent){for(const item of tree.children.get(parent)||[]){
  const keep=protectedIds.has(item.id);
  if(!keep&&(hideCompleted&&tree.colors.get(item.id)==='green'||query&&!matching.has(item.id)))continue;
  rows.push(item);
  if(query||expanded.has(item.id)||keep)walk(item.id);
 }}
 walk(selected);return rows;
}

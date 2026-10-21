// Group the actual ROM catalog, without selecting a test map for the user.
function baseGroups(source){
 const groups=new Map();
 for(const m of source?.maps||[]){const id='section:'+m.section;if(!groups.has(id))groups.set(id,{id,name:m.label?.trim()||'Zone '+m.section+' · '+m.name,headers:[]});groups.get(id).headers.push(m.headerId);}
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})||a.id.localeCompare(b.id));
}
export function catalogNodes(source){
 const bases=baseGroups(source),byId=new Map(bases.map(g=>[g.id,{...g,ownHeaders:g.headers.slice(),parentId:source?.groupParents?.[g.id]||null,children:[]}])) ;
 for(const id of Object.keys(source?.groupParents||{}))if(!byId.has(id))throw Error('Unknown Map Group.');
 for(const node of byId.values())if(node.parentId){const parent=byId.get(node.parentId);if(!parent||parent===node)throw Error('Invalid Map Group Parent.');parent.children.push(node.id);}
 const visiting=new Set(),done=new Set();function visit(node,depth=0,path=[]){if(visiting.has(node.id)||depth>8)throw Error('Map Groups Cannot Cycle or Exceed Eight Nested Levels.');if(done.has(node.id))return;visiting.add(node.id);node.depth=depth;node.path=[...path,node.name].join(' / ');node.rootId=path.length?null:node.id;node.headers=node.ownHeaders.slice();for(const id of node.children){const child=byId.get(id);visit(child,depth+1,[...path,node.name]);node.headers.push(...child.headers);}visiting.delete(node.id);done.add(node.id);}
 for(const node of byId.values())if(!node.parentId)visit(node);if(done.size!==byId.size)throw Error('Map Groups Cannot Contain a Cycle.');
 const result=[];function append(n,root){n.rootId=root;result.push(n);for(const id of n.children)append(byId.get(id),root);}for(const node of byId.values())if(!node.parentId)append(node,node.id);return result;
}
export function catalogGroups(source){return catalogNodes(source).filter(n=>!n.parentId);}
export function selectedCatalogGroup(source,selected){const id=selected==='violet-city'?'section:128':selected,node=catalogNodes(source).find(g=>g.id===id);return node?catalogGroups(source).find(g=>g.id===node.rootId):null;}
export function groupTree(source,rootId){return catalogNodes(source).filter(n=>n.rootId===rootId).map(({id,name,parentId,ownHeaders,depth,path})=>({id,name,parentId,ownHeaders,depth,path}));}

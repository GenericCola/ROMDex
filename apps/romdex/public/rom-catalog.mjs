// Group the actual ROM catalog, without selecting a test map for the user.
export function catalogGroups(source){
 const groups=new Map();
 for(const m of source?.maps||[]){const id='section:'+m.section;if(!groups.has(id))groups.set(id,{id,name:m.label?.trim()||'Zone '+m.section+' · '+m.name,headers:[]});groups.get(id).headers.push(m.headerId);}
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})||a.id.localeCompare(b.id));
}
export function selectedCatalogGroup(source,selected){return catalogGroups(source).find(g=>g.id===(selected==='violet-city'?'section:128':selected))||null;}

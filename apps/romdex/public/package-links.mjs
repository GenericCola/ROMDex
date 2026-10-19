import {packageSummary} from './package-progress.mjs';
export function renderPackageLinks(host,{state,issueId,open,error=()=>{}}){
 host.replaceChildren();const entries=Object.values(state?.mapPackages||{}).filter(e=>e.issueId===issueId).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));host.hidden=!entries.length;if(!entries.length)return;
 const title=document.createElement('h3');title.textContent='Linked Map Packages';host.append(title);
 for(const entry of entries){const p=packageSummary(entry,state.blocked),line=document.createElement('div');line.className='package-link-row';const label=document.createElement('span');label.textContent=entry.mapName+' · Version '+entry.version+' · '+(p.delivery==='attached'?'Attached':p.delivery==='needs-review'?'Needs Review':'Staged');line.append(label);
  for(const [kind,text]of [['map','Open Map'],['package','View Package']]){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>Promise.resolve().then(()=>open({id:entry.id,kind})).catch(e=>error(e.message));line.append(b);}host.append(line);
 }
}

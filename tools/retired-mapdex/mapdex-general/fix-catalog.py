from pathlib import Path
p=Path('outputs/ROMDex/rom/reader.mjs');s=p.read_text().replace("['size','mtimeNs','ctimeNs','ino','dev']", "['size','mtimeNs','ino','dev']");s=s.replace("this.check();const now=await this.#handle.stat({bigint:true});", "// ctime also changes for Windows/OneDrive metadata updates, not only ROM writes.\n  // Keep file identity, byte length and content-modification time pinned.\n  this.check();const now=await this.#handle.stat({bigint:true});");p.write_text(s)
p=Path('outputs/ROMDex/rom/workspace-worker.mjs');s=p.read_text().replace("import {compileRomMap}","import {decodeMessage} from './messages.mjs';\nimport {compileRomMap}");s=s.replace("parentPort.postMessage({result:{source:inventory.source", "const names=await rom.member(inventory.archives.messages.fileId,279);\n  const labels=new Map();for(const m of inventory.maps)if(!labels.has(m.locationSection))labels.set(m.locationSection,decodeMessage(names,m.locationSection).text);\n  parentPort.postMessage({result:{source:inventory.source");s=s.replace("section:m.locationSection}","section:m.locationSection,label:labels.get(m.locationSection)}");p.write_text(s)
Path('outputs/ROMDex/public/rom-catalog.mjs').write_text('''// Group the actual ROM catalog, without selecting a test map for the user.
export function catalogGroups(source){
 const groups=new Map();
 for(const m of source?.maps||[]){const id='section:'+m.section;if(!groups.has(id))groups.set(id,{id,name:m.label?.trim()||'Zone '+m.section+' · '+m.name,headers:[]});groups.get(id).headers.push(m.headerId);}
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
}
export function selectedCatalogGroup(source,selected){return catalogGroups(source).find(g=>g.id===(selected==='violet-city'?'section:128':selected))||null;}
''')
p=Path('outputs/ROMDex/public/rom-import.mjs');s=p.read_text().replace("import {publicationProgress}","import {catalogGroups,selectedCatalogGroup} from './rom-catalog.mjs';\nimport {publicationProgress}");a=s.index('function mapCatalog()');b=s.index('function notify()',a)
s=s[:a]+'''function mapCatalog(){const term=$('map-search').value.toLowerCase();$('map-list').replaceChildren();for(const g of catalogGroups(state.source)){if(!g.name.toLowerCase().includes(term))continue;const b=el('button');b.type='button';b.dataset.map=g.id;b.setAttribute('aria-pressed',String(g.id===selectedCatalogGroup(state.source,state.selected)?.id));b.append(el('strong',g.name),el('small',g.headers.length+' areas'));b.onclick=()=>run(async()=>{await flush();state=await call('select',{id:g.id});render();});$('map-list').append(b);}}
'''+s[b:]
s=s.replace("supported=state.selected==='violet-city'", "group=selectedCatalogGroup(state.source,state.selected),supported=!!group")
s=s.replace("supported?(p?.name||'Violet City'):'Unverified Map / Zone'", "supported?(p?.ready?p.name:group.name):'Select a Map / Zone'")
s=s.replace("state.source?supported?'Choose Included Areas, Then Prepare the Map.':'Extraction support for this group requires review.'", "state.source?supported?'Choose Included Areas, Then Prepare the Map.':'Choose a Map / Zone from the ROM Catalog.'")
s=s.replace("drafts.mapName??p?.name??'Violet City'", "drafts.mapName??(p?.ready?p.name:group?.name)??''")
s=s.replace("for(const header of [73,135,157,158,159,160,162,167])", "for(const header of group?.headers||[])")
s=s.replace("m.name+(header===73?' · Outside':'')", "m.name")
s=s.replace("state.headers.length+' of 8 suggested areas; one map per RDX.'", "state.headers.length+' of '+(group?.headers.length||0)+' suggested areas; one map per RDX.'")
p.write_text(s)
p=Path('outputs/ROMDex/rom/workspace.mjs');s=p.read_text().replace("import {requireRom} from './reader.mjs';", "import {requireRom} from './reader.mjs';\nimport {catalogGroups,selectedCatalogGroup} from '../public/rom-catalog.mjs';")
s=s.replace("source:null,selected:'violet-city',headers:HEADERS", "source:null,selected:null,headers:[]")
s=s.replace("this.state.headers=this.state.prepared?.sourceSHA256===message.result.source.sha256?this.state.prepared.headers:HEADERS;this.state.selected='violet-city';", "const same=this.state.prepared?.sourceSHA256===message.result.source.sha256;this.state.headers=same?this.state.prepared.headers:[];if(!same||!selectedCatalogGroup(this.state.source,this.state.selected))this.state.selected=null;")
s=s.replace("(input.id==='violet-city'||this.state.source?.maps.some(m=>'section:'+m.section===input.id))", "!!selectedCatalogGroup(this.state.source,input.id)")
s=s.replace("this.state.selected=input.id;await this.persist();", "this.state.selected=selectedCatalogGroup(this.state.source,input.id).id;this.state.headers=selectedCatalogGroup(this.state.source,input.id).headers;await this.persist();")
s=s.replace("input.headers.every(h=>HEADERS.includes(h))", "input.headers.every(h=>selectedCatalogGroup(this.state.source,this.state.selected)?.headers.includes(h))")
s=s.replace("Select Areas Within the Reviewed Violet City Group.", "Select Areas Within the Current Map / Zone.")
s=s.replace("this.state.selected==='violet-city'", "selectedCatalogGroup(this.state.source,this.state.selected)?.headers.every(h=>HEADERS.includes(h))")
p.write_text(s)
p=Path('outputs/ROMDex/tests/rom-workspace.test.mjs');s=p.read_text().replace("s.importer.state.headers=[1];", "s.importer.state.selected='section:128';s.importer.state.headers=[1];");p.write_text(s)

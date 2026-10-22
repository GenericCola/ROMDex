from pathlib import Path
p=Path('outputs/ROMDex/rom/extract.mjs');s=p.read_text().replace('previousIdentities=null,progress=', 'previousIdentities=null,headerIds=null,scope=null,progress=')
s=s.replace('const maps=inventory.maps.filter(m=>profile.candidateGroup.headers.includes(m.headerId));', 'const selectedHeaders=headerIds||profile.candidateGroup.headers,maps=inventory.maps.filter(m=>selectedHeaders.includes(m.headerId));')
s=s.replace("requireRom(maps.length===8&&maps.every(m=>m.locationSection===128),'INVALID_REFERENCE','Violet City grouping differs from its reviewed ROM location section.');", "requireRom(maps.length>0&&maps.length===new Set(selectedHeaders).size,'INVALID_REFERENCE','The Selected Map Areas Differ from the ROM Catalog.');")
s=s.replace('headerIds:profile.candidateGroup.headers','headerIds:selectedHeaders')
s=s.replace("testbed:{key:profile.candidateGroup.key,locationSection:128,headerIds:areas.map(a=>a.headerId),excludes:'Sprout Tower; separate location identity'}", "testbed:{key:scope?.key||profile.candidateGroup.key,name:scope?.name||'Violet City',regionName:scope?.regionName||'Johto',regionKey:scope?.regionKey||'johto',locationSection:maps[0].locationSection,headerIds:areas.map(a=>a.headerId),excludes:'Areas outside the selected map / zone group'}")
p.write_text(s)
p=Path('outputs/ROMDex/rom/compile-map.mjs');s=p.read_text().replace("requireRom(x.testbed.key==='violet-city'&&x.inventoryDigest===inventory.digest,'SOURCE_CHANGED','Compilation requires the reviewed Violet City inventory.');", "requireRom(typeof x.testbed.key==='string'&&x.testbed.key.length>0&&x.inventoryDigest===inventory.digest,'SOURCE_CHANGED','Compilation Requires the Selected Map Inventory.');\n const mapKey=x.testbed.key,mapName=x.testbed.name||'Violet City',regionKey=x.testbed.regionKey||'johto',regionName=x.testbed.regionName||'Johto';")
s=s.replace("id('map','violet-city')","id('map',mapKey)").replace("id('timeline','violet-city')","id('timeline',mapKey)").replace("id('region','johto')","id('region',regionKey)").replace("id('document','violet-city')","id('document',mapKey)")
a=s.index(' const stages=');b=s.index(' const zoneIds=',a)
s=s[:a]+''' const sceneVariables=new Set(x.roots.filter(r=>r.kind==='scene-hook'&&r.predicate).map(r=>r.predicate.left)),writes=x.mutations.filter(m=>m.kind==='SetVar'&&m.operands[0]>=0x4000&&m.operands[0]<0x8000&&(!sceneVariables.size||sceneVariables.has(m.operands[0]))),states=new Map();
 for(const m of writes){const [variable,value]=m.operands,key=variable+':'+value;if(!states.has(key))states.set(key,{variable,value,evidence:[]});states.get(key).evidence.push(m.locator);}
 const stages=[...states.values()].sort((a,b)=>a.variable-b.variable||a.value-b.value).map(s=>({id:id('scene-value',s.variable,s.value),name:'Scene variable 0x'+s.variable.toString(16)+' = '+s.value,event:'Observed '+mapName+' source state. Numeric display order is not verified gameplay chronology; independent flags are retained separately.',uncertain:true,condition:{variable:s.variable,value:s.value},evidence:s.evidence}));
 add(regionId,'region',null,{name:regionName,regionKey});
 add(timelineId,'shared',null,{name:mapName+' — Source States (Chronology Requires Review)',sharedType:'progression',definitions:{stages,scope:'this-map-only',chronologyVerified:false,initialStateNotInferred:true,milestoneCandidates:x.timeline.milestoneCandidates,warning:x.timeline.warning}});
'''+s[b:]
s=s.replace("name:'Violet City (RI02C Isolated ROM Proof)'", "name:mapName").replace("sourceMapKeys:['violet-city']", "sourceMapKeys:[mapKey]")
s=s.replace("predicate?.left===0x4074&&predicate.operator==='equal'?stages.find(s=>s.condition.value===predicate.right)", "predicate&&predicate.operator==='equal'?stages.find(s=>s.condition.variable===predicate.left&&s.condition.value===predicate.right)")
s=s.replace("area.internalName+(area.headerId===73?' · Violet City Exterior':'')", "area.internalName")
s=s.replace('Two ambiguous sprite palettes have no guessed default image; all alternatives are retained.', 'Ambiguous sprite palettes have no guessed default image; all alternatives are retained.')
s=s.replace("summary:{map:'Violet City'", "summary:{map:mapName")
s=s.replace("previousIdentities=null,progress=", "previousIdentities=null,headerIds=null,scope=null,progress=")
s=s.replace("{inventory,previousIdentities,progress}", "{inventory,previousIdentities,headerIds,scope,progress}")
p.write_text(s)
p=Path('outputs/ROMDex/rom/staging-document.mjs');s=p.read_text().replace("p.name='Violet City';", "")
a=s.index('\nexport function selectPreparedAreas');s=s[:a]+'''
export function recoverSourceScope(value){const source=value.document.extensions?.['org.romdex.rom-source'],entry=value.document.assetInventory.find(a=>a.assetId===source?.sourceAsset);requireRom(entry&&value.blobs.has(entry.sha256),'INTEGRITY','Missing Source Scope.');return structuredClone(parseJSON(value.blobs.get(entry.sha256)).header.testbed);}
'''+s[a:];p.write_text(s)
p=Path('outputs/ROMDex/rom/workspace-worker.mjs');s=p.read_text().replace("section:m.locationSection,label", "section:m.locationSection,regionId:m.regionId,label").replace("previousIdentities:workerData.previousIdentities||null,progress", "previousIdentities:workerData.previousIdentities||null,headerIds:workerData.scopeHeaders,scope:workerData.scope,progress");p.write_text(s)
p=Path('outputs/ROMDex/rom/workspace.mjs');s=p.read_text().replace('recoverSourceIdentities,mergePreparation','recoverSourceIdentities,recoverSourceScope,mergePreparation').replace('const HEADERS=[73,135,157,158,159,160,162,167],BUDGET=', 'const BUDGET=')
s=s.replace("cached.manifest=recoverSourceIdentities(value);", "cached.manifest=recoverSourceIdentities(value);cached.scope=recoverSourceScope(value);")
s=s.replace("cached.sourceSHA256===this.state.source.source.sha256&&!found.some", "cached.sourceSHA256===this.state.source.source.sha256&&token(cached.manifest.headerIds)===token([...(selectedCatalogGroup(this.state.source,this.state.selected)?.headers||[])].sort((a,b)=>a-b))&&!found.some")
s=s.replace("name:cached.name,manifest:cached.manifest", "name:cached.name,manifest:cached.manifest,scope:cached.scope")
s=s.replace("requireRom(this.state.source&&selectedCatalogGroup(this.state.source,this.state.selected)?.headers.every(h=>HEADERS.includes(h)),'UNSUPPORTED','Extraction Is Currently Verified for Violet City Only.');", "requireRom(this.state.source&&selectedCatalogGroup(this.state.source,this.state.selected),'INVALID','Select a Map / Zone from the ROM Catalog.');")
s=s.replace("headers:this.state.headers,previousIdentities:chosen?.manifest", "headers:this.state.headers,scopeHeaders:selectedCatalogGroup(this.state.source,this.state.selected).headers,scope:chosen?.scope||{key:this.state.selected,name:selectedCatalogGroup(this.state.source,this.state.selected).name,regionKey:'rom-region-'+(this.state.source.maps.find(m=>m.headerId===this.state.headers[0])?.regionId??0),regionName:'ROM Region '+(this.state.source.maps.find(m=>m.headerId===this.state.headers[0])?.regionId??0)},previousIdentities:chosen?.manifest")
p.write_text(s)

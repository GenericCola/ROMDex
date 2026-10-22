from pathlib import Path
p=Path('outputs/ROMDex/rom/workspace.mjs');s=p.read_text()
old="if(this.state.job){this.state.job={...this.state.job,state:'interrupted',message:'Extraction Was Interrupted. The Last Prepared Map Is Preserved.'};await this.persist();}"
new="if(this.state.job?.state==='working'){this.state.job={...this.state.job,state:'interrupted',message:'Extraction Was Interrupted. The Last Prepared Map Is Preserved.'};await this.persist();}for(const b of this.state.bindings.filter(b=>b.ready===false)){const row=this.maps.store?.db.prepare('SELECT head FROM documents WHERE key=?').get(b.key);if(row){const v=this.maps.store.load(b.key,row.head);if(v.document.revision===b.importRevision||v.document.content.history.some(h=>h.sha256===b.importBytesHash)){b.ready=true;b.error=null;}}}await this.persist();"
assert old in s;s=s.replace(old,new)
old="const incoming=await this.prepared(),bytes=await packRdx(incoming.documentBytes,incoming.blobs);\n   const begin="
new="const incoming=await this.prepared(),bytes=await packRdx(incoming.documentBytes,incoming.blobs);let intent=this.state.bindings.find(b=>b.key===p.key);if(!this.maps.cloud?.get(p.key)){if(!intent){intent={key:p.key};this.state.bindings.push(intent);}Object.assign(intent,{ready:false,importRevision:incoming.document.revision,importBytesHash:sha(incoming.documentBytes),authorizedAt:new Date().toISOString(),error:null});await this.persist();}\n   const begin="
assert old in s;s=s.replace(old,new)
old="if(!this.maps.cloud?.get(p.key)&&!this.state.bindings.some(b=>b.key===p.key))this.state.bindings.push({key:p.key,authorizedAt:new Date().toISOString()});await this.persist();"
new="if(intent)intent.ready=true;await this.persist();"
assert old in s;s=s.replace(old,new)
s=s.replace("if(this.paused()||!manual&&!this.enabled()||!this.maps.cloud)return;", "if(!this.maps.cloud)return;")
s=s.replace("if(this.paused())break;if(b.error&&!manual)continue;", "if(b.ready===false||b.error&&!manual)continue;")
p.write_text(s)
p=Path('outputs/ROMDex/public/rom-import.mjs');s=p.read_text();s=s.replace("editing=Promise.resolve(),drafts={};", "editing=Promise.resolve(),drafts={},pendingStages=null;")
s=s.replace("function showStages(){", "function position(){return {selected,mode,drafts,stageDraft:pendingStages};}\nfunction showStages(){")
s=s.replace("s.name=input.value;$('save-stages').disabled=false;", "s.name=input.value;pendingStages=structuredClone(stages);$('save-stages').disabled=false;clearTimeout(timer);timer=setTimeout(()=>run(flush),650);")
s=s.replace("showStages();$('save-stages').disabled=false;", "pendingStages=structuredClone(stages);showStages();$('save-stages').disabled=false;run(flush);")
s=s.replace("stages=p.stages.map(s=>({id:s.id,name:s.name}));showStages();", "stages=pendingStages&&pendingStages.length===p.stages.length&&pendingStages.every(s=>p.stages.some(x=>x.id===s.id))?structuredClone(pendingStages):p.stages.map(s=>({id:s.id,name:s.name}));showStages();$('save-stages').disabled=!pendingStages;")
s=s.replace("{selected,mode,drafts}", "position()")
s=s.replace("drafts=state.position.drafts||drafts;", "drafts=state.position.drafts||drafts;pendingStages=state.position.stageDraft||null;")
s=s.replace("delete drafts[key];", "delete drafts[key];$('map-name-heading').textContent=state.prepared.name;")
s=s.replace("$('save-stages').disabled=true;message('Map Stage", "pendingStages=null;await call('position',position());$('save-stages').disabled=true;message('Map Stage")
s=s.replace("label.append(select);$('handoff-conflicts')", "const comparison=el('details');comparison.append(el('summary','Compare Existing / Prepared'),el('h4','Existing'),el('pre',JSON.stringify(c.local?.current||c.local,null,2),'source-text'),el('h4','Prepared'),el('pre',JSON.stringify(c.incoming?.current||c.incoming,null,2),'source-text'));label.append(select,comparison);$('handoff-conflicts')")
p.write_text(s)
p=Path('outputs/ROMDex/desktop/main.cjs');s=p.read_text();old="if(path.extname(selected.filePath).toLowerCase()!=='.rdx')throw Error('Export Maps as .rdx Files.');";new=old+"if(path.resolve(selected.filePath).toLowerCase().startsWith(path.resolve(base).toLowerCase()+path.sep))throw Error('Export Outside the Managed Application Data Folder.');";assert old in s;s=s.replace(old,new);p.write_text(s)
print('Persisted preparation drafts and crash-recoverable, local-only publication intent.')

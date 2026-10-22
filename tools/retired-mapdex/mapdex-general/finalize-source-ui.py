from pathlib import Path
p=Path('outputs/ROMDex/public/rom-import.mjs');s=p.read_text().replace("$('cancel-job').disabled=!busy;", "for(const button of document.querySelectorAll('[data-map]'))button.disabled=busy;$('cancel-job').disabled=!busy;")
s=s.replace("if(result){detail=null;state=await call('status');render();}","if(result){detail=null;detailHead=null;selected=null;drafts={};pendingStages=null;stageSelection='all';state=await call('status');render();}")
p.write_text(s)
p=Path('outputs/ROMDex/rom/workspace.mjs');s=p.read_text().replace("if(data.mode==='catalog'){this.state.source=", "if(data.mode==='catalog'){const priorSource=this.state.source?.source.sha256;this.state.source=").replace("const same=this.state.prepared?.sourceSHA256===message.result.source.sha256;", "if(priorSource!==message.result.source.sha256){this.state.positions={};this.state.position=null;this.state.selected=null;}const same=this.state.prepared?.sourceSHA256===message.result.source.sha256;")
p.write_text(s)
p=Path('work/mapdex-general/prove-ui.mjs');s=p.read_text().replace("await frame.locator('#prepared-preview').waitFor({state:'visible'});await frame.waitForFunction(()=>document.getElementById('item-detail').querySelector('h3'));", "await frame.waitForFunction(()=>document.getElementById('map-name-heading').textContent==='Route 29'&&document.getElementById('item-detail').querySelector('h3')?.textContent.startsWith('R29')&&!document.getElementById('prepare-map').disabled);")
p.write_text(s)

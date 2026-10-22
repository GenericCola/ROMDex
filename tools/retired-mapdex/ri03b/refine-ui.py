from pathlib import Path
p=Path('outputs/ROMDex/public/rom-import.mjs');s=p.read_text();s=s.replace('pendingStages=null;','pendingStages=null,uiBusy=0;',1)
s=s.replace("function run(action){return Promise.resolve().then(action).catch(error=>message(error.message));}","function run(action){uiBusy++;if(state)updateButtons();return Promise.resolve().then(action).catch(error=>message(error.message)).finally(()=>{uiBusy--;if(state)updateButtons();});}")
s=s.replace("const busy=state?.job?.state==='working',ready=", "const busy=state?.job?.state==='working'||uiBusy>0,ready=")
s=s.replace("state=await call('areas',{headers:[...document.querySelectorAll('[data-header]:checked')].map(x=>Number(x.dataset.header))});", "const headers=[...document.querySelectorAll('[data-header]:checked')].map(x=>Number(x.dataset.header));if(!headers.length){render();message('Keep At Least One Area Selected.');return;}state=await call('areas',{headers});")
s=s.replace("delete drafts[key];$('map-name-heading')", "if(drafts[key]===name)delete drafts[key];$('map-name-heading')")
s=s.replace("$('commit-handoff').onclick=()=>run(async()=>{", "$('commit-handoff').onclick=()=>run(async()=>{$('commit-handoff').disabled=true;")
p.write_text(s)
print('Preserved edits typed during pending saves and prevented stale export clicks.')

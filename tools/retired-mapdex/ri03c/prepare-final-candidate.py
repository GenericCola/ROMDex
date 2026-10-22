from pathlib import Path
import shutil
p=Path('work/ri03c/build-candidate.mjs');s=p.read_text(encoding='utf-8-sig').replace("work/phase11e/candidate","work/ri03c/candidate").replace("candidate=path.resolve('work/ri03c/candidate')", "candidate=path.resolve('work/ri03c/candidate2')").replace('0.5.26-11f.1','0.5.26-11f.2');Path('work/ri03c/build-candidate2.mjs').write_text(s,encoding='utf-8');shutil.copy2('work/ri03c/build.json','work/ri03c/build1.json')
for rel in ['rom/location-decoder.mjs','tests/location-portability.test.mjs']:shutil.copy2(Path('outputs/ROMDex')/rel,Path('work/u13b/repository/apps/romdex')/rel)
p=Path('work/ri03c/verify-native.mjs');s=p.read_text(encoding='utf-8-sig')
s=s.replace("report.metrics.startupMilliseconds=Date.now()-started;", "report.metrics.startupMilliseconds=Date.now()-started;if(!report.checks.includes('Switching final workspaces preserves local state without reopening Connection Details or producing page errors')){")
s=s.replace("await check('Switching final workspaces preserves local state without reopening Connection Details or producing page errors');", "await check('Switching final workspaces preserves local state without reopening Connection Details or producing page errors');}")
s=s.replace("const child=app.process(),exit=", "for(const f of page.frames()){try{await f.evaluate(()=>window.romdexWorkspace?.ready);}catch{}}await page.waitForFunction(()=>!document.getElementById('shell-loading')||document.getElementById('shell-loading').hidden,null,{polling:200});const child=app.process(),exit=")
s=s.replace("report.error=e.stack;if(page)", "report.error=e.stack;if(app)report.lastNativeMessage=await app.evaluate(()=>require('electron').dialog.lastMessage||null).catch(()=>null);if(page)")
p.write_text(s,encoding='utf-8')

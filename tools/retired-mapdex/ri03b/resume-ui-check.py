from pathlib import Path
p=Path('work/ri03b/verify-ui.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("const root=path.resolve('work/ri03b/ui-'+Date.now())", "const reuse=process.argv[2];const root=path.resolve(reuse||'work/ri03b/ui-'+Date.now())")
start=s.index('const maps=new MapWorkspace');end=s.index("\nprocess.env.ROMDEX_DATA_DIR",start)
block=s[start:end].replace('const saved=','saved=')
s=s[:start]+"let saved;if(!reuse){"+block+"}else{saved=JSON.parse(await fs.readFile(path.join(data,'ROMImport/workspace.json'))).prepared;}"+s[end:]
s=s.replace(" await step('Actual worker-derived", " if(!reuse){await step('Actual worker-derived")
s=s.replace(" await step('Shared checkpoint", " }\n await page.waitForFunction(()=>[...window.romdexShell.host.views.values()].every(v=>v.doc===v.frame.contentDocument));\n if(reuse){await page.setViewportSize({width:1024,height:620});await frame.evaluate(()=>window.romdexWorkspace.ready);await page.screenshot({path:path.join(root,'workspace-short-final.png')});assert.equal(await frame.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);checks.push('Final MAPDex layout fits a short 1024-pixel desktop window');}\n await step('Shared checkpoint")
s=s.replace("{passed:true,root,checks,errors},null,2", "{passed:true,root,checks,errors,reusedPriorUIEvidence:!!reuse},null,2")
p.write_text(s,encoding='utf-8')

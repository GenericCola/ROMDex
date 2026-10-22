from pathlib import Path
p=Path('work/mapdex-general/prove-ui.mjs');s=p.read_text().replace("await fs.cp(path.join(root,'runtime-proof'),data,{recursive:true,errorOnExist:true,force:false});", "try{await fs.access(data)}catch(e){if(e.code!=='ENOENT')throw e;await fs.cp(path.join(root,'runtime-proof'),data,{recursive:true,errorOnExist:true,force:false});}")
s=s.replace("await frame.locator('[data-map=\"section:126\"]').click();assert.equal", "await frame.locator('[data-map=\"section:126\"]').click();await frame.waitForFunction(()=>document.getElementById('map-name-heading').textContent==='New Bark Town'&&!document.getElementById('prepare-map').disabled);assert.equal")
p.write_text(s)

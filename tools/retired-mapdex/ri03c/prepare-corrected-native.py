from pathlib import Path
p=Path('work/ri03c/verify-native.mjs');s=p.read_text(encoding='utf-8-sig').replace("work/phase11e/build.json","work/ri03c/build.json")
s=s.replace("if(!report.checks.includes('NPCDex uses the same map-specific condition index, location imagery and access inspector after handoff'))", "if(!report.checks.includes('An empty condition match explains the filter and returns to actual dialogue with one Show All Content action'))")
needle="await check('NPCDex uses the same map-specific condition index, location imagery and access inspector after handoff');"
s=s.replace(needle,needle+"assert((await npc.locator('.conditions-pane').innerText()).includes('Access Requirements'));const all=npc.locator('[data-show-all-dialogue]');assert.equal(await all.count(),1);await all.click();assert.equal(await npc.locator('#conditional').getAttribute('aria-pressed'),'true');assert(await npc.locator('.passage').count());await check('An empty condition match explains the filter and returns to actual dialogue with one Show All Content action');")
s=s.replace("const t=Date.now();await openMap('Route 29');", "if(!report.checks.includes('Actual map controls switch New Bark to Route 29 with different relevant conditions, clear the old filter and keep unresolved content reachable')){const t=Date.now();await openMap('Route 29');")
s=s.replace("await check('Actual map controls switch New Bark to Route 29 with different relevant conditions, clear the old filter and keep unresolved content reachable');", "await check('Actual map controls switch New Bark to Route 29 with different relevant conditions, clear the old filter and keep unresolved content reachable');}")
p.write_text(s,encoding='utf-8')
for rel in ['content/workspace-runtime.js','content/import-ui.js']:
 import shutil
 shutil.copy2(Path('outputs/ROMDex')/rel,Path('work/u13b/repository/apps/romdex')/rel)

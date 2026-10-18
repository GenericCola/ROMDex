import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const visual=JSON.parse(await fs.readFile('work/u20g/installed-visual.json','utf8'));assert.equal(visual.status,'passed');assert.equal(visual.version,'0.5.10');
await import('./u20g-finalize.mjs');
const file='outputs/U20G-Verification.json',verification=JSON.parse(await fs.readFile(file,'utf8'));verification.installedNativeVisual=visual;await fs.writeFile(file,JSON.stringify(verification,null,2));
await fs.copyFile(file,'work/u13b/repository/docs/project/U20G-Verification.json');await fs.copyFile('work/u20g/installed-visual.json','work/u13b/repository/docs/project/U20G-Evidence/installed-visual.json');
await fs.copyFile('work/u20g/post-visual-preservation.json','work/u13b/repository/docs/project/U20G-Evidence/post-visual-preservation.json');
for(const name of ['u20g-final-docs.mjs','u20g-final-push.mjs','u20g-post-visual.mjs'])await fs.copyFile('work/'+name,'work/u13b/repository/tools/development/'+name);

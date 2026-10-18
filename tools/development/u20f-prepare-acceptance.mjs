import fs from 'node:fs/promises';
let editor=(await fs.readFile('work/u20d-live-editor.cjs','utf8')).replaceAll('u20d','u20f').replaceAll('U20D Planned Character','U20F Planned Character').replaceAll('U20D Shared Appearance','U20F Shared Appearance');
editor=editor.replace('let dropped=false;','let offline=false,dropped=false;').replace('const u=new URL(url);','if(offline)throw Error("Injected Offline Connection");const u=new URL(url);');
editor=editor.replace("const view=await editor.sync(true);assert(dropped);", "offline=true;await editor.sync(true);assert.equal(editor.view().status.pendingWrites,4);assert.equal(posts.length,0);offline=false;const view=await editor.sync(true);assert(dropped);");
await fs.writeFile('work/u20f-live-editor.cjs',editor);
for(const stage of ['mutate','recover','final'])await fs.writeFile('work/u20f-live-'+stage+'.cjs',"require('./u20f-live-editor.cjs')('"+stage+"');\n");

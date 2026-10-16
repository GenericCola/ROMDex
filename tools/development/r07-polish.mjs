import fs from 'node:fs';
const base='C:/Users/mrgen/Documents/Codex/2026-10-13/can/outputs/ROMDex/public/';
for(const name of ['index.html','app.mjs']){let text=fs.readFileSync(base+name,'utf8');text=text.replaceAll('Attach Files / Manage Attachments','Attachments').replaceAll('Attach Files / Manage','Attach Files').replace('type="file" multiple aria-label="Attach Files"','type="file" multiple class="sr-only" aria-label="Attach Files"');fs.writeFileSync(base+name,text);}

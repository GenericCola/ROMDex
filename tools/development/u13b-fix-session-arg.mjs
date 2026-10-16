import fs from 'node:fs/promises';
const file='outputs/ROMDex/desktop/updater-window.mjs';let text=await fs.readFile(file,'utf8');text=text.replace('createHandoff({root,profile,installer:','createHandoff({root,profile,session:app.getPath(\'userData\'),installer:');await fs.writeFile(file,text);
const helper='outputs/ROMDex/desktop/update-handoff.ps1';text=await fs.readFile(helper,'utf8');text=text.replaceAll('$profile','$romdexProfile');await fs.writeFile(helper,text);

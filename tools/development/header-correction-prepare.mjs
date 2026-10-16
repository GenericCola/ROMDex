import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const names=['public/shared-ui/header.mjs','public/shared-ui/theme.css','shared-ui/header.mjs','shared-ui/theme.css','shared-ui/README.md'],sha=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir('work/header-correction');await fs.mkdir('outputs/Header-Correction-Before');const files=[];
for(const name of names){const bytes=await fs.readFile('outputs/ROMDex/'+name);assert.ok(bytes.equals(await fs.readFile('outputs/ROMDex-v0.4.2/ROMDex/'+name)));const to='outputs/Header-Correction-Before/'+name;await fs.mkdir(path.dirname(to),{recursive:true});await fs.writeFile(to,bytes);files.push({path:name,sha256:sha(bytes)});}
await fs.writeFile('work/header-correction/baseline.json',JSON.stringify({files},null,2));
const file='outputs/ROMDex/public/shared-ui/header.mjs';let code=await fs.readFile(file,'utf8');code=code.replace('onConnection,onAbout,onWorkspace','onWorkspace').replace(',onUpdates,onQuit','');
code=code.replace(/\n  <div class="suite-menu-anchor"><button id="app-settings"[\s\S]*?\n <\/div>`;/,'\n </div>`;');
code=code.replace(",{trigger:root.querySelector('#app-settings'),menu:root.querySelector('#app-settings-menu')}",'');
code=code.replace(/^ root.querySelector\('#app-settings-menu'\).*\r?\n/m,'');
assert.equal(code.includes('id="app-settings"'),false);await fs.writeFile(file,code);
const css='outputs/ROMDex/public/shared-ui/theme.css';let theme=await fs.readFile(css,'utf8');theme=theme.replace('.connection-status{position:static;left:auto;top:auto;transform:none;display:block;width:11px;height:11px;--indicator-size:11px}', '.connection-status{position:static;left:auto;top:auto;transform:none;display:grid;place-items:center;line-height:0;width:11px;height:11px;--indicator-size:11px}\n.connection-status .bulb{display:block;margin:0;vertical-align:initial}');await fs.writeFile(css,theme);
for(const name of ['header.mjs','theme.css'])for(const dir of ['outputs/ROMDex/shared-ui','outputs/Tool-Suite-UI'])await fs.copyFile('outputs/ROMDex/public/shared-ui/'+name,dir+'/'+name);
console.log('Removed application settings menu; connection lens no longer participates in inline baseline layout.');

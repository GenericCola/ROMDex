import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const original='C:/Users/mrgen/Downloads/npcdex-v2.42',target='outputs/NPCDex',backup='outputs/U07-Before';
const hash=b=>createHash('sha256').update(b).digest('hex'),files=[];
await fs.mkdir('work/u07',{recursive:true});await fs.mkdir(target);await fs.mkdir(backup);
for(const entry of await fs.readdir(original,{withFileTypes:true})){assert.ok(entry.isFile(),'Unexpected package directory');const bytes=await fs.readFile(original+'/'+entry.name);files.push({path:entry.name,bytes:bytes.length,sha256:hash(bytes)});await fs.writeFile(target+'/'+entry.name,bytes);await fs.writeFile(backup+'/'+entry.name,bytes);}
await fs.writeFile('work/u07/baseline.json',JSON.stringify({original,target,backup,files},null,2));
const template=target+'/npcdex-template.html';let html=await fs.readFile(template,'utf8');
function replace(old,next){assert.equal(html.split(old).length,2,'Expected one match: '+old.slice(0,80));html=html.replace(old,next);}
const gender='<div class="gender"><label>Player Character</label><div class="segments" role="group" aria-label="Player character gender"><button id="male" aria-pressed="true">Male</button><button id="female" aria-pressed="false">Female</button></div></div>';
const data='<button id="data-tools">Data</button>',flags='<button id="flags">Flags & Notes</button>';
replace(gender,'');replace(data,'');replace(flags,'');
replace('<nav id="maps"',flags+'<nav id="maps"');
const art=await fs.readFile('outputs/Tool-Suite-UI/standard-settings-icon.svg');
const icon='<img class="standard-settings-icon" width="12" height="12" alt="" src="data:image/svg+xml;base64,'+art.toString('base64')+'">';
replace('<button id="inventory-settings" aria-label="Inventory settings">⚙</button>',gender+'<button id="inventory-settings" aria-label="Inventory Settings" title="Inventory Settings">'+icon+'</button>');
replace('<label class="check-label"><input id="sort-sub-area"', '<h2 class="inventory-settings-title">Inventory Settings</h2><div class="inventory-settings-actions">'+data+'</div><label class="check-label"><input id="sort-sub-area"');
replace("$('data-tools').onclick=()=>{showExportDestination();$('data-dialog').showModal()}","$('data-tools').onclick=()=>{$('inventory-dialog').close();showExportDestination();$('data-dialog').showModal()}");
replace('</style>',`\n/* U07: relocate existing controls; retain their IDs and application handlers. */
.maps-shell>#flags{width:100%;flex-shrink:0;margin:0 0 10px;padding:8px 12px;text-align:left;font-size:12px;line-height:1.45;border-radius:6px}
.inventory-tools{flex-wrap:wrap;justify-content:flex-end}
.inventory-tools .gender{flex-shrink:0}
.inventory-tools .gender>label{display:none}
.inventory-tools .segments button{height:34px;padding:6px 12px;line-height:1}
.inventory-tools #inventory-settings{width:18px;height:18px;min-width:18px;min-height:18px;padding:0;display:grid;place-items:center;border:1px solid #718773;border-radius:50%;background:#101d1de6;flex-shrink:0}
.standard-settings-icon{width:12px;height:12px;display:block;image-rendering:pixelated}
.inventory-settings-title{margin:0 0 16px}
.inventory-settings-actions{margin:0 0 18px}
.inventory-settings-actions #data-tools{min-height:34px;padding:8px 12px;border-radius:6px;line-height:1}
.lamps .lamp:nth-child(1){background:#ef8273}.lamps .lamp:nth-child(2){background:var(--yellow)}.lamps .lamp:nth-child(3){background:#81c79a}
@media(max-width:700px){.inventory-tools{gap:7px}.inventory-tools .segments button{height:30px;padding:5px 9px}}
</style>`);
await fs.writeFile(template,html);
console.log(JSON.stringify({protectedFiles:files.length,workCopy:target,sourcePackageUnchanged:true}));

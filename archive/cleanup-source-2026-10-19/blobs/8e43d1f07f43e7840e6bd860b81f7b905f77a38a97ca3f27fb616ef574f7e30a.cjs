const fs=require('fs');let html=fs.readFileSync('outputs/npcdex-template.html','utf8');
html=html.replace(':is(.entry-tools,.flag-severity-picker,.entry-note,.status-buttons) button,#settings-dialog :is(button:not(:where(#settings-close)),.file-control)',':is(.entry-tools,.flag-severity-picker,.entry-note) button,#settings-dialog :is(button:not(:where(#settings-close,.status-choice)),.file-control)');
html=html.replace('.status-buttons{display:flex;align-items:center;gap:8px;flex-wrap:wrap}', '.status-buttons{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:var(--control-height)}');
html=html.replace(':is(.intent-tag,.status-choice){--status-color:', ':is(.intent-tag,.status-choice),#settings-dialog .status-choice{--status-color:');
html=html.replace('font-weight:400;letter-spacing:0}', 'font-weight:400;letter-spacing:0;display:inline-flex;align-items:center;justify-content:center;padding:1px 5px;min-height:0;height:auto;min-width:0;box-shadow:none}');
html=html.replace('.intent-tag{display:inline-block;padding:1px 5px;margin:4px 4px 0 0}', '.intent-tag{margin:4px 4px 0 0}');
const start=html.indexOf('.status-buttons .status-choice,#settings-dialog .status-buttons .status-choice{');const end=html.indexOf('.prompt-status-row{align-items:flex-start}',start);if(start<0||end<0)throw Error('Status CSS boundary missing');
html=html.slice(0,start)+`.status-buttons .status-choice[aria-pressed=true],#settings-dialog .status-choice[aria-pressed=true]{color:var(--status-color);background:var(--status-background);border-color:var(--status-color);box-shadow:none}
.status-buttons.has-selection .status-choice[aria-pressed=false]{opacity:.5}
.status-buttons .status-choice[aria-pressed=true]{opacity:1}
`+html.slice(end);
fs.writeFileSync('outputs/npcdex-template.html',html);
const file='outputs/npcdex-standard-notes-suite.js';let source=fs.readFileSync(file,'utf8');source=source.replace('<div class="status-buttons">','<div class="status-buttons ${STANDARD_NOTES_SUITE.statuses.includes(intent)?\'has-selection\':\'\'}">');fs.writeFileSync(file,source);
for(const name of ['npcdex-data.json','npcdex-agent-export.json']){const d=JSON.parse(fs.readFileSync('outputs/'+name));d.interfaceBuild='2.32';d.buildVersion='2.32';fs.writeFileSync('outputs/'+name,JSON.stringify(d,null,2));}
const notes='outputs/npcdex-update-notes.md';fs.writeFileSync(notes,'# NPCDex 2.32 · Status selectors match tile tags\n\nFINAL/UPDATE/REMOVE choices now share the exact compact tag padding, height, typography, fill, border and radius. Selection leaves the active choice fully opaque and dims the other two to 50% while retaining click access. No selection restores all three. Critical UPDATE remains red. Control rows retain vertical alignment. Includes the completed 2.31 embedded receipt contract.\n\n'+fs.readFileSync(notes,'utf8'));
fs.appendFileSync('outputs/Standard-Notes-Suite.md','\n## Compact status choices · 2.32\n\nStatus choices reuse the frame-tag visual primitive, including its compact height and fill. The containing row supplies alignment space; selectors do not inherit the general action-button height. Selected choice is fully opaque; other choices are 50% opaque and remain interactive. Unset displays all at full opacity.\n');
console.log('Shared compact tag styling, filled choices and selection dimming implemented.');

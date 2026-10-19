const fs=require('fs');
const file='outputs/npcdex-template.html';
let html=fs.readFileSync(file,'utf8');
// Consolidate the status visual rules: tags and interactive choices share tokens.
const selectors=['.intent-tag','.intent-tag.final','.intent-tag.update','.intent-tag.remove','.status-buttons','.status-choice','.status-choice.final[aria-pressed=true]','.status-choice.update[aria-pressed=true]','.status-choice.remove[aria-pressed=true]','.intent-tag.update.critical-update,.status-choice.update.critical-update[aria-pressed=true]'];
for(const selector of selectors){const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(escaped+'\\{[^}]*\\}','g'),'');}
html=html.replace('</style>',`/* Shared control primitives. Keep dimensions, status colors and alignment here. */
:root{--control-height:34px;--control-radius:6px;--control-padding:8px 12px;--status-final:#a4e4b6;--status-final-bg:#173a2b;--status-update:var(--yellow);--status-update-bg:#45391e;--status-remove:#ff4248;--status-remove-bg:#49252a}
:is(.entry-tools,.flag-severity-picker,.entry-note,.status-buttons) button,#settings-dialog button:not(#settings-close),#settings-dialog .file-control{display:inline-flex;align-items:center;justify-content:center;min-height:var(--control-height);padding:var(--control-padding);border:1px solid var(--line);border-radius:var(--control-radius);font-size:11px;line-height:1;box-sizing:border-box;vertical-align:middle}
#settings-dialog .file-control{margin:0;font-size:11px}
#settings-dialog .image-actions{align-items:center}
.status-buttons{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
:is(.intent-tag,.status-choice){--status-color:var(--muted);--status-background:var(--screen-light);color:var(--status-color);background:var(--status-background);border:1px solid currentColor;border-radius:3px;font-size:10px;line-height:1.4;text-transform:uppercase;font-weight:400;letter-spacing:0}
:is(.intent-tag,.status-choice).final{--status-color:var(--status-final);--status-background:var(--status-final-bg)}
:is(.intent-tag,.status-choice).update{--status-color:var(--status-update);--status-background:var(--status-update-bg)}
:is(.intent-tag,.status-choice).remove,:is(.intent-tag,.status-choice).update.critical-update{--status-color:var(--status-remove);--status-background:var(--status-remove-bg)}
.intent-tag{display:inline-block;padding:1px 5px;margin:4px 4px 0 0}
.status-buttons .status-choice{border-color:var(--status-color);border-radius:3px;font-size:10px;min-width:66px;background:transparent;color:var(--status-color)}
.status-buttons .status-choice[aria-pressed=true]{color:var(--status-color);background:var(--status-background);border-color:var(--status-color);box-shadow:inset 0 0 0 1px currentColor}
.prompt-status-row{align-items:flex-start}
.prompt-status-row fieldset{padding:0;border:0;margin:0;min-width:0}
.prompt-status-row legend,.prompt-decision legend{font-size:10px;line-height:1.45;letter-spacing:1px;color:var(--muted);margin:0 0 6px;padding:0}
.prompt-status-row .tester-status label{height:var(--control-height);display:inline-flex;align-items:center;line-height:1;margin:0}
.tile-select{height:100%}
.tile-label{display:flex;flex-direction:column;flex:1}
.tile-intent{display:block;margin-top:auto;padding-top:6px}
.tile-intent .intent-tag{margin:0 6px 0 0}
</style>`);
fs.writeFileSync(file,html);
const suite='outputs/npcdex-standard-notes-suite.js';
let js=fs.readFileSync(suite,'utf8').replace('${titleCase(value)}','${value}');
fs.writeFileSync(suite,js);
console.log('Shared controls, uppercase statuses, alignment and tile footer updated.');

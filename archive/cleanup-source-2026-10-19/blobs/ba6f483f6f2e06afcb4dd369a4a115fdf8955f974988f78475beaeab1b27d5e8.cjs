const fs=require('fs');let s=fs.readFileSync('work/npcdex-template.html','utf8');s=s.replace("$('settings-title').textContent=settingsTarget.label;","$('settings-title').textContent=formatStages(settingsTarget.label);").replace('esc(a.context?.label||key)','esc(formatStages(a.context?.label||key))');fs.writeFileSync('work/npcdex-template.html',s);const data=JSON.parse(fs.readFileSync('outputs/npcdex-data.json','utf8'));fs.writeFileSync('outputs/npcdex.html',s.replace('/*__NPCDEX_DATA__*/',JSON.stringify(data).replace(/</g,'\\u003c')));
let doc=fs.readFileSync('outputs/NPCDex-README.md','utf8').replace('Version 2.13','Version 2.14').replaceAll('**This Line Only**','**Selected Line Only**');doc=doc.replace('## Navigation',`## This build

This package incorporates tester export revision 24, retaining its images, preferences, and unrelated annotations. Four reviewed flags/notes are cleared and their prompts reset to Unreviewed. The two early west-exit conditions belong to West-Side Resident; Elm’s phone-number condition belongs to Elm. The resident’s later line starts after the Egg handoff, Stage VI onward. Original IDs and the original New Bark Town sourceBaseline/index records are preserved. The before/after corrections and resolved feedback are recorded in reconciliations.

Route 29 adds Outdoors and Northern Gate / Gate Interior. Every dialogue variant in the guide is included (29), and all 53 detailed records are retained with their raw Markdown under the Route 29 town’s sourceRecords. Script files 225/226, level scripts 470/471, text archives 373/374, event files 30/130, and map headers 33/134 remain identified. The new source baseline is separate at sourceBaselines.route29; the original baseline remains unchanged. Shared routines without documented wording are described as events, without invented dialogue.

Static and clock-dependent encounters appear throughout the narrative; time-of-day branches remain separate conditions. The tutorial and Tuscany’s conditional encounters appear under Other Conditions because their narrative timing is unresolved. Selecting a character whose encounters are all unstaged automatically selects Other Conditions. The friend tutorial is accessible through Lyra/Ethan and Marill, with the male-only extra demonstration line filtered correctly.

Dialogue edits preserve both the outer pane scroll and the inner dialogue scroll, clamping only if hiding an editor makes the content shorter. Narrative-stage references in display prose use Roman numerals; original alphabetical IDs and source strings remain in JSON. Prompt participantIds can restrict which characters can access individual conditions of a shared scene while retaining the scene and all existing IDs.

On opening this package, an older browser snapshot is upgraded to the current content. Newer local images, preferences, and annotations are preserved; matching resolved feedback is cleared and changed prompts reset. New notes written after the supplied export remain pending. Press Save Changes to commit the upgraded snapshot. Alternatively, import the included npcdex-agent-export.json. Do not re-import the old export after upgrading.

## Navigation`);fs.writeFileSync('outputs/NPCDex-README.md',doc);
fs.writeFileSync('outputs/npcdex-update-notes.md',`# NPCDex 2.14 — validation notes

All four submitted flags/notes have been reconciled and cleared. These prompts are now Unreviewed:

| Prompt | Change to validate |
|---|---|
| 60-4-0 | Early west-exit dialogue available through West-Side Resident, excluded from Professor Elm. |
| 60-4-1 | Pokégear reminder available through West-Side Resident, excluded from Professor Elm. |
| 60-4-2 | Elm phone-number scene available through Professor Elm, excluded from West-Side Resident. |
| 60-3-2 | Later resident line becomes available after the Egg handoff, Stage VI onward. |

Route 29 is added with 29 dialogue variants and 53 preserved source records. Its unresolved clock/day/badge and tutorial conditions remain explicitly identified. Research evidence labels are separate from tester verification; new Route 29 prompts are Unreviewed.

Pending UI changes applied: dialogue scroll retention, Selected Line Only label, and Roman numeral narrative references. Original source IDs, unrelated annotations, and assigned images are retained. Resolved feedback remains in the reconciliation history for future comparison, while the active flags/notes are cleared.
`);

const fs=require('fs'),assert=require('assert');
const d=JSON.parse(fs.readFileSync('outputs/npcdex-data.json','utf8')),old=JSON.parse(fs.readFileSync('work/data-before-planning.json','utf8'));
for(const key of ['towns','annotations','characterImages','index','sourceBaseline','sourceBaselines','reconciliations'])assert.deepEqual(d[key],old[key],key+' changed unexpectedly');
d.romReversalResolutions=d.romReversalResolutions||{};d.exportSchema='NPCDexAgentExport/2';d.changeRequests=[];d.romReversalRequests=[];d.changeFormat={version:1,intents:['FINAL','UPDATE','REMOVE'],verificationScope:'Consecutive speaker prompt',history:'Before/after JSON-pointer patches; undo appends a reversal',receipts:'NPCDexImplementationReceipt/1'};
for(const name of ['npcdex-data.json','npcdex-agent-export.json'])fs.writeFileSync('outputs/'+name,JSON.stringify(d,null,2));
for(const name of ['npcdex-template.html','npcdex-change-engine.js','npcdex-planning-ui.js'])fs.copyFileSync('work/'+name,'outputs/'+name);
const readme=`# NPCDex · Version 2.16

Open **npcdex.html** in Chrome or Edge. Extract the ZIP into a dedicated folder first. The app works offline and includes New Bark Town and Route 29, with all existing source IDs, images and tester feedback preserved.

## Navigation and review

The familiar three panes remain: Maps, the tile inventory, and dialogue above the timeline. Expand a map, then a building, to reach its rooms/floors. The master player selector controls gender variants throughout the engine. At town level the inventory groups Characters, Elements and Scenes; the inventory cog can enable Sort by Sub-Area. Selecting a building or room filters encounters to that location. Each entry shows its Location and access conditions, including uncertainty.

Available dialogue entries now appear as a clickable list beside the dialogue pane. Double-click a label to rename it; Enter commits and Escape cancels. Source labels, IDs, script references and original dialogue remain intact. Click a passage to select it. A speaker's multi-part text scrolls; Previous/Next changes speaker turns in a scene. The Sequence Overview shows each verification badge on its own line.

Flags and notes apply to the whole current speaker prompt by default. **Selected Line Only** restricts feedback to the selected passage. Verified and Inaccessible always apply to the current complete speaker prompt; another speaker/turn is independently reviewed. Inaccessible counts as investigated, without implying a coding error. Critical is available in the flag menu and settings. Ordinary flags and notes remain yellow; Critical is red.

## Decisions and tile indicators

Use the existing cog on any tile to choose **FINAL**, **UPDATE**, **REMOVE**, or leave its decision unset. The dialogue header's cog targets the current speaker prompt; Condition Notes targets the complete entry. UPDATE/REMOVE require Change Instructions. Proposed dialogue is stored separately until implementation. Characters in shared scenes require an explicit decision to retain other participants or update shared scenes. Parent decisions can be inherited, with more specific decisions overriding them.

- **Green:** every active descendant is FINAL, tested as Verified/Inaccessible, with no unresolved flags or notes.
- **Yellow:** untagged or UPDATE content, unresolved ordinary feedback, or unfinished testing.
- **Red:** pending REMOVE content or a Critical flag.

Each tile and dialogue-list entry has a small inset node in a consistent top-left position. Rollups include hidden gender variants, conditions and shared references. Deletions remain red until implemented and reconciled; archived records are then excluded from active readiness. A FINAL label alone does not mean testing is complete. No color key was added to the main screen.

## Names and images

Character settings include NPC Name and Link to Existing NPC. A shared identity carries its display name and image across regions, including separate Lyra/Ethan profiles. Display renaming preserves original character IDs and script evidence. Linking is explicit; merely typing the same name does not merge characters. Generic characters keep distinct qualified names, such as New Bark Town Officer.

Images fill tiles. Uploads and URL images are embedded in the saved export; URL downloads require the host to allow browser access. A regional image override remains available. Existing conflicting regional images are preserved. Tile settings retain flags and notes alongside these fields.

## Saving and reconciliation

**Save Changes** overwrites **npcdex-agent-export.json** in the selected package folder and commits a browser-local snapshot. On first save choose the dedicated extracted folder, not the protected Downloads root, then press Save Changes again. The location is remembered when browser permissions permit. Save errors retain edits. Manual snapshot download is available if folder access is unsupported. The save light is green after saving and blinks red for pending edits.

Give the latest saved Agent Export to the coding agent. UPDATE/REMOVE requests contain stable references, baselines, hashes and instructions. The agent implements approved changes in the ROM project and returns an implementation receipt. Import it in Data, review the preview, then Apply. A receipt makes implemented content current, archives removed records, clears only explicitly reconciled unchanged feedback and resets affected prompts for tester validation. NPCDex does not write the ROM itself.

**Change History**, available in Data and Flags, Notes & Changes, records before/after edits including labels, images, identities, annotations, proposals, imports and receipts. Undo appends a reversal and protects later conflicting edits. Undoing an implemented change restores dex data and exports a separate request to reverse the real ROM change. See **NPCDex-Agent-Workflow.md** for exact receipt formats and fallback rules.

## Existing content and compatibility

New Bark Town preserves the corrected house hierarchy: Elm's Lab with its family residence upstairs, the player's house, the southwest resident's house and the southeast friend's house. The friend changes with player gender. The old family-house alias/map 62 remains preserved for reconciliation. Existing revision-24 tester corrections remain logged in reconciliations; no previous feedback is silently removed by this interface update.

Route 29 retains 29 documented dialogue variants and 53 raw source records, with separate source baseline and script metadata. Unresolved clock/day/badge/tutorial conditions stay explicit. Narrative stages display Roman numerals in order, with correctly capitalized chapter headings; backend alphabetical stage IDs and source prose remain stable.

Older local snapshots migrate while preserving images, preferences and later annotations. Save Changes commits the upgrade. Dialogue feedback edits preserve scroll positions. Panel headings use Title Case. All data strings remain escaped when displayed.

## Agent maintenance

The HTML is self-contained. Accompanying template and JavaScript files are editable build sources; they are not required to run it. Start content changes from the latest saved export. To embed it directly, run:

\`\`\`sh
node update-npcdex.cjs npcdex-agent-export.json npcdex.html
\`\`\`

For interface changes edit the template/modules, update npcdex-data.json from the latest export, then run **node build-npcdex.cjs**. Read NPCDex-Agent-Workflow.md before changing mappings or implementing ROM requests.
`;
fs.writeFileSync('outputs/NPCDex-README.md',readme);fs.writeFileSync('outputs/README.md',readme);
let notes=fs.readFileSync('outputs/npcdex-update-notes.md','utf8');notes='# NPCDex 2.16 — update notes\n\nThe existing layout is retained. Added dialogue-list selection and safe display-label renaming; FINAL/UPDATE/REMOVE decisions and inherited readiness nodes; Critical flags; shared NPC name/identity settings; hashed agent change requests; previewed implementation receipts; and immutable before/after history with conflict-safe undo and ROM reversal reporting. Panel/timeline capitalization and standalone verification badges are corrected.\n\nVerified in a live Chrome test: renaming/cancel/undo, severity and all-gender readiness, shared names and images, atomic settings rollback, report generation during concurrent edits, receipt application and source restrictions, deletion archiving and undo, ROM reversal confirmation, overwrite saving, IndexedDB reopening, legacy migration, import history/undo, responsive widths 320–1440, and absence of browser script errors. Original towns, source baselines, script index, annotations and image data were compared with 2.15 and are unchanged in this package.\n\nNative folder-picker behavior depends on browser permissions; persistence tests use a folder adapter writing the real export file. The app previews and records receipts but does not access or modify the ROM.\n\n## Previous content corrections\n\n'+notes;
fs.writeFileSync('outputs/npcdex-update-notes.md',notes);console.log('Package sources/docs ready; original content and evidence unchanged');

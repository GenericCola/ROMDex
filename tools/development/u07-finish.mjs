import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const hash=b=>createHash('sha256').update(b).digest('hex'),base=JSON.parse(await fs.readFile('work/u07/baseline.json')),qa=JSON.parse(await fs.readFile('outputs/U07-Verification.json'));
assert.equal(qa.errors.length,0);assert.equal(qa.checks.length,12);
for(const f of base.files){assert.equal(hash(await fs.readFile(base.original+'/'+f.path)),f.sha256);assert.equal(hash(await fs.readFile(base.backup+'/'+f.path)),f.sha256);}
for(const f of JSON.parse(await fs.readFile('outputs/U06-Patch-Manifest.json')).files)assert.equal(hash(await fs.readFile('outputs/ROMDex-v0.4.1/ROMDex/'+f.path)),f.sha256);
const cipher=JSON.parse(await fs.readFile('work/u06/credential-integrity.json'));assert.equal(hash(await fs.readFile(cipher.path)),cipher.sha256);
const changed=[];for(const name of ['npcdex-template.html','npcdex.html','ROMDex-Integration.md']){const bytes=await fs.readFile(base.target+'/'+name);changed.push({path:name,bytes:bytes.length,beforeSHA256:base.files.find(f=>f.path===name)?.sha256||null,sha256:hash(bytes)});}
let syntax=0;for(const name of (await fs.readdir(base.target)).filter(n=>/\.(cjs|js)$/.test(n))){new vm.Script(await fs.readFile(base.target+'/'+name,'utf8'),{filename:name});syntax++;}new vm.Script((await fs.readFile(base.target+'/npcdex.html','utf8')).match(/<script>([\s\S]*?)<\/script>/)[1]);syntax++;
await fs.writeFile('outputs/U07-Change-Manifest.json',JSON.stringify({task:'U07',verifiedAt:new Date().toISOString(),protectedOriginalFiles:base.files.length,sourcePackageUnchanged:true,sourcePackage:base.original,workingCopy:base.target,changed,syntaxChecks:syntax,uiChecks:qa.checks.length,romDexInstallationUnchanged:true,credentialCiphertextUnchanged:true,productionWrites:false},null,2));
const report=`# U07 — Relocate NPCDex Controls

Completed October 15, 2026 under its task-specific PASSKEY.

## Delivered

- Flags & Notes is beneath the Maps heading in Tray 1, above its selectors.
- Male/Female is in the Inventory header in Tray 2, immediately left of its settings cog. The group keeps its accessible player-character name.
- Data is inside Inventory Settings and opens the existing Content & Saving interface. Inventory Settings closes first so the dialogs do not stack.
- Inventory Settings retains Sort by Sub-Area and uses the exact approved Standard Settings Icon: 12 px artwork centered in an 18 px circular frame. Decorative title circles agree with U06: red → yellow → green.

Existing control IDs, gender handling, annotation flushing, imports, exports, receipt workflow, history, save destination and local persistence are retained. This task changes their access points and related layout; it does not migrate data or enable cloud saves.

## Verification

All **12 focused browser/preservation checks** passed, with **${syntax} script syntax checks** including the assembled application. Checked keyboard activation, flags/history, gender preference, grouping, Data capabilities, first-save flow, exact SVG bytes/centering and five widths. No browser script errors. The 84 px header and desktop tray allocation remain intact. Isolated before/after builds hydrated current saved revision ${qa.savedRevision} identically.

[Verification](U07-Verification.json), [visual review](U07-Controls-QA.png), [change manifest](U07-Change-Manifest.json).

## Delivery and Data Boundary

The canonical NPCDex integration working copy is **outputs/NPCDex**. It is staged for U08, which connects it to the ROMDex workspace host. No refresh/restart or separate NPCDex launch is needed for U07; the running ROMDex frontend remains U06.

The Downloads package is unchanged. All ${base.files.length} original package files were copied into **U07-Before** and hash-verified. The saved export, data JSON and every non-UI module in the working copy remain byte-identical. ROMDex's installed U06 patch and remembered credential ciphertext are unchanged; no production YouTrack writes or browser save writes occurred.

The original packaged dataset is revision 64; the authoritative saved export is revision ${qa.savedRevision}. U07 deliberately preserves both. The current saved export was used in isolated QA, not silently promoted into a new live save. U08 must refresh the latest saved content before adoption and preserve newer work. See [integration notes](NPCDex/ROMDex-Integration.md). No Git repository is present, so this is a recorded change set rather than a Git commit.

## New Feature Scheduled

**U10F — Desktop File Drop Attachments**, Sol / High, is added after U10 and before U11. External Explorer/desktop files dropped on a Work Pane ticket will use the existing attachment validation, durable upload queue and native YouTrack delivery. The task will distinguish external files from hierarchy drags and verify offline/Auto-Sync Off, multiple files, recovery and validation. [Scope](Desktop-File-Drop-Attachments-Plan.md). It requires its own PASSKEY; no interim drop implementation was added here.

**Next: U08 — Tool Switching and Preserved Workspace Context, Sol / High.** It remains pending and requires a new PASSKEY.
`;
await fs.writeFile('outputs/U07-Completion-Report.md',report);
let checklist=await fs.readFile('outputs/NPCDex-ROMDex-Action-Checklist.md','utf8');checklist=checklist.replace('- [ ] **U07 — Relocate NPCDex Controls** — Sol / Medium.','- [x] **U07 — Relocate NPCDex Controls** — Sol / Medium. Completed October 15; [report](U07-Completion-Report.md).');await fs.writeFile('outputs/NPCDex-ROMDex-Action-Checklist.md',checklist);
let plan=await fs.readFile('outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md','utf8');plan=plan.replace('S01 and U06 are complete in ROMDex 0.4.1 + U06; U07 and remaining work require separate PASSKEYs.','S01/U06 are complete in ROMDex 0.4.1 + U06; U07 is complete in the staged NPCDex integration copy. U08 and remaining work require separate PASSKEYs.');plan=plan.replace('Next implementation boundary: **U07 — Relocate NPCDex Controls, Sol / Medium**, under a new PASSKEY.','Next implementation boundary: **U08 — Tool Switching and Preserved Workspace Context, Sol / High**, under a new PASSKEY.');plan=plan.replace('| U07 | Relocate NPCDex Data, Male/Female, and Flags & Notes to the confirmed homes.','| U07 | **Complete:** relocate NPCDex Data, Male/Female, and Flags & Notes to the confirmed homes; [report](U07-Completion-Report.md).');await fs.writeFile('outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md',plan);
const decision=`\n\n## U07 — Completed October 15, 2026; File Drop Scheduled\n\nU07's PASSKEY authorized NPCDex control relocation. Flags & Notes is above Tray 1 selectors; Male/Female is immediately left of the Inventory cog in Tray 2; Data opens from Inventory Settings. The working source is **outputs/NPCDex**, staged for U08 integration. All 12 focused browser/preservation checks and ${syntax} syntax checks passed; original Downloads files, current saved export and ROMDex credentials/installation remain unchanged. Current saved revision ${qa.savedRevision} was used only in isolated before/after QA; the packaged dataset remains untouched. [Report](U07-Completion-Report.md).\n\nThe user requested Explorer/desktop file drops onto tickets, permitting deferral to avoid duplication. Schedule **U10F — Desktop File Drop Attachments, Sol / High**, immediately after U10's native host/file adapters and before U11. Reuse existing attachment queue and validation; preserve hierarchy dragging. [Feature scope](Desktop-File-Drop-Attachments-Plan.md). Separate PASSKEY required.\n\nNext: **U08 — Tool Switching and Preserved Workspace Context, Sol / High**, awaiting its own PASSKEY.\n`;
for(const file of ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Unified-App-Scope.md','NPCDex-ROMDex-Decision-Log.md'])await fs.appendFile('outputs/'+file,decision);
console.log(JSON.stringify({completed:'U07',uiChecks:qa.checks.length,syntaxChecks:syntax,protectedFiles:base.files.length,modifiedUIFiles:2,workingCopy:base.target,nextTask:'U08',fileDropScheduled:'U10F'}));

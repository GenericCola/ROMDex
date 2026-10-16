import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.2-Manifest.json')),ui=JSON.parse(await fs.readFile('outputs/U08-UI-Verification.json')),live=JSON.parse(await fs.readFile('outputs/U08-Live-Verification.json'));
assert.equal(live.version,'0.4.2');assert.equal(live.serviceBuildMatches,true);assert.equal(ui.errors.length,0);
const report=`# U08 — Tool Switching and Preserved Workspace Context

**Completed:** October 15, 2026, under the task-specific PASSKEY. **Running build:** ROMDex 0.4.2, confirmed after the user's launcher restart.

## Result

The small red header button now switches between working ROMDex and NPCDex workspaces. The shared title identifies the active tool. Selecting a workspace closes the menu; ESC and clicks in either workspace dismiss it. No footer is allocated.

Both trusted first-party workspace documents remain mounted. Switching hides a view rather than navigating, reinitializing or serializing its editors. Selection, scope, expanded hierarchy, filters, scroll, pane layout, Details context, checkbox selection and unfinished text remain in their running view. Focus and input selection are restored. Native edit dialogs stay open within their workspace and keep unapplied form values. Switching does not apply, cancel, publish or save those drafts. A failed load retains the current view and supports retry.

ROMDex's existing YouTrack queue keeps running in its retained view. NPCDex uses the U07 control locations, the exact Standard Settings Icon and its existing manual local-save workflow. The header forwards manual Save to native tasks and an opened NPCDex workspace; Auto-Sync continues controlling the existing native queue and remains Off after a manual save. NPCDex's unsaved local content also lights the shared Save button red. The formal durable shared coordinator remains U09; NPCDex cloud synchronization remains later work. Tooltip/About/Connection text distinguishes these current capabilities.

## Current Data and Persistence

The NPCDex first-launch baseline is the exact latest saved export, revision **72**, captured from the authoritative Downloads package. [Adoption preview](U08-Data-Adoption-Preview.json) records its hash and counts. Every field is included, including stable IDs, images, annotations, preferences, requests, receipts and history. The generated embedded data was compared against the original parsed export with full deep equality.

NPCDex's integrated browser save uses a separate stable database, **ROMDex-NPCDex**, preserving the old standalone NPCDex database. Existing integrated saves take precedence on later launches. ROMDex retains its existing database/profile and remembered YouTrack connection. Workspace context preservation is within the running app; fresh ROMDex launch still selects All Tasks. U08 does not claim crash recovery for every uncommitted form, cross-computer view transfer or NPCDex cloud migration.

The original Downloads files, saved export, original 0.4.1 ZIP and installed 0.4.1 frontend remain unchanged. All 77 pre-U08 packaged files are preserved in **U08-Before**. The saved token's encrypted bytes remain unchanged; no token is embedded in the package. The release does contain private project/NPC content and is a local private deliverable.

## Verification

- **${manifest.testsPassed} automated tests** passed.
- **${ui.checks.length} focused workspace/browser checks** passed: scopes, comments/cursor, filters, multi-selection, scroll, pane expansion, both tools' modal drafts, menu dismissal, shared control routing and five viewport widths.
- The real packaged service passed isolated no-token startup, workspace-load failure/retry, repeated switching, fresh-launch behavior and content-policy checks. NPCDex's existing URL-image import works under the new policy, verified using an intercepted image fixture without an external download.
- **${manifest.syntaxChecks} JavaScript/module syntax checks** and **${manifest.fileCount} ZIP-entry hashes** passed. Credentials/private runtime files are excluded.
- Live GET-only verification confirmed the running installation identity/build, remembered connection, unchanged credential ciphertext and **${live.servedAssetsVerified} served assets** matching the release.

[UI verification](U08-UI-Verification.json), [service checks](U08-Service-Verification.json), [preservation checks](U08-Preservation-Verification.json), [live verification](U08-Live-Verification.json), [visual review](U08-Combined-Workspace-QA.png), [release manifest](ROMDex-v0.4.2-Manifest.json).

NPCDex's large inline application script was externalized into a local asset so script-src remains self-only. Only the two workspace pages allow same-origin framing; the shell disallows framing. The NPCDex page retains credential-free HTTP/HTTPS URL-image retrieval under its scoped policy. No arbitrary workspace URLs, cross-window command bridge or new filesystem privilege was added.

## Handoff

The active installation is **outputs/ROMDex-v0.4.2/ROMDex**. Use its Start-ROMDex.cmd for future launches; canonical source remains **outputs/ROMDex**, with the U07 NPCDex source copy at **outputs/NPCDex**. [Workspace guide](ROMDex-v0.4.2/ROMDex/U08-Workspace-Guide.md). No further restart is needed. This workspace has no Git repository; the verified release and manifest record the change set.

**Next: U09 — Shared Save and Auto-Sync Coordination, Sol / High.** Move ownership toward the approved shared durable/headless coordination model, retaining manual Save while Off and independent provider failures. U09 has not begun and requires a new PASSKEY. **U10F — Desktop File Drop Attachments** remains scheduled after U10.
`;
await fs.writeFile('outputs/U08-Completion-Report.md',report);
let checklist=await fs.readFile('outputs/NPCDex-ROMDex-Action-Checklist.md','utf8');checklist=checklist.replace('- [ ] **U08 — Tool Switching and Preserved Workspace Context** — Sol / High.','- [x] **U08 — Tool Switching and Preserved Workspace Context** — Sol / High. Completed October 15 in ROMDex 0.4.2; [report](U08-Completion-Report.md).');await fs.writeFile('outputs/NPCDex-ROMDex-Action-Checklist.md',checklist);
let plan=await fs.readFile('outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md','utf8');plan=plan.replace('S01/U06 are complete in ROMDex 0.4.1 + U06; U07 is complete in the staged NPCDex integration copy. U08 and remaining work require separate PASSKEYs.','S01 and U06–U08 are complete; the current combined browser build is ROMDex 0.4.2. U09 and remaining work require separate PASSKEYs.');plan=plan.replace('Next implementation boundary: **U08 — Tool Switching and Preserved Workspace Context, Sol / High**, under a new PASSKEY.','Current combined build: [U08 / ROMDex 0.4.2](U08-Completion-Report.md). Next implementation boundary: **U09 — Shared Save and Auto-Sync Coordination, Sol / High**, under a new PASSKEY.');plan=plan.replace('| U08 | Add switching between both workspaces while preserving selection, navigation, scroll, filters, pane sizes, and unfinished edits.','| U08 | **Complete in 0.4.2:** switching between retained workspaces preserves selection, navigation, scroll, filters, pane sizes, and unfinished edits; [report](U08-Completion-Report.md).');await fs.writeFile('outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md',plan);
const decision=`\n\n## U08 — Completed October 15, 2026; Combined Browser Build 0.4.2\n\nThe authorized task connected ROMDex and NPCDex through the red header menu. Separate retained documents preserve scopes, filters, scroll, checkbox selection, pane layout, cursor positions, unfinished text and open modal forms. Workspace switches do not commit drafts. NPCDex's embedded first-launch baseline exactly matches the current saved revision 72; the old standalone database, Downloads package and exported save remain preserved. A distinct integrated NPCDex browser database avoids silently adopting an unrelated old-origin save.\n\nThe user launched **outputs/ROMDex-v0.4.2/ROMDex** and live GET-only verification confirmed version/build/installation identity, remembered YouTrack connection, unchanged credential ciphertext and ${live.servedAssetsVerified} served assets. Passed ${manifest.testsPassed} automated tests, ${ui.checks.length} browser checks, ${manifest.syntaxChecks} syntax checks, real-service content-policy/failure/retry/image-import checks and ${manifest.fileCount} package hashes. [Completion report](U08-Completion-Report.md), [live record](U08-Live-Verification.json).\n\nThe header temporarily forwards existing manual save actions; NPCDex remains manual/local and its cloud connection is not claimed. U09 supplies the formal shared durable/headless coordinator. **Next: U09 — Shared Save and Auto-Sync Coordination, Sol / High**, under a new PASSKEY. U10F file-drop attachments remains after U10, before U11.\n`;
for(const file of ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Unified-App-Scope.md','NPCDex-ROMDex-Decision-Log.md'])await fs.appendFile('outputs/'+file,decision);
console.log(JSON.stringify({completed:'U08',runningVersion:live.version,tests:manifest.testsPassed,uiChecks:ui.checks.length,next:'U09',model:'Sol / High'}));

# U01 — Baseline Inventory and Protected Backups

**Completed:** October 14, 2026.  
**Authorization:** User PASSKEY for checklist creation and the first task.  
**Snapshot capture:** 2026-10-14 15:22 EDT (19:22 UTC); subsequent verification and reference captures are recorded individually in the manifest.  
**Checklist:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md).

## Result

Identified and preserved the current working datasets, development sources, running ROMDex release, shared assets, prior selector archive, release packages, and existing receipt contracts. Created a restricted Windows backup folder and verified all 165 captured files against SHA-256 hashes. No application code, original save, credential, setting, or YouTrack issue was changed. The only new files are planning/checklist documents, backup helpers, and the backup itself.

**Backup:** [U01 Baseline Folder](U01-Baseline-2026-10-14-01/)  
**Manifest:** [manifest.json](U01-Baseline-2026-10-14-01/manifest.json)  
**Captured file bytes:** 93,940,999 (about 94 MB; includes duplicate source/reference copies and release ZIPs). This is not the proposed cloud dataset size.

## Authoritative Locations

| Asset | Current Authority | Baseline Finding |
| --- | --- | --- |
| NPCDex working package | `C:/Users/mrgen/Downloads/npcdex-v2.42` | User confirmed latest work is saved in the package extracted to Downloads. |
| NPCDex current save | Working package's `npcdex-agent-export.json` | Revision **72**, saved October 14 at 15:19 EDT; `NPCDexAgentExport/2`, content revision 8. |
| NPCDex development source | `C:/Users/mrgen/Documents/Codex/2026-10-12/use/outputs` | 2.42 source/build files retained; its Agent Export is older revision **64** and is not the migration authority. |
| ROMDex canonical development source | `C:/Users/mrgen/Documents/Codex/2026-10-13/can/outputs/ROMDex` | Version 0.3.0. Service identity matches the running release's code. |
| ROMDex running installation | `C:/Users/mrgen/Documents/Codex/2026-10-13/can/outputs/ROMDex-v0.3/ROMDex` | Matched the live service installation ID; all **49** release ZIP files match the captured installation. |
| ROMDex durable private profile | `C:/Users/mrgen/AppData/Local/ROMDex/thegobindsingh-PMON` | Shared across builds; contains workspace backup, assigned statuses, operation journal, sync settings, profile marker, and encrypted connection. |
| YouTrack task authority | `thegobindsingh.youtrack.cloud`, PMON | Native issues remain the authority for server-owned task fields. This baseline is a local application/profile backup, not a full YouTrack account backup. |
| Shared UI assets | `outputs/Tool-Suite-UI` | Standard Settings Icon SVG and its reuse documentation captured. NPCDex favicon is embedded in HTML; ROMDex's extracted copy is in `public/npcdex-pokeball.svg`. |
| Historical selector design/data | `outputs/ROMDex-Selector-Archive-2026-10-13` | Preserved in the baseline; 287-item historical snapshot, not current task authority. |

Current development/running executable and frontend sources match. Running-installation-only references are `REVISION-PLAN.md`, `preview.png`, and `mobile-preview.png`; they do not indicate a behavioral code difference. Editing canonical development files will not automatically change the extracted release currently being served. Each later task must deliver/launch the intended changed build using the same persistent profile.

## Dataset Inventory

### NPCDex — Working Export, Revision 72

- 4 top-level town/workspace records.
- 44 change plans, 6 exported Change Requests, 145 history records.
- 85 annotations, 15 character-image entries, 2 source-baseline entries.
- 0 applied implementation-receipt records in this saved export.
- Current export size: **13,221,699 bytes** (about 13.2 MB), including its embedded data/assets. U03 must assess the real structured dataset and assets against free-service limits rather than using the size of this duplicate-filled backup folder.
- The older development export has 39 plans, 124 history records, and 76 annotations. Replacing the working save with that export would discard newer work.
- The dataset's numeric `build` property is a data-format value; the app release is established from the 2.42 package/source notes rather than misreading that property as the app version.

### ROMDex — Persisted Service Workspace at Capture

- 293 remote issue records; **0 pending operations**, no blocked conflict.
- 97 manual-order keys; 0 currently assigned selector-image entries.
- 306 assigned-status records and 357 operation-journal entries. Their counts are retained exactly; do not remove historical entries merely because they exceed current issue count.
- Shared profile contains `profile.json`, `workspace.json`, `assigned-statuses.json`, `journal.json`, `sync-settings.json`, and `connection.encrypted`; all six were captured.
- Live status reported connected, remembered connection present, Auto-Sync On, and YouTrack available.
- Existing browser storage is `romdex-v1` → `workspace` → `current`, plus the local Auto-Sync preference. The service maintains its workspace copy through the current browser's backup path.

## Contracts and Data Boundaries to Preserve

- NPCDex `NPCDexAgentExport/2` and agent handoff `NPCDexAgentHandoff/1`.
- Integration/implementation receipt `NPCDexImplementationReceipt/1` and ROM reversal receipt `NPCDexROMReversalReceipt/1`.
- Stable record identities, source/script references, source baselines, live mappings, request/baseline hashes, annotations, image identity links, and reversible history.
- Hash inputs use the existing exact JSON structures and key order. All six current requests' baseline and request hashes were independently recomputed and matched.
- Receipt application modifies NPCDex records/history; actual ROM changes and tester verification remain separate.
- ROMDex effective inherited State remains distinct from a parent's saved assigned status. Manual order and tile images are workspace metadata, not YouTrack issue attachments.
- New YouTrack attachment support belongs to R07; issue binaries are not currently included in ROMDex's local model or this profile backup.

## Verification and Protection

- 165 source/profile/reference files copied, then independently re-read and SHA-256 verified.
- 15 captured JSON files parsed successfully; ROMDex remote hierarchy passed existing tree/cycle validation.
- Private profile files were checked before and after the complete profile capture to detect a changing/mixed copy. Capture completed without a mismatch.
- ROMDex release ZIP byte count/hash matched its existing published manifest. All 49 ZIP contents subsequently matched the captured running installation: [release-content-verification.json](U01-Baseline-2026-10-14-01/release-content-verification.json).
- Backup directory inheritance is disabled; access is limited to the current Windows account, SYSTEM, and Administrators. Child files inherit those restricted rules: [backup-security.json](U01-Baseline-2026-10-14-01/backup-security.json).
- The remembered connection was copied and hashed **only as Windows DPAPI ciphertext**. It was never decrypted or printed. It remains tied to the original Windows account/protection context.
- No browser interaction or application test run was needed: U01 changed no application behavior. Accessible browser inventory contained no tabs. Browser IndexedDB and unsaved in-memory editor contents were not independently captured. The user confirmed NPCDex's saved package; ROMDex's captured durable queue was empty. Before any later migration, obtain a fresh saved/settled workspace snapshot rather than assuming this capture still represents all current work.

## Recovery and Later Migration

1. Preserve these backups as recovery material. Never distribute the private profile or current working export as part of an installer/source release.
2. Before restore or migration, save current edits and create a new checkpoint. This October 14 baseline must not automatically replace later work.
3. For NPCDex, use the working-package export from revision 72 as this checkpoint's dataset, not revision 64 or an embedded older HTML seed. Recover into a separate package/profile first, preview through NPCDex's existing Data import workflow, and verify counts/history/IDs before adopting it. Current development sources can be rebuilt only after incorporating the latest approved save.
4. For ROMDex, close browser instances and stop the matching service before any profile restoration. Work from a separate copy initially. Restore the private-profile files together only after comparing current YouTrack state and reviewing journal/queue semantics. Never blindly replay an old operation journal or overwrite native YouTrack edits.
5. Preserve `connection.encrypted` as ciphertext when changing builds on the same Windows account. Another computer/account must establish its own protected connection; do not assume that copying this encrypted file makes its token usable there.
6. Restore source/UI from the matching source or verified release. Local profile restoration does not undo changes already made in YouTrack or in the actual ROM.
7. Refresh the baseline after R08 and again before U12/U15. The future cloud migration must preserve the latest data at that time, including new images, requests, and history.

## Next Approval Boundary

**U01 is complete.** Next proposed task is **R01 — Details Opening and Context-Sensitive TAB**, recommended **Sol / Medium**. Its implementation requires a new PASSKEY. The other tasks remain unchecked.

## R08 Checkpoint Update — October 14, 2026

R01–R07 were subsequently authorized and completed. R08 prepared ROMDex 0.4 and a fresh protected 47-file saved-data/release checkpoint. See [R08 Baseline Update](R08-Baseline-Update.md) for verified contents, capture boundaries and the outstanding final Windows launch check. This supplements the immutable U01 capture; none of its protected files were changed. Refresh current data again before U12/U15.

R08 final launch is verified: ROMDex 0.4.0, unchanged remembered credential ciphertext, healthy Auto-Sync, all 299 original issue IDs, and no pending/blocked work. The protected profile and final ZIP/manifest were refreshed and independently checked after launch; the 47-file checkpoint is complete. Next approval boundary: U02, Sol / High.

# U09 — Engine and Provider Contract

October 15, 2026. This is the implemented browser-stage contract, preparing U10's desktop utility process.

## Ownership

The shell creates one Workspace instance and exposes it to the retained ROMDex view. The view adds UI listeners and flushes accepted notes/title edits; it does not create another queue or clock when embedded. NPCDex initializes on launch too, so a stored recovery draft can affect the shared Save indication before that workspace is selected.

There is one native queue owner per running application. Cross-process/profile single-instance locking remains U11. Browser-stage timers live in the application runtime adapter; closing the browser does not leave a headless worker running. U10 moves the extracted engine into Electron's utility process, and U11 verifies tray/lifecycle behavior.

## Modules

| Module | Responsibility |
| --- | --- |
| public/workspace-engine.mjs | Native task transactions, reconciliation, attachments, settings and explicit sync/tick operations. Requires injected transport and durable storage; files/upload adapters and preference cache are injectable. No DOM, IndexedDB, localStorage, window/document, polling or timeout ownership. |
| public/workspace-runtime.mjs | Browser IndexedDB adapters, preference cache and an injectable clock/lifecycle adapter. It listens for schedule/cancel/backup requests and can start/stop independently. |
| public/store.mjs | Compatibility facade supplying browser defaults to the same engine. Existing standalone task view/tests remain usable. |
| public/save-coordinator.mjs | Provider registration, result aggregation, manual-save coalescing, shared setting access and injected metadata storage. No browser globals/timers. |
| durable-json-storage.mjs | Node storage adapter with serialized writes, flushed temporary file and atomic replacement. Used in headless disk/restart tests; desktop profile adoption remains U10/U12. |
| public/addons/npcdex/coordination.js | Adapter around the existing NPCDex model and manual export. Local recovery uses additional records in its existing snapshots store, with no database version change. |

The engine emits schedule-sync, cancel-scheduled-sync and backup-needed. An injected runtime owns the resulting clocks. Manual sync requested during an automatic send schedules one follow-up cycle; repeated equivalent requests share the same promise. Durable local operations keep their existing operation IDs and server journal semantics.

## Providers and Results

A provider supplies status(), save() and optionally checkpoint(). Registering a second owner for the same ID is rejected. Status reports capabilities separately from current attention/pending work. YouTrack supports native remote synchronization; NPCDex reports cloud:false and automaticRemote:false while supporting local checkpoints and manual exports.

Manual Save starts provider calls before awaiting their results, retaining browser file-permission user activation. Provider failure is captured independently; other providers continue. Repeated Save calls coalesce. A manual override never changes the shared Auto-Sync setting. Coordinator metadata records completed attempt results and is never replayed as an outgoing operation queue. Native/provider journals remain authoritative for accepted work.

Unknown coordinator formats are retained rather than overwritten. Metadata write failures remain visible. The current shared setting is read from the native service; providers do not fabricate cloud connectivity.

## NPCDex Local Recovery

Accepted edits/notes are checkpointed in the existing ROMDex-NPCDex snapshots store as recovery-draft, with the known committed revision/savedAt identity and a complete model snapshot. Matching copies restore as dirty; this does not acknowledge an export/cloud delivery. A mismatched or invalid record is held for human review in Data. Explicit acknowledgement preserves it as held-recovery before proceeding.

The original manual export/file and committed-browser-snapshot order is retained. The adapter awaits completion and any concurrent checkpoint before clearing/replacing recovery state. New edits accepted while an export is pending stay dirty and receive another checkpoint against the newly saved base.

Checkpointing does not apply unrelated modal form drafts. U08 still retains those drafts while switching; U12 must account for them at migration. Local recovery identity checks are not the cloud immutable-commit/branch protocol from U04; that protocol is implemented in U14–U19.

## Migration Boundary

U12 must capture the latest native workspace/queued files and server journal/uploads, coordinator metadata, NPCDex current/export-directory/recovery-draft/held-recovery records, and encrypted connection. A release's embedded data is a baseline, not permission to replace a newer browser/profile save. The old standalone NPCDex database and Downloads package remain intact.

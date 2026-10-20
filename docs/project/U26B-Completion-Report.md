# U26B — Task Manager Responsiveness

**Complete and installed:** October 19, 2026. Targeted responsiveness, draft/checkpoint and shutdown corrections are installed in ROMDex **0.5.15**. The user confirmed warning-free tray Quit, and independent checks verified process exit, relaunch and preserved saves. NPCDex cloud sync remains paused by user request; local saving and task/metadata syncing remain enabled. No installer or whole-save replacement was used.

## What Changed

- Duplicate snapshot and command-response refreshes are coalesced into one animation frame. Connection/status updates still update the header.
- A cached presentation model reuses task materialization and hierarchy when task data, queued operations and manual order are unchanged. Complete task inputs are checked, including notes, attachments, comments and custom fields; source data is never mutated by the cache.
- Selector, Work and Details rendering checks their own dependencies. Status-only and selector-only updates no longer rebuild unrelated panes or force their layout reads.
- Work rows are reconciled by stable identity. Unchanged row/select/input DOM survives an expansion elsewhere instead of replacing the entire table body.
- Collapsed selector branches create descendant cards when first opened, while retaining already-rendered children during the closing animation. Reopening uses current data.
- Selector animation no longer waits 120 ms before starting, and its duration is reduced from 360 ms to 180 ms.
- Hierarchy expansion and scope selection paint before their view preferences finish saving. Saves still use the existing durable transaction; no task edits are delayed or batched. A failed view save restores the latest durable preference and reports the error; an older failed click cannot roll back a newer click.

## Evidence

Read-only inspection confirmed the installed 0.5.15 renderer has the same relevant general change listener, full-panel redraw, full-row replacement, save-before-expansion and delayed selector-animation paths. The isolated native-bridge simulation reproduced eight full renders for four expansion clicks before the correction. The correction coalesces duplicate refreshes and makes the remaining status renders inexpensive.

Median click-to-two-animation-frame measurements follow. Each cell uses four samples with a 300- or 1,000-task synthetic hierarchy. The 60 ms condition deliberately delays isolated file persistence; it is not a claim about the user's disk.

| Tasks | Added Storage Delay | Interaction | Before | After |
| --- | --- | --- | --- | --- |
| 300 | 0 ms | Selector | 122 ms | 80 ms |
| 300 | 0 ms | Work | 489 ms | 286 ms |
| 300 | 0 ms | Details | 280 ms | 334 ms |
| 300 | 0 ms | Status | 66 ms | 94 ms |
| 300 | 60 ms | Selector | 190 ms | 37 ms |
| 300 | 60 ms | Work | 477 ms | 259 ms |
| 300 | 60 ms | Details | 270 ms | 321 ms |
| 300 | 60 ms | Status | 52 ms | 79 ms |
| 1000 | 0 ms | Selector | 465 ms | 89 ms |
| 1000 | 0 ms | Work | 1880 ms | 682 ms |
| 1000 | 0 ms | Details | 431 ms | 529 ms |
| 1000 | 0 ms | Status | 195 ms | 173 ms |
| 1000 | 60 ms | Selector | 557 ms | 79 ms |
| 1000 | 60 ms | Work | 1674 ms | 469 ms |
| 1000 | 60 ms | Details | 433 ms | 502 ms |
| 1000 | 60 ms | Status | 228 ms | 182 ms |

For the final 300-task run without added delay, cumulative JavaScript time in the four Work expansion notifications fell from approximately **1,447 ms to 11 ms**; click/frame latency fell from **489 ms to 286 ms**. At 1,000 tasks that frame metric fell from **1,880 ms to 682 ms**. These are scoped measurements, not a universal speed guarantee. Earlier samples varied with machine load. Creating and painting a large newly revealed set still costs time; row virtualization was not introduced in this correction.

The existing **220 ms single-click guard before opening Details remains**, preserving rename-by-double-click without opening a collapsed tray. Details frame measurements did not show a consistent latency improvement; no such improvement is claimed. This deliberate wait can be revisited separately if the user wants different click/rename behavior.

## Verification and Preservation

- **88 focused regression tests passed:** cache invalidation, hierarchy/status rollup, manual order, selector rules, Work filtering, selection, editor preservation, tray splitting, keyboard routing, Details navigation and bulk hierarchy operations.
- **Nine source UI preservation checks passed:** row/select identity and draft whitespace during snapshots; checkbox selection with collapsed Details; durable queued notes; rename draft and double-click behavior; refreshed lazy selector content; persisted tray resizing; reported/rolled-back view-save failure without changing task edits; search and remote row invalidation; focused clean editors defer incoming text until blur and then refresh.
- **Three changed source-module syntax checks passed.** The actual renderer, DesktopWorkspace and WorkspaceEngine were exercised against an isolated HTTP IPC simulation and file persistence. No credential or remote write was used.
- The targeted renderer corrections are now installed in the existing 0.5.15 build. Its application differs from newer source features, so only U26B changes were transplanted; unrelated U21–U26A source features were not installed. Eight task UI preservation checks and a separate focused-editor check passed against this exact candidate. The first transplant failed an isolated syntax check and was corrected before installation; a later fixture selector ambiguity was corrected without changing app code.

See [verification data](U26B-Verification.json). Private Git backup identity is recorded separately after publication.

**Next: U26C — Isolated Clean RDX Round-Trip Acceptance. Recommended: Sol / High. A new PASSKEY is required; U27 follows that acceptance exercise.**

## Urgent Startup and Save Recovery

A full closed-app Data backup was verified file by file: 148 files, 255,063,611 bytes. The exact installed build reproduced the service crash using an isolated copy without credential access or network requests. A DOMException TimeoutError was recorded as a blocked publication before any remote write slot existed. That hid its dependent local chain from the checkpoint source. The managed-file guard correctly refused to discard 67 plan and 10 review revisions; it remains enforced.

The correction treats transport timeout/abort as retryable unless a sending slot requires uncertain-delivery review. Legacy recovery is restricted to blocked code 23, the exact timeout message, and zero slots; it retains the prior error as recovery evidence. The copy proof preserved all 110 journal entries, the 78 pending operations, 1,091 immutable objects and three encrypted credential files. Only the one incorrectly blocked operation changed delivery state. Startup also retains access to a verified loaded catalog when a newer checkpoint fails; corruption of the accepted generation still fails verification.

All changed installed files and their original versions are hash recorded and backed up separately. The user confirmed the repaired app opens, although slowly. A live read-only check showed the recovery applied, database integrity OK, no blocked/uncertain operation or recorded error, and 81 queued operations after newer edits. A subsequent UI view showed 86 pending. This is **not** evidence of finished cloud delivery.

Additional source checks passed: 22 content recovery/delivery/catalog tests; 21 shared Save/status tests; three actual-shell checks with isolated providers. Shared manual Save coalesces the task/metadata service call, reports the outstanding provider, and keeps Save enabled so another click opens Connection Details without resending. Healthy flowing edits stay green; real offline/review failures remain red. Slow remote history reads remain a live diagnostic item.


## Final Recovery and Temporary NPCDex Cloud Pause

The user explicitly chose to pause NPCDex cloud delivery and retain local saves before a later clean-data RDX workflow test. Delivering or batching the legacy backlog is no longer part of this acceptance. No pending operation was deleted, cancelled, batched or marked delivered. The experimental batching helper was removed from shipping source without use on live data.

The final closed-app backup is `outputs/Protected/U26B-Final-Data-Backup-2026-10-19`: **158 files, 308,593,829 bytes**, each copied file SHA-256 verified. It includes all saves, three working map RDX files and previous generations, editor drafts, queues and Windows-protected connections. It is private local recovery material and was not uploaded to GitHub. The original code is separately preserved in `outputs/Protected/U26B-Before-Final-Repair`.

The final backup's content database passes integrity checking and retains **165 journal entries: 32 committed, one blocked and 132 queued**. The blocked entry reports **Content Attachment Bytes Do Not Match**, with two verified upload slots. This remains a cloud integrity/review issue; it has not been silently retried or declared resolved. Pausing cloud sync prevents further reads/writes for NPCDex, including a manual Save override and new map cloud binding. Existing task and metadata syncing continue. The pause is stored separately from the shared Auto-Sync setting and survives relaunch.

The old shutdown loop combined three problems: background checkpointing retried blocked feedback; draft snapshots could contain undefined optional properties and fail strict JSON serialization; and a blocked delivery entry was excluded from the local overlay, making its dependent history disappear from the proposed RDX checkpoint. The history guard correctly rejected that incomplete checkpoint. Local projection now retains blocked work while cloud publication and editing review gates remain enforced. Checkpointing saves editor drafts without retrying blocked edits, and overlapping provider checkpoints share one operation. Export/history validation is unchanged.

Additional focused evidence: persistent pause/status isolation check; service fixture with local task edit, checkpoint, resume and shutdown and zero external requests; two real-UI draft preservation/reopen checks after a synthetic review rejection; blocked-preview/review-gate regression; and overlapping checkpoint coalescing regression. Installed startup shows **299 tasks** and explicit **Cloud Sync Paused · Local Saves Enabled · 133 Queued Entries Preserved**. Save remains enabled. Final tray Quit/reopen passed as recorded below.

No dataset has been cleared. A clean RDX round-trip test must use an isolated dataset first; replacing existing content still requires a preview that preserves the full backup and avoids unintended archival/deletion of shared NPCD content. U21–U26A features remain source-complete rather than deployed, as documented in their reports. U26B does not change that release boundary.

## Final Installed Acceptance — October 19

The user selected **Quit ROMDex** from the Windows notification-area menu. Independent checks confirmed the ROMDex window was absent and the profile ownership file was released. A consistent closed-app database copy passed integrity checking, retained all **133 pending entries**, and retained the editor draft. No forced termination was used.

ROMDex reopened normally with a new process and the existing saved connection. The native UI confirmed **299 tasks**, **YouTrack Tasks Up to Date**, **ROMDex Metadata Up to Date**, an enabled **Save Changes** button, and **NPCDex Cloud Sync Paused · Local Saves Enabled · 133 Queued Entries Preserved**. Three working map files and the checked YouTrack/GitHub encrypted connection files match the verified backup. No additional code change or redundant regression run was needed for this acceptance.

**U26B was reopened for the warning before exit; that correction is now accepted in the warning-free check below.** The legacy cloud attachment-integrity issue remains preserved and paused for separate review rather than claimed resolved. No data has been cleared. U26C will prove the clean RDX workflow in isolation before any previewed production replacement.

## Shutdown Warning Follow-up

The user confirmed the remaining message was “Wait for the Application Lifecycle Work to Finish.” The native `.rdx` file-open poll calls the list IPC after 1.5 seconds, including after the Quit guard has become active. The original guard rejected even a read-only list call, and the renderer displayed it as an error although shutdown could finish. This warning was missed by checking only process exit and data preservation; U26B was reopened.

The correction sends lifecycle-busy events to pause the poll and prevents in-flight list/inspect responses from opening import UI during shutdown. Polling resumes if Quit fails/cancels. Listing opaque IDs remains safe during the lifecycle gate; inspect, dismiss and stage remain blocked. Four focused checks pass, including normal error visibility and preservation of pending file requests. Installed warning-free Quit acceptance passed as recorded below.

## Warning-free Shutdown Acceptance

The user selected tray Quit in the corrected build and confirmed **“Closed Without Any Error.”** The window and profile ownership file were independently confirmed absent. A consistent closed-app database copy passed its integrity check and retained all 133 queued entries and the editor draft; the task store retained 299 tasks with zero pending task operations. No force termination or cloud-queue reset was used.

Normal relaunch succeeded. The native header showed **Cloud Sync Paused · Local Saves Enabled · 133 Queued Entries Preserved**, tasks and metadata Up to Date, and an enabled Save Changes button. **U26B is complete.** The next task is the separately authorized U26C clean RDX round-trip exercise; current datasets remain intact and the known legacy cloud attachment-integrity issue remains preserved and paused.

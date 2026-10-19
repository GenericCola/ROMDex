# U26B — Task Manager Responsiveness

**Source corrections verified; live recovery in progress:** October 19, 2026. Installed ROMDex remains **0.5.15**, with a minimal three-file startup repair. No installer or whole-save replacement was used. Normal quit and the remaining NPCDex sync duration are still being checked.

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
- The task renderer changes remain source-only. A separately scoped three-file repair was applied to the exact installed 0.5.15 content writer/catalog after the urgent startup report. Native packaged acceptance for the broader source changes remains at the release gate.

See [verification data](U26B-Verification.json). Private Git backup identity is recorded separately after publication.

**Following the U26B recovery gate: U27 — History, Reversal and Verification-Gated Completion. Recommended: Sol / High. A new PASSKEY is required.**

## Urgent Startup and Save Recovery

A full closed-app Data backup was verified file by file: 148 files, 255,063,611 bytes. The exact installed build reproduced the service crash using an isolated copy without credential access or network requests. A DOMException TimeoutError was recorded as a blocked publication before any remote write slot existed. That hid its dependent local chain from the checkpoint source. The managed-file guard correctly refused to discard 67 plan and 10 review revisions; it remains enforced.

The correction treats transport timeout/abort as retryable unless a sending slot requires uncertain-delivery review. Legacy recovery is restricted to blocked code 23, the exact timeout message, and zero slots; it retains the prior error as recovery evidence. The copy proof preserved all 110 journal entries, the 78 pending operations, 1,091 immutable objects and three encrypted credential files. Only the one incorrectly blocked operation changed delivery state. Startup also retains access to a verified loaded catalog when a newer checkpoint fails; corruption of the accepted generation still fails verification.

The three changed installed files and their original versions are hash recorded and backed up separately. The user confirmed the repaired app opens, although slowly. A live read-only check showed the recovery applied, database integrity OK, no blocked/uncertain operation or recorded error, and 81 queued operations after newer edits. A subsequent UI view showed 86 pending. This is **not** evidence of finished cloud delivery.

Additional source checks passed: 22 content recovery/delivery/catalog tests; 21 shared Save/status tests; three actual-shell checks with isolated providers. Shared manual Save coalesces the task/metadata service call, reports the outstanding provider, and keeps Save enabled so another click opens Connection Details without resending. Healthy flowing edits stay green; real offline/review failures remain red. Slow remote history reads remain a live diagnostic item.

# U26B — Task Manager Responsiveness (Source Checks Passed; Live Recovery in Progress)

Reported October 19, 2026. The user clarified that the sluggishness is in **ROMDex Task Manager**, especially expanding/collapsing dropdowns and loading trays. NPCDex is not the reported focus.

Authorized under its own PASSKEY before U27. [Completion report](../History/U26B/U26B-Completion-Report.md). The reported Save/quit/startup failure extends this correction. A minimal three-file repair is applied to installed 0.5.15, with a complete verified Data backup. Further responsiveness and shared Save changes remain source-only. Recommended model/effort: Sol / High.

## Investigation

Measure click-to-paint latency, long main-thread work, render counts and local IPC/storage latency with a current-data-shaped isolated task tree. Compare quiet and active synchronization. Measure selector disclosures, Work Pane expansion/collapse, item selection/Details loading, and tray resizing. Preserve selections, expansion state, edits and attachment/comment loading behavior.

Initial source inspection found candidates, not a measured root cause: the general render path updates selectors, Work Pane and Details together; preferences use the full workspace transaction/persistence path; status changes emit the same general change event. Establish which path actually blocks interaction before optimizing. Inspect both installed 0.5.15 and current source where relevant; do not confuse unreleased NPCDex fixes with the reported Task Manager problem.

## Acceptance

- Record before/after timings and eliminate measured redundant work from the affected interactions.
- Keep expansion/collapse and tray loading responsive without losing durable state or delaying actual saves indefinitely.
- Retain current hierarchy/status logic, selected items, checked items, scroll, drafts and sync behavior.
- Use focused regression and one compact UI performance run; avoid repeated broad suites and unnecessary Windows restarts.
- Do not upload user saves or credentials for profiling. U26B implementation was authorized by its own subsequent PASSKEY; U27 remains separately gated.

## Urgent Live Recovery

The user reported a prolonged manual Save, red attention despite Auto-Sync On, failed tray Quit, and service exit (1) after ending the process. A copied profile reproduced a blocked prewrite DOMException timeout that hid a dependent queue from the checkpoint source; the retained map history guard correctly refused the resulting regression. Recover only the exact legacy prewrite failure with no recorded write slots. Preserve all immutable content and sending-slot review protections, and retain launch access to a verified catalog if a newer checkpoint needs recovery. Verify normal launch/quit and investigate the remaining cloud read duration; do not declare queued edits delivered.


## October 19 Acceptance Scope Update

The user authorized pausing NPCDex cloud sync, preserving a complete backup and retaining local saving so U26B can close before isolated clean RDX acceptance. Do not drain, batch, cancel or silently reset the legacy cloud backlog to finish this task. The persistent pause is NPCDex-only; task and organization-metadata sync remain enabled. U26B still requires installed normal Quit/reopen acceptance. The clean dataset exercise is U26C before U27, with production replacement separately previewed after success.

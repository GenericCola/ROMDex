# ROMDex 0.4.1 — S01 QA Report

Prepared October 15, 2026 under the user's S01 PASSKEY. The R08 report below is historical; S01 supersedes its native-attachment-deletion exclusion.

- **227 automated tests passed**, zero failures/skips. Tests cover scoped attachment deletion, matching-name neighbors, native metadata changes, permission rejection, interrupted responses/restart, cancelled/stale replay, operation-target binding, manual save while Off, confirmed-removal cache refresh and startup-scope preservation.
- Isolated browser verification passed 11 focused checks: default All Tasks; in-session scope retention; reload behavior; paperclip stroke/size; closing a removed file's preview; cancelled confirmation; paused queue; cancel deletion; manual deletion preserving other files/Off; last-file paperclip removal; shared Details list refresh. No page errors or production writes were involved.
- Existing native files remain visible until removal is confirmed. Queued uploads retain Cancel Upload; native files use Delete/Cancel Deletion. Delete names its file/ticket and preserves the ticket and other files. Already-completed deletion cannot be undone by cancelling a retry.
- The icon uses the same 12 × 14 px footprint and muted color as Notes, with a lighter one-unit stroke. The footer switcher and decorative-circle order remain U06 work.
- Source backup: `S01-Before`, containing 69 allowlisted baseline files with verified source/installed hashes; no private profile was copied. Original release ZIPs and protected U01/R08 checkpoints remain intact. The remembered credential is checked by ciphertext hash only.

Live running-build/connection verification follows the requested switch to 0.4.1; see the external S01 completion report for its final result. No production file is used for destructive QA. Native updates use optimistic metadata checks, not an atomic server editing lock; a native edit can still race a REST DELETE between preflight and dispatch.

## Historical 0.4.0 — Final QA Report

Reviewed October 14, 2026 under the user's R08 PASSKEY.

## Requirements Review

| Request / Clarification | Result |
| --- | --- |
| Full Edit menu and all editable PMON fields/tags | Implemented; eligible assignment/unassignment, dates/clearing, tags, Type, Kanban, estimation and numeric values verified against real YouTrack. Spent Time is read-only; Stage reflects its unconfigured choice list. |
| Ticket files, viewing and paperclip after Notes | Implemented; real image/text uploads and original-byte downloads matched SHA-256. Native additions/removals and uncertain/restart recovery have controlled-provider coverage. |
| Reopen collapsed Details only from names | Verified; checkbox/notes/paperclip actions preserve pane size. |
| Context-sensitive TAB | Verified name indentation, multi-selection grouping, normal form navigation, and all three Details modes. |
| Dense rows, checkbox selection and sibling grouping/moves | Fixed gutter and triangle/light/name/icons/ID layout; 36 px rows. Grouping/complete subtrees, mixed-parent rejection, stable order, retries and 1,000-item batching covered. |
| Compact text selectors, preserve saved images | 48 px tiles, no picture area; cog/settings and saved images retained. |
| One open path, four-tier depth boundary after Saga addition | Verified two Epic paths are mutually exclusive; Verse tiles do not expand and deeper tasks remain in Work. |
| Add Item/filter toolbar, colors and Title Case | Verified labels, filtering/grey-red indicator, left-aligned tags and 29 px toolbar actions. |
| ESC retains selector scope; status order/purple inheritance | Verified selection-first ESC and pane toggle; full status/rollup suite covers all-grey, blue/green and red-over-purple precedence. |
| Remembered token and working data across builds | New 0.4 installation/build identity verified, saved connection and Auto-Sync retained, encrypted credential bytes unchanged, 299 original issues and no pending/blocked actions. Protected checkpoint refreshed after launch. |

## Fixes Found in This Pass

- A multipart request arriving after cancellation could recreate private staged bytes. Terminal upload journal entries now reject late staging, with client handling and a service regression check.
- Expand/Collapse toolbar controls differed from Add/Filter by half a pixel. Their height/minimum is now uniformly 29 px.
- Updated hierarchy/editor and upgrade documentation that still described the old three-tier selector or hover Rename action.

## Automated and Isolated UI Checks

The final extracted package passes 207 tests with zero failures/skips. It covers fields, conflicts, statuses, keyboard routing, selection, hierarchy, pending work, credential/profile migration, partial group/tag recovery, exact file bytes, permissions, metadata pagination, uncertain uploads, cancellation and stale replay. All 51 packaged JavaScript modules pass syntax checks, and the PowerShell launcher parses successfully. An extracted isolated service starts without a token, reports version 0.4.0, and serves all 28 public assets with matching hashes without touching the live profile.

Focused combined browser checks verified named sibling grouping with spaces, files retained on grouped children, no grouped task leaking into Tray 1, collapsed multi-selection messaging, four-tier accordion, 36 px rows, header gap 0 after scrolling the dense list, outer Work scrollTop 0, Default/Expanded/Collapsed cycling, 52 px handle in both visible modes, selection-first ESC with scope retained, completion filtering and a narrow layout. Prior task checks cover actual pointer bulk dragging, including selected-parent subtrees; this pass did not repeat a physical drag.

## Real YouTrack Contract Verification

Only four marked disposable tickets were explicitly edited: PMON-319, PMON-320, PMON-321 and PMON-322.

- Dashboard-service edits wrote notes, In Development, priority, complexity, self-assignment, due date, Type, Kanban, estimation, Ideal Days, Story Points and an existing tag. An independent connector read confirmed native field values; In Development inherited to ancestors.
- Two files were attached to PMON-321. Native attachment IDs were 12-2 and 12-3; both downloaded through the protected local proxy with identical SHA-256 to the original image/text fixture bytes. An independent connector confirmed their native presence.
- Native connector changes to title, notes, State, priority, complexity and Kanban were pulled by ROMDex. Show-stopper remained native while displaying at the highest priority; Standby inherited. Moving the QA branch retained its child relationship and both attachments.
- A native same-field note change blocked a stale dashboard edit and preserved native notes. Unassignment, date clearing and tag removal also succeeded against the real project.
- Cleanup checked exact IDs, the marker, unexpected children and unexpected attachment IDs before deleting only those tickets. Independent project search found no active R08 QA issues. All 299 original issue IDs remained and the final project count was 299. No old workspace snapshot was restored.

The contract checks used the running R07 adapter, which is unchanged in 0.4's native field/file paths. The final new-folder build and served resources are verified separately. Ordinary background synchronization continued during these checks.

## Package, Profile and Practical Limits

The release contains 69 explicitly allowlisted files, independently re-read from the ZIP and matched by SHA-256 and byte count. Its external manifest records every file and the ZIP checksum. The private profile, current workspace export, credentials, uploads, logs, scratch data and QA fixtures are excluded from the release ZIP. The original prototype seed remains included and does not overwrite established data.

The user's Windows launch was independently verified at 2026-10-15 00:30 UTC (October 14 locally). The running service reports 0.4.0 with the expected new installation/build identity. All 28 public assets match the release over HTTP. The remembered connection and Auto-Sync are healthy, the encrypted credential bytes are unchanged, all 299 original issue IDs remain, and the saved queue has zero pending operations or blocked action. No further service-code change was made after that launch.

The protected R08 checkpoint contains 47 verified files: 39 authoritative NPCDex package files (saved revision 72), six shared-profile files, and the final release ZIP/manifest. Profile hashes were stable during capture. Access is restricted to the current Windows user, SYSTEM and Administrators; credentials are copied only as DPAPI ciphertext.

This remains a Node.js 22+ local service and browser launcher. Sync requires its page/service and connectivity; native polling is approximately 15 seconds. REST conflicts are optimistic comparisons, not an atomic cross-client lock. Local staging/viewing limits are 50 MB per file; YouTrack permissions/site limits can be lower. Only raster images have inline previews; native attachment deletion is not included.

The R08 checkpoint preserves saved files/ciphertext and current saved NPCDex data, not unsaved browser-only NPCDex edits. Do not restore an old journal or profile over later work without comparison. The original U01 backup remains immutable.

No Git repository exists, so this is a verified release change set rather than a Git commit. No publication or standalone desktop migration was performed.

## U23A — Authorized Handoff and File Transfer

Source implementation: 94 final affected checks passed after two new metadata-transition failures were corrected; the single broad run had 866 passes and the two corrected failures. Six headless source-interface checks passed, including short-window footer layout. Actual Windows-protected-connection/YouTrack proof used the deterministic CLI on private synthetic task PMON-329, then removed it. Download, valid synthetic returned RDX, upload/readback and duplicate-free replay passed; task fields, Auto-Sync Off and the protected connection were preserved. This is not proof of real ROM extraction/in-game behavior, a separate restricted agent identity, automatic discovery/application or a new installed release. See rdx/AGENT-FILE-TRANSFER.md.

# ROMDex — Pre-Launcher Enhancement Proposals

**Date:** October 14, 2026  
**Status:** R01–R07 completed, including selection/grouping, ESC/In Development, the full PMON editor/tags, and attachments; R08 awaits its own PASSKEY.  
**Baseline:** ROMDex 0.3.0. These tasks precede unified-interface and launcher implementation, subject to user approval. Prefix R distinguishes them from completed ROMDex tasks and the unified-app U tasks.

## Recommended Placement

Complete these in the existing ROMDex HTML/CSS/JS and YouTrack service, then use the accepted enhancement release as the desktop migration baseline. None requires the new NPCDex cloud provider. The resulting editor, attachment adapter, selection logic, and tray behavior can carry into the desktop app. Existing NPCDex/ROMDex baselines must be inventoried and backed up before coding; use U01 for that prerequisite rather than repeating it later.

Each row below is one proposed reviewable change set. Complete one task, verify it, report, and await a new PASSKEY before starting another. If implementation discovery requires subdivision, revise the proposal first. Preserve the remembered token and working data across all builds. Use focused browser checks and meaningful automated checks for hierarchy changes, fields, uploads, and recovery.

## Priority Order and Model Recommendations

| Task | Change Set | Request Items | Model / Effort |
| --- | --- | --- | --- |
| R01 — Complete | Details opening and context-sensitive keyboard behavior; [report](R01-Completion-Report.md) | 3, 4 | Sol / Medium |
| R02 — Complete | Compact four-tier selector tiles and exclusive expansion; [report](R02-Completion-Report.md) | 6, 7; Saga addition | Sol / Medium |
| R03 — Complete | Work toolbar, ESC selection/pane behavior, and In Development status; [report](R03-Completion-Report.md) | 8; user-added ESC/status requests | Sol / Medium |
| R04 — Complete | Dense row layout and checkbox selection; [report](R04-Completion-Report.md) | 5, selection portion | Sol / High |
| R05 — Complete | Group creation and dragging multiple selected items; [report](R05-Completion-Report.md) | 5, hierarchy portion | Sol / Extra High |
| R06 — Complete | Full item Edit menu, all editable PMON custom fields, and tags; [report](R06-Completion-Report.md) | 1; user-expanded fields/tags | Sol / High |
| R07 — Complete | YouTrack attachments, previews, and paperclip indicator; [report](R07-Completion-Report.md) | 2 | Sol / High |
| R08 | Integrated QA and enhanced ROMDex release | All | Sol / High |

Sol means GPT-6.1 Sol. These effort choices are engineering judgments, using the same [official model-selection guidance](https://developers.openai.com/api/docs/guides/model-selection) as the unified plan. Sol is sufficient for this scoped pass; revisit the model recommendation if bulk hierarchy recovery or adapter design proves substantially more complex. Remind the user of the next recommendation before requesting its PASSKEY.

## R01 — Details Opening and Keyboard Routing

- Clicking a Work Pane item opens that item and automatically reopens a collapsed Details Pane. Restore the normal split rather than unexpectedly maximizing it. Apply the same opening path to Notes and, when available, the attachment icon.
- Implement the requested Details cycle: Default → Expanded → Collapsed → Default. R01 restores the original default split when cycling back to Default, matching the existing Expand-button restore behavior. Clicking an item to reopen a collapsed pane retains the saved divider position.
- Route TAB by context, confirmed by the user: inline Work Pane name editor uses its nesting behavior; a multi-selection hierarchy command takes precedence in workspace navigation; otherwise TAB cycles the Details modes only in workspace navigation context. TAB inside notes, comment editors, Edit forms, menus, and dialogs keeps normal behavior.
- Ensure the shortcut remains reachable when Expanded mode hides the Work Pane. Do not attach an indiscriminate global TAB handler that prevents navigating the application. Consider Shift+TAB reverse cycling only if explicitly chosen.
- Reserve the multi-selection command for R05. The new routing must not cycle the pane when selected items are intended for grouping.

**Verify:** reopening retains the selected item and existing navigation history; cycling handles all three modes; input spaces and typing remain intact; inline item nesting and normal form navigation work. Keyboard routing is confirmed; default-size semantics and keeping the shortcut reachable in Expanded mode remain implementation-design details to review.

## R02 — Selector Tiles and Accordion

- Confirmed by the user: remove the entire picture/thumbnail area for compact text tiles, retain all saved image data and Tile Settings access, and keep the existing indicator/cog/toggle styling.
- Use 48 px text tiles with single-line ellipsis and full-title hover tooltips.
- The user added Saga during R02: enforce one expanded Epic, one expanded Saga, and one expanded Story in Tray 1, retaining the active ancestor path. Opening another item at the same tier collapses the old branch with the NPCDex expansion animation.
- Show only Epic → Saga → Story → Verse. Tier 4 Verses remain selectable and cannot expand; anything below them stays in the Work Pane. Existing Stories become Sagas, existing Verses become Stories, direct children of existing Verses become Verses, and deeper items remain Tasks. Existing issue links stay intact; hierarchy roles follow the updated depth mapping.
- Remove stale/hidden branch expansion state so reopening a different Epic does not unexpectedly open several Stories. Keep selection and expansion distinct, and handle native hierarchy changes cleanly.
- These restrictions never limit Work Pane expansion or hierarchy depth.

**Verify:** only one visible branch per expandable tier, no fifth-tier selectors, stable tile sizing/tooltips, saved image data retained, unrestricted Work Pane expansion.

## R03 — Add Item and Completed Filter

**User-approved additions during R03:** ESC clears Work selection/editing focus while keeping the selector scope; when nothing is selected and no field is active, ESC toggles Details Collapsed ↔ Default. Existing menu, drag, resize, and draft cancellation take precedence. Add In Development with a flashing purple indicator; menu order is Untouched → In Progress → Standby → In Development → Complete → Critical. In Progress means preparation underway; Standby means ready for development. Purple overrides all inherited colors except red. Other rollup rules remain unchanged when purple is absent.

- Replace the current toolbar Hide Completed position with **+ Add Item**, using the existing filter button's styling. Connect it to the existing contextual item-creation behavior.
- Move the completed toggle to the right side of that toolbar row. Use the existing size/shape with extra width for a standard indicator, yellow fill, and heavier font.
- Preserve one visible text string at a time: **Hide Completed** when completion filtering is Off, **Show Completed** when it is On.
- Indicator blinks red while completed items are hidden; dark gray and steady otherwise. This indicator describes filtering, independently of Save and connection indicators.
- Proposed: move the existing large Add Item action from the title row into the new toolbar position, leaving one primary Add Item control rather than a duplicate. Confirm this during layout review.

**Verify:** filter label, indicator, and actual visibility agree; preference survives reload; new drafts remain visible; the new action creates in the currently selected scope; desktop and narrow layouts remain readable.

## R04 — Row Layout and Selection

- Use the supplied ClickUp screenshot as a spacing/order reference while preserving ROMDex theme and indicators.
- Anchor grab handle at the row's extreme left, then a checkbox in a fixed gutter. These controls do not indent with hierarchy depth.
- Inside the indented hierarchy area, order the controls: expansion triangle → status light → item name → Notes paper icon → attachment paperclip when present. Retain the task ID after the name, dependency indicator, left-aligned Priority/Complexity tags, and hover actions.
- Keep slots aligned for leaf rows even when their triangle is inactive. Account for the new gutter in horizontal nesting gestures and the depth-aligned drop guide/triangular tail.
- Show unchecked checkboxes on hover or keyboard focus; checked boxes remain visible after the pointer leaves. Reserve their space to prevent row shifting.
- Support checkbox toggling, Ctrl-click additive nonconsecutive selection, and Shift-click ranges in current visible row order. Do not include collapsed, filtered-out, or out-of-scope rows in an implicit range.
- More than one checked item makes the Details Pane show exactly **Multiple Items are Selected.** Flush the previous item editor first; do not apply that item's pending text to the selection.
- Integrate the R03 ESC clear-selection event with the checkbox selection model, so the first ESC clears checked items without resetting the selector scope or toggling Details.
- Review plain row-click versus checkbox behavior, selection clearing on scope/filter changes, and return to single-item Details during this task. Updated by the user during R05: only name clicks reopen collapsed Details; checkbox clicks preserve pane size, background clicks leave selection unchanged, and a scope change clears it.

**Verify:** alignment across nested levels, no horizontal jump on hover, range/additive selection, keyboard reachability, selected item removal/native refresh, and safe Details editor transition. Bulk mutation is reserved for R05.

## R05 — Grouping and Bulk Drag

- With multiple checked items and workspace navigation focus, TAB stages a new parent and places the selection below it. Proposed: focus a new-parent title editor and commit only after a nonblank name; cancel/empty dismissal creates no issue and makes no hierarchy changes.
- Confirmed by the user: initial grouping and bulk dragging support only items sharing the same immediate parent. The new parent belongs beneath that shared original parent; a bulk drag can move the sibling group to another valid parent. Mixed-parent selections must not trigger a partial move or grouping: explain the restriction and leave the hierarchy unchanged. Recheck the shared-parent condition against incoming native changes before applying the operation.
- Drag a selected row/handle to move the selected set as one block. Preserve visible ordering, move selected parent subtrees intact, and show both selection count and the destination hierarchy depth.
- A selected parent carries its subtree intact. An ancestor/descendant selection has different immediate parents and therefore cannot be grouped or bulk-dragged in this initial release. Keep descendant relationships unchanged rather than flattening them.
- Validate the full intended result before staging moves: no cycles, no moving inside selected descendants, no missing destinations, and no implicit inclusion of hidden rows.
- Stage local changes together and persist a recoverable operation group. YouTrack parent-link operations are separate requests, so remote bulk moves need progress tracking/recovery rather than a claim of server-side atomicity. Interrupted or conflicting groups must expose which moves completed and preserve remaining work for review/retry.
- New parent creation is directly requested by the user's grouping action; retry must not create duplicate parent tickets. Wait for its real YouTrack ID before pushing child links. Existing assigned/inherited status rules remain in force.

**Verify:** same-parent groups, rejection of mixed-parent and ancestor/descendant selections, nonconsecutive siblings, preserved subtrees, ordering, nesting guides, offline staging, native parent changes, partial-link interruption, conflict, cancellation, and retry without duplicate parents.

## R06 — Full Edit Menu

**User-approved expansion during R06:** include all other editable PMON project fields and ticket tags. Read field definitions and values from YouTrack, preserve computed/read-only fields as informational values, and retain independent conflict baselines for each field. Tags support assigning/removing existing accessible tags.

- Replace the hover pencil's Rename action with **Edit Item**, opening a complete standard edit form. Proposed first scope: Name, Assigned Status, Priority, Complexity, Assignee, Due Date, and Notes/Instructions; retain comments and child navigation in Details.
- Keep a focused inline title-edit route available so this change does not eliminate existing rapid name entry/nesting behavior. Decide its affordance in the form/row review rather than assigning a surprising double-click behavior silently.
- Use the PMON project's existing field definitions and eligible assignee choices; preserve stable user identities rather than sending display names as identities.
- Extend adapter, normalized values, queued operations, and conflict checks for Assignee and Due Date. Respect the actual field type/cardinality and date-only semantics to avoid one-day timezone shifts. Allow clearing values only where the project permits it.
- Form save applies only fields the user changed; Cancel makes no changes. Native YouTrack edits return automatically, and concurrent edits follow existing review behavior.
- Parent status editing continues to save the directly assigned value; children determine the visible inherited value until the parent has no children. Do not let the form bypass this rule.
- The user subsequently approved all editable PMON custom fields and ticket tags. Type, Stage, Kanban State, Estimation, Ideal Days and Story Points are included; calculated Spent Time is shown as read-only when time tracking is enabled.

**Verify:** assign/reassign/unassign, set/clear date, invalid choice/permissions, offline save, native incoming changes, conflicts, unchanged-field preservation, and parent status behavior.

JetBrains documents project-specific types and values for [YouTrack custom fields](https://www.jetbrains.com/help/youtrack/devportal/api-concept-custom-fields.html). The current ROMDex write path supports summary, description, status, priority, complexity, and hierarchy, so the new writable fields need adapter work.

## R07 — Attachments

- Store attachments on the actual YouTrack issue so authorized agents can retrieve them. Do not substitute ROMDex selector images or the future NPCDex cloud store for ticket attachments.
- Add attachment metadata/incoming refresh and the requested paperclip directly after the Notes paper icon. If an item has attachments but no notes, show the paperclip in the same reserved name-adjacent area.
- Add **Attach Files** and an attachment list in Details/Edit with filenames, sizes, upload status, and viewing/download actions. Proposed first scope: image previews suitable for sprites, and download/open actions for other files. Preview types beyond images require a separate decision.
- Keep original bytes/filenames; pixel-art preview should avoid smoothing. Previewing a file does not execute it or alter it.
- Upload through the local service using multipart data; list/retrieve through verified issue attachments without exposing the permanent token in browser URLs. Account for deployment-specific upload limits and access permissions.
- For new local items, queue the file until issue creation produces a real ID. Persist queued file data and upload state outside distributed code, so restarts/build replacement and Auto-Sync Off preserve it. Manual Save processes pending uploads once while Off.
- Reconcile uncertain upload outcomes before retrying; matching names alone are insufficient to establish that the same file was uploaded. Surface ambiguity for review instead of blindly producing duplicates.
- Reflect files attached or removed natively in YouTrack. Removing existing attachments from ROMDex is not included in this request; decide separately if desired.

**Verify:** existing native attachments, sprite preview/original download, upload to existing/new issues, multiple files, permissions/size failures, paused sync, restart during upload, uncertain retry, and paperclip updates.

JetBrains specifies [multipart uploads to an existing issue](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-attach-files.html) and [attachment list/download access](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-download-issue-attachment.html). Agent access depends on its account's access to the issue and attachments; ROMDex attaching a file does not grant a new agent permission automatically.

## R08 — Review and Release

- Review all eight requests and their confirmed clarification answers against the final implementation.
- Run meaningful hierarchy, field, keyboard, and attachment checks; use focused browser inspection of row spacing, tiles, toolbar, and all Details modes.
- Use isolated fixtures before controlled real-YouTrack verification. Keep test records separate from real work, and clean only those records.
- Verify saved token/profile preservation and produce an enhancement release, manifest, QA report, and recovery instructions. Choose the version number during release preparation.
- Update U01's baseline record after the accepted release, then resume architecture/design and unified-interface tasks using that release rather than 0.3.0.

## Clarifications Confirmed

1. TAB: inline Work Pane name editing nests the item; multiple checked items take priority for grouping; otherwise workspace navigation cycles Details Default → Expanded → Collapsed. Notes, forms, and menus retain normal TAB behavior.
2. Initial grouping and bulk moves are restricted to items sharing the same immediate parent. Mixed-parent operations leave the hierarchy unchanged.
3. Remove the entire tile picture area; preserve saved images in Tile Settings.

Before each relevant task, also review its concrete UI: Edit menu fields/inline rename access, selection behavior, grouping title/cancel flow, reduced tile dimensions, and toolbar layout. These are scoped design checkpoints, not implementation authorization.


## R08 — Release Completed, October 14, 2026

ROMDex 0.4.0 is the verified enhancement baseline. Passed 207 extracted-package tests, 51 module syntax checks, launcher parsing, combined isolated browser checks and controlled real YouTrack two-way field/file/conflict/subtree verification. Four marked QA tickets were cleaned; all 299 original issue IDs remain. The user launched the new folder: expected running installation/build and all 28 public asset hashes match, saved credential ciphertext is unchanged, connection/Auto-Sync are healthy, and no pending or blocked work remains. The 69-file ZIP/manifest and protected 47-file saved-data checkpoint are verified, including NPCDex revision 72. See [R08 Completion Report](R08-Completion-Report.md) and [Baseline Update](R08-Baseline-Update.md). No U02 work has begun. Next: **U02 — Desktop Host and Distribution Design, Sol / High**, requiring a new PASSKEY.

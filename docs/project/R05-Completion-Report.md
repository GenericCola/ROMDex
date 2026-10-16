# R05 — Same-Parent Grouping and Bulk Drag

**Completed:** October 14, 2026, under user PASSKEY and follow-up corrections.  
**Checklist:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md).  
**Build:** ROMDex 0.3.0 working installation with R01–R05 patches. R08 remains the packaging/release checkpoint.

## Delivered Behavior

- Checkbox clicks update selection without reopening or resizing Details. Only a task name reopens a collapsed Details Pane. Background clicks do not open it; the Notes icon can update content while leaving the pane collapsed. Existing explicit pane controls remain available.
- With multiple checked siblings, TAB from a checkbox or Work navigation context opens a new-parent title row. A nonblank Enter creates the parent and groups the selection. Empty Enter or ESC creates no issue and makes no hierarchy changes. Repeated Enter is guarded against duplicate submissions.
- The new parent occupies the first selected sibling's position, under their shared original parent. Selected siblings retain their visible/manual order, and the new parent is expanded in Work.
- Dragging a checked item grip moves the selected sibling set as a block into a valid row/selector destination. The destination message includes selection count and hierarchy level. Mixed-parent and ancestor/descendant selections are rejected; circular or missing destinations cannot be committed.
- **Selected parents carry their entire subtrees.** Descendant parent links, ordering, notes, comments, directly assigned statuses and other fields remain attached to their existing issues. Children are not flattened into the moved sibling block.
- All local changes are published in one durable transaction. Same-parent display reordering remains local and sends no needless parent-link writes.
- Remote group preflight checks that all selected items still exist under their expected shared parent. Native moves/removals stop the group before its first write and require renewed selection.
- Durable operation groups retain member IDs, operation IDs, parent mapping and confirmed progress. The group notice shows saved/remaining work; review lists saved versus pending items. Partial YouTrack updates remain recoverable.
- Cancelling remaining group changes preserves confirmed remote moves and unrelated later note edits. Ambiguous parent creation uses the existing human acknowledgement flow before retrying, preventing duplicate parents. Queued-group deletion cancels remaining links before staging the confirmed deletion; in-flight group deletion is blocked.
- Supports up to 1,000 selected items, with outgoing queues batched at 1,000 operations. Local queue materialization follows parent chains rather than rebuilding a full tree for each queued link, retaining cycle protection.

## Verification

- **170/170 tests passed**; syntax checks passed for **36 frontend/test/service modules**.
- New model/storage tests cover stable sibling ordering, nonconsecutive selections, insertion boundaries, subtree preservation, mixed-parent/cycle rejection, atomic storage failure, new-parent ID mapping, progress, partial cancellation, unrelated note retention, offline deletion, in-flight deletion protection, and a 1,000-item group across two sync batches.
- Controlled service integration verified selected-parent subtrees during a detached-link interruption/retry, rejection of native parent drift before creating a parent, and acknowledgement of an uncertain creation without creating another parent. These checks use a mock provider and make no real YouTrack ticket changes.
- Isolated browser checks verified collapsed checkbox selection, name-only reopening, staged parent entry, empty/ESC cancellation, committed grouping, mixed-parent rejection, progress display, and an actual selected-set drag to another Verse.
- The browser move carried PMON-935 and PMON-939 into the destination; PMON-940 remained a child of PMON-935, displayed one level deeper. This fixture is isolated from the real PMON project and contains no token.
- Initial coordinate drag attempts cancelled while the test viewport was unsettled; one attempt was rejected as outside its viewport. After reading the settled viewport and target geometry, the drag completed and its destination/subtree relationships were verified. Temporary hit-test diagnostics existed only in the fixture response, not delivered application code.
- The 1,000-item controlled check improved from approximately 28.5 seconds to 1.5 seconds after the local parent-chain optimization. This is local test timing, not a promise about YouTrack network throughput.
- Browser warning/error log was empty. Temporary fixture tabs were closed, its server stopped, and viewport overrides reset.
- After the user launched the final service, its build identity matched the delivered files. Connection, remembered credentials and Auto-Sync were healthy. All five changed frontend files were compared with the real served HTTP content.

![Isolated destination scope with the preserved nested child](R05-Subtree-Move-QA.png)

## Delivery and Boundaries

Updated `public/app.mjs`, `public/index.html`, `public/store.mjs`, `public/core.mjs`, new `public/bulk-hierarchy.mjs`, `server.mjs`, `runtime-profile.mjs`, tests and README in canonical `outputs/ROMDex` and actual `outputs/ROMDex-v0.3/ROMDex`. Previous running files are preserved in `outputs/R05-Before`. Original ZIP, protected baseline backups and shared encrypted connection are preserved.

YouTrack parent updates remain separate requests, not a server-side atomic transaction. A partial failure requires review of saved and pending work; cancelling the remainder does not undo confirmed changes. Existing uncertainty/conflict protections remain active.

R06 has not begun. **Next:** Full Edit Menu, Assignee and Due Date, using **Sol / High**. Await a new PASSKEY before starting.

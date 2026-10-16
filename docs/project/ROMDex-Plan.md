# ROMDex implementation plan

Work proceeds in this order, one task at a time. User approved development on October 13, 2026.

1. **Complete — Discovery and connection.** Read all 287 PMON issues and their parent links, descriptions and recent comments. Five roots. Selected a loopback-only Node.js service with direct YouTrack REST access; a user-provided permanent token is required to authenticate the independent dashboard. No live data changed during discovery.
2. **Complete — Data and synchronization foundation.** Implemented hierarchy validation, recursive status rollup, IndexedDB pending changes and disk backup, three-way conflict detection, manual retry, operation journal, and 7 passing core regression tests. Live behavior is verified in task 5 and full integration in task 6.
3. **Complete — Main interface implementation.** NPCDex red shell and green panels, three-tier image selectors, scoped table, and task detail/notes/comments pane. Syntax checks pass. Browser visual verification remains for task 6: the environment currently prevents cross-process loopback connections despite a granted network permission.
4. **Complete — Editing interaction implementation.** Drag ordering/reparenting/horizontal nesting, keyboard creation, images, deletion, priorities, status controls, and conflict review are implemented. Syntax checks pass; functional browser checks remain in task 6.
5. **Complete — Live integration verification.** Connected as James Loder. Required State values are available. On disposable PMON-288, verified creation and dashboard-to-YouTrack title/description/state/priority writes through the independent MCP connection, then independent YouTrack-to-dashboard edits visible in the browser. Controlled service integration suite: 9 tests pass. Incoming refresh continues during manual-save/conflict states. Final source updates require a service restart during task 6.
6. **Complete — Final QA/review.** Live creation, native round-trip edits, keyboard nesting, pointer drag reparenting, notes and parent status propagation verified on temporary issues; all temporary issues removed, returning PMON to 287 issues. Desktop/mobile layouts and selector image assignment reviewed. 24 automated checks pass, including controlled interruption/conflict handling and Windows credential encryption. Background service restart verified. See ROMDex/QA-Report.md for evidence and limits.

## Agreed behavior

- Root items = epics; level two = feature suites; level three = features; deeper levels = tasks. Preserve existing YouTrack links, IDs, descriptions, comments, and custom fields.
- Grey untouched, yellow in progress, red critical/debugging, green complete, blue standby. Yellow/blue pulse between lit and dark colors. Parent rollup: all-grey children produce grey; otherwise red > yellow or mixed grey > blue > green. Leaf status is directly assigned. This includes the October 14 all-untouched correction.
- Left selectors can have images. Work pane stays a compact hierarchical table. Pencil pixel icon means notes are present.
- Rows support drag-and-drop across parents and horizontal level changes. Add child focuses title; Enter commits and opens next row; Tab indents under preceding item; empty Enter removes only the draft.
- Notes and comments remain distinct. Priority is visible. Dependency count is optional.
- Save Changes contains its own light: green synced, blue pulsing during sync/reconnection, red flashing for manual action. Manual save retries; conflicts show both values for human resolution.
- Automatic bidirectional synchronization with durable pending edits. A network connection cannot be guaranteed continuously; pending changes must survive disconnection and the interface must honestly display its state.
- Deletion propagates to YouTrack. Parent deletion requires a review of affected descendants.
- Sync manual order if straightforward; otherwise retain dashboard-local order. Images and navigation preferences may be dashboard-local when YouTrack has no equivalent.

## Discovery

- Project: PMON / Pokemon, https://thegobindsingh.youtrack.cloud
- Existing State values: To do, In Progress, Done, Fixed, Open, Prompt Ready.
- Priorities: Show-stopper, Critical, Major, Normal, Minor.
- Browser authentication and status-bundle write access are not yet verified.
- Reinforced requirement: incoming refresh must continue during pending edits, conflicts, and manual-save states. Remote values update the baseline; pending local field edits remain overlaid until resolved.

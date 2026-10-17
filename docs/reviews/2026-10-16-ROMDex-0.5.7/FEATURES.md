# ROMDex 0.5.7 — Current Features

Review baseline: October 16, 2026. This is the installed, verified release, including NPCDex as an add-on. Architecture documents describe additional future work; those features are identified below.

## Windows App and Workspaces

- Standalone Windows x64 application and per-user installer, Start Menu shortcut and Pokédex icon; separate Chrome/Node installation is unnecessary.
- Switch ROMDex/NPCDex with the small red header button. Each running workspace retains its navigation, selection, scroll, filters, pane sizes and unfinished edits when switching.
- Closing the window keeps the app in the Windows tray; explicit Quit checkpoints accepted work and exits. Bounded renderer/service recovery and single-profile ownership protect durable work.
- Application-folder Data is preserved across upgrades and uninstall/reinstall. Remembered credentials use Windows account protection.
- Private signed release metadata; notify/review/download/install consent, a manual-update route and retained Data on upgrade. Windows installer publisher signing is separate and currently absent.

## ROMDex Task Organization

- Two-way YouTrack task synchronization: native edits flow into ROMDex and supported dashboard edits flow back to YouTrack.
- Epic → Saga → Story → Verse selectors, with deeper tasks in the Work Pane. One branch per expandable selector tier, fixed-height compact tiles and All Tasks on fresh launch.
- Dense hierarchical Work list, search, Expand All/Collapse All, completion filtering, IDs beside titles, notes/attachment indicators and priority/Complexity tags.
- Drag to reorder/reparent, including sideways nesting; selected parents carry their descendants. Same-parent multi-selection supports range/nonconsecutive selection, grouping and bulk drag.
- Direct status-light editing; retained parent assignments are separate from inherited effective status. Lights show Untouched, In Progress, Standby, In Development, Complete and Critical, with agreed descendant rollups.
- Full Edit Item menu for assignee, due date, priority, Complexity, supported editable custom fields, description and tags. Calculated Spent Time remains read-only.
- Inline task creation/rename, keyboard nesting and selection-aware TAB/ESC behavior. Checking boxes preserves the Work view; selecting an item name opens its details.
- Docked Details Tray with notes/instructions, comments, child navigation/back, resize handle, expand and collapse.
- Native ticket attachments: add/download, raster previews, deletion with review/recovery, and Explorer/desktop file drops onto task rows.

## NPCDex Planning and Review

- Map/location/character/interactive-element browsing, conditional dialogue, player-gender views, narrative stages and shared/global dialogue references.
- Current content plus staged changes; FINAL/UPDATE/REMOVE editorial decisions, Change Instructions, proposed dialogue, scoped flags/notes and separate tester verification.
- Source/script evidence, stable target/review identities, character imagery and shared identity references.
- Change history, guarded data undo and retained implementation/reversal history. Manual legacy receipt/export facilities remain; they are not the new automatic YouTrack registry workflow.
- Persistent private GitHub-backed saves and image/history data, local durable checkpoints, offline queues, incoming revisions and independent-edit merging. Conflicts retain original versions and require review.

## Shared Synchronization

- Save Changes and Auto-Sync apply across native YouTrack tasks, NPCDex cloud saves and ROMDex organization metadata. A failed provider does not stop healthy providers.
- Save performs one cycle while Auto-Sync is Off and leaves it Off. Accepted local work remains durable while disconnected.
- Save stays green during ordinary healthy automatic delivery; unsendable/paused pending work, conflicts and recovery problems require red/review. Connection pulses blue when configured connections are healthy, flashes red on failure and stays dark blue when Off.
- Click the connection light for each provider's status, pending work, latest contact and recovery guidance.
- Tile images, manual sibling order and saved parent assignments sync through the metadata store. Window/view preferences remain local.

## Approved Design, Not Yet Shipped

- A separate NPCDex Content YouTrack project and dynamic per-map/entity content records, with shared profiles and local appearances.
- Package Map Changes: one fixed document, explicit existing/new PMON task attachment and a separate user-controlled agent handoff.
- Validated direct backend implementation updates, incremental independent results, complete dependent groups, preserved newer drafts and user testing before task completion.
- Explicit documentation corrections, planned additions and archived implemented removals through the new registry.
- Agent contact notifications are later work. See [status and roadmap](PROJECT-STATUS.md).

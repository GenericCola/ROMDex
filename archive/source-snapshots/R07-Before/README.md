# ROMDex 0.3.0 · Pokémon Workspace

ROMDex is a plain HTML/CSS/JavaScript dashboard for the **PMON** YouTrack project. It uses the NPCDex red shell, green panels, cream text, compact hierarchy selectors, and status lights.

## Open ROMDex

Double-click **Start-ROMDex.cmd**. Your browser opens at **http://127.0.0.1:4322**. The service runs in the background; a command window does not need to stay open.

The launcher uses the Node.js runtime already installed with Codex on this computer. On another computer, install Node.js 22 or newer from https://nodejs.org. No package installation is needed.

To stop the service deliberately, double-click **Stop-ROMDex.cmd**. Restart it with Start-ROMDex.cmd. Pending work remains saved locally.

## YouTrack Connection

Create a permanent token on **thegobindsingh.youtrack.cloud**, signed in as your own account with access to PMON. Select the **YouTrack** scope. In ROMDex, click **Connection**, enter the token, and select **Connect & Sync**.

Optional: check **Remember This Connection on My Windows Account**. Windows encrypts the token for the current user. Otherwise, it stays in service memory and must be entered after a service restart. Tokens are not saved in the browser or included in the ZIP package. A remembered token belongs to this Windows account and should not be copied to another computer.

The remembered connection now lives in **%LOCALAPPDATA%\ROMDex\thegobindsingh-PMON**, outside the application folder. Subsequent builds reuse it under the same Windows account. Opening Connection shows Remember checked when a saved connection exists. The first upgrade copies the original private runtime data into this shared profile and leaves the installation's **.romdex** folder intact as a backup.

ROMDex adds missing Standby, In Development, and Critical / Debugging values when your YouTrack account has Update Project permission. It preserves existing State values and unrelated custom fields.

## Project Hierarchy

- **Tier 1:** Epics, which are the existing root issues.
- **Tier 2:** Stories.
- **Tier 3:** Verses.
- **Deeper Levels:** nested Tasks.

The hierarchy key is **EPIC → SAGA → STORY → VERSE**. These are depth-based display labels; existing titles, notes, IDs and YouTrack Type values are preserved. New Sagas, Stories and Verses continue to use the existing native Feature type.

Select an item in the left pane to narrow the work table. Expand its selector to reveal the next tier. Selecting a Verse shows only its descendant tasks. Click a task title to view its notes/instructions, comments, and properties in the docked Details Tray below the Work Tray. The Details header can expand to fill the right-hand area, restore the default split, or minimize to the divider handle. Drag the handle up to reopen a minimized tray. The handle stays 52 px wide. The arrow-only Back button returns through children opened within Details, stopping at the initial Work item; a fresh Work selection starts a new trail. Its tooltip names the destination. Use Hide Completed beside Expand All/Collapse All to hide effectively green Work rows; the button then says Show Completed. This local view preference survives reload. Search and hierarchy expansion still apply; selector tiles and the selected Details item remain available. Active drafts/rename rows stay reachable until editing ends.

Drag the handle between the trays to adjust their heights. Pull it to the bottom to collapse Details; drag it upward to reopen. Collapsing preserves the selected task and its editor contents. Selecting a task while collapsed automatically reopens Details. The minus button minimizes Details. Expand hides Work and fills the right-hand area; clicking it again restores the default split. The 24 px outlined Back button has a centered SVG arrow and is dimmed at the starting item. The divider position and collapse preference are saved locally in the current browser.

Keyboard alternative: focus the divider and use **Up/Down** to resize, **Shift+Up/Down** for larger steps, **End** to collapse, **Enter/Space** to collapse or reopen, or **Home** to give Details the maximum available space. On narrow screens, the selector tray sits above the two docked trays; the table retains horizontal scrolling.

Drag a task grip to reorder or move the task. Drag sideways to change its nesting level. Drop onto a selector to move into that category. The destination appears before release. Descendants, notes, comments, and status remain attached to the moved issue. Circular moves are rejected.

Manual display order, selector images and retained directly assigned statuses are stored locally in ROMDex. Parent relationships, titles, notes, comments, priorities and displayed statuses are stored in YouTrack. YouTrack's personal/contextual custom-order system has no straightforward equivalent for this shared hierarchy, so ROMDex does not write those custom-order controls.

## Sidebar and Future Menu Content

The selector tray starts with **Pokémon / PMON** and an **Add Epic** control. **All Tasks** uses the pixel Poké Ball; select it to show the entire project. Expand an Epic to reveal its Stories and their Verses. The tray no longer has an Explore Project heading, a Keyboard Guide footer, or an Epic/Item count footer.

The removed footer information is preserved here for a future menu. The **Epic count** is the number of root-level project items (`parentId` is empty). The **Item count** is the full number of loaded project issues, including descendants. The Keyboard Guide's original contents were:

- Hierarchy: Epics contain Sagas, Sagas contain Stories, Stories contain Verses, and deeper levels are Tasks. Selecting a Verse filters the Work Pane to its descendants. Display tiers do not change YouTrack Type values.
- Drag above or below an item to reorder. Drag right to nest and left to move up a level. Drop onto a selector to move into it.
- Hover or focus a row's **+** to add a child. **Enter** commits the title and starts another row. Enter on an empty new row discards the draft.
- **Tab / Shift+Tab** while naming nests under the previous item or moves out a level. **Escape** cancels the title editor.
- Double-click a title or use **✎** to rename it inline.
- Status stages are Untouched (grey), In Progress/preparation (yellow), Standby/ready (blue), In Development (flashing purple), Complete (green), and Critical (red). Parent lights summarize their descendants automatically.

## Add and Edit Items

- Use **+** at the top of the left pane to add an epic.
- Use a selector's **+** or a row's hover/focus **+** to add a child.
- **Enter:** commit the title and open the next blank row at the same level.
- **Tab** in an inline Work Pane title editor: make the new or existing item a child of its preceding sibling.
- **Shift+Tab** in that editor: move the item out one level.
- **Tab** from the task list or workspace background: cycle Details **Default → Expanded → Collapsed → Default**. Forms, notes, comments, menus, and modified TAB shortcuts retain normal behavior.
- **Enter on an empty draft:** discard the blank row without creating a YouTrack issue.
- **Escape:** cancel the title editor.
- **Escape** clears the selected Work item/editing focus while keeping the selector scope. A subsequent Escape with no selection or field active toggles Details between Collapsed and Default. Menus and active drags/resizes consume Escape first. Notes are retained, and unfinished comment text stays with its item during in-session navigation.
- **Double-click a title** or choose **✎** to rename it.
- Use a selector's **settings cog** to rename it or manage its preserved image.

The compact selectors follow **Epic → Saga → Story → Verse**. Every tile is 48 px high, with no picture area, a top-left status light, top-right settings cog, and animated bottom-right disclosure arrow where expansion is available. Names stay on one line with ellipsis and a full-title tooltip. Saved images remain accessible in **Tile Settings** for preview, upload, or removal. The cog remains 18 px with its centered Standard Settings Icon. Add new children from the Work Pane. The **All Tasks** icon is the exact 16 px SVG embedded as NPCDex's favicon, copied into this build as a separate asset.

Tray 1 permits one open Epic, one open Saga, and one open Story. Opening another at the same tier collapses the previous branch and clears expansion below it. Verses are selectable but cannot expand; anything below them appears only in the Work Pane. The Work Pane retains unrestricted expansion. Existing parent relationships stay intact: former Stories become Sagas, former Verses become Stories, direct children of former Verses become Verses, and deeper items remain Tasks. These roles follow hierarchy depth rather than creating new parent issues or changing existing YouTrack Type fields. Collapsed selector preferences survive reload; stale/multiple expansion state is normalized against the current tree.

The small pixel paper icon beside the title indicates actual notes/instructions; click it to open Notes. Task IDs follow the title and notes marker on the same line. Rows are 36 px tall, and long names truncate while preserving the notes marker and ID. A ClickUp migration footer alone does not count as a note, although the original text remains preserved. Comments are separate from notes. Priority and Complexity retain left-aligned tags and can be edited by clicking their tags in the table or Details Tray. There is no separate dropdown arrow; the choices also support keyboard input.

During a table drag, the blue insertion line starts at the destination level's indentation, with a triangular marker at its left endpoint. Moving horizontally changes the proposed level. The guide and the actual move share the same destination calculation. Inserting beside an expanded parent places the guide before or after its whole visible branch; the message identifies the destination parent. Sticky column headers start at the scroll viewport's top edge, preventing rows from showing above them.

The row's hover/focus menu contains Add Child, Rename and a pixel trash icon. The trash icon opens the existing deletion review; task titles still open Details. Deleting an existing item deletes it from YouTrack. The review dialog lists all descendants to be deleted. Cancelling preserves them. Deleting a different item leaves the selected task's Details open; deleting the selected task clears it. Blank drafts have not yet been created in YouTrack.

Clicking a task name automatically reopens a collapsed Details Tray, retaining the saved divider position. Its Notes icon can update Details without reopening it. Only the item name opens a collapsed Details Pane; background clicks do not open it. Keyboard cycling returns to the original default split after Collapsed; the cycle remains reachable while Expanded hides Work. Checkbox selection, named grouping, and same-parent bulk dragging are available.

## Priority and Complexity

Both columns use NPCDex's colored tag appearance and ALLCAPS labels. Complexity appears immediately after Priority. A dash means Complexity has not been assigned; it does not mean LOW.

| Color | Priority | YouTrack Priority | Complexity |
| --- | --- | --- | --- |
| Green | LOW | Minor | LOW |
| Blue | NORMAL | Normal | MID |
| Yellow | HIGH | Major | HIGH |
| Red | URGENT | Critical | INSANE |

YouTrack's **Show-stopper** also displays as red **URGENT**. Its native value is preserved during unrelated edits. The picker identifies its current Show-stopper value; explicitly choosing URGENT writes Critical, because ROMDex has no distinct level that writes Show-stopper.

Complexity uses an optional single-choice YouTrack custom field, with LOW, MID, HIGH and INSANE values. It is configured for PMON in this installation; existing items were left unassigned. New installations can use **Connection → Set Up Complexity Field** when setup is needed. Setup reuses compatible fields, creates a dedicated PMON value bundle when necessary and does not change unrelated projects or shared bundles. An incompatible existing field requires configuration review rather than being overwritten.

Complexity changes use the existing durable queue, bidirectional synchronization and conflict review, including clearing the field to **Not Set**. Native values outside ROMDex's four Complexity choices remain visible with a warning and are preserved until explicitly changed. Disabled synchronization and manual Save behavior apply to these fields as well.

## Status Lights

| Light | Leaf Meaning | YouTrack State |
| --- | --- | --- |
| Grey | Untouched | To do; existing Open also displays grey |
| Pulsing yellow | In Progress / preparation underway, not ready for development | In Progress |
| Pulsing blue | Standby / ready for development | Standby; existing Prompt Ready also displays blue |
| Flashing purple | In Development / development active | In Development |
| Green | Complete | Done; existing Fixed also displays green |
| Flashing red | Critical | Critical / Debugging |

Dynamic lights use NPCDex's 7 px lenses with a fixed black inset ring at 50% opacity. Yellow and blue fade over four seconds; blue fades between light and dark blue. Red and purple blink over 1.2 seconds. Complete task lights stay green; the Save Changes light retains its green pulse. Reduced-motion preferences disable the animations. The three decorative header lamps remain static.

The Work table has no separate Status column. Each row starts with its clickable status light, indented for its nesting level. Click the light to choose a status; its click target is larger than the visible bulb. Parents can also receive a directly assigned status.

Parent lights are inherited recursively: red overrides every other color; otherwise any purple makes the parent purple. When there is no purple, all grey makes the parent grey; otherwise any yellow or a mix containing grey makes it yellow; otherwise at least one blue makes it blue; only all green makes it green. A parent's directly assigned status stays saved while children determine its displayed light. When its final child is moved or deleted, that saved status becomes visible and is written to YouTrack's State field. Computed parent states also save to YouTrack.

The compact **+ Add Item** action is in the Work toolbar after Collapse All. The completed filter sits at the right, with one action label: Hide Completed when all items are shown, or Show Completed when completion filtering is active. Its inset light is dark grey while Off and blinks red while completed items are hidden. The button is yellow with heavier text; it is separate from save/connection status and uses the same 29 px height as Add Item.

Retained assignments are stored in `assigned-statuses.json` in the shared private profile, with pending edits protected by the existing browser queue and workspace backup. No additional YouTrack field is created. Native YouTrack State changes update the local assignment; if the item still has children, their inherited status remains the displayed state. ROMDex's own inherited-state writes preserve the separate assignment. Conflicting assignments open the existing review pane, labeled **Assigned Status** with the value **Saved in ROMDex**.

On first use, existing items take their current YouTrack State as the saved assignment. Earlier directly assigned parent statuses that had already been overwritten cannot be reconstructed from that field alone. Preserve the private `.romdex` folder to retain these assignments when moving or restoring this installation.

## Bidirectional Synchronization

With **Auto-Sync Data On**, ROMDex automatically saves edits and checks YouTrack approximately every 15 seconds while its page and service are running. Native changes to titles, descriptions, status, priority, parent links, comments, new issues and deleted issues are read back into ROMDex. Opening or returning to the page also triggers a check. Checks can take longer when YouTrack is slow or unreachable.

The **Auto-Sync Data** On/Off toggle sits beside Save Changes. It applies to every window using this ROMDex service, and its choice survives page and service restarts. Other windows check the shared setting approximately every five seconds; the service enforces it immediately once the change is saved. A request already in progress finishes before the setting changes. Settings checks and local backups continue while Off, without contacting YouTrack.

With **Auto-Sync Data Off**, edits stay saved locally and both automatic incoming refreshes and outgoing commits stop, including comment refreshes. Click **Save Changes** to run one synchronization cycle: it reads current YouTrack values, reconciles pending edits, pushes permitted changes and pulls current data. Conflicts still require review. The toggle remains Off afterward, including after conflict resolution; later edits wait for another manual save. Turning it On resumes reconciliation before queued changes are pushed.

When Auto-Sync Data is On, incoming refresh continues during conflicts or a manual-save state. Local pending field edits remain overlaid; their original values are retained for conflict detection. YouTrack changes to other fields remain visible.

The **Save Changes** light is the only sync indicator on that button:

- **Pulsing green:** no manual save is needed. Healthy automatic synchronization keeps this light green, including while edits are queued or being sent.
- **Flashing red:** uncommitted work cannot be sent, for example because of a lost connection, a failed save, or a conflict. Click to retry; conflicting values open the review pane.

Connection loss alone does not turn the save light red when there is no pending work. Disabling automatic synchronization turns it red only when there are pending edits. A healthy one-time save can process those edits without enabling automatic synchronization.

A separate 7 px **connection light** sits immediately to the right of Save Changes:

- **Pulsing blue:** the last confirmed YouTrack connection is healthy and automatic sync is On.
- **Flashing red:** the connection or local service is unavailable, or YouTrack has not yet been connected.
- **Steady dark blue:** automatic synchronization is intentionally Off, including during a one-time manual save.

The previous header synchronization text is removed. Hover the light or Save Changes for its current state; the connection light also has an accessible status label. Connectivity is determined from actual requests rather than the mere presence of a token. The light cannot detect an interruption until the next request.

Conflicts show the dashboard and YouTrack values. Keep either version or combine text fields, then commit. Uncertain task/comment creation requires review before retrying so an interrupted response does not blindly create duplicates.

Pending edits are persisted in IndexedDB before a push, with a disk backup in the shared private profile. Network interruption does not discard them. Leave pending work in the same browser profile until it has synchronized. Browser closure warns when changes are pending. Images and manual ordering remain local workspace preferences.

## Prototype Limits

This local prototype synchronizes while its page and service are running and Auto-Sync Data is On. Closing the page stops periodic checks; opening it pulls the latest changes when enabled. Internet interruptions cannot be prevented; indicator lights report confirmed request outcomes rather than a continuous connection guarantee.

Conflict checks use YouTrack's REST API and fresh field comparisons. They are optimistic checks, not an atomic lock against another person editing the same field during the final write request. A production version needing strict concurrent-write guarantees should add a transactional YouTrack endpoint/workflow. No existing notes or comments are silently replaced to reconcile a detected conflict.

See **QA-Report.md** for verification results. The API adapter is limited to this YouTrack instance and PMON. It is served only on the local loopback address.

## Upgrade This Installation

ROMDex **0.3.0** completes Tasks 1–8 and the later status/title fixes. The release ZIP is ROMDex-v0.3.zip. The prior v0.2 ZIP remains available. Reload an open ROMDex page to load the revised interface. Start-ROMDex.cmd safely switches a running older service to the current build while reusing the saved Windows-account profile.

Continue using **Start-ROMDex.cmd**, the same Windows account, browser profile and local URL. The launcher reuses the matching running build or gracefully switches to a changed build after checking profile access and saved-connection availability. Once migration has completed, a new application folder uses the same saved profile; it does not overwrite it with an older installation backup. For the first migration, launch the updated application from the original installation containing **.romdex**. Keep that original folder as a backup.

The shared profile preserves the encrypted connection, workspace backup, selector images, manual order, pending operations, retained parent assignments and sync setting. Browser preferences and pending IndexedDB work still belong to the originating browser profile. Private data stays excluded from distribution packages. Explicit **ROMDEX_DATA_DIR** overrides use isolated storage without importing an adjacent installation's data.

Task 1 verification passed **92 tests**, syntax checks for **23 modules**, and the launcher parse/access checks. The live upgrade reconnected without token entry and retained all **287 items**, with no queued operations. Task 2 verification passed **98 tests** and syntax checks for **25 modules**. Desktop/mobile browser checks verified compact editing, inline IDs, notes navigation, zero header gap and left-aligned tags. Drag operations were tested with isolated fixture data. Task 3's live browser review verified the revised tray labels, retained All Tasks badge, controls and left-shifted Save area. Task 4 passed **98 tests**, JavaScript syntax checks and focused live browser review of the compact tile layout, cog settings and exact favicon asset. Task 5 passed **99 tests** and focused live review of the full-height/minimized Details modes, selected-item preservation, header/settings-button geometry, and centered connection lens. The approved gear is archived as the [Standard Settings Icon](shared-ui/README.md). Task 6 passed **104 tests** and live review of Back boundaries, tray-mode preservation, the fixed-width handle, outlined square button alignment, and the centered connection lens. Task 7 passed **111 tests** and live review of completion filtering, reload persistence, Details retention, and draft/rename text preservation. The later all-untouched rollup correction passed **113 tests** and connected service verification: all-grey descendants now produce grey ancestors and corresponding To do States in YouTrack. The title editor follow-up passed **117 tests** and isolated browser checks; focused whitespace/cursors survive autosave and the Details title uses a compact single-line input. Task 8 completed final integrated QA and packaging. See QA-Report.md for the actual live/controlled checks and limitations.

The live project remained connected with no pending operations and retained all previous item IDs during Tasks 2–7 checks.

## Files

`public/index.html`, `styles.css`, and `app.mjs` implement the interface. `core.mjs` defines hierarchy and conflict rules. `store.mjs` handles durable local changes; `sync-control.mjs` defines connection-light states. `server.mjs` and `youtrack.mjs` provide local authentication and YouTrack access. `runtime-profile.mjs` resolves and safely migrates the private profile. `sync-settings.mjs` enforces the shared preference, persisted as `sync-settings.json` in that profile. Run `npm test` from this folder to run the automated tests, or `node --test tests/*.test.mjs` if npm is not on PATH.

The shared profile and original `.romdex` backup are private runtime data, including an encrypted token only if you explicitly remembered the connection. Preserve them locally; neither belongs in a distributed ZIP.


## Work Row Selection

Grab handles and checkboxes occupy a fixed 48 px gutter at the left. The expansion triangle, status light, title, notes marker, and inline ID indent together. Leaf rows retain the triangle's empty alignment slot; priority and complexity remain left-aligned.

Checkbox clicks toggle membership without clearing other checked items. Ctrl-click (or Command-click) adds/removes nonconsecutive items. Shift-click selects a range in current visible order; Ctrl+Shift-click adds that range. Collapsed, filtered-out, and out-of-scope rows are excluded. Unchecked boxes appear on hover or keyboard focus; checked boxes stay visible. Space toggles a focused checkbox.

One checked item updates Details content without changing the pane size; multiple checked items display exactly “Multiple Items are Selected.” Clicking a task name clears checkbox selection and opens that item normally. Background clicks leave selection and pane size unchanged. Changing selector scope clears the selection. Search, completed filtering, collapse, deletion, and native refresh prune hidden/missing rows; checkboxes are session-only and do not create YouTrack changes. ESC clears them while retaining selector scope.

Editor text is saved before selection changes; a valid inline rename is saved without adding another row. Finish or cancel a nonblank new-item draft before selecting checkboxes. With multiple checked siblings, Tab from a checkbox or the Work navigation context opens a new-parent title editor. Enter on a nonblank title commits the group; empty Enter or Escape creates nothing. Drag a checked item grip to move the whole selection as a block. Mixed-parent selection is rejected. Selected parents carry their complete subtrees without changing descendant links.

## Recoverable Group Moves

Grouping and bulk moves stage all local changes in one durable transaction. A group parent occupies the first selected sibling's position; selected siblings retain their order. Same-parent reordering stays local and does not send unnecessary YouTrack parent edits.

The group progress notice shows how many item updates have been confirmed. Before starting a remote group, the service checks that its selected items still exist under the expected shared parent. Native moves/removals require renewed selection. YouTrack parent changes are separate requests; a partial failure keeps confirmed work and queues the remainder for review/retry. Cancelling Remaining Group Changes removes only unsent actions, leaving confirmed YouTrack changes in place. Unrelated later note edits are kept separately. Ambiguous new-parent creation requires checking the existing ticket before retrying, preventing duplicate parents.

Deleting items involved in a queued group cancels its remaining links before staging the confirmed deletion. Deletion is blocked while that group is being sent. Bulk selections support up to 1,000 items; queues are sent in batches of at most 1,000 operations. Saves, notes, comments, assigned status and child relationships retain their existing behavior.

## Full Item Editor

The hover pencil opens **Edit Item** without resizing or reopening Details. Edit the name, notes/instructions, assigned status, priority, complexity, assignee, due date, other editable PMON custom fields, and existing ticket tags. The menu refreshes project choices and the current ticket from YouTrack; saved choices remain available for offline work after the first successful refresh. Fields you have already started editing retain your input during that refresh. Tab navigates the form normally. Cancel or Escape discards only unsubmitted form changes; Save Item Changes stages a durable edit and uses the existing automatic/manual synchronization and conflict-review flow.

Assignee choices come from the project's eligible-user bundle. Unassigned and empty dates are allowed only when the project permits them. Dates use YouTrack's date-only representation, preserving the selected calendar day. Estimation accepts hours/minutes, such as **2h 30m**, without assuming a working-day length. Spent Time is shown read-only when calculated from YouTrack work logs. Each additional custom field remains an independent conflict target; unrelated native edits are preserved. Tags assign/remove existing visible tags on the ticket and do not change tag definitions or sharing.

An untouched native Show-stopper priority remains Show-stopper. Choosing URGENT writes Critical. For parents with children, Assigned Status edits the retained local value; children still determine the displayed/native effective status. The retained value becomes visible when the parent has no children.

Double-click a Work Pane name or press **F2** with its name focused for quick inline renaming. Name-editor Tab nesting and Enter behavior are retained. Only a single click on the name reopens collapsed Details; checking items or opening Edit Item leaves the tray collapsed.

Multi-field edits are validated before writes. YouTrack field updates and tag assignments are separate requests: if a later tag request fails, confirmed changes are retained and remaining work is queued for review/retry. The conflict pane reports confirmed fields and tag actions. YouTrack permissions and workflows can still reject an edit; ROMDex keeps the unsent operation available for review rather than discarding it. Attachments are scheduled for R07.

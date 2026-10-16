# ROMDex v0.2 · Pokémon Workspace

ROMDex is a plain HTML/CSS/JavaScript dashboard for the **PMON** YouTrack project. It uses the NPCDex red shell, green panels, cream text, image selectors, and status lights.

## Open ROMDex

Double-click **Start-ROMDex.cmd**. Your browser opens at **http://127.0.0.1:4322**. The service runs in the background; a command window does not need to stay open.

The launcher uses the Node.js runtime already installed with Codex on this computer. On another computer, install Node.js 22 or newer from https://nodejs.org. No package installation is needed.

To stop the service deliberately, double-click **Stop-ROMDex.cmd**. Restart it with Start-ROMDex.cmd. Pending work remains saved locally.

## YouTrack Connection

Create a permanent token on **thegobindsingh.youtrack.cloud**, signed in as your own account with access to PMON. Select the **YouTrack** scope. In ROMDex, click **Connection**, enter the token, and select **Connect & Sync**.

Optional: check **Remember This Connection on My Windows Account**. Windows encrypts the token for the current user. Otherwise, it stays in service memory and must be entered after a service restart. Tokens are not saved in the browser or included in the ZIP package. A remembered token belongs to this Windows account and should not be copied to another computer.

ROMDex adds missing Standby and Critical / Debugging values when your YouTrack account has Update Project permission. It preserves existing State values and unrelated custom fields.

## Project Hierarchy

- **Tier 1:** Epics, which are the existing root issues.
- **Tier 2:** Stories.
- **Tier 3:** Verses.
- **Deeper Levels:** nested Tasks.

The hierarchy key is **EPIC → STORY → VERSE**. These are depth-based display labels; existing titles, notes, IDs and YouTrack Type values are preserved. New Stories and Verses continue to use the existing native Feature type.

Select an item in the left pane to narrow the work table. Expand its selector to reveal the next tier. Selecting a Verse shows only its descendant tasks. Click a task title to view its notes/instructions, comments, and properties in the docked Details Tray below the Work Tray.

Selector tiles use an image window above their title. Their inherited status light sits at top-left, Add Child and Rename controls at top-right, and the expand/collapse arrow at bottom-right. Controls appear on hover or keyboard focus and remain visible on mobile. Click the title area to select or drag a category; click its image window to assign an image, including when the window is empty. Rename opens and focuses the existing title editor in Details, reopening that tray if necessary. The arrow rotates and smoothly reveals the next tier without changing the selected Work view.

Drag the handle between the trays to adjust their heights. Pull it to the bottom to collapse Details; drag it upward to reopen. Collapsing preserves the selected task and its editor contents. Selecting a different task while collapsed updates the selection without reopening the tray. The close button collapses Details, and the expand button gives it more writing space without covering the task list. The divider position and collapse preference are saved locally in the current browser.

Keyboard alternative: focus the divider and use **Up/Down** to resize, **Shift+Up/Down** for larger steps, **End** to collapse, **Enter/Space** to collapse or reopen, or **Home** to give Details the maximum available space. On narrow screens, the selector tray sits above the two docked trays; the table retains horizontal scrolling.

Drag a task grip to reorder or move the task. Drag sideways to change its nesting level. Drop onto a selector to move into that category. The destination appears before release. Descendants, notes, comments, and status remain attached to the moved issue. Circular moves are rejected.

Manual display order, selector images and retained directly assigned statuses are stored locally in ROMDex. Parent relationships, titles, notes, comments, priorities and displayed statuses are stored in YouTrack. YouTrack's personal/contextual custom-order system has no straightforward equivalent for this shared hierarchy, so ROMDex does not write those custom-order controls.

## Add and Edit Items

- Use **+** at the top of the left pane to add an epic.
- Use a selector's **+** or a row's hover/focus **+** to add a child.
- **Enter:** commit the title and open the next blank row at the same level.
- **Tab** in a new title: make it a child of the preceding item.
- **Shift+Tab:** move the draft out one level.
- **Enter on an empty draft:** discard the blank row without creating a YouTrack issue.
- **Escape:** cancel the title editor.
- **Double-click a title** or choose **✎** to rename it.
- Click a selector's **image window** to assign or remove an image.

The small pixel pencil indicates actual notes/instructions. A ClickUp migration footer alone does not count as a note, although the original text remains preserved. Comments are separate from notes. Priority and Complexity can be edited by clicking their tags in the table or Details Tray. There is no separate dropdown arrow; the choices also support keyboard input.

The row's hover/focus menu contains Add Child, Rename and a pixel trash icon. The trash icon opens the existing deletion review; task titles still open Details. Deleting an existing item deletes it from YouTrack. The review dialog lists all descendants to be deleted. Cancelling preserves them. Deleting a different item leaves the selected task's Details open; deleting the selected task clears it. Blank drafts have not yet been created in YouTrack.

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
| Pulsing yellow | In progress | In Progress |
| Flashing red | Critical / debugging | Critical / Debugging |
| Green | Complete | Done; existing Fixed also displays green |
| Pulsing blue | Standby / ready for an agent | Standby; existing Prompt Ready also displays blue |

Dynamic lights use NPCDex's 7 px lenses with a fixed black inset ring at 50% opacity. Yellow and blue fade over four seconds; blue fades between light and dark blue. Red blinks over 1.2 seconds. Complete task lights stay green; the Save Changes light retains its green pulse. Reduced-motion preferences disable the animations. The three decorative header lamps remain static.

The Work table has no separate Status column. Each row starts with its clickable status light, indented for its nesting level. Click the light to choose a status; its click target is larger than the visible bulb. Parents can also receive a directly assigned status.

Parent lights are inherited recursively: any red makes the parent red; otherwise any yellow or grey makes it yellow; otherwise at least one blue makes it blue; only all green makes it green. A parent's directly assigned status stays saved while children determine its displayed light. When its final child is moved or deleted, that saved status becomes visible and is written to YouTrack's State field. Computed parent states also save to YouTrack.

Retained assignments are stored in `.romdex/assigned-statuses.json` on this installation, with pending edits protected by the existing browser queue and workspace backup. No additional YouTrack field is created. Native YouTrack State changes update the local assignment; if the item still has children, their inherited status remains the displayed state. ROMDex's own inherited-state writes preserve the separate assignment. Conflicting assignments open the existing review pane, labeled **Assigned Status** with the value **Saved in ROMDex**.

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

Pending edits are persisted in IndexedDB before a push, with a disk backup in `.romdex`. Network interruption does not discard them. Leave pending work in the same browser profile until it has synchronized. Browser closure warns when changes are pending. Images and manual ordering remain local workspace preferences.

## Prototype Limits

This local prototype synchronizes while its page and service are running and Auto-Sync Data is On. Closing the page stops periodic checks; opening it pulls the latest changes when enabled. Internet interruptions cannot be prevented; indicator lights report confirmed request outcomes rather than a continuous connection guarantee.

Conflict checks use YouTrack's REST API and fresh field comparisons. They are optimistic checks, not an atomic lock against another person editing the same field during the final write request. A production version needing strict concurrent-write guarantees should add a transactional YouTrack endpoint/workflow. No existing notes or comments are silently replaced to reconcile a detected conflict.

See **QA-Report.md** for verification results. The API adapter is limited to this YouTrack instance and PMON. It is served only on the local loopback address.

## Upgrade This Installation

The v0.2 ZIP contains application files and the original imported PMON seed. It excludes private runtime data and your current browser preferences. Replace the application files in the existing ROMDex folder while preserving its **.romdex** folder, and continue using the same browser profile and local URL. That preserves images, manual order, pending work, retained status assignments and any remembered connection. The current installed folder already contains these revisions.

Final QA passed all 84 tests and live checks in both synchronization directions; see **QA-Report.md**.

## Files

`public/index.html`, `styles.css`, and `app.mjs` implement the interface. `core.mjs` defines hierarchy and conflict rules. `store.mjs` handles durable local changes; `sync-control.mjs` defines connection-light states. `server.mjs` and `youtrack.mjs` provide local authentication and YouTrack access. `sync-settings.mjs` enforces the shared preference, persisted in `.romdex/sync-settings.json`. Run `npm test` from this folder to run the automated tests, or `node --test tests/*.test.mjs` if npm is not on PATH.

`.romdex` is runtime data, including an encrypted token only if you explicitly remembered the connection. Keep this folder private and preserve it when moving this installation. It is excluded from the distributed ZIP.

# ROMDex Task 7 Review

Completed October 13, 2026. Task 7 corresponds to original Item 7, Connection Indicator and Sync Toggle. The user authorized this task with PASSKEY, then replaced the proposed Work Pane cog with an **Auto-Sync Data** On/Off toggle beside Save Changes. Task 8 has not been started.

**Result:** The header synchronization text is removed. Auto-Sync Data appears immediately to the left of Save Changes; a separate connection lens appears immediately to its right. The toggle supports pointer and keyboard input and exposes its On/Off state as an accessible switch. Save Changes retains its existing appearance and embedded green/red save indicator.

| State | Separate Connection Light | Save Light |
| --- | --- | --- |
| Automatic sync On; connection healthy | Blue, four-second pulse | Green while edits can synchronize normally |
| Connection or service unavailable | Red, 1.2-second flash | Red only if unsaved work needs intervention |
| Automatic sync Off | Dark blue, steady | Green when clean; red for pending work |
| One-time manual sync while Off | Dark blue, steady | Reflects save progress, success or required review |

The connection lens uses the existing 7 px appearance and fixed 1.5 px black inset ring at 50% opacity. Reduced-motion rules still disable illumination animation. Hover text and an accessible status label explain the connection state without restoring visible header text. Token presence alone does not mean YouTrack is reachable; actual requests supply the connection health.

**Shared preference:** Off applies to all windows using this local service and is persisted in `.romdex/sync-settings.json`. The service gates automatic synchronization, snapshots, comment refreshes and related automatic data routes. A stale window cannot bypass Off. Requests already in progress finish before a setting change is committed; the toggle shows a pending disabled state during that update. Other windows check the setting approximately every five seconds. These local checks and workspace backups continue while Off without contacting YouTrack.

The browser caches the preference separately from the issue workspace. Settings polling does not rewrite another window's workspace queue. When a remembered connection is restored during a disabled service restart, the service retains the credential without contacting YouTrack until an explicit synchronization or re-enablement. No credentials were exposed or included in new deliverables.

**Manual Save:** Clicking Save Changes while Off runs one explicit synchronization cycle. It reads fresh YouTrack values before reconciling queued edits, pushes permitted changes and returns current incoming data. The Off preference remains in place afterward. Conflicts retain both versions and open human review; resolving them authorizes another explicit cycle while still leaving automatic sync Off. New edits made after a manual cycle wait for another save. Turning the toggle On resumes reconciliation and automatic synchronization.

**Automated validation:** All 69 checks pass: the prior core, assigned-status, Save-light and tray checks, extended service integration, 17 sync-control checks and a disabled-startup check. New cases cover service-wide enforcement with zero provider calls while Off, one-time bidirectional saves, native same-field conflicts while paused, explicit conflict resolution without re-enablement, dormant startup, re-enabling with pending work, stale windows/settings responses, online/page-return triggers, connection loss/recovery and local save failure without falsely claiming a lost YouTrack connection. The integration provider is controlled and never contacts production YouTrack.

**Isolated browser validation:** Used the actual frontend/workspace code with synthetic issues and separate IndexedDB/local-storage keys. With Off, a local status edit remained pending and a simulated native title change remained absent from the dashboard. Provider counters stayed at one read and zero writes, including after opening task notes. Manual Save then increased them to two reads and one write, displayed the native title and saved the local status, with the toggle still Off. Reloading while Off produced zero provider reads/writes. Space toggled sync back On. Simulated connection loss produced a flashing red connection light with a green Save light in a clean workspace; pending work then made Save red. Restoring the provider and saving returned connection blue and Save green. Temporary fixture files were moved out of the delivered application after testing.

**Live validation:** After the user's service restart, the dashboard reported a healthy YouTrack connection and all 287 items. Turning Off in one live window was reflected in the second window, with steady dark-blue connection lights. A manual Save completed while the preference remained Off. Turning On resumed synchronization and returned a healthy blue connection and green Save light. The persisted service preference was verified as enabled at completion. No live task titles, notes, priorities, statuses or parent links were intentionally edited for QA; mutation and conflict scenarios used controlled data.

**Layout:** At 1440 × 900, Save Changes remains x=1284.16, y=32.75, width=131.84 and height=34 px. The new lens is x=1423, y=46.25, size=7 px. Header height remains 84 px. At 900 × 900 and 390 × 844, controls fit without document horizontal overflow. The mobile action row reserves 14 px for the adjacent connection light; the Save button retains its 34 px height and 12 px font. Existing Work/Details and selector styling remains in place. Live browser console error logs were empty.

**Limits:** Connection lights report the last confirmed request outcome; they cannot detect a network loss between requests. Disabled synchronization intentionally pauses both directions. A request already underway cannot be retroactively undone. The existing optimistic REST conflict checks remain in effect.

**Changed files:** `sync-settings.mjs` and `public/sync-control.mjs` were added. `server.mjs`, `youtrack.mjs`, `public/store.mjs`, `public/app.mjs`, `public/index.html`, `public/styles.css`, integration tests and new sync tests implement the behavior. README.md and the revision plan were updated. The installed application is updated; final ZIP packaging remains a separate approval checkpoint.

**Evidence:** ROMDex-Task-7-Preview.png and ROMDex-Task-7-Header.png show the live On state. ROMDex-Task-7-Mobile.png shows mobile layout. ROMDex-Task-7-Off-Pending.png and ROMDex-Task-7-Lost-Connection.png are isolated-fixture evidence.

**Checkpoint:** Task 7 is complete. Await a new PASSKEY for Task 8, Priority Tags and Complexity (original Item 9).

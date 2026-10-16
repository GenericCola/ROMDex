# ROMDex v0.2 — Final QA Report

Final review completed October 14, 2026, following the user's PASSKEY. This report supersedes the historical v0.1 baseline. The nine visual revisions and final combined QA are complete.

## Result

All **84 automated tests pass**, all **21 JavaScript modules pass syntax checks**, and the PowerShell launcher parses successfully. Live PMON checks verified both synchronization directions, comments, status inheritance, Complexity conflicts and pointer reparenting. The four disposable live issues were removed; **287 project items remain**. Auto-Sync Data was restored to **On**.

## Integrated Interface Review

The header, title, decorative lamps, Save Changes button, recessed selector frame and screen frames retain the NPCDex v2.42 reference measurements. At 1440 × 900: the header is 84 px high; the 48 px lens is at x=24/y=16.5; the 31 px title starts at x=89; Save Changes is 131.84 × 34 px at x=1284.16/y=32.75. The Vertical Tray is 220 px wide. Work and Details start at x=247 with a 1179 px width and default heights of 362 and 420 px.

Dynamic bulbs remain 7 px with fixed 1.5 px, 50%-black inset rings. Decorative header lamps remain static. Green Save illumination continues during healthy automatic writes; required manual attention uses red. The separate connection light pulses blue when healthy, flashes red when unavailable, and remains dark blue when paused. Priority/Complexity tags retain the reference typography, borders, padding and colors, without visible dropdown arrows.

EPIC → STORY → VERSE uses actual arrows. Interface labels use Title Case; hierarchy keys and tag values keep ALLCAPS. Authored titles, notes and comments retain their capitalization. New Stories and Verses still use native Type Feature.

Compared live computed styles with the reference source, saved NPCDex preview and the previous measured task reviews. A live side-by-side NPCDex session was not used. The docked resizable Details Tray, shared sync toggle and mobile hierarchy layout are intentional, approved ROMDex adaptations.

## Final QA Fix

Focusing an offscreen task could scroll the outer Work Tray and clip its header, despite the table having its own scrollbar. The frame now uses CSS overflow:clip. Its internal table still scrolls normally. After clicking the final row, outer scrollTop stayed zero while the table scrolled to the task. The header stayed at y=100 inside the tray at y=94. The same focus check passed on mobile. This fix changes only the tray's overflow rule; it does not change task data or service behavior.

## Live YouTrack Verification

Disposable PMON-295 through PMON-298 formed an Epic → Story → Verse → Task hierarchy. Creation through the ROMDex service was independently read through the YouTrack connector, including the parent link, native Type and initial Complexity.

- ROMDex's browser sent leaf notes, Major priority, HIGH Complexity, Standby status and a comment. An independent YouTrack read confirmed each value and the comment. The QA root inherited Standby.
- Native YouTrack edits changed the leaf title, notes, State, priority to Show-stopper, Complexity to MID and added another comment. All appeared automatically in the open dashboard. Show-stopper displayed as red URGENT while retaining its native value.
- With Auto-Sync Off, a local HIGH Complexity edit remained pending while a native edit changed it to LOW. Manual Save opened conflict review showing both values. Choosing the YouTrack version resolved it, completed a one-time sync and left Auto-Sync Off. Re-enabling restored automatic synchronization.
- A physical pointer drag moved PMON-298 from the Verse PMON-297 to the Story PMON-296. An independent YouTrack read confirmed the new parent and preserved fields/comments.
- Cleanup validated the recorded IDs, disposable description marker and absence of unexpected children before deleting the four QA items. No QA issues remain; the project returned to 287 items.

Existing project field updates occurred during this review. The data comparison exactly matches the pre-QA checksum after accounting, in memory only, for 16 newly assigned Complexity values and the priority change on Debug Features. All other recorded IDs, titles, descriptions, parent links, statuses, priorities and Types match. Current field values were retained; no historical reconstruction was written back. The QA operations intentionally targeted only PMON-295 through PMON-298.

## Controlled Tests and Browser Scenarios

The full suite covers every status combination, recursive inheritance, local retained parent assignments, native State changes, disk-persistence failures, cycle prevention, queued-operation preservation, ID remapping, incoming edits during pending work/conflicts, in-flight edits, ambiguous-response review, comment retry safety, deletion conflicts, Complexity setup/read/write/clearing, native Show-stopper preservation, shared sync enforcement, dormant restart and one-time manual synchronization while Off.

The first full-suite attempt could not replace files in the sandbox's system temp directory. Running the same suite with temporary files in the writable workspace passed 84/84 without service-code changes. Controlled provider tests never contact production YouTrack.

An isolated browser fixture used the current frontend and separate storage. Verified Enter creation, Tab/Shift+Tab nesting, empty-row discard, inline rename, pointer reparenting, hidden parent status assignment and restoration after its child moved, reload persistence, image assignment/removal, Details collapse/reopen and selection while collapsed. Deletion review listed the correct subtree and cancellation preserved it.

Simulated provider loss produced a red connection light with a green Save light in a clean workspace. A queued edit turned Save red; provider recovery and manual Save restored blue connection/green Save. Fixture and live console error logs were empty. The divider had no full-width focus highlight.

## Responsive and Access Checks

Desktop 1440 × 900, tablet 900 × 900 and mobile 390 × 844 were inspected. No document horizontal overflow was found. The tablet selector frame is 175 px wide. Mobile uses a 660 px table inside a 349 px scroller; tray controls remain accessible. Refreshed previews include the populated Details Tray and the corrected fixed Work header.

Cross-origin writes, cross-site reads and encoded path traversal were rejected with HTTP 403. Private runtime files are unavailable through the static file server. Tokens remain in service memory or Windows-protected runtime storage; they are not present in browser storage or the download package.

## Delivery and Practical Limits

ROMDex-v0.2.zip contains the current application, launchers, tests, README, this report and preview. Packaging uses an explicit file list, excludes .romdex, encrypted credentials, logs, Git metadata and temporary QA data, and verifies each archived file against its source hash. The original v0.1 ZIP and selector data/code archive remain available separately.

The installed .romdex folder and originating browser profile retain local images, ordering, pending edits, directly assigned parent statuses and connection settings. Preserve them when upgrading this installation. The distributed ZIP includes the original imported PMON seed, not a private runtime backup; opening a connected installation reconciles with current YouTrack data.

Automatic synchronization needs an open ROMDex page, the local service, Auto-Sync On and a reachable YouTrack connection. Polling runs approximately every 15 seconds; indicators show confirmed request outcomes rather than continuous connectivity. Manual Save overrides Off for one cycle. REST conflict checks remain optimistic, not an atomic concurrent-write lock.

No Git commit or publication was performed. No requested revision tasks remain pending.

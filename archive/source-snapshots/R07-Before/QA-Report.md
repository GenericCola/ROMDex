# ROMDex 0.3.0 — Final QA Report

Reviewed October 14, 2026, under the user's Task 8 PASSKEY. Tasks 1–8 and the later all-untouched/title-entry corrections form this release. The previous v0.2 report and ZIP are retained separately.

## Result

The full suite passed **117/117 tests**. All **31 JavaScript modules** passed syntax checks, and the PowerShell launcher parsed successfully. The user launched the 0.3 release service; its build matched the source and it restored the remembered YouTrack connection without a new token. Live synchronization was verified in both directions on four disposable issues, which were subsequently removed.

## Interface and Integrated Checks

Compared NPCDex 2.42 and ROMDex at **1440 × 900**. Both use an 84 px header, a 48 px lens at x=24/y=16.5, a 31 px title font starting at x=89, and a Work/Inventory screen at x=247/y=94 with width 1179 px and height 362 px. Screen colors, 6 px frames, 10 px corners and typography match. Save retains NPCDex's 131.84 × 34 px dimensions, font, fill, border and corners. Its approved 24 px left shift and subsequent header-control alignment place it at x=1260.16/y=23.5 instead of the reference's x=1284.16/y=32.75.

Header controls share a 34 px height. Selector tiles are uniformly 68 px high, with the exact NPCDex favicon and canonical Standard Settings Icon. Tile Settings action controls are 34 px high. Back is 24 px square with a centered SVG; the single-line title is 40 px high. The accepted connection lens is an 11 px bordered circle containing a centered 7 px light; ordinary indicators retain the shared NPCDex treatment.

Desktop full-height Details filled its 792 px host and hid Work/divider. Back returned through child/grandchild views and stopped at the starting item. Minimize/reopen retained a 52 px grip. Keyboard creation and Tab nesting produced the correct fixture hierarchy; empty Enter discarded the draft. Completion filtering removed green rows while retaining context and Details. Search, inline IDs, paper notes indicators, left-aligned tags and hover actions remain available.

After focusing the final row of a long table, Work's outer scrollTop remained zero while its internal table scrolled. Sticky header and scroller tops were identical. Tablet **900 × 900** and mobile **390 × 844** checks found no document horizontal overflow; the tablet selector is 175 px wide. Mobile full-height Details occupied its 711 px host using keyboard activation. Browser pointer activation on offscreen mobile controls was unreliable in this tooling; keyboard activation and desktop clicks verified the pane behavior.

Final QA fixed a minimum-height omission: the visible connection/offline banner's height and margins now contribute to Work's minimum. At **1280 × 720** with the notice visible, a 335 px Work Tray provided a 111 px table viewport for its 40 px header and 36 px row. The first row remained reachable.

## Synchronization and Conflicts

In an isolated browser provider, connection loss left Save green when clean; queued edits turned it red. Recovery/manual Save restored blue connection and green Save while preserving notes. With Auto-Sync Off, a local LOW Complexity edit conflicted with native MID. Manual Save opened review; choosing the provider version retained MID, closed review, kept Auto-Sync Off and restored dark-blue connection/green Save. These checks used no real project data. Fixture and live browser error logs were empty.

The suite covers credential/profile migration, all status combinations and recursive inheritance, retained assignments, title spaces/cursors, incoming changes during pending work/conflicts, retry ambiguity, comments, deletion review, Complexity, Show-stopper, cycles, filtered insertion guides and manual synchronization while paused. Pointer drop destination logic and filtered sibling boundaries were exercised with isolated tests; a new physical pointer drag was not repeated in this pass.

## Live YouTrack Verification

PMON-302 through PMON-305 formed a disposable Epic → Story → Verse → Task hierarchy. Independent connector reads confirmed creation, parent links, Types and LOW Complexity. All-untouched root/leaf States were To do.

- Browser edits to PMON-305 pushed a multiword title, notes, Major priority, Standby, INSANE Complexity and a comment. An independent YouTrack read confirmed every value and the comment count. The root's native State inherited Standby.
- Native connector edits changed title, notes, State to Critical / Debugging, Priority to Show-stopper and Complexity to MID, and added another comment. All appeared automatically in ROMDex, including red inherited readiness and URGENT display for the preserved Show-stopper value.
- A guarded service move placed the leaf under Story PMON-303. An independent read confirmed the parent, preserved fields and both comments.
- Cleanup validated recorded IDs, the disposable marker and absence of unexpected children before deleting the four QA issues. None remains. The project had 287 items before creation and 293 after cleanup, reflecting concurrent project changes during QA. The checksum therefore differed; no old-data restoration was attempted. Explicit QA edits/moves/deletes targeted only the four recorded IDs. Normal automatic synchronization continued computing parent States.

Cross-origin writes, cross-site reads and encoded traversal were blocked with HTTP 403. Private runtime credentials were unavailable through the static server. Tokens were not entered in chat or included in packaging.

## Packaging, Upgrade and Practical Limits

ROMDex-v0.3.zip uses an explicit source allowlist and excludes private runtime folders, credentials, logs, Git metadata and temporary fixtures. Every archived file is checked against its source SHA-256. The extracted package is smoke-tested with an isolated data directory and no token; packaging results are recorded separately.

The distribution contains the original imported project seed, not the current private workspace backup. Existing Windows-account installations reuse %LOCALAPPDATA%/ROMDex/thegobindsingh-PMON; the original .romdex remains a migration backup. Preferences/queued edits retain their originating browser profile. Explicit ROMDEX_DATA_DIR overrides stay isolated. Upgrading does not copy a packaged seed over established user data.

This release still uses the background local service and browser launcher, with Node.js 22 or newer available. The unified standalone desktop host is the next project. Automatic sync requires the service, an open page, Auto-Sync On and reachable YouTrack; polling is approximately every 15 seconds. Conflict checks remain optimistic REST checks rather than a cross-client atomic lock.

No Git repository exists here, so no Git commit was created. No publication was performed.
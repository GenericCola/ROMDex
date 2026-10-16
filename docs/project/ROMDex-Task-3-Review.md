# ROMDex Task 3 Review

Completed October 13, 2026. Task 3 corresponds to original Item 2, Save Changes Button. The user authorized the next priority task with PASSKEY and affirmed the revised indicator behavior. No subsequent task has been started.

**Result:** Save Changes now uses NPCDex's button appearance, font, header alignment and embedded light geometry. Its light pulses green during healthy automatic synchronization, even while edits are waiting or in flight. It flashes red only when there is uncommitted work that cannot be sent. This prevents routine edits from causing red/green flicker.

| Property | Verified Value |
| --- | --- |
| Desktop Bounds at 1440 × 900 | x=1284.16, y=32.75; 131.84 × 34 px; right edge=1416 |
| Background / Text | #f6cd61 / #293023 |
| Font | 650 14px/1 system-ui, sans-serif |
| Border / Corners | 1 px solid #583921 / 6 px radius |
| Padding | 8 px vertically, 12 px horizontally |
| Lower Shadow | 0 3px 0 #59121f |
| Embedded Light | 7 × 7 px; 9 px left margin; desktop x=1396, y=46.25 |
| Healthy Animation | NPCDex green illumination fade, 4 seconds |
| Required-Save Animation | NPCDex red blink, 1.2 seconds |
| Mobile | 34 px height, 12 px font, 7 px / 9 px padding |

Hover brightening, keyboard focus, disabled opacity and reduced-motion behavior follow the reference treatment. The reference Save light's ring is retained for this task; Task 4 will apply the separately requested 50%-black inset ring consistently across dynamic lights, including Save. The three static header lamps are excluded from that future change.

**Verification:** Compared NPCDex v2.42 source styles and its saved preview with live ROMDex computed styles and screenshots. At 1440 × 900, the approved header is still 84 px high, title begins at x=89, lens remains 48 × 48 px at x=24/y=16.5, and all three decorative lamps remain 9 × 9 px at their approved positions. Tray geometry is unchanged. At 390 × 844, the button remains visible, its text fits, and the document has no horizontal overflow. Browser error logs were empty.

Clicked Save Changes in the connected application: synchronization started with a green save light and finished with “All changes saved to YouTrack,” also green. No live task-content edits or forced connection interruption were used. Existing editor flushing, manual synchronization and conflict-review handling were preserved.

**Automated checks:** All 20 focused checks pass: 14 existing core checks and six new save-indicator behavior checks. They cover healthy pending work, disabled synchronization with/without pending work, connection loss, failed retries, blocked conflicts, uncertain writes, unavailable states and editor changes. The application module passes Node syntax checking. Disabled-sync cases test the indicator rule only; the UI toggle and its service behavior belong to Task 7 and are not implemented yet.

**Files:** public/styles.css and public/index.html contain the visual update; public/core.mjs defines the required-save rule; public/app.mjs applies it; tests/save-indicator.test.mjs verifies the rule. README.md and the revision plan have been updated. The service and YouTrack adapter are unchanged.

**Evidence:** ROMDex-Task-3-Header.png and ROMDex-Task-3-Mobile.png. The installed ROMDex folder contains the update. Refresh an already-open page to load it. The original distributed ZIP remains the baseline until the final approved packaging task.

**Checkpoint:** Task 3 is complete. Await a new PASSKEY for Task 4 — Dynamic Indicator Styling (original Item 3).

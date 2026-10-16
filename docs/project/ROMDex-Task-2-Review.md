# ROMDex Task 2 Review

Completed October 13, 2026. Task 2 corresponds to original Item 5, Vertical and Work Trays. The user authorized this task with PASSKEY and approved a docked Details Tray and a draggable divider during scope clarification. No later implementation task has been started.

**Result:** The Vertical Tray now uses NPCDex's dark red recessed frame. The Work Tray uses its grey-green screen border, dark green background and inset shading. Details occupies a separate screen below Work, replacing the previous side/overlay pane. The default upper allocation follows NPCDex's inventory screen; the lower tray combines the dialogue and timeline space. Users can resize the split, collapse Details by dragging to the bottom, and reopen it by dragging upward.

| Reference Frame Property | Implemented Value |
| --- | --- |
| Desktop Shell Insets | 14 px at the sides and bottom |
| Vertical Tray Width | 220 px; 250 px at viewport widths ≥1600; 175 px at widths ≤1000 |
| Desktop Gutter | 13 px; 9 px at widths ≤1000 |
| Vertical Tray Background | #681421 |
| Vertical Tray Border | 2 px solid #54121c |
| Vertical Tray Corners and Padding | 10 px radius; 10 px padding |
| Vertical Tray Shading | inset 0 1px 3px #40131d |
| Work/Details Background | #162e2b |
| Work/Details Border | 6 px solid #343e36; 4 px on mobile |
| Work/Details Corners | 10 px radius |
| Screen Shading | inset 0 0 15px #061d1870; lower edge 0 2px 0 #64151f |
| Pane Base Typography | 14px/1.45 system-ui, sans-serif |
| Divider | 10 px gap with a centered grip and a larger invisible pointer target |

At 1440 × 900, the reference default is a 362 px Work Tray and a 420 px Details Tray. At the saved NPCDex preview size, 1440 × 1000, the corresponding allocation is approximately 428 px above and 454 px below. Both screens start at x=247 and are 1179 px wide; the Vertical Tray begins at x=14, y=94 and is 220 px wide. Explicit user resizing takes precedence over the default reference allocation.

**Interaction behavior:** The split saves its ratio and collapsed state in the current browser's workspace preferences. Incoming refresh and local preference saves do not reset the split. Collapsing does not clear the selected task or editor contents. Selecting another task while collapsed leaves the tray collapsed. The close button collapses rather than clearing selection; the expand button enlarges the docked tray without creating an overlay. Keyboard arrows resize, Shift changes the step size, End collapses, Enter/Space toggles, and Home expands Details. Pointer cancellation or Escape during a drag restores the starting split. A minimum upper size protects the Work Tray controls and one complete task row when there is sufficient space.

**Detail arrangement:** On desktop, properties and children occupy the left part of Details; notes/comments occupy the right. These sections have independent scrolling. The same existing editing controls and IDs are retained. On mobile, properties and writing stack inside the lower tray, with internal scrolling. The selector tray sits above Work at narrow widths. The task table keeps horizontal scrolling within its own tray.

**Verified in the browser:** Native pointer resize, drag-to-bottom collapse and drag-up reopen at 1440 × 900. Reopening retained Super Items' notes byte-for-byte. Collapse survived reload. Selecting a task while collapsed did not reopen Details. Keyboard reopening and expansion/restoration worked. The expanded-details limit retained 50 px for a complete task row beneath the column headings. Notes and Comments tabs worked. Adding an empty child draft focused the title field; Enter discarded it without creating a YouTrack item. Checked wide, desktop, tablet and mobile viewports; the final mobile document has no horizontal overflow. No application browser error logs appeared.

**Automated verification:** All 28 checks pass: the existing 24 core/service checks plus four split-layout checks. These cover default allocation, collapse without losing the saved ratio, proportional resizing with reachable bounds, and damaged saved preferences. Node syntax checks pass. The first integration run failed when Windows denied fixture-file replacement in its sandbox temporary folder; rerunning with a test folder under work/task-2-trays passed without changing the service or adapter. Final frontend refinements were additionally checked in the browser and with the split tests.

**Reference method and intentional adaptations:** Compared the actual NPCDex v2.42 CSS with live ROMDex computed styles and the saved NPCDex preview. Work's default height follows the reference inventory screen, while the lower Details screen intentionally combines two source trays. The new divider and collapsing/resizing behavior are approved ROMDex additions. Mobile uses a bounded selector area to preserve ROMDex hierarchy navigation; it is not a pixel copy of NPCDex's map-specific contents. A live side-by-side NPCDex browser session was not used.

**Header regression check:** Header remains x=14, y=0, height=84 px; lens remains x=24, y=16.5, 48 × 48 px; title begins at x=89 with the same 31 px font; decorative lamp positions and 9 px dimensions match the completed Task 1 result. Sidebar insets were corrected without shifting these elements.

**Application files:** public/index.html, public/styles.css and public/app.mjs were updated; public/split-pane.mjs and tests/split-pane.test.mjs were added. README.md and the revision plan describe the new layout. YouTrack adapter, service and field synchronization rules were unchanged. There were no intentional live task-content or project-configuration writes for this task; normal synchronization remained active. Automated integration writes used a controlled fixture provider.

**Evidence:** ROMDex-Task-2-Preview.png shows the completed stacked layout; ROMDex-Task-2-Collapsed.png shows the full-height Work Tray with the reopening handle; ROMDex-Task-2-Mobile.png shows the mobile arrangement. The original distributed v0.1 ZIP remains the baseline; the installed ROMDex folder contains this update. Packaging is planned for final combined delivery.

**Follow-up correction:** Removed the full-width divider focus outline at the user's request. Hover and keyboard-focus feedback remains on the small grip. Verified the divider with keyboard focus and native pointer dragging; computed outline style is none in both cases, and resizing still works. ROMDex-Task-2-Handle-Fix.png shows the corrected focused handle. This was a CSS-only correction; no new automated tests were necessary.

**Checkpoint:** Task 2 is complete. Await user review and a new PASSKEY for Task 3 — Save Changes Button (original Item 2). No Save Changes styling, dynamic-light redesign, Epic tile redesign, status-column removal, synchronization-toggle work, Complexity integration or global terminology change has been started.

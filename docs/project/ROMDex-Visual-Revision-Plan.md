# ROMDex Pending Revisions and Action Plan

Prepared October 13, 2026; final review completed October 14, 2026. This report consolidates the nine requested revisions, including the subsequent corrections and decisions.

**Approval and execution:** The report PASSKEY produced this plan. Subsequent PASSKEYs authorized Tasks 1 through 9 separately and Task 10 final QA. Task 9 also incorporates the clarified use of actual arrows in EPIC → STORY → VERSE. Task 8 includes the user-requested Show-stopper display mapping, arrow-free tag controls and row trash icon. During Task 7, the user replaced the Work Pane cog with an Auto-Sync Data On/Off toggle beside Save Changes. Task 6 uses local storage for retained directly assigned statuses, as selected by the user. Task 2's scope was clarified and approved to include docked Work/Details trays and a resizable, collapsible divider. Task 3 incorporates the affirmed green save light during healthy synchronization and red only for unsaved work that cannot be sent. During Task 5, the user also requested preservation of the previous selector data for future reuse; a data/code archive was created before the selector changes. Each implementation task requires a new PASSKEY. Complete and verify exactly one task, report its changes, evidence, questions and limitations, then stop before the next task. Final combined QA is a separate approval checkpoint.

**Reference:** Use the latest cumulative NPCDex build, v2.42, in the NPCDex project's outputs folder. Inspect the rendered build and its source together; later CSS overrides take precedence. Record reference measurements before editing. Compare both tools at the same browser zoom, viewport dimensions and operating-system display scale. Match the reference rather than estimating from screenshots. User-specified ROMDex behavior takes precedence over the reference.

**Status:** Tasks 1 through 10 are complete. No approved revision tasks remain pending. See the numbered task reviews and ROMDex/QA-Report.md for validation and delivery details.

## Priority Order

Original item numbers remain unchanged so approvals can identify a task unambiguously. Layout foundations precede controls that depend on their geometry; terminology follows the new controls so the copy audit covers them all.

| Sequence | Original Item | Task | Reason for Position |
| --- | --- | --- | --- |
| 1 | 1 | Header and Title | Establish the header's reference geometry. |
| 2 | 5 | Vertical and Work Trays | Establish the frames and available content space. |
| 3 | 2 | Save Changes Button | Match the button within the corrected header. |
| 4 | 3 | Dynamic Indicator Styling | Establish the shared light style before placing interactive lights. |
| 5 | 6 | Epic Tile Controls | Match selector controls within the corrected Vertical Tray. |
| 6 | 4 | Work Pane Status Controls | Move the lights and implement retained parent status. |
| 7 | 7 | Connection Indicator and Sync Toggle | Add separate connection state and the shared Auto-Sync Data toggle. |
| 8 | 9 | Priority Tags and Complexity | Extend the table and bidirectional field synchronization. |
| 9 | 8 | Title Case and Hierarchy Terminology | Audit the complete interface and documentation. |
| 10 | Final Review | Combined QA and Delivery | Verify all approved changes together and refresh deliverables. |

## Item 1 — Header and Title

**Scope:** Match NPCDex's header exactly, changing the title to ROMDex. Remove the unrequested “Pokémon development workspace” subtitle. Match title coordinates, font family, size, weight, line height, letter spacing and text shadow. Match the lens, three decorative lamps, spacing and alignment. Restore the horizontal divider's position, thickness and margins. Account for the title's different letter widths so the lamps retain the reference placement.

**Action:** Measure the NPCDex header, inspect all applicable style overrides, then adjust only the header markup and styles needed for this match. Match responsive behavior as well as the primary desktop view. Avoid carrying the existing subtitle's extra height or spacing into the new layout.

**Verification:** Match the reference source's computed geometry and typography, and inspect rendered ROMDex screenshots at controlled viewport sizes. Check the divider and the decorative lamps explicitly. Confirm existing header controls still work. Completed at 1440 × 900, 900 × 900, and 390 × 844, with additional breakpoint checks at 1001 and 700 pixels wide. The Connection dialog opens, Save Changes remains enabled, and the task detail pane clears the mobile header.

**Boundary:** These three decorative lamps are static. Item 3 must not restyle or animate them.

## Item 5 — Vertical and Work Trays

**Scope:** Match the corresponding NPCDex tray frames: dimensions, position, background colors, outlines, corner geometry, shading, shadows, surrounding gaps and internal padding. Match their responsive sizing rules and typography where relevant to the reference appearance. Preserve the selector hierarchy, nested table and scrolling. The approved clarification docks the Work Tray above a Details Tray, using the former dialogue and timeline space for Details. A draggable separator changes their heights. Dragging to the bottom collapses Details; dragging up reopens it. Keep the selected task and its editor contents while collapsed, and persist the layout preference locally. Selecting a task while collapsed must not reopen Details automatically.

**Action:** Compare the reference layout and tray CSS, then reproduce the frame and layout measurements. Replace the side/overlay detail pane with a docked lower screen. Use NPCDex's inventory height as the default upper allocation and combine its remaining dialogue/timeline height into Details. Add pointer and keyboard resizing, bottom-edge collapse, reopening, and local preference persistence. Keep a minimum Work Tray height sufficient for its controls and a task row. Verify populated trays, collapsed selectors and an open Details Tray so content cannot accidentally force different frame sizing.

**Verification:** Complete. Checked rendered frame geometry/styles against NPCDex source and the saved reference preview, including 1440 × 900 and 1440 × 1000 desktop sizes, a 1920 × 1080 wide view, a 900 × 900 tablet view and a 390 × 844 mobile view. Verified pointer resize/collapse/reopen, retained task notes, persisted collapse through reload, selection while collapsed, keyboard reopening, expansion/restoration, notes/comments switching and empty-draft focus/discard. The approved header remains aligned. All 28 automated checks pass. See ROMDex-Task-2-Review.md.

## Item 2 — Save Changes Button

**Scope:** Match NPCDex's button color, dimensions, position, shape, border, drop shadow, font, padding and spacing. Match the embedded indicator's reference geometry. Its dynamic indicator treatment is subsequently governed by Item 3.

**Action:** Copy the applicable reference button treatment, including hover, focus and disabled states where present. Preserve the manual save and conflict-resolution behavior. Establish an anchor for Item 7's separate adjacent connection light without allowing the new light to displace the button from the agreed reference position.

**Verification:** Complete. Compared rendered bounds, font, colors, border, shadow and embedded light geometry with NPCDex's reference source and saved preview. Checked desktop and mobile rendering, healthy synchronization and manual Save Changes through completion. All 20 focused core/save-indicator checks pass. Existing conflict-review dispatch and save handling remain unchanged. This task does not introduce the separate connection indicator yet. See ROMDex-Task-3-Review.md.

**Confirmed behavior:** The embedded save light pulses green when no manual save is needed, including while healthy automatic synchronization queues or sends edits. It flashes red only when unsaved work cannot be sent: disconnected/failed synchronization, a blocking conflict, or disabled synchronization once Item 7 adds that toggle. A clean workspace does not flash red merely because its connection is lost. The save light no longer turns blue during synchronization. Item 7's separate connection light retains the approved blue pulse for a healthy connection.

## Item 3 — Dynamic Indicator Styling

**Scope:** Standardize dynamic lights in selectors, Work Pane rows, task details and the Save Changes button. Match NPCDex's appropriate light sizing, shape, shading and visual treatment. Replace colored outer rings with a black ring at 50% opacity to represent an inset. Remove enlarged variants. Do not change Item 1's static decorative lamps.

**Action:** Consolidate the dynamic light styles so every applicable location uses the same standard. Preserve meaningful status colors and animations: grey untouched; yellow in progress with a fade; red critical/debugging; green complete; blue standby fading between light blue and dark blue. Apply the same standard to Item 7's connection light when that light is added.

**Verification:** Complete. Verified 7 px lenses and a fixed 1.5 px, 50%-black ring in selectors, table statuses, Details status, child lists, status choices and Save Changes. Inspected all five colors and the parsed animation rules in the browser. Yellow and blue fade over four seconds, red blinks over 1.2 seconds, green task lights remain steady, and the green Save light retains its four-second pulse. Desktop and mobile geometry checks pass; static header lamps and Save button bounds are unchanged. Reduced-motion rules disable illumination animation. See ROMDex-Task-4-Review.md.

## Item 6 — Epic Tile Controls

**Scope:** Bring Epic tiles into line with NPCDex: dynamic status light at top-left; Add Child (+) and Rename (pencil) at top-right; expand/collapse arrow at bottom-right. Match NPCDex's arrow and expand/collapse animation. Remove the Set Image button and use the image window itself to open image selection, including when empty.

**Action:** Reposition controls using the reference layout. Reuse the existing child creation, renaming and image assignment flows. Prevent control clicks from triggering an unintended tile selection or expansion. Preserve drag targets and hierarchy navigation.

**Verification:** Complete. Selector tiers use NPCDex's full-width image/label arrangement and corner controls. Verified independent image settings, Rename focus and reopening of collapsed Details, Add Child focus/creation/empty-row discard, image assignment/removal and persistence, keyboard expansion, both Work-row and selector-title dragging onto another Epic, and Tier 3 filtering. Data-changing checks used an isolated browser fixture; no live task-content edits were made. Arrow rotation is .22 seconds; child reveal is .36 seconds with a .12-second delay, matching NPCDex. Desktop, tablet and mobile checks pass; 24 focused regression checks pass. Previous data/code is preserved in ROMDex-Selector-Archive-2026-10-13.zip. See ROMDex-Task-5-Review.md.

## Item 4 — Work Pane Status Controls

**Scope:** Remove the separate Status column. Place the clickable status light at the far left of each item, indented once per nesting level and aligned consistently. Clicking any item's light opens the status picker, including parents.

**Parent behavior:** A parent may receive a directly assigned status at any time. Its displayed light continues to inherit from its children while it has any children. Its retained directly assigned status becomes visible when it has none. Following the October 14 correction, all-grey children yield grey. Any red yields red; otherwise any yellow or mixed grey yields yellow; otherwise a mixture consisting only of green and blue with at least one blue yields blue; all green yields green.

**Action:** Move the status control into the title row area without reducing its click target to the tiny visible bulb. Preserve row selection, expand/collapse, drag reordering, horizontal nesting, keyboard creation and notes indicators. Add durable storage for the directly assigned parent state separately from the inherited state, with appropriate YouTrack synchronization and conflict handling.

**Confirmed storage decision:** The user selected local ROMDex storage for the retained assignment. The service persists it in `.romdex/assigned-statuses.json`; pending edits use the existing browser queue and disk backup. YouTrack's State continues to hold the displayed status. Native State changes update the saved assignment; journaled inherited-state writes preserve it. No YouTrack field was added. Initial records use the existing State; earlier overwritten direct statuses cannot be reconstructed from that field alone.

**Verification:** Complete. All 47 automated checks pass, including local persistence, native State changes, conflicting assignments and ambiguous inherited-write responses. Isolated browser checks verified hidden parent assignments, restoration after reparenting, reload persistence, conflict resolution, drag between Epics and draft keyboard nesting/discard. The restarted live dashboard opens the parent picker and has 287 persisted assignment records; no live task-content edits were made for QA. Desktop, tablet and mobile retain 7 px bulbs, 24 × 28 px click targets and 21 px hierarchy indentation. See ROMDex-Task-6-Review.md.

## Item 7 — Connection Indicator and Sync Toggle

**Scope:** Remove header sync text such as “Synchronizing with YouTrack” and “Can't connect to YouTrack.” Add a separate connection light immediately to the right of Save Changes. The user's Task 7 correction replaces the cog/settings approach with an **Auto-Sync Data** On/Off toggle beside Save Changes. No Work Pane cog is added.

| Connection State | New Connection Light |
| --- | --- |
| Synchronization enabled and connection healthy | Pulsing blue |
| Connection interrupted or lost | Flashing red |
| Synchronization intentionally disabled | Steady dark blue |

**Action:** Separate connection-health tracking from pending-save/conflict state. Keep the button's own light for save activity and required manual attention. Store the synchronization preference durably. Gate automatic incoming checks, outgoing saves, retries and page-return triggers according to that preference. Preserve pending edits and conflict bases while disabled. On re-enabling, read current YouTrack data and reconcile before pushing queued edits. Accessible labels and settings may explain state without restoring the removed header text.

**Confirmed manual-save policy:** Clicking Save Changes overrides disabled synchronization for one explicit synchronization cycle. The disabled preference remains in effect afterward; automatic synchronization must not resume as a side effect. The cycle reads current YouTrack values and reconciles them with queued local edits before committing. Detected conflicts still open the human review pane.

**Implemented toggle scope:** Shared across windows using this ROMDex service, persisted in `.romdex/sync-settings.json`. The service enforces Off even for a stale window that still attempts an automatic request. A request already in progress completes before the change is committed. Windows check the shared setting approximately every five seconds; those local checks do not contact YouTrack. Off survives service restarts, and a remembered connection remains dormant until a manual cycle or re-enablement. Browser preference caching is separate from the issue workspace so settings polling does not rewrite another window's pending queue.

**Verification:** Complete. All 69 automated checks pass, covering shared enforcement, zero provider requests while Off, dormant restart, incoming/outgoing one-time synchronization, paused conflicts and their resolution, recovery, stale settings responses and page-return/online triggers. Isolated browser checks verified pending local edits with unchanged provider counters while Off, one-time push/pull without re-enabling, reload persistence, keyboard toggling, red connection with a clean green Save light, pending red Save light during failure and recovery. Live checks confirmed the setting in two windows, manual Save while Off and successful re-enablement. Auto-Sync Data was left On. Desktop Save bounds are unchanged; tablet/mobile controls fit without document overflow. The light reports the latest confirmed connection outcome; polling cannot certify continuous connectivity between requests. See ROMDex-Task-7-Review.md.

## Item 9 — Priority Tags and Complexity

**Scope:** Use NPCDex's CHANGE / FINAL / REMOVE tag appearance: shape, border, shading, padding and typography. Add a visually matching blue treatment. Display tag values in ALLCAPS, an explicit exception to Item 8. Place Complexity immediately to the right of Priority.

| Color | Priority Label | Complexity Value |
| --- | --- | --- |
| Green | LOW | LOW |
| Blue | NORMAL | MID |
| Yellow | HIGH | HIGH |
| Red | URGENT | INSANE |

**Confirmed storage decision:** Complexity uses a single-choice YouTrack custom field, not issue tags. The user selected this after comparing implementation effort. Reuse a suitable existing field if available; otherwise create a dedicated Complexity field attached to PMON. Allow an empty value until assigned. Do not alter unrelated fields or shared bundles inadvertently.

**Action:** Implement readable, editable priority tags and the Complexity column. Extend field normalization, read/write handling, queued edits, conflict comparison, creation, readback verification and refresh merging for Complexity. Include task details where needed to keep editing consistent. Keep table keyboard and drag behavior intact. Verify permissions and field configuration before live setup.

**Confirmed priority mapping:** LOW ↔ Minor; NORMAL ↔ Normal; HIGH ↔ Major; URGENT ↔ Critical. The user's Task 8 correction maps native Show-stopper to the highest ROMDex priority: red URGENT. Preserve its native value during unrelated edits. The picker identifies the current Show-stopper value; explicitly selecting ROMDex URGENT writes Critical. There is no separate backwards mapping to Show-stopper. Do not delete or globally rename native priority values.

**Additional Task 8 corrections:** Remove visible dropdown arrows; edit Priority and Complexity by clicking their tags, with keyboard support retained. Replace the row hover menu's Details arrow with a pixel trash icon using the existing deletion review. Clicking a task title still opens Details. These additions were authorized directly during Task 8.

**Verification:** Complete. All 84 automated checks pass, including every Complexity value and clearing, native edits and conflicts, new-item remapping, safe/idempotent field setup, priority writes and native Show-stopper preservation. Browser fixtures verified arrow-free tag editing, persistence, Complexity conflict resolution, clearing, draft column span/nesting, subtree deletion review/cancel and deletion without clearing another task's Details. Live PMON Complexity setup succeeded; an independent YouTrack schema read confirms the four optional values. No live issue contents were intentionally changed for QA. Desktop, tablet and mobile checks pass. See ROMDex-Task-8-Review.md.

**Effort comparison:** Based on the current source, extending the existing custom-field path is likely simpler than adding tag handling and ensuring mutually exclusive Complexity tags. This is an implementation estimate, not a claim about subscription pricing. Reference: [YouTrack Custom Field Setup](https://www.jetbrains.com/help/youtrack/cloud/creating-and-editing-custom-fields.html) and [Issue Tag Operations](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-work-with-tags.html).

## Item 8 — Title Case and Hierarchy Terminology

**Scope:** Apply Title Case consistently to headings, buttons, tooltips, menu items, field labels and equivalent interface text throughout ROMDex. Keep explanatory sentences in sentence case. Preserve ROMDex, YouTrack and other proper names. The requested ALLCAPS hierarchy key and priority/complexity tags remain ALLCAPS.

| Depth | Revised Term |
| --- | --- |
| Tier 1 | Epic |
| Tier 2 | Story |
| Tier 3 | Verse |
| Below Tier 3 | Task |

**Action:** Display the hierarchy key as EPIC → STORY → VERSE. Replace Feature Suite and Feature hierarchy labels throughout navigation, creation flows, breadcrumbs, settings, dialogs, accessibility labels, help and current documentation. Audit strings introduced by all other revisions. Do not rewrite user-authored task titles, notes or comments, or change issue IDs and parent relationships. Display terminology changes do not by themselves require a YouTrack Type-field migration.

**Verification:** Complete. All 24 focused core/save-indicator/tray checks pass, and JavaScript syntax checks pass. The live interface and help use actual arrows; selector counts and table headers render correctly. Isolated creation verified Story/Verse prompts, Enter/Tab nesting, empty draft discard, preserved authored capitalization and native Feature Type for both new items. Verse filtering shows only dependent tasks. Live menus/dialogs and desktop/mobile rendering were checked with no document overflow or console errors. Historical QA evidence is explicitly identified. See ROMDex-Task-9-Review.md.

## Final Combined QA and Delivery

**Scope:** A separate task requiring a new PASSKEY after all nine revisions have been reported and approved to proceed in turn. Individual tasks include their own checks; final QA checks the integrated result.

**Action:** Compare the complete application with NPCDex at matching desktop and narrow viewports. Audit header, trays, button, dynamic lights, Epic tile controls, status placement, Auto-Sync Data toggle and connection light, priority/complexity tags and terminology. Exercise hierarchy navigation, creation, rename, image assignment, drag/reparenting, keyboard nesting, notes, comments, deletion review and conflicts. Run the existing automated suite plus meaningful tests for parent-state persistence, disabled synchronization and Complexity. Independently verify both YouTrack directions for changed behaviors, with approved disposable fixtures as needed. Review data migrations, credential handling and the absence of runtime data in distributed files. Update the QA report, README, preview and ZIP after validation.

**Final outcome:** Complete. 84 tests and all syntax checks pass. Live two-way synchronization, conflicts and pointer reparenting were independently verified; disposable data was removed. The Work Tray focus-scroll defect was corrected. Desktop/mobile views and clean packaging passed review. See ROMDex-Task-10-Review.md.

**Verification standard:** Report actual checks and outcomes, distinguishing controlled tests from live YouTrack verification. Resolve failures within the approved task, and flag scope-expanding changes before making them. A screenshot alone is insufficient evidence for synchronization behavior.

## Report-Back Contract

At the end of each approved task, report the original item number, what changed, verification evidence, remaining questions or limitations, and the next proposed item. Include a screenshot for visual changes when useful. Stop there. Do not begin the next task, perform its setup changes, or make its YouTrack configuration changes without a new PASSKEY.

**Current next action:** Completed. ROMDex-v0.2.zip and the refreshed QA report/preview are ready; the installed ROMDex folder contains the same application source.

# ROMDex Task 8 Review

Completed October 13, 2026. Task 8 corresponds to original Item 9, Priority Tags and Complexity. The user authorized it with PASSKEY and added three corrections: native Show-stopper displays as the highest ROMDex priority, tags have no visible dropdown arrow, and the row Details arrow becomes a trash icon. Task 9 has not been started.

**Result:** The table now has Name, Priority, Complexity and Actions columns. Priority and Complexity use clickable ALLCAPS tags with keyboard support, also available in the Details Tray. No dropdown arrow is displayed. Complexity is optional; a neutral dash represents an unset value.

| Color | Priority | Native Priority Written | Complexity |
| --- | --- | --- | --- |
| Green | LOW | Minor | LOW |
| Blue | NORMAL | Normal | MID |
| Yellow | HIGH | Major | HIGH |
| Red | URGENT | Critical | INSANE |

Native Show-stopper also displays as URGENT in red. Its native value remains unchanged during unrelated edits. The picker identifies its current Show-stopper value; selecting ROMDex's ordinary URGENT choice writes Critical. Other unknown native values remain visible with a warning rather than being silently converted.

**NPCDex reference:** Tags reproduce the current CHANGE / FINAL / REMOVE treatment: 10 px system font, 14 px line height, normal weight, no letter spacing, 1 px border in the text color, 3 px corners, 1 px/5 px padding and no shadow. Green uses #a4e4b6 on #173a2b; yellow uses the existing #f6cd61 on #45391e; red uses #ff4248 on #49252a. The matching blue extension uses #8ed5f1 on #183e56. The native selector sits over the tag transparently, preserving accessible names and keyboard choices while removing the visible arrow. Routine sync-status updates preserve unchanged Work rows instead of rebuilding the selectors.

**YouTrack setup:** Initial PMON schema inspection showed no Complexity field. The tested setup created an optional single-choice enum with LOW, MID, HIGH and INSANE. It uses a dedicated ROMDex PMON Complexity bundle and does not auto-attach the new field to other projects. Existing PMON items were left unset. Setup completed successfully after the user's service restart; an independent connector schema read confirms all four values and no required-field rule.

Setup is idempotent and reuses compatible definitions. It does not modify another field's defaults or a shared bundle. Different existing values/types require review rather than replacement. An existing otherwise suitable project field can be made optional without changing its bundle. Interrupted attachment retries reuse the prepared field and bundle.

The implementation follows JetBrains' [enum custom-field setup documentation](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-create-enum-custom-field.html) and [project field update documentation](https://www.jetbrains.com/help/youtrack/devportal/operations-api-admin-projects-projectID-customFields.html).

**Synchronization:** Complexity is included in normalized issue data, editable fields, creation payloads, queued edits, three-way conflicts, incoming merges and write verification. Clearing uses an explicit null value. Native Complexity edits arrive through the existing refresh flow. Pending local edits remain overlaid until reconciled. Auto-Sync Data Off and one-time manual Save continue to apply to these edits.

**Trash control:** The row hover/focus menu now contains Add Child, Rename and a pixel trash icon. The icon opens the existing review listing the item and its descendants. Task titles still open Details. Cancelling preserves the subtree. The existing native-modification/deletion checks remain in place. Deleting the selected item clears Details; deleting another item preserves the current Details editor. No live issues were deleted during QA.

**Automated validation:** All 84 checks pass. New coverage includes the four priority mappings, Show-stopper display/native preservation, each Complexity value and null clearing through service writes and native snapshots, same-field conflicts, creation and temporary-ID remapping, preservation of unrelated fields, optional setup, global-field reuse, safe refusal of incompatible/shared configurations and idempotent retries. Previous status, sync-toggle, save-indicator, hierarchy, comments, retry-safety and tray checks pass. Node syntax checks pass for the changed modules. Integration tests use a controlled provider and never contact production YouTrack.

**Isolated browser validation:** Synthetic issues with separate storage showed all tag colors, Show-stopper as URGENT, and an unset Complexity dash. Clicked a priority tag and changed it with the keyboard; edited Complexity and verified persistence after reload. A paused local HIGH Complexity edit conflicted with a native MID value; manual Save opened human review. Keeping MID resolved the conflict without enabling automatic synchronization. Clearing Complexity displayed the dash and synchronized correctly.

Verified task-title access to Details, matching Details tags, the parent trash dialog listing three subtree items, cancellation, deletion of an isolated item and deletion of an unrelated task while the existing Details editor remained visible. New-row editing uses the correct three-column span, focus, Tab/Shift+Tab nesting and empty Enter discard. Fixture console error logs were empty. Temporary browser fixtures are excluded from the delivered application.

**Live and responsive validation:** The connected dashboard shows four columns, editable Complexity tags, 287 items, and Auto-Sync Data On with a healthy blue connection light. Live field configuration was created and independently read back. Issue-content mutation/round-trip and conflict scenarios used controlled data; existing live priorities, notes, status assignments and parent relationships were not intentionally edited for testing. At 1440 × 900 and 900 × 900 the tags retain reference styling. At 390 × 844 the 660 px table scrolls internally without document horizontal overflow. Header, tray frames, status lamps and Save styling remain in place. Live console error logs were empty.

**Application files:** Added `public/field-tags.mjs`, `complexity-field.mjs` and field/setup tests. Updated the adapter, service, core schema, frontend, table/details markup, tag/trash styles, service integration tests, README and revision plan. Final ZIP packaging remains a separate approval checkpoint.

**Evidence:** ROMDex-Task-8-Preview.png shows the live table; ROMDex-Task-8-Work-Rows.png shows the controls; ROMDex-Task-8-Mobile.png shows the mobile layout. ROMDex-Task-8-Colors.png, ROMDex-Task-8-Conflict.png and ROMDex-Task-8-Delete-Review.png show isolated-fixture scenarios.

**Checkpoint:** Task 8 is complete. Await a new PASSKEY for Task 9, Title Case and Hierarchy Terminology (original Item 8).

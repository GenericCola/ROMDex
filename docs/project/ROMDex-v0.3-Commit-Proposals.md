# ROMDex Next Build — Commit Proposals

Prepared October 14, 2026. Working baseline: v0.2, confirmed working by the user. The proposal itself authorizes no implementation, Git commit or release; execution follows the user's individual PASSKEY approvals.

**Execution checkpoint:** Tasks 1–8 are complete under their PASSKEY approvals. The 0.3.0 release includes the all-untouched/title editor fixes and the final offline-banner row-clearance correction. The suite passed 117 tests, 31 JavaScript modules passed syntax checks, the remembered connection survived the release restart, and live bidirectional QA issues PMON-302–305 were removed. See QA-Report.md in ROMDex and the Task 8 review for the final archive verification. ROMDex-v0.3.zip is the release package; v0.2 remains available. The next project is the scoped NPCDex/ROMDex desktop integration. There is no Git repository here.

Execution remains sequential: one approved proposal, its verification and report, then a new PASSKEY before the next proposal. Proposed commit titles describe reviewable units of work.

At each completed-task checkpoint, remind the user of the next task's recommended model and effort level before requesting its PASSKEY. Keep browser QA focused and batched, using compact results to minimize tokens.

## Proposed Order and Models

| Commit | Proposal | Requests Covered | Recommended Model / Effort |
| --- | --- | --- | --- |
| 1 | Preserve the Connection Across Builds | Token preservation | GPT-6.1 Sol / High |
| 2 | Fix Table Scrolling, Compact Rows and Hierarchy Drop Guides | 8, 13; inline IDs and drop-guide additions | GPT-6.1 Sol / Medium |
| 3 | Simplify Tray Headers and Chrome | 4, 5, 6, 7, 9, 14 | GPT-6 Luna / Medium |
| 4 | Restore Compact Selector Tiles and Settings | 3 | GPT-6.1 Sol / Medium |
| 5 | Add True Full-Height Details and Minimize Controls | 1, 10, 11 | GPT-6.1 Sol / High |
| 6 | Add Back Navigation Within Details | 2 | GPT-6.1 Sol / Medium |
| 7 | Add the Completed-Task Visibility Toggle | 15 | GPT-6.1 Sol / High |
| 8 | Verify the Integrated Build and Package It | All | GPT-6.1 Sol / High |

These settings are task-specific recommendations, not guarantees or automatic model changes. OpenAI describes Luna as its most cost-efficient model and GPT-6.1 Sol as a lower-cost option for complex coding. Sol supports Low, Medium and High effort. The bounded cosmetic commit can use Luna; data preservation and interacting state changes justify Sol. Astra is a fallback for an unresolved complex failure, not a prerequisite for this build. Sources: [Model Selection](https://developers.openai.com/api/docs/guides/model-selection), [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol).

## Commit 1 — Preserve the Connection Across Builds

Proposed title: `fix: preserve the saved ROMDex connection across builds`

**Problem:** The remembered connection is encrypted but currently lives inside the application folder. A newly extracted build therefore has no saved connection of its own. Packaging excluded the original private runtime data, as intended, but the upgrade path did not transparently reuse it.

**Action plan:** Separate the Windows-account-specific ROMDex data location from the versioned application folder. Migrate the existing saved connection and runtime state once, retaining a backup and refusing to overwrite an already established destination. Preserve images, manual order, pending work, assigned parent statuses and sync settings together. Keep the existing browser origin stable. Continue to honor explicit isolated data-directory overrides for tests. Update startup and upgrade behavior so a new build reuses the connection and clearly loads the correct application version.

The credential stays Windows-encrypted locally and is preserved through testing and subsequent builds until the user deliberately replaces or removes it. It is not embedded in source code, reports, logs or the general download ZIP. Existing private credential contents do not need to be revealed or copied into chat.

**Verification:** Upgrade from the current installation, launch from a second build folder and restart under the same Windows account. Confirm reconnection without token entry, retained local data, paused-sync behavior, isolated tests and credential exclusion from packaging. If an established data destination already exists, review the conflict rather than overwriting it.

## Commit 2 — Fix Table Scrolling, Compact Rows and Hierarchy Drop Guides

Proposed title: `fix: compact task rows and clarify hierarchy drop targets`

**Requests:** 8, 13, plus the October 14 additions for inline task IDs and hierarchy-aware drop guides. Request 12 (centering Priority/Complexity tags) is **cancelled**; both columns retain their existing left alignment.

**Action plan:** Reproduce the gap above the sticky column headers and check scroll-container padding, header offsets, backgrounds and stacking. Make the header band fully opaque across its area while retaining internal table scrolling and the v0.2 fixed outer-frame behavior. Keep Priority and Complexity tags and headers left-aligned.

Move each task ID (for example, PMON-224) from beneath the title to the same line after the item name, reducing row height. Put the notes indicator immediately beside the item title and before the inline ID; replace its pencil artwork with a pixel sheet-of-paper/text icon. Keep the separate Rename pencil intact. Allow long names to truncate while keeping the ID and notes indicator readable; keep inline title editing and draft rows usable.

Use the supplied ClickUp captures as the drop-guide reference. The insertion line's **left endpoint must align with the indentation of the destination hierarchy level**, with a small triangular marker at that endpoint and the line extending toward the table's right edge. Moving the pointer horizontally updates that endpoint as the proposed level changes. Derive the guide from the same proposed parent/depth used by the actual drop operation, so it previews the resulting placement rather than the dragged item's old level. Preserve existing move validation, descendant attachment and cycle prevention.

**Verification:** Scroll a long nested list vertically and horizontally at desktop and mobile widths. Confirm no rows show through above the headers, tags remain left-aligned, IDs no longer create a second line, long titles retain the notes icon/ID, and clicking the notes icon still opens notes. Check keyboard focus, draft rows, inline editing and row hover controls. Exercise root, sibling and deeper-child drop previews while moving horizontally, including cross-parent moves and scrolled lists. Confirm the triangular endpoint aligns with the prospective level and the resulting hierarchy matches the preview. Invalid/circular moves remain rejected. Use isolated test items for any completed drag operations; preserve the user's project hierarchy. A screenshot can be requested during implementation if the reported header gap cannot be reproduced.

## Commit 3 — Simplify Tray Headers and Chrome

Proposed title: `refactor: simplify tray headings and navigation controls`

**Requests:** 4, 5, 6, 7, 9, 14.

**Action plan:** Rename Everything to All Tasks wherever the view name appears and reuse the actual pixel Poké Ball artwork from the NPCDex favicon. Remove Explore Project and place the Add Epic button beside the project header at the tray's top-right. Remove the bottom Keyboard Guide, Epic/Item count and their footer framing; preserve their content and count definitions in documentation for a future menu. Remove the static List/Manual Order strip. Rename Collapse to Collapse All. Move Save Changes and its adjacent connection light left by 24 px, with responsive spacing for the neighbouring header controls.

Manual Order currently describes ROMDex's local drag ordering, as opposed to sorting by a field such as title or priority. There is no alternate sorting/view control to operate, so the text and List label add visual clutter. Drag ordering remains available after removing these labels.

**Verification:** Check every removed DOM reference/listener so the app still starts, the sidebar ends like NPCDex, Add Epic and All Tasks work, and the header controls fit narrow screens. Record Save/light offsets against v0.2. Retain the All Tasks button's existing total-count badge unless the user requests its removal; request 6 targets the separate footer count.

## Commit 4 — Restore Compact Selector Tiles and Settings

Proposed title: `feat: restore compact selector tiles with NPCDex settings`

**Request:** 3.

**Action plan:** Use the preserved compact selector code/CSS as a layout reference, while retaining the current hierarchy renderer and live data. Restore rectangular tiles with a small image on the left and text on the right. Keep the current top-left light and bottom-right disclosure arrow, including their current styling and animation. Replace tile Add Child/Rename controls with the NPCDex cog treatment. Its settings surface provides image assignment/removal and rename controls. Child creation remains in the Work Pane. Per the user's Task 4 refinements, use the exact NPCDex favicon in All Tasks, make the cog button 40% smaller and center its gear, cap all tile heights equally, truncate long titles with an ellipsis, and provide the full title on hover.

Apply the compact treatment consistently to Epic, Story and Verse selectors. Reuse NPCDex's relevant settings appearance and interactions; only ROMDex-relevant settings appear. The historical data snapshot is a reference/archive, not data to restore over current YouTrack work.

**Verification:** Check selection, nested expansion, drag targets, image persistence, rename push to YouTrack, keyboard access and mobile controls. Verify light/arrow positions independently and preserve existing selector images, order and data.

## Commit 5 — Add True Full-Height Details and Minimize Controls

Proposed title: `feat: add full-height and minimized Details modes`

**Requests:** 1, 10, 11.

**Action plan:** Remove the collapsed handle's visible “Details · Drag Up to Reopen” text and its visual hover hint; retain an accessible description of how the handle works. Model three layouts: normal Work/Details split, full-height Details and minimized Details. Full-height Details fills the combined right-hand Work/Details area, with the Work Tray and divider hidden during that mode. Rotate the expand arrow 180 degrees while expanded. The second click restores the default split, as requested. Preserve the selected item and editor contents through every transition.

Place a clearly labelled minus/Minimize control beside Expand. Proposed treatment: replace the existing × collapse control, since it currently performs the same action. Minimize shows the full Work Tray and collapsed handle. Dragging the handle up restores the normal split. Header and Vertical Tray remain visible throughout.

**Verification:** Exercise pointer/keyboard resizing and all normal/full/minimized transitions, including minimizing from full-height mode. Check long prompts, save flushing, selection changes, reload/layout preferences and narrow screens. Full-height Details must no longer obey the old minimum Work height.

## Commit 6 — Add Back Navigation Within Details

Proposed title: `feat: navigate back through Details child views`

**Request:** 2.

**Action plan:** Clicking an item in the Work Pane establishes the starting item. Opening a child from Details records the item being left. A Back button returns one visited parent level at a time and stops at the original item. Opening another item directly from the Work Pane starts a new trail. Flush edits before navigation and maintain the chosen tray mode. Label the action with its destination where space/accessibility permits.

**Verification:** Navigate parent → child → grandchild → back → back; confirm the original boundary, notes preservation and appropriate disabled/hidden state at the beginning. Test native reparenting/deletion while browsing and skip destinations that no longer exist without losing current notes. Back follows the viewed trail rather than jumping outside it after a native move.

## Commit 7 — Add the Completed-Task Visibility Toggle

Proposed title: `feat: toggle completed tasks in the Work Pane`

**Request:** 15.

**Action plan:** Add one button next to Expand All/Collapse All. Initially completed tasks are visible and the button says Hide Completed. Clicking it hides them and changes the label to Show Completed; clicking again restores them. Persist this local view preference. Use the effective green status, including inherited parent status, to determine completion. Hide completed branches while retaining the ancestors needed to understand unfinished tasks. Combine the filter with search, selector scope and expansion state.

The filter applies to the Work Pane. It does not change statuses, delete tasks, alter YouTrack values or remove selector tiles. Details can continue displaying the selected item if it becomes hidden. New draft/edit rows remain usable, and empty-state copy explains when completed items are hidden.

**Verification:** Check mixed-status hierarchies, all-complete branches, search, new items, status changes arriving from YouTrack, drag/reparenting while filtered, reload persistence and the alternating single label. Filtering must not change status rollup calculations or saved manual ordering.

## Commit 8 — Verify the Integrated Build and Package It

Proposed title: `chore: verify and package the revised ROMDex build`

**Action plan:** Run the complete regression suite plus meaningful coverage for credential migration, full-height layout, Details navigation and completion filtering. Compare the revised trays/settings with NPCDex at matching viewport sizes. Check combined keyboard, scrolling, drafting, dragging and editor behaviour. Verify live push/pull using isolated/disposable data, preserve concurrent native project edits and confirm removal of test items. Upgrade/restart with the saved connection, refresh documentation/previews and produce a ZIP that excludes private runtime data.

**Verification:** The new build opens with the existing saved connection, UI changes match the approved proposals, no user data is lost, both sync directions work, tests pass and archived files match the approved source. Report actual live checks separately from controlled tests. Stop and report a meaningful failure rather than claiming an unverified release.

## Decisions Proposed for Approval

- Compact styling applies to all three selector tiers.
- Minimize replaces the current × collapse control.
- Expand's restore action returns to the default split, rather than the last manually resized split.
- Hide Completed affects Work rows only and starts with completed tasks visible.
- Save and its connection light move left by 24 px.

These are explicit proposal choices; they can be adjusted before implementation of their respective task. Tasks 1–8 are complete. Subsequent implementation work requires its own PASSKEY. No application files or credentials were changed while initially preparing this plan.

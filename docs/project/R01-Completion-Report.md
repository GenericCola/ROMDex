# R01 — Details Opening and Context-Sensitive TAB

**Completed:** October 14, 2026. Authorized by user PASSKEY.  
**Checklist:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md).  
**Baseline:** ROMDex 0.3.0 with the R01 frontend patch; the original release ZIP and U01 backups remain unchanged. R08 will produce the enhancement release.

## Changes

- Clicking a task title, row background, or Notes icon reopens collapsed Details and displays the item. Reopening retains the saved divider position.
- Unmodified TAB from the task list/workspace navigation cycles Default → Expanded → Collapsed → Default. Default restores the existing default split, matching the existing Expand button's restore behavior.
- Workspace focus remains reachable when Expanded hides Work. The navigation focus target does not draw an unwanted outline around the entire tray.
- TAB/Shift+TAB in inline Work Pane names nest/outdent new or existing items. Existing-name edits preserve trailing spaces, focus, and caret; an explicit hierarchy action saves a nonblank title before moving it so a move outside the current filtered scope cannot discard the rename.
- Notes, comments, form fields, menus/dialogs, Shift+TAB navigation outside inline names, modifier-key combinations, composition, and active drag/resize retain their ordinary behavior.
- Multi-selection TAB routing is reserved for R04/R05 and takes priority over pane cycling when those features exist. No checkboxes, group creation, bulk moves, compact tiles, toolbar, full Edit menu, or attachment features were implemented in R01.

## Verification

- **127/127 automated tests passed**, including ten new tests covering keyboard context, cycle transitions, safe nesting destinations, manual ordering, and invalid operations.
- First broad test run used Windows' sandbox temporary directory and encountered existing profile-test rename restrictions. Rerun used a writable workspace-local temporary directory; all tests passed. One new test initially assumed alphabetical root order incorrectly; it was corrected to supply explicit manual order.
- Syntax checks passed for **27 frontend/test modules**.
- Isolated browser fixture verified: minimize → task/Notes reopen; Default → Expanded → Collapsed → Default; focused workspace continuity; notes TAB; modal TAB; new and existing inline-name nesting/outdenting; trailing-space preservation; custom divider-size preservation on reopening; child navigation and Back; persisted collapse after reload and subsequent automatic reopening.
- Browser console contained no errors during checks. The fixture had no live YouTrack backend and no remembered credential; title/hierarchy operations affected only disposable local fixture state.
- Delivered the five frontend files to the identified running installation and verified matching file hashes and served HTTP content. Live service remained connected with its remembered connection and Auto-Sync enabled. No service restart was required and no live issue was edited by the QA workflow.

![Isolated fixture after reopening Details](R01-Details-QA.png)

## Files and Delivery

Canonical source changed: `public/app.mjs`, `public/split-pane.mjs`, `public/index.html`, `public/styles.css`, new `public/workspace-keyboard.mjs`, new `tests/workspace-keyboard.test.mjs`, and README/documentation.

The matching frontend patch is installed in `outputs/ROMDex-v0.3/ROMDex`, which is the build currently served on port 4322. Refresh an existing ROMDex page to load the patch. Saves and credentials remain in the shared AppData profile; original ZIP contents remain the 0.3.0 release baseline.

## Next Task

**R02 — Compact Selector Tiles and Exclusive Expansion**, recommended **Sol / Medium**. Await a new PASSKEY before starting.

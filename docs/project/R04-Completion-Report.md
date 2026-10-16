# R04 — Dense Rows and Checkbox Selection

**Completed:** October 14, 2026, under user PASSKEY.  
**Checklist:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md).  
**Build:** ROMDex 0.3.0 working installation with R01–R04 patches. R08 remains the packaging/release checkpoint.

## Delivered Behavior

- Grab handles and checkboxes occupy a fixed **48 px gutter** at the left of every row, independent of nesting depth.
- Indented controls follow **triangle → status light → title → Notes paper icon → task ID**, followed by the existing linked-issue count. Leaf rows reserve the triangle slot. Priority/Complexity stay left-aligned. Rows remain **36 px high**.
- Unchecked checkboxes appear on hover or keyboard focus; checked boxes remain visible. Reserved gutter space prevents movement on hover.
- Checkbox clicks toggle membership. Ctrl-click adds/removes nonconsecutive items; Shift-click replaces selection with the anchor-to-click range in current visible order. Ctrl+Shift-click adds that range. Collapsed, filtered-out, and out-of-scope items are excluded.
- A single checked item opens its Details; multiple checked items show exactly **Multiple Items are Selected.** A name/background/Notes click clears checkbox selection and returns to normal item navigation.
- Scope changes clear selection. Search, completed filtering, branch collapse, deletion, and native refresh remove hidden/missing IDs. Selection is session-only; local issue ID remapping preserves it.
- ESC clears checked items while preserving selector scope. Focused checkboxes support Space and ordinary keyboard navigation. Background renders restore checkbox focus when its row remains present.
- Previous notes are saved before selection transitions. Valid inline renames are saved without creating another row. A nonblank new-item draft must be finished or cancelled before checkbox selection; it is not silently discarded.
- Drop-guide indentation now includes the fixed gutter, retaining the existing destination-depth calculation and triangular tail.

## Verification

- **156/156 tests passed**; syntax checks passed for **33 frontend/test modules**.
- Seven new selection cases cover toggling, additive selection, forward/reverse anchored ranges, Ctrl+Shift extension, visibility boundaries, native deletion/collapse pruning, scope clearing, invalid IDs, and local ID replacement.
- Focused isolated browser checks verified fixed grip/checkbox X coordinates at depths 0–3, 21 px hierarchy increments, control order, 36 px heights, persistent checked-box visibility, single/multiple Details, Shift/Ctrl selection, keyboard Space, ESC, scope clearing, search/completed/collapse pruning, notes retention, inline rename preservation, and unfinished draft protection.
- Desktop and 900 px layouts retained aligned gutters and had no horizontal page overflow. Browser warning/error log was empty.
- After initial search-pruning checks, updated the render path so Details clears immediately without waiting for a background status poll. Rechecked the final behavior in a fresh fixture tab.
- Browser checks waited for settled scope/selection transitions because editor persistence is asynchronous. No production work was altered for QA; fixture notes/rename operations remained isolated from YouTrack.
- Verified filesystem hashes and served HTTP content for all three frontend files. The actual service remained connected, remembered the saved token, retained Auto-Sync On, and reported zero missing States.

![Isolated dense-row and multi-selection verification](R04-Selection-QA.png)

## Delivery and Boundaries

Updated `public/app.mjs`, `public/styles.css`, new `public/work-selection.mjs`, new `tests/work-selection.test.mjs`, and README in canonical `outputs/ROMDex` and the actual `outputs/ROMDex-v0.3/ROMDex` installation. Previous running app/styles/README are retained in `outputs/R04-Before` for rollback. Original ZIP and baseline backups remain unchanged.

Refresh ROMDex to load this frontend patch. No service restart or token entry is required. Temporary fixture tabs were closed, its server stopped, and viewport overrides reset.

Group creation and bulk dragging are **R05**, not implemented here. While multiple items are checked, their grouping shortcut and row drag are guarded with an explanatory message, preventing an accidental single-item move. Single-item dragging retains its existing behavior. Attachment indicators arrive with R07.

**Next:** R05 — Same-Parent Grouping and Bulk Drag. Recommended **Sol / Extra High**. Await a new PASSKEY before starting.

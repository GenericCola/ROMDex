# R02 — Compact Four-Tier Selectors and Exclusive Expansion

**Completed:** October 14, 2026, under user PASSKEY.  
**Checklist:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md).  
**Build:** 0.3.0 working installation plus R01/R02 frontend patches; the original ZIP and protected U01 backup remain unchanged. R08 will package the enhancement release.

## Final Scope and Behavior

- Removed the entire selector picture/thumbnail area. Saved image values remain in the workspace and accessible through the unchanged Tile Settings preview/upload/remove controls.
- All selector tiles are **48 px high**, down from 68 px. Titles occupy one line, end with ellipsis when needed, and expose their full name in a tooltip.
- Retained the top-left status indicator, top-right centered 18 px settings cog, and bottom-right animated triangle. The arrow's hit area fits the reduced tile height; the cog and arrow do not overlap.
- Incorporated the user's in-progress scope addition: **Epic → Saga → Story → Verse → Task**. Tray 1 displays only tiers 1–4; Verse is selectable and cannot expand.
- Existing depths are relabeled: Epic remains Epic; Story becomes Saga; Verse becomes Story; the direct child of an old Verse becomes Verse; anything deeper remains Task. This does not insert issues or change existing parent links, IDs, content, statuses, or native YouTrack Type fields. New items continue using the existing project's Epic/Feature/Task Type mapping for their logical depth.
- Only one Epic, one Saga, and one Story can be open at a time in Tray 1. Opening a different peer replaces the old branch; collapsing a parent clears its descendant expansion state.
- Old saved multi-expansion preferences, deleted items, and native hierarchy moves normalize into a valid active path. An explicitly collapsed path stays collapsed after reload.
- Work Pane selection and expansion retain arbitrary hierarchy depth; Verse selection displays its dependent tasks there. Creation and drag destination revelation use the same selector-path rules without expanding hidden task tiers.

## Verification

- **140/140 tests passed**, including 13 four-tier selector-state cases. Native parent changes, deletion, prior saved preferences, empty branches, unchanged image inputs, and unrestricted Work expansion are covered.
- Syntax checks passed for **29 frontend/test modules**.
- Isolated browser fixture verified 48 px heights across all four tiers, absent image windows, long-title truncation/full tooltip, one active Epic/Saga/Story path, peer replacement, Verse without an arrow, tasks in Work but absent from selectors, and persisted collapse after reload.
- Tile Settings still displayed the saved test image (decoded width 1 px). Fixture workspace retained its image entry and had zero pending operations. The cog was 18 × 18 px with zero horizontal/vertical center offset for its icon.
- Work Expand All retained all 17 fixture rows, including every lower-level Task, independently of selector expansion.
- Fast sequential pointer automation during animated layout changes initially targeted moving controls inconsistently. Settled keyboard/state checks verified the intended transitions, followed by a successful pointer opening check. No application fix was inferred solely from transient automation timing.
- Browser error log was empty. The fixture had no YouTrack connection or token; no live ticket was created, relinked, or otherwise edited by QA.
- Delivered five frontend files to the running installation, verified filesystem hashes and served HTTP content. Live connection, remembered token, and Auto-Sync remained active.

![Settled compact selector fixture](R02-Selectors-QA.png)

## Files and Delivery

Canonical application changes: `public/app.mjs`, `public/selector-view.mjs`, new `public/selector-state.mjs`, `public/styles.css`, `public/index.html`, new `tests/selector-state.test.mjs`, and README.

The matching patch is installed in `outputs/ROMDex-v0.3/ROMDex`, served at port 4322. Refresh ROMDex to load it. No service restart or token entry is required. Shared AppData storage is preserved.

## Next Approval Boundary

**R03 — Add Item and Completed-Filter Toolbar**, recommended **Sol / Medium**. Await a new PASSKEY. No R03 changes were included in R02.

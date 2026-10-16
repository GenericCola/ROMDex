# ROMDex v0.3 — Task 7 Review

Completed October 14, 2026, under the user's Task 7 PASSKEY.

## Changes

- Added one button beside Expand All and Collapse All. With completed rows visible it says **Hide Completed**; when they are hidden it says **Show Completed**. The view preference persists in the existing local workspace storage and backup.
- Filtering uses effective green status from the full hierarchy, including inherited parent status. It hides complete branches, retains unfinished ancestors, combines with selector scope/search/expansion, and leaves selectors and the selected Details item available.
- Active rename rows and draft insertion paths stay visible. Inline rename text is retained independently of DOM focus so toggling or a native refresh cannot erase uncommitted title input. Temporary exceptions for editing end when the edit/draft is cancelled or finished.
- Empty-state copy explains when completed items are hidden and how to reveal them. The footer continues reporting visible rows against the full scope count. Filtering does not change statuses, hierarchy, manual ordering, or YouTrack data.

Changed `public/app.mjs` and `public/index.html`, added `public/work-view.mjs` and `tests/work-view.test.mjs`, and updated documentation. No service restart is required; reload ROMDex. No live YouTrack items were edited. The v0.2 ZIP remains unchanged; no Git repository exists here.

## Verification

- Changed JavaScript passed syntax checks. The full suite passed **111/111 tests** using workspace-local TEMP. New coverage exercises effective status, ancestors, scope, expansion, search, editing paths, incoming completion/reopening, unchanged data/order, and a filtered drop target preserving its hidden sibling boundary.
- In the connected browser, an all-complete 16-row section became empty with the explanatory message. Selector count remained unchanged and the selected Details title remained visible. Reload retained the hidden preference after workspace initialization.
- A mixed 42-row scope contained 24 complete rows. Hiding completion left 18 rows with zero green row indicators. Search continued narrowing the filtered view. [Preview](ROMDex-v0.3-Task-7-Preview.png) shows this filtered view and an unfinished task in Details.
- Uncommitted draft and rename text survived both toggle states. Both were cancelled without submitting edits. The original selector/Details view and visible-completed preference were restored after QA.
- Native status-change and filtered drag behavior were verified with isolated automated data; no real project issue was moved or changed during browser review. Final integrated live verification remains Task 8.

## Next Checkpoint

Task 7 is complete. **Task 8 — Verify the Integrated Build and Package It** awaits a new PASSKEY. Recommended model/effort: **GPT-6.1 Sol / High**. This is the final pending proposal.

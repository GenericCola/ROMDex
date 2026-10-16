# ROMDex — All-Untouched Parent Rollup Correction

Completed October 14, 2026, following the user's report after Task 7. This supersedes the earlier rule that grey was never inherited. Task 8 remains pending its PASSKEY.

## Change

Parents now inherit grey when every immediate child is grey, recursively through the full hierarchy. Any red still yields red. Yellow or a mixture containing grey yields yellow. Green/blue-only mixtures with at least one blue yield blue; all green yields green. Empty parents display their retained directly assigned status.

The dashboard and service share `public/core.mjs`, so the same correction governs indicator lights and YouTrack State writes. Retained assignments are preserved while inherited status is displayed. Updated `tests/core.test.mjs`, `tests/integration.test.mjs`, README and the scope documents.

## Verification

- Syntax check passed; the full suite passed **113/113 tests**. Coverage includes all 125 three-child combinations, recursive all-grey inheritance, mixed-grey combinations, red precedence, and preserved parent assignments.
- The isolated service test verifies two ancestor levels are written to YouTrack as To do, a native leaf change restores In Progress through both levels, and assigning Untouched to the root succeeds while all descendants remain untouched.
- The user restarted the service. Its reported build matches the corrected source and the saved YouTrack connection is healthy.
- Initial live verification showed Stretch Goals (PMON-4) and Balance & Engine (PMON-282) grey; the source snapshot confirmed both YouTrack States were To do.
- A subsequent live refresh showed Balance & Engine with nine direct children, including Implement Fairy Type (PMON-60) in Done and Implement Modern Movesets (PMON-61) in In Progress. The latest source snapshot confirmed both are children of PMON-282, whose State correctly returned to In Progress. Its amber light now reflects this mixed set rather than the old all-grey bug. Stretch Goals remains Untouched.
- [Preview](ROMDex-v0.3-Untouched-Rollup-Preview.png) shows the all-untouched Stretch Goals view. No task hierarchy or leaf status was edited during verification; automatic synchronization wrote the derived parent statuses. The original Work view was restored.

Final integrated QA and packaging remain **Task 8**, recommended **GPT-6.1 Sol / High**, awaiting a new PASSKEY.

# R08 — Enhancement QA and Release

Authorized by PASSKEY; October 14, 2026. Release: **ROMDex 0.4.0**.

**Status:** Complete and checked off. The user launched the new 0.4 folder; its running build, saved connection, data and protected checkpoint are verified.

## Delivered

- Reviewed all eight enhancement requests and the confirmed Saga, ESC, status and selection clarifications against the combined implementation.
- Fixed late multipart staging after a cancelled upload; the client accepts an already-completed staging response without recreating queued bytes. Added a service regression check.
- Unified the four Work toolbar actions at 29 px and corrected outdated hierarchy/editor documentation.
- Prepared `ROMDex-v0.4.zip`, its per-file SHA-256 manifest, upgrade/recovery instructions, a combined QA report and fixture preview. The ZIP contains 69 allowlisted files and excludes the private workspace, remembered connection, uploads, logs and test scratch data.

## Verification

- Extracted release: **207 tests passed, zero failures/skips; 51 module syntax checks; PowerShell launcher parse passed**.
- Extracted no-token service startup passed in an isolated profile. All **28 public assets** matched their source hashes over HTTP. All **69 ZIP entries** matched their allowlist hashes and sizes.
- Focused browser checks covered four-tier exclusive selectors, dense rows/header scrolling, sibling grouping with spaces, retained files, selection-only checkbox behavior, Details modes, ESC/TAB, completed filtering and narrow layout. All four toolbar controls measured 29 px; the Details grip stayed 52 px. No unexpected console warnings/errors were observed. Physical bulk dragging was covered in R05 and not repeated here.
- Controlled real YouTrack checks used four marked disposable tickets, PMON-319 through PMON-322. Verified both-way changes to title, notes, State, priority, Complexity and Kanban; outbound assignment, due date, estimation, numeric fields and tags; clearing fields; inherited status; subtree movement; and stale-note conflict protection.
- Uploaded an image and text fixture, independently confirmed their native attachments, and downloaded identical original bytes through ROMDex. Cleanup removed only the marked QA tickets after identity/relationship/file checks. Independent native search found no active R08 QA tickets; all **299 original issue IDs remained**, with a final count of 299.
- The native field/file contract checks used the running R07 adapter; these paths are unchanged in 0.4. The release's cancellation change was exercised by service regression tests.

- Verified the running **0.4.0** installation/build identity after the user's Windows launch and compared all **28 public resources** against the release. Remembered connection and Auto-Sync are healthy. The encrypted credential bytes are unchanged; all **299 original issue IDs** remain, with **zero pending operations and no blocked action**. No further service-code changes followed the launch.
- Refreshed the protected checkpoint after launch: **47 verified files**, including NPCDex saved revision **72**, six stable shared-profile files and the final ZIP/manifest. Checked all hashes and restricted child-file access. Original U01 backups remain immutable; no token was decrypted or printed.

Full results and practical limits: [QA Report](ROMDex-v0.4/ROMDex/QA-Report.md). Release: [ZIP](ROMDex-v0.4.zip), [Manifest](ROMDex-v0.4-Manifest.json), [Upgrade and Recovery](ROMDex-v0.4/ROMDex/UPGRADE-AND-RECOVERY.md), [Baseline Update](R08-Baseline-Update.md).

## Scope and Recovery

This is the final browser/local-service enhancement release before desktop design, not the standalone launcher. It requires Node.js 22+; native polling remains approximately 15 seconds while the page/service are running. Optimistic REST conflict comparisons do not provide an atomic lock across clients. Local attachment staging/viewing is capped at 50 MB per file, subject to lower native limits; only raster images have inline previews, and native attachment deletion remains outside scope.

Original release ZIPs and U01 backups remain intact. Keep browser data and the shared profile together while work is pending; never restore an old journal over newer work. There is no Git repository, so this is a verified release change set rather than a Git commit.

## Next Approval Boundary

The next task is **U02 — Desktop Host and Distribution Design**, recommended **Sol / High**. It will compare the desktop packaging/lifecycle choices and define installer/profile behavior. It requires a new PASSKEY; no U02 work has begun.

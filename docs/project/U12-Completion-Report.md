# U12 — Persistent Profile and Current-Data Migration

Completed October 15, 2026 under the U12 PASSKEY. Delivery: **0.5.0-preview.12**, [ROMDex.exe](ROMDex-Desktop-U12/ROMDex.exe). U13A has not begun.

The desktop now uses the current live browser data rather than the older packaged baseline. Your approved migration imported **299 tasks and 104 manual-order entries**, with no pending operations or queued files. The complete NPCDex revision **72** snapshot matches the preserved Downloads package: 4 towns, 44 change plans and 145 history records. No browser NPCDex current/recovery/held record was present, so the preview explicitly identified the preserved package as its source. Saved parent statuses and the backend operation journal match their originals exactly.

Saves are now outside every application/build directory, at **%LOCALAPPDATA%\ROMDexDesktopData\thegobindsingh-PMON**. The Chromium session lives in a separate sibling folder so first-run initialization cannot interfere with atomic publication. An established desktop profile refuses missing or unsupported task/NPCDex saves; it does not silently replace them with the older embedded baseline. Normal launches reuse this profile without repeating migration.

The importer validates the same-origin browser capture, tree, operation identities, source hashes and attachment bytes; copies originals into protected recovery storage; stages and verifies the complete desktop profile; rechecks the sources after human review; and publishes by directory rename. Cancellation/interruption retains the originals and staging/recovery copies. Chrome directory-permission handles cannot transfer: NPCDex exports initially use the desktop profile's exports folder, and Data can choose another destination.

The original Windows-protected remembered connection was decrypted only in the trusted migration process, converted to Electron safeStorage, round-trip verified, and restored successfully by later desktop launches. No plaintext token was put in files, reports, renderer messages or the package. The old encrypted connection remains unchanged. The private credential channel between main and utility has explicit regression coverage.

Validation completed:

- **272 automated tests** passed, including corrupt/truncated captures, invalid origins/IDs/trees, missing or changed file bytes, source changes after preview, interruption, credential failure, raced/existing destinations and missing established saves. Failure and nonempty-queue scenarios use isolated fixtures.
- **83 module syntax checks**, all **194 delivered-file hashes**, and 119 source/delivery file matches passed. The U11 desktop delivery, all 91 original web-release files and the old web ZIP remain unchanged. Four capture-page assets were added to the old web folder for the export.
- The user reviewed the native migration preview and confirmed desktop connection. A genuine YouTrack read matched **all 299 tasks field for field**. No synthetic production ticket edits were made; ordinary Auto-Sync remained On.
- Both workspace views loaded. NPCDex's renderer reports revision 72, clean state and no recovery warning; the entire stored document matches the source. Switching workspaces retained task-view state.
- A normal automatic synchronization cycle completed with the window hidden, connected and without failures.
- The application checkpointed and relaunched from a separate verified build folder. The same data, ordering and remembered connection passed the live checks again. This proves build-folder independence; installer upgrade/uninstall testing remains U13A.
- The application returned to **outputs/ROMDex-Desktop-U12/ROMDex.exe** with its normal window. Temporary verification ports 9243/9244 are closed. Native restart testing used Electron's documented [app.relaunch](https://www.electronjs.org/docs/latest/api/app#apprelaunchoptions) behavior, through orderly checkpoint/quit.

Evidence: [live and restart verification](U12-Desktop-Verification.json), [first live pass](U12-First-Live-Verification.json), [source/package preservation](U12-Preservation-Verification.json), [migration preview](U12-Migration-Preview.json), [package manifest](U12-Desktop-Manifest.json), [checklist](U12-Implementation-Checklist.md), and [desktop guide](ROMDex-Desktop-U12/READ-ME-FIRST.md).

Original web/package data and the protected task backup **outputs/U12-Protected-Data-Backup** remain intact. The published profile's desktop-profile.json records its additional Windows-account recovery backup. For rollback, Quit ROMDex completely and review any newer desktop work before reopening/restoring the old web copy; that copy does not include later desktop-only edits. Earlier isolated previews remain separate.

**Use the desktop executable for current work; the old web service is stopped. NPCDex is still local-only.** Cloud persistence remains U14–U19. The installer and approved update delivery remain separate U13A/U13B tasks. No installer, updater, cloud-storage project or synthetic YouTrack issues were introduced by U12.

Next: **U13A — Windows Installer and Upgrade/Uninstall Preservation**, recommended **Sol / Medium**. Await a new PASSKEY before beginning.

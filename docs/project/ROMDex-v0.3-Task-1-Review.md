# ROMDex v0.3 — Task 1 Review

Completed October 14, 2026, under the user's Task 1 PASSKEY. Installed version: **0.3.0-preview.1**. Scope: preserve the remembered YouTrack connection and private runtime data across builds.

## Result

The saved connection and runtime state now use **C:\Users\mrgen\AppData\Local\ROMDex\thegobindsingh-PMON**, independent of the application folder. The existing Windows-encrypted credential was migrated without decrypting it during copying. The original installation's **.romdex** data remains intact as a backup. Subsequent builds reuse the established profile without replacing it with older data.

The user launched the updated application normally in Windows and confirmed **“Opened and connected”**, without token entry. Live status then confirmed the expected preview version, a shared profile, a remembered connection and healthy YouTrack access. The project retained **287 items**, **zero pending operations**, and **Auto-Sync On**. The migrated encrypted file matched the original byte-for-byte. No production issue edits were made specifically for this task's QA.

## Changes

- Added profile resolution, validated one-time migration and build identification in `runtime-profile.mjs`. Migration stages and verifies all private files before publishing; unknown destinations or damaged legacy JSON are refused without overwriting existing data.
- Preserved connection ciphertext, workspace backup, images, manual order, queued work, assigned parent statuses, operation journal and sync settings. Explicit test data-directory overrides remain isolated.
- Updated startup to distinguish builds, reuse a matching service and gracefully switch builds when needed. Profile access is checked before stopping a working service; a connected memory-only credential blocks switching until it is remembered.
- Kept the local URL at **http://127.0.0.1:4322/** so browser storage retains its origin. Saved credentials remain encrypted for the same Windows account, outside browser storage and distribution packages.
- Made encrypted-credential replacement atomic. Opening Connection now accurately checks Remember when the current service has a remembered connection. Updated upgrade documentation.

## Verification

**92/92 tests passed**, including eight new migration/profile tests. They cover identical profile locations across build folders and Windows launch contexts, byte-preserving migration, legacy backup retention, existing-profile reuse, damaged/unknown destination refusal, explicit test isolation, failed credential replacement and build identification. Existing provider, conflict, hierarchy, persistence and paused-sync tests also passed.

All **23 JavaScript modules** passed syntax checks. The PowerShell launcher parsed successfully. Its new access preflight and matching-build reuse were exercised against the connected service with `-NoBrowser`; it remained connected on the same build.

The browser opened the live project with its existing hierarchy/preferences and healthy connection. The Connection dialog showed **Remember checked** and **Live sync available**. It was closed without submission; no token value was inspected or entered.

The initial sandbox launch could not create the account's AppData directory. The user's normal Windows launch completed migration successfully. The updated launcher now checks destination access before stopping a working build. Controlled tests verify reuse from a second build folder; the actual production check verified the original installation's upgrade and encrypted reconnection.

![Remembered Connection Verified](ROMDex-v0.3-Task-1-Connection.png)

## Next Checkpoint

Task 1 is complete. **Task 2 — Fix Table Scrolling and Row Readability** awaits a new PASSKEY. No other v0.3 task was implemented. The v0.2 ZIP remains unchanged; final packaging is reserved for Task 8. No Git commit or publication was performed.

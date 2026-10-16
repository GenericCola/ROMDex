# ROMDex 0.3.0 — Task 8 Completion

Completed October 14, 2026, under the user's PASSKEY. All eight v0.3 proposals and the later status/title fixes are complete.

- **117/117 tests** passed; **31 JavaScript modules** and the PowerShell launcher passed syntax checks.
- Same-viewport NPCDex comparison, desktop/tablet/mobile review, pane navigation/modes, keyboard creation/nesting, completion filtering, scrolling, failure/retry, paused manual conflict resolution, and console checks are recorded in [QA-Report.md](ROMDex/QA-Report.md).
- Fixed Work's minimum-height calculation to include the visible offline banner and margins. Corrected outdated README descriptions of tiles, Details controls and private-profile storage.
- The release restart matched the current build and restored the remembered connection without token entry. Automatic sync remained On for the real workspace.
- Live disposable issues PMON-302–305 verified dashboard-to-YouTrack writes, automatic native incoming changes, comments, inherited status, Show-stopper display/preservation, Complexity and a guarded hierarchy move. All four were removed after marker/subtree checks. Concurrent real project updates were retained; no old-data reconstruction was written.
- The ZIP contains **49 allowlisted files**, each verified against its source SHA-256. Private runtime files, credentials, logs and temporary fixtures are excluded. The extracted final ZIP starts with isolated storage and no token; all **17 public assets** serve successfully, including the new editor/navigation/view modules.

## Delivery

- [ROMDex-v0.3.zip](ROMDex-v0.3.zip), **307,248 bytes**.
- SHA-256: `7DBB44D4C99AADCB63E0844C3FCD8DB969DBB153D0A5C445349D3ED8278FB989`.
- [Package manifest](ROMDex-v0.3-Package-Manifest.json).
- [Preview](ROMDex-v0.3-Preview.png) uses isolated synthetic data.
- The installed source is already 0.3.0; the ZIP is the distributable copy. The prior v0.2 package remains available.

This release retains the browser/background-service launcher. The standalone combined desktop app is the next project. Browser automation did not repeat a physical pointer drag in this pass; filtered drop/move logic is covered by isolated tests, and the live service move was independently confirmed. Other practical limits are documented in the QA report.

No Git repository exists here, so no Git commit was created. ROMDex Task 8 is now closed; the unified-app scope decisions and Action Plan are next.

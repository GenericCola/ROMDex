# U13A — Installer Verification

**October 15, 2026. Status: isolated checks passed; current-save installation and final delivery assessment pending.** U13A remains in progress. U13B has not begun.

**Current-data check found a migration defect:** 0.5.1 installed successfully but could not decrypt the existing remembered connection after changing Electron's userData location. No authoritative Data profile was published and the original saves/credential remain intact. Version **0.5.2** adds migration of the original Windows-protected Local State key before Electron initialization. **287 tests now pass; the separate real-Windows cross-profile encryption test, corrected installer and current-data handoff remain pending. Do not use 0.5.1 for migration.** The measurements/evidence below describe the successful 0.5.1 isolated installer lifecycle, whose installer template remains unchanged in 0.5.2.

## Delivered Candidate

Private unsigned Windows x64 **ROMDex 0.5.1**, using Electron 44.7.2 and Forge/WiX MSI. [Installer](ROMDex-Installer-0.5.1/ROMDex-0.5.1-x64.msi), [guide](ROMDex-Installer-0.5.1/READ-ME-FIRST.md), [installer manifest](ROMDex-Installer-0.5.1/Installer-Manifest.json), [application manifest](U13A-Application-Manifest.json).

The candidate is exactly the tested artifact: **162,271,232 bytes**, SHA-256 `13064a4a7b37c1b206fff591ef9c53ae752551482b087305cbe0ad10169b4de7`. It has not been uploaded or published. The installer includes no current saves or remembered credential.

## Preservation and Validation

- **283 automated tests**, **87 JavaScript syntax checks**, **198 application-file hashes**; 123 current source files match and one retained preview asset matches U12. All **194 original U12 delivery hashes** remain unchanged.
- Both baseline 0.5.0 and upgrade 0.5.1 passed full Windows Installer validation. Validation was not disabled. Early attempts exposed missing empty-directory cleanup and registered-path restoration; both were corrected before this successful lifecycle run.
- A disposable per-user install opened both workspaces without Chrome or separately installed Node, created the correct Start Menu shortcut and handled a second launch.
- Actual upgrade preserved every profile-file hash before reopening, including paused pending edit/upload operations and file bytes. Electron safeStorage restored a synthetic Windows-protected credential, and the backend recognized it as remembered.
- Actual uninstall removed the program and shortcut while preserving every profile file. Reinstall retained those bytes before reopening and restored pending work, NPCDex revision 72 and the protected credential. The final test uninstall left **only Data** in the installation root.
- All lifecycle checks used isolated fixture data. No synthetic edits were sent to production YouTrack.

See [full isolated evidence](U13A-Isolated-Installer-Verification.json).

## Application-Folder Data

Per the user's clarification, saves now belong under `%LOCALAPPDATA%\ROMDexDesktop\Data`, alongside versioned application files. Program updates and uninstall retain Data. The first installed launch reviews a verified copy of the established U12 profile; its original remains preserved. Missing/corrupt established Data stops for recovery rather than loading an older baseline. [Storage decision](U13A-Storage-and-Installer-Revision.md).

## Measurements

The MSI is approximately **154.8 MiB**. Packaged program files total **396,227,873 bytes** (approximately **377.9 MiB**), before user Data, installer cache and filesystem overhead. Test launches reached two loaded workspaces in **7.0, 10.8 and 10.1 seconds**; these are observations under the verification workload, not guaranteed startup times.

Summed Electron process working-set samples were approximately **703.6 MiB** with the window visible and **711.0 MiB** shortly after hiding to the tray. These sums can double-count shared pages and are not deduplicated physical-memory measurements; closing to the tray retains loaded workspaces for background activity. Memory optimization was not part of U13A.

## Remaining U13A Checks

The user has been asked to quit U12 and launch the installed candidate through the verification helper. Before marking completion: verify the current-save preview/adoption, exact retained source and NPCDex document, protected connection reuse, genuine YouTrack reads, private upload-size configuration or its permission gap, and return the installed app to normal operation without diagnostic endpoints. NPCDex cloud remains U14–U19; update notifications/downloads remain U13B.


## Final U13A Result

**Completed October 15:** corrected 0.5.2 installed, exact current-save adoption and remembered connection verified, normal automatic-sync relaunch passed and diagnostic ports closed. The earlier pending status above describes the intermediate 0.5.1 checkpoint. Use the [final completion report](U13A-Completion-Report.md) and [final evidence](U13A-Desktop-Verification.json).

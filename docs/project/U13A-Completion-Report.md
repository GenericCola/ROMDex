# U13A — Completed October 15, 2026

**ROMDex 0.5.2 is installed, running normally and connected to YouTrack.** Open **ROMDex** from the Windows Start Menu for current work. Closing the window leaves it in the tray; **Quit ROMDex** checkpoints work and exits.

## Changes

- Added the private unsigned per-user Windows x64 MSI, Start Menu shortcut, stable application identity, version metadata and the original Pokédex icon. [Installer](ROMDex-Installer-0.5.2/ROMDex-0.5.2-x64.msi), [guide](ROMDex-Installer-0.5.2/READ-ME-FIRST.md).
- As requested, saves reside **inside the installation folder**, at `%LOCALAPPDATA%\ROMDexDesktop\Data`. Program versions occupy separate app-version folders. Uninstall retains Data; reinstall reuses it.
- Copied the current U12 profile only after native review and Windows-protected credential verification. The original remains unchanged, with a fresh protected backup including the original encrypted session key. Existing Data takes precedence over older copies.
- Corrected atomic save handling for brief Windows file locks, installer cleanup/path restoration, and migration of Electron's encrypted Local State key before initialization. No token re-entry was needed.

## Verified Current Data

**299 tasks, 104 manual-order entries, zero pending operations and NPCDex revision 72 (4 towns).** The entire NPCDex document and order/images match the original. Credential ciphertext is preserved exactly; the remembered connection restores and genuine YouTrack reads match all 299 task records. The normal installed relaunch completed automatic synchronization with diagnostic ports closed. Original U12 delivery: all **194 hashes unchanged**.

## Validation

**287 automated tests, 89 syntax checks and 200 final application-file hashes** passed. Final source files match the delivered application; one unchanged U12 preview asset is retained. No current saves or credentials are bundled.

Actual disposable install, Start Menu/second launch, upgrade, uninstall and reinstall passed with paused pending edits, queued-file bytes, NPCDex data and a synthetic protected credential. Final test uninstall left only Data. Those lifecycle versions were 0.5.0/0.5.1; final 0.5.2 uses the **byte-identical installer template**, passed full Windows Installer validation, upgraded the real 0.5.1 installation and then adopted the current saves. The real user installation was not uninstalled as a test.

The initial 0.5.1 live adoption correctly stopped before publishing saves when it could not decrypt the remembered connection. Version 0.5.2 fixes the missing original session key. A real Windows/Electron cross-profile test reproduces the failure without migration and proves successful restoration with migration. Earlier failed staging copies are retained, not treated as current saves.

[Final desktop evidence](U13A-Desktop-Verification.json), [isolated lifecycle evidence](U13A-Isolated-Installer-Verification.json), [application manifest](U13A-Application-Manifest.json). No synthetic production edits were made.

## Size and Private Delivery

Final installer: **154.8 MiB** (162,275,328 bytes), SHA-256 `08509edd0aae65a8583187a88adb7c4635c9e5791f83696d5f87c1475dd66161`. Program payload: approximately **377.9 MiB**, before Data, MSI cache and filesystem overhead. Isolated launches loaded both workspaces in **7.0–10.8 seconds**. Summed process working sets sampled approximately **704 MiB visible / 711 MiB hidden**; these can double-count shared pages and are not deduplicated physical memory. These resource samples used the preceding lifecycle build.

The current token's read-only upload-setting probe returned **HTTP 404**; neither the upload ceiling nor remaining server storage could be established. The installer stays local/private. **No limit was raised, no installer was uploaded, and no GitHub repository or paid service was provisioned.** U13B must resolve private delivery access/limits before selecting YouTrack or the conditional private GitHub fallback.

## Recovery and Next Task

Back up the **whole Data folder**, including Data/Runtime: Windows-protected credentials depend on its encrypted key as well as the saved envelope. Original U12 data remains at `%LOCALAPPDATA%\ROMDexDesktopData`; do not resume editing the preserved older build as though it contains newer installed-app work. Quit before installing or uninstalling. [Storage decision](U13A-Storage-and-Installer-Revision.md).

**U13A is checked off. Next: U13B — Approved Update Notifications and Installation, Sol / High, requiring a new PASSKEY.** Updates will notify and ask before installation. NPCDex remains local-only until U14–U19. No U13B or cloud implementation was started.

# U13A — Windows Installer and Preservation

Authorized by PASSKEY October 15, 2026. Recommended Sol / Medium. U13B updater and U14 cloud provisioning remain separate tasks.

- [x] Preserve the verified U12 source and delivery; record the current stable-profile baseline without exposing credentials. Refresh after the final live checkpoint.
- [x] Pin Forge/WiX build tools and stable Windows install/shortcut identity. User supersedes Squirrel direction: saves belong inside the application folder and Data must remain on uninstall.
- [x] Implement Data outside replaceable program-version files, verified U12 profile copying and ownership checks. Live adoption remains below.
- [x] Build corrected 0.5.2 unsigned private Windows x64 installer; full Windows validation and actual upgrade from installed 0.5.1 passed. Current-save adoption and normal connected relaunch passed.
- [x] Pass 287 regression tests, 89 syntax checks and the final 200 application-file hash audit; preserved U12 delivery's 194 hashes remain unchanged.
- [x] Verify real Windows encryption across old/new userData folders. The test reproduces failure without migration and proves successful restoration after preserving the original key, including backup of the failed launch's generated key.
- [x] Verify actual install, shortcut/reopen, upgrade and uninstall/reinstall with isolated saves, paused pending work and a Windows-protected credential. Final uninstall leaves only Data. [Evidence](U13A-Isolated-Installer-Verification.json).
- [x] Verify the installed application adopts the established current profile without replacing data or requesting the token again.
- [x] Measure installer/installed size, startup and window/tray memory; assess private YouTrack delivery against actual accessible configuration, recording any permission gap.
- [x] Record evidence, recovery instructions and completion; stop before U13B and request its PASSKEY.

# U10 — Native Desktop Window and Local Service

**Completed:** October 15, 2026, under the task-specific PASSKEY. **Desktop build:** 0.5.0-preview.10, Windows x64, Electron 44.7.2. The user's normal Windows launch and subsequent checks verified the packaged window and separate utility process.

## Result

ROMDex and NPCDex now run in a standalone desktop window with bundled Chromium and Node. The desktop application does not require an open command window, a separate Chrome installation or an externally installed Node runtime. The native engine, clock, operation queue, file staging and named durable stores run in the utility process. A restricted facade connects the existing views to that owner.

Packaged files load through **romdex-app://shell/**. Sandboxed renderers have no Node integration; the bridge checks the root caller, enumerated commands, storage keys and payloads. File dialogs and export destinations are controlled by privileged code. The desktop does not open the browser service's HTTP port. The tested browser adapter remains available for the existing release.

Both workspaces remain loaded during switching. Shared Save retains independent provider results and the one-cycle override while Auto-Sync is Off. NPCDex accepted edits and recovery copies use native durable stores; manual export uses an atomic JSON write. Native attachments use the existing durable queue, with selected paths confined to privileged processes. The corrected header and removed application cog remain intact.

U02 preferred WebContentsView as a container; this implementation retains U08's trusted same-origin documents inside a sandboxed BrowserWindow to preserve their tested editing/context interfaces. The [host/bridge contract](U10-Host-and-Bridge-Contract.md) records this choice and the trust boundary. Untrusted downloadable add-ons are not supported by this arrangement.

## Verification

- **240 automated tests** passed under Electron's bundled **Node 24.21.0**; no tests failed or were skipped.
- **Seven service/restart checks** verified no HTTP listener, finite commands/stores, incoming updates, Auto-Sync behavior, and recovery of queued edits, file bytes and NPCDex records.
- **Nine desktop-facade UI checks** used the real service and facade in controlled Chromium; **14 browser regressions** also passed.
- **Eleven actual packaged Electron checks** verified protocol loading, sandbox/bridge restrictions, denied privileged API access, shared Save, native NPCDex export, preserved context, renderer reload, header alignment, separate bundled-runtime processes and automatic incoming updates while NPCDex was active. No page script errors were recorded.
- **70 script/module syntax checks** and **174 delivery-file hashes** passed. The runtime archive matched its official SHA-256; licenses are included. Delivery size is **396,119,337 bytes**, before any future installer compression.
- All **91 files** of the previous 0.4.3 installation and protected checkpoint, plus its ZIP, remained unchanged. The saved credential ciphertext matched the prior protected value; the working browser service still reports 0.4.3 with its remembered connection and Auto-Sync enabled. Verification made no production YouTrack writes.

[Windows evidence](U10-Windows-Verification.json), [utility checks](U10-Utility-Service-Verification.json), [facade checks](U10-Desktop-Facade-Verification.json), [browser regressions](U10-Browser-Regression-Verification.json), [preservation](U10-Preservation-Verification.json), [delivery manifest](U10-Desktop-Manifest.json), [desktop image](U10-Desktop-Preview.png).

The first normal Windows attempt exposed a session-registration error: the custom protocol was attached to the default session instead of the window's persistent session. This was corrected before the successful launch and actual Electron checks. The graphical runtime cannot start inside the tool sandbox, so a normal Windows launch was required; headless and browser evidence was not treated as a substitute for desktop acceptance.

## Delivery and Current Work

Open **ROMDex-Desktop-U10/ROMDex.exe** for the independent preview; [guide](ROMDex-Desktop-U10/READ-ME-FIRST.md). The verification launcher is separate and uses fixture data with no token or production connection. Ordinary ROMDex.exe launches do not enable debugging or fixtures.

**Continue using the 0.4.3 browser release for the live project until U12 migration.** This preview uses packaged baseline data and its own profile at **%LOCALAPPDATA%/ROMDexDesktopData/preview-u10**. No current browser save, remembered connection or original NPCDex Downloads file was adopted or overwritten. Program files and the preview profile are separate; U12 must capture the latest current data and queued bytes before ownership handoff.

Closing the U10 window exits it. Tray operation, command placement, instance/profile locking, supervised process recovery and full lifecycle acceptance remain U11/UX01. The installer remains U13A. NPCDex cloud synchronization remains U14–U19. No account, billed provider, update feed or public artifact was created. There is no Git repository here; the protected baseline, source, verified folder and manifest record this change set.

## Next Approval Boundary

**Next: U10F — Desktop File Drop Attachments, Sol / High.** Add Explorer/desktop drops through the native adapters and existing queue, preserving internal hierarchy dragging. A new PASSKEY is required. UX01 still precedes U11; U12 remains the current-data migration gate. No U10F implementation is included in U10.

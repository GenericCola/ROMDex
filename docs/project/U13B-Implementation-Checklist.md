# U13B — Update Notifications and Installation

Authorized by PASSKEY October 15, 2026. Recommended **Sol / High**. Resume after the user's reasoning-level pause. One task at a time; U14 cloud provisioning remains separate.

- [x] Preserve the verified 0.5.2 source, installer and save boundaries; finalize the release trust and consent contract.
- [x] Implement signed release validation, approved private-provider reads and streamed download verification. Keep hosting unavailable until a private route is configured and proven.
- [x] Add tray update commands and non-interrupting notices; require approval before download and installation. Update failures must remain separate from data-sync indicators.
- [x] Implement durable checkpoint, installer handoff, restart/cancellation recovery and compatibility checks; retain Data and pending work.
- [x] Run targeted security/failure tests, full regression tests and isolated Windows installer/update checks.
- [x] Verify the delivered build, current-data/credential preservation and normal restart; document hosting status and recovery.
- [x] Check off U13B only after its approved acceptance gates pass; report and stop before U14, naming its recommended model/effort.

## Hosting State

The current YouTrack account's menu does not expose Server Settings; the read-only upload-setting request returned HTTP 404. Its upload limit and remaining storage remain unverified. The approved private GitHub fallback is published and verified at GenericCola/ROMDex. It contains organized source, historical backups, deferred work and release 0.5.3. Windows Git verified its exact private repository identity. The Windows-protected RSA-3072 publisher key stays outside Git; its public key is pinned in the installed app. Authenticated installer downloads matched the published size and hash. Current Data, credentials and the private signing key remain outside Git.

## Implementation Contract

Checks may run at launch and at most once per day, plus a manual tray command. Checks fetch only bounded signed metadata. Download requires explicit Update Now approval; installation requires a successful local checkpoint and an explicit install/restart action. Feed errors do not affect shared Save/Auto-Sync health. Signed metadata binds application, channel, Windows x64 platform, stable increasing version, expiry, exact installer byte size/hash and provider artifact identity. Publishing keys remain outside application code, Data and cloud storage, protected to the publisher's Windows account. Missing trust/provider configuration shows Unavailable and retains an authenticated manual-install route.

## Verified Candidate

305 tests, 98 syntax checks and 214 installed application-file hashes passed. Genuine isolated MSI upgrade/reopen/uninstall passed with exact retained task fields, both operations, queued bytes, manual order, images, protected fixture credential and the entire NPCDex document. Installer cancellation recovery used injected exit 1602 after real preflight. The production MSI is fully validated; its 139 source files match canonical source and one unchanged reference asset is preserved. Private publication, current-data adoption, protected GitHub access and a normal restart all passed. The saved GitHub credential remained byte-for-byte unchanged after restarting.

## Final Acceptance

Private source/release publication, authenticated remote bytes, actual 0.5.3 installation, exact 96-file Data preservation, current YouTrack/NPCDex data, read-only GitHub update access and normal relaunch with diagnostic ports closed all passed. See the final completion report. Earlier pending paragraphs above describe intermediate checkpoints. U14 remains gated by a new PASSKEY.

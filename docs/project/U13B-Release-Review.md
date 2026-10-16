# U13B — Release Review

Status: production candidate verified; private publication and current-data adoption pending. This document is not final acceptance. The live installation remains 0.5.2 until the user finishes edits and quits for the reviewed installation. U14 is not authorized by this task.

## Result Implemented

The Windows tray opens a dedicated Updates window. Checks fetch signed metadata only, at launch and at most daily, with a manual check available. The user reviews release notes and approves downloading. Downloaded bytes are verified before a separate Install and Restart approval. Later keeps the current app running; Cancel Download removes incomplete staging. Update errors do not affect the project Save/Auto-Sync indicators.

The application pins a public RSA-3072 key. Signed metadata binds application identity, stable version, channel, platform, compatible save schemas, publication/expiry dates, exact artifact identity, byte size and SHA-256. Older/replayed, incompatible, expired, unsigned, modified or partial installers are rejected. An authenticated signed manual-file route remains available when hosting is unreachable.

Installation checkpoints local data, pauses mutations, copies pending work and runtime encryption state, and verifies the installer again. A Windows shell-activated helper waits for both save-owning processes to exit, checks the MSI product/upgrade identity, runs Windows Installer and reopens ROMDex. Failure/cancellation preserves Data and reports its result without automatically retrying. Open edit forms block installation and resume the current workspace.

## Private Repository and Publishing

The user created and authorized **GenericCola/ROMDex**, private repository ID **1421521049**, as the organized development home. It contains current source, shared suite assets, plans/deferred features, historical source checkpoints and development/delivery scripts. Archived scripts retain their original task-relative paths and must be reviewed before reuse. Original local artifacts remain intact.

Live Data, pending file bytes, protected save backups, tokens, private keys, dependency caches and runtime binaries are excluded. The historical baseline commit preserves exact source bytes; Git does not normalize line endings in preserved snapshots. Installers belong in private GitHub Releases, separate from Git source history. Actions and billing are not enabled.

The publisher obtains GitHub access through Windows Git Credential Manager. Its separate signing key is encrypted to the Windows account outside the app and repository. The application uses its own Windows-protected, repository-limited **Contents: Read** download token. The publisher's write credential is never copied into the app. Repository identity/privacy are checked before release access; authorization is stripped from approved asset-CDN redirects. The installer transfer streams outside the ticket-attachment viewing path and its 50 MB limit.

## Verification Gates

- Automated regression and failure/security tests: **305 passed**.
- Original baseline archive: all **2,398 tracked files** matched exact working bytes in the initial baseline commit.
- Repository audit also covers historical scripts and shared assets; final counts follow final staging.
- Native update-window consent and unfinished-form blocking passed in the isolated installation.
- Cancellation recovery, genuine MSI upgrade/reopen/uninstall and exact fixture-data preservation passed. Cancellation used injected exit 1602 after genuine preflight; upgrade/uninstall used Windows Installer.
- Production: 98 syntax checks, 214 application-file hashes, 139 exact canonical source matches and one retained reference asset. MSI: 162,304,000 bytes; SHA-256 `7413808d56a34a6965bfa10858ef7f7df75635438d4889eadb351dec53a25670`.
- Private publication/remote bytes and current-data adoption remain pending. [Windows evidence](U13B-Desktop-Verification.json), [fixture preservation](U13B-Fixture-Preservation.json), [application manifest](U13B-Application-Manifest.json).

Earlier fixture runs exposed Windows helper launch/status handling and test-harness cleanup issues. Their diagnostics remain local. Final evidence must identify the corrected run and distinguish injected installer cancellation from a genuine MSI upgrade.

## Remaining Limits

Windows installers remain unsigned during private testing; release signing is a separate integrity check, not Windows publisher certification. YouTrack's actual upload limit and remaining space could not be read with the current account, so the explicitly approved private GitHub fallback is used for installers. No YouTrack setting or billing configuration is changed.

NPCDex cloud persistence remains U14–U19. U13B does not create cloud save containers, migrate NPCDex into YouTrack or implement change-request/receipt reconciliation. The next task remains **U14 — Private YouTrack Storage and Access Rules, Sol / High**, under a new PASSKEY after U13B acceptance.

The final publishing preflight also exposed a GitHub repository-root URL issue. The corrected provider uses the exact API path; the existing private-identity test now asserts that URL, and all 305 tests pass. The production installer was rebuilt and fully validated after that change. The native handoff source is unchanged from the successful genuine fixture upgrade. Packaged source-control dotfiles are included in the repository source binding. No release was uploaded before these corrections.

## Final Acceptance

All remaining gates passed, including private publication/download, live-data adoption, read-only update access and normal restart. The [completion report](U13B-Completion-Report.md) supersedes intermediate pending statements above. U14 requires its own PASSKEY.

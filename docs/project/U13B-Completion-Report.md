# U13B — Completed October 15, 2026

**ROMDex 0.5.3 is installed, connected and running normally.** Open ROMDex from the Windows Start Menu. Closing leaves it in the tray; Quit saves local work and exits.

## Changes

The Windows tray now offers Check for Updates. Release checks fetch signed metadata only, automatically at most daily or manually on demand. Review notes and choose Update Now to approve downloading, then Install and Restart when ready. Later leaves the existing version running. Cancel Download removes incomplete staging. Updates are independent of project Save/Auto-Sync; the header is unchanged.

RSA-3072 signatures bind application/version/platform/schema compatibility, dates, exact installer identity, size and SHA-256. Untrusted, altered, expired, older, incompatible and incomplete files are rejected. Native private GitHub reads are restricted to the approved repository; credentials are not forwarded to approved download-CDN redirects. Signed manual metadata/MSI selection remains available offline.

Installation checkpoints local work and queued bytes, pauses mutations and preserves encryption state. An independent Windows helper waits for both save-owning processes to exit, verifies MSI identity/hash again and pins installation to the existing application folder. It reports failed/cancelled results without automatic retry, retains Data and reopens the app. Unfinished forms block installation and resume the workspace. Interrupted-helper lock files no longer permanently block later updates.

## Verified Current Saves

**299 tasks, 104 order entries, 0 pending operations and NPCDex revision 72.** The entire NPCDex document, manual order, images and protected YouTrack connection are preserved. All **96 Data files** matched exactly before and after MSI installation, before startup. Genuine YouTrack reads match every task field. No new YouTrack token was entered. Normal relaunch completed automatic synchronization and closed both diagnostic ports.

Private update access is separately saved with Windows protection using a repository-limited, read-only GitHub token. The installed app authenticated, verified the signed release and reported Up to Date without downloading an installer. The publisher's write credential/private signing key were never copied into the application or repository. Back up the whole Data folder, including Data/Runtime, to retain encrypted connections. The protected pre-upgrade backup is retained locally at outputs/U13B-Protected-Data-Backup; original earlier data and releases remain intact.

## Private Development and Release Home

[GenericCola/ROMDex](https://github.com/GenericCola/ROMDex) now contains current application source, shared suite assets including the Standard Settings Icon, plans/deferred work, **27 historical source checkpoints**, and development/delivery scripts. Archived helpers retain their original task-relative paths and must be reviewed before reuse. Source snapshots may contain original packaged seed data; never use them to replace newer Data.

Live saves, queued work, protected backups, tokens, private keys, dependency caches and runtime binaries are excluded. Exact Git-blob/working-byte and secret-boundary audits passed. No Actions workflow, billing, public repository/release or extra collaborator was configured.

[Private release 0.5.3](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.3) contains the MSI, signed metadata and guide. Source commit: f41dd2f33fd7ab68dcca6703cde7ba68a57481df. Installer: **154.8 MiB** (162,304,000 bytes), SHA-256 `7413808d56a34a6965bfa10858ef7f7df75635438d4889eadb351dec53a25670`. Authenticated remote bytes matched exactly before live installation.

## Quality Assurance

**305 tests, 98 syntax checks and 214 installed application hashes passed.** All 139 canonical source files and one unchanged reference asset match the delivered package. Actual native consent/Later/no-download, unfinished-form blocking, cancellation recovery, genuine MSI upgrade/reopen and uninstall-retaining-Data passed with an isolated identity. Exact task fields, both pending operations, queued file/metadata bytes, order/images, encrypted fixture credential and the whole NPCDex document survived.

Cancellation used injected exit 1602 after genuine release/MSI preflight; upgrade and uninstall used real Windows Installer. The baseline fixture used final handoff/main files. A later provider-only API-path correction was regression-tested, fully rebuilt/validated and verified against GitHub and the installed app. Earlier failed diagnostics/artifacts remain local; they are not treated as acceptance results.

[Desktop evidence](U13B-Desktop-Verification.json), [installed application manifest](U13B-Application-Manifest.json), [fixture preservation](U13B-Fixture-Preservation.json), [update guide](ROMDex/U13B-Update-Guide.md).

Private test MSIs remain unsigned for Windows publisher identification. YouTrack upload limits and free capacity are unverified; the approved private GitHub fallback is now proven. No synthetic production edits were made. **NPCDex is still local-only. U13B is complete; next is U14 — Private YouTrack Storage and Access Rules, Sol / High, requiring a new PASSKEY.** No U14 provisioning or migration was performed.

# ROMDex — Review Package

**Release:** 0.5.7 · **Prepared:** October 16, 2026 · **Platform:** Windows x64.

Open **START-HERE.html** for a clickable overview, or begin with these files:

1. [Features](FEATURES.md) — what is available in 0.5.7.
2. [Project Status and Owner Review](PROJECT-STATUS.md) — approved architecture, roadmap and the NPCDex Content / NPCD project prerequisite.
3. [Known Limitations](KNOWN-LIMITATIONS.md) — platform, storage, conflict and unfinished-work boundaries.
4. [Development Log](DEVELOPMENT-LOG.md) — milestone summary; original reports are in [the full document index](DOCUMENT-INDEX.md).
5. [Installer](installer/ROMDex-0.5.7-x64.msi) — the existing verified private test release, not a new development build.

## Installer

Extract the ZIP before installing. Run installer/ROMDex-0.5.7-x64.msi and open ROMDex from the Windows Start Menu. No separate Chrome/Node installation is needed. The private test MSI is unsigned for Windows publisher identification; its release metadata is separately signed and was verified when preparing this ZIP.

Installer SHA-256:

8bab8e1253503f765b030f3079a6c7c480b8f628e69645c422af6dd8df1e7d83

The MSI is 162,380,666 bytes. Signed release metadata and its public verification key are included beside it. Existing ROMDex users can use the application's approved signed manual-update flow; finish edits and Quit from the tray before an installer upgrade. Do not run old migration/verification helpers from historical reports.

Closing the window keeps ROMDex running in the tray. Choose Quit ROMDex to stop it. Application Data stays under %LOCALAPPDATA%/ROMDexDesktop/Data and is retained on uninstall. Use only the reviewer’s separately authorized connections. Connecting to a real project enables the normal application workflow; this installer is not a forced read-only demo.

## Contents and Exclusions

Included: verified MSI, signed release metadata/public key, current review guides, canonical project documentation and technical evidence, application milestone guides, NPCDex reference/workflow/iteration/source-map documents, approved contracts/examples and selected labelled screenshots.

Excluded: current working saves, application Data/session, queued files, encrypted/plaintext credentials, protected backups, private signing keys, dependency/runtime caches and the private Git repository itself. The installer retains its original bundled baseline; this is not the owner's latest saved workspace. No access grant, live save migration or automatic agent handoff is performed by creating this archive.

Historical documents retain original version claims, local paths and milestone next-task labels. Current review guides take precedence; missing historical local artifacts are identified in DOCUMENT-LINK-AUDIT.json. PACKAGE-CONTENTS.json and SHA256SUMS.txt identify the included bytes. External links may require repository access; the documentation copies are readable offline.

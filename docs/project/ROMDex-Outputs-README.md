# ROMDex Outputs — Start Here

Current installed evaluation build: **0.5.25**, with reviewed cross-ROM map updates, parent/child grouping and readable source previews. Connection Details stays closed during background retries. Two-actual-build acceptance remains deferred. The supplied ROM exposes all 121 named groups; additional ROM layouts and broader RI03C acceptance remain open. Latest published private updater release: **0.5.15**. This folder contains current deliverables and organized reference material. Runtime saves and credentials remain in the installed application's Data folder.

- [MAPDex Preparation Corrections and Character Linking](MAPDex-0.5.25-Completion-Report.md)
- [RI03U Cross-ROM Updates and Connection Dialog Correction](RI03U-Completion-Report.md)
- [MAPDex 0.5.22 Hover Settings Correction](MAPDex-0.5.22-Completion-Report.md)
- [MAPDex 0.5.21 Grouping and Preview](MAPDex-0.5.21-Completion-Report.md)
- [Location Preview Scope](MAPDex-Location-Preview-Scope.md)
- [MAPDex 0.5.20 Entity and Sprite Correction](MAPDex-0.5.20-Completion-Report.md)
- [MAPDex 0.5.19 Readable Map Contents](MAPDex-0.5.19-Completion-Report.md)
- [MAPDex 0.5.18 Loading and Selection Correction](MAPDex-0.5.18-Completion-Report.md)
- [MAPDex 0.5.16 Delivery and Test Steps](MAPDex-0.5.16-Delivery-Report.md)
- [Overall Action Plan](NPCDex-ROMDex-Unified-App-Action-Plan.md)
- [Phase and Task Checklist](NPCDex-ROMDex-Action-Checklist.md)
- [Current Installer](ROMDex-Installer-0.5.25/ROMDex-0.5.25-x64.msi)
- [RDX Agent Authoring Kit](RDX-Reference/RD09-Agent-Authoring-Kit.zip)
- [RDX Tooling and Deferred ROM Extraction](Phase-6-RDX-Authoring-Report.md)
- [Project Scope](NPCDex-ROMDex-Unified-App-Scope.md) and [Decision Log](NPCDex-ROMDex-Decision-Log.md)
- [U26 Returned-File Review Report](U26-Completion-Report.md)
- [U25 Validated Application Report](U25-Completion-Report.md)
- [U24 Returned RDX Discovery Report](U24-Completion-Report.md)
- [U22 Navigation and Progress Report](U22-Completion-Report.md)
- [U21 Package Implementation Report](U21-Completion-Report.md)
- [Latest Release Acceptance](RD10-Completion-Report.md)
- [Cleanup Completion](Documentation/Cleanup/Local-Cleanup-2026-10-19-Completion.md)

| Folder | Contents |
| --- | --- |
| ROMDex | Current application source and tests. |
| ROMDex-Installer-0.5.25 | Current verified evaluation installer and application manifest. |
| Protected/Before-MAPDex-0.5.25 | Latest verified complete Data and prior-source ZIPs; preserve them. |
| Protected/Before-MAPDex-0.5.18 | Latest verified complete Data and prior-source ZIPs; preserve them. |
| Protected/NPCDex-Archive-2026-10-20 | Verified complete pre-reset Data, YouTrack and older recovery ZIPs; preserve them. |
| Documentation | Project decisions, cleanup records and historical reports/evidence grouped by task. |
| Testing | Standalone Violet City RDX and the clean round-trip test guide. |
| RDX-Reference | Format contracts, portable examples and the agent authoring kit. |
| Tool-Suite-UI | Shared interface assets and standards. |
| ROMDex-Selector-Archive-2026-10-13 | Preserved original selector data and archive. |

Obsolete logs, finished launchers and instructions have joined the existing `../DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-19` folder for manual deletion. No files were deleted and the installed app was not changed.

Going forward, place task reports/evidence in ``, current project guides in ``, and development helpers under `../work/`. Keep the current plans, installer, source and newest recovery backup readily accessible. The source repository remains at `../work/u13b/repository`; its canonical documentation paths were not reorganized.

The relocation map in [Documentation/OUTPUTS-RELOCATION-MAP.json](Documentation/OUTPUTS-RELOCATION-MAP.json) records every old/new location. Historical verification scripts and recorded artifact paths are frozen evidence; consult this map when locating their outputs. The private repository retains its canonical documentation; pre-organization local navigation files are preserved in `../work/outputs-organization-2026-10-19/original-navigation-documents.zip`. No U21 or ROM extraction implementation is included in this organization task.

October 20: NPCDex was reset and reconnected at the user's request for clean RDX testing. [Test guide](Testing/README.md). Keep `Protected/NPCDex-Archive-2026-10-20`; obsolete files are collected in `../DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-20` for manual deletion. The former raw RD10/U26B recovery folders now have verified compressed copies in the protected archive. [Reset report](NPCDex-Clean-RDX-Test-Preparation.md).

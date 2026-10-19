# RD10 — Complete

Completed October 19, 2026. **Phase 6 is complete. ROMDex 0.5.15 is installed and running with the accepted current saves.** [Verification](RD10-Verification.json), [private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), [installer](ROMDex-Installer-0.5.15/ROMDex-0.5.15-x64.msi).

The three physical maps now use separate managed RDX working files. Each contains one map, its descendants, relevant planning/review/history and required exact assets/shared dependencies. Global Dialogue, shared collections, the original export and complete recovery backups remain separate. All 211 original NPCD issue identities are retained; adoption creates no replacement tickets.

| Map | Compressed bytes | Installed working copy |
| --- | ---: | --- |
| New Bark Town | 540,642 | [Working file](C:/Users/mrgen/AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON/RDX/working/f43040a1071e18840f42f31817a7406192e360bd1c1d55a12bd7c97eca94d4c3.rdx) |
| Route 29 | 185,623 | [Working file](C:/Users/mrgen/AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON/RDX/working/6c724be0d7bbff3364c6a6c3bfb720675a78c8949e0d6e492d0d1327010f67d1.rdx) |
| Cherrygrove City | 338,835 | [Working file](C:/Users/mrgen/AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON/RDX/working/5e820e54fb72f90edd249f935ed2004a1dc40d139cdd769f7361e0505a67cba2.rdx) |

Select a physical map in NPCDex, then use **Tray 2 Settings → Export Current Map RDX** to save a portable copy. The managed copy stays inside the installed application's Data/RDX/working folder. The original native synchronization journal remains the publication owner. Local saves and accepted YouTrack updates checkpoint affected map files; complete-generation selection and retained history protect interrupted writes.

## Verification and Preservation

- 186 RDX regressions passed; nine final adoption/catalog checks, the focused content-preview check, the new workspace-reload regression and 15 lifecycle checks passed. One sandbox default-temp rename failure passed its focused workspace-temp recheck. These are separate evidence sets with overlap, not a claimed total of distinct tests.
- Six final packaged desktop checks passed, including actual menu export, correct map restoration, fresh shell save handlers after iframe reload and normal quit with an unsent isolated edit. 145 packaged-source files passed syntax checks; all 310 installed application/runtime hashes matched.
- The fresh complete Data backup preserved 121 files and 192,524,906 bytes. Isolated restoration matched every original hash. Backup: **outputs/RD10-Protected-Data-Backup**; it is protected locally and contains no source-controlled copy of credentials.
- Fresh local/remote content heads agreed before activation. Installed read-only acceptance verified all three one-map files against the native backend domain, 299 tasks, 104 order entries and 78 saved parent statuses, with zero pending operations/reviews.
- All three credential ciphertexts remained unchanged and were unlocked without token entry. Restricted NPCD ownership and private update access were verified. The signed release index and authenticated installer download matched the tested MSI; Windows installer signing remains the approved private-testing limitation.

The native review found two defects before release: partial restored selections became undefined instead of null, blocking export; and iframe reloads left the shell holding old save handlers, blocking quit. Both are corrected and covered by focused/packaged checks.

## Remaining Boundaries

Global Dialogue is a shared collection. Native journals, shared context and full backups remain alongside the map documents. Historical versions are retained; no pruning policy is introduced. Divergent returned RDX files cannot silently replace adopted existing NPCD maps; task-bound discovery/reconciliation and mandatory human testing remain U23–U27. JSON Map Package selection/task attachment remains U21. No real ROM extraction has been performed.

[Plain-English authoring/tooling report](Phase-6-RDX-Authoring-Report.md). Next: **U21 — Map Document Preview and Task Attachment, Sol / High**, requiring a new PASSKEY.

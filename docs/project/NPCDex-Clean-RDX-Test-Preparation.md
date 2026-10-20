# NPCDex Clean RDX Test Preparation — October 20, 2026

Completed at the user's explicit request, independently of RI03C's remaining packaged acceptance gate. The installed app remains 0.5.15 with its existing repairs; no application code or installer was changed.

- Archived the complete closed-app Data folder: 160 files, 308,578,799 source bytes; verified every ZIP member's SHA-256 by readback.
- Archived all 224 app-owned NPCD tickets, comments, hierarchy/native metadata and exact attachment bytes: 2,239 archive files, 24,475,645 source bytes. Rechecked the backend baseline before removal.
- Removed only those exact ownership-verified NPCD records, children before parents/registries; each deletion passed a 404 readback. NPCD had zero remaining issues after the reset. No PMON task was deleted.
- Retired the three prior managed maps, content-provider binding, legacy import seed, caches and pending legacy content queue into the cleanup folder. Their exact originals and unsent changes remain in the complete Data archive. Removed both active legacy-provider paths so neither YouTrack nor the old GitHub seed can repopulate the clean workspace.
- Preserved and hash-checked nine unrelated task, metadata and credential files, including the remembered YouTrack, GitHub cloud and private-update credentials. Retained the Windows encryption key/session and shared Auto-Sync preference.
- Re-enabled NPCDex cloud synchronization for the new RDX workflow. The saved account and NPCD project verified successfully without token entry. Import remains local until the user explicitly confirms **Publish Map to YouTrack** for that map.
- Reopened the actual installed app and verified zero managed maps, content records, areas and queued writes, with no NPCDex-only pause and a working YouTrack connection. The workspace is now available for user edits; these zero counts describe the reset checkpoint, not a continuing restriction.
- Verified and retained compressed copies of four older recovery folders before collecting their raw directories. Collected 3,634,086,305 bytes of additional obsolete files; the separate Retired-NPCDex and incomplete-archive subfolders are also in the same delete folder.

## User test sequence

1. Import one standalone map RDX into NPCDex, browse and edit it locally.
2. Publish it through a reviewed binding; inspect the resulting NPCD data tree and mappings.
3. Make a supported native YouTrack edit, synchronize and accept its review, and confirm NPCDex plus the managed/exported RDX retain both local and incoming changes.
4. After this round trip, test MAPDex ROM extraction and another map. MAPDex/RI03P remain source-complete and require RI03C packaged acceptance before becoming installed features.

The unedited, ROM-only Violet City input is retained locally at `outputs/Testing/VioletCityMap.rdx` (1,001,582 bytes; SHA-256 `be868307dc1668f9366716251776ffd23b54eec2e70f5a5ba0c08c08f4d56d8b`). It was not imported or published during this reset. [Test guide](NPCDex-RDX-Test-Guide.md).

## Recovery and cleanup

Keep `outputs/Protected/NPCDex-Archive-2026-10-20/`. It contains the complete pre-reset Data ZIP, separate YouTrack ZIP, four older recovery ZIPs and verification receipts. The full Data ZIP includes Windows-protected credentials and their session context; it is a private recovery artifact and is excluded from development/release uploads. Backend snapshots preserve original issue IDs as historical evidence; reimporting archived map content requires fresh backend bindings rather than reopening deleted issue references.

The folder `DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-20` contains retired NPCDex working data, obsolete installers, disposable test profiles, redundant build payloads and the already-backed-up historical source checkout. Current source, Git history, runtime/build tools, the current installer, test input and recovery ZIPs remain outside it. Historical source archives remain in Git/GitHub and can be materialized again with `git -C work/u13b/repository sparse-checkout disable`.

Nothing in the delete folder was permanently deleted. Space is reclaimed only after the user removes that folder and empties the Recycle Bin. No ROM was removed, no new YouTrack account/project was created, and no live test map was imported on the user's behalf.

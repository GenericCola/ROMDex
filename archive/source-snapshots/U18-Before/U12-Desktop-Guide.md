# ROMDex Desktop — Current Save Migration

This private Windows build adopts the latest browser saves through the reviewed U12 migration. The original web profile, NPCDex package, earlier desktop previews and protected recovery backups remain separate.

On first launch, choose **ROMDex-Web-Migration.rdx** from Downloads. Review the counts, NPCDex source and remembered-connection result, then choose **Migrate These Saves**. The browser service must be stopped for this ownership handoff. Cancel retains the original files and verified staging copy. An existing destination is never merged or overwritten.

The stable data profile is **%LOCALAPPDATA%/ROMDexDesktopData/thegobindsingh-PMON**; the Chromium session is stored separately under ROMDexDesktopData/sessions. These locations are independent of the build folder. Later builds reuse the established profile and do not import their packaged baseline over it. An absent or unsupported save requires recovery.

Migration preserves task fields, manual ordering, selector images, saved parent statuses, operation IDs/journal, queued attachment bytes, NPCDex data/history/requests/images, recovery and held copies, coordinator records and Auto-Sync. If no browser NPCDex save exists, the preserved Downloads/npcdex-v2.42/npcdex-agent-export.json package is identified in the preview. Folder permission handles from Chrome do not transfer; NPCDex initially exports to the desktop profile's exports folder, and Data can choose another folder.

The remembered connection is decrypted only inside the trusted migration process using the original Windows routine, then re-protected with Electron safeStorage and round-trip verified. No plaintext token is written to a file, installer, log, renderer or report. Another Windows account or computer needs its own connection.

Close hides the app to the Windows tray. Right-click its icon for shared save/sync controls or explicit Quit. Quit checkpoints local work without requiring a successful network save; unfinished forms/comments need review. Incoming YouTrack changes continue while hidden when Auto-Sync is On.

**NPCDex still uses local saves and recovery. Cloud persistence is U14–U19.** The Windows installer is U13A; application updates are U13B. Neither is introduced by this build.

Recovery backups are recorded in desktop-profile.json under the account's ROMDexDesktopData/recovery folder. To roll back, Quit the desktop completely before reopening the old web launcher; review the original web snapshot and any work performed after migration before restoring. Never run an old snapshot as though it includes later desktop-only edits. Keep both copies until recovery is reviewed.

Launch-U12-Migration.cmd enables loopback verification endpoints for this handoff only. Ordinary ROMDex.exe launches do not enable them. Use the normal executable after verification.

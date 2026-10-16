# ROMDex Desktop Preview — U11

Open ROMDex.exe. This build uses the original ROMDex Pokédex icon for the application, window and Windows tray.

Closing the window or pressing Alt+F4 hides ROMDex to the Windows tray, beside the clock (possibly under the hidden-icons arrow). Click its icon to restore the existing workspace. Right-click for the approved menu: Show ROMDex, Open Workspace, Save Changes, Auto-Sync Data, Connection Details, About ROMDex and Quit ROMDex. Update checks arrive with U13B.

Auto-Sync follows the shared on/off setting while hidden. Manual Save performs one cycle and leaves Off unchanged. Incoming YouTrack changes continue through the service clock. NPCDex remains local-only until U14–U19.

Quit ROMDex checkpoints accepted local edits, queued files and NPCDex recovery, then stops the service and exits. It does not require a successful network synchronization. Finish or cancel unfinished forms, inline rename/group editors or unposted comments first; otherwise Quit returns the window for review. Closing to the tray preserves those editors without submitting them.

Reopening the application restores its existing window rather than starting another queue owner. A separate profile lease also prevents overlapping writers from alternate executable paths and refuses ownership while an orphan service is still alive. Interrupted services have bounded restart attempts, recover durable accepted work, and report interrupted actions for review rather than automatically replaying uncertain commands. Suspend stops the service clock; resume wakes it and respects Auto-Sync Off.

Quit any older desktop preview before opening the normal U11 preview. Older builds do not participate in U11's profile ownership lock. The isolated verification launcher uses a separate profile.

If the interface renderer crashes, ROMDex reloads it from durable state while leaving the save service running. Reload attempts are bounded; the tray icon can retry, and Quit can still checkpoint accepted work if the renderer is unavailable. Unsaved form input that was never accepted may need re-entry after a renderer crash.

**This is still an independent preview. Continue live work in browser ROMDex 0.4.3 until U12 migrates the latest authoritative saves and remembered connection. The preview baseline must not replace them.** Normal preview data remains outside program files under %LOCALAPPDATA%/ROMDexDesktopData/preview-u10. Installer/Start Menu integration remains U13A; automatic startup is not enabled.

The separate Launch-U11-Verification.cmd uses only isolated fixture data, without a real token or production YouTrack writes. Its loopback debugging endpoints are for verification only; ordinary ROMDex.exe launches do not enable them. Use Quit ROMDex when done.

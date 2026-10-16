# UX01 — Application Command Placement Proposal

October 15, 2026. **Approved by the user: “yes, approved.” UX01 is complete; no interface implementation authorized by this document.** Recommended model/effort: Sol / Medium.

## Recommended Placement

Keep the current header unchanged. The red circle remains a workspace switcher, the connection light continues to open Connection Details, and established workspace cogs retain their existing purposes. Add no global header cog or footer controls.

Use the Windows tray icon's right-click menu for application lifecycle commands and background save controls. Group the menu with separators as shown below. Opening the application through its shortcut or activating its tray icon restores the last active workspace; choosing a workspace explicitly opens that workspace without resetting its view.

```text
Show ROMDex
Open Workspace  →  ROMDex
                  NPCDex
──────────────────────────
Save Changes
✓ Auto-Sync Data
Connection Details…
──────────────────────────
Check for Updates…
About ROMDex…
──────────────────────────
Quit ROMDex
```

“Show ROMDex” names the application: it restores whichever workspace was last active. The Open Workspace submenu provides an explicit choice. Save and synchronization shortcuts make these controls available while the window is hidden.

## Command Contract and Delivery

| Command | Behavior | Delivery |
| --- | --- | --- |
| Show ROMDex | Restore the existing window and last active workspace, preserving selections, scroll positions and open edits. Do not create a second service or queue. | U11 |
| Open Workspace → ROMDex / NPCDex | Restore the existing window and activate the chosen workspace. Preserve each workspace's existing context. Mark the active workspace in the submenu. | U11 |
| Save Changes | Invoke the same shared save operation as the header. If Auto-Sync is Off, perform one synchronization without turning it on. Bring the window forward if conflict review or other human action is required. Existing provider capabilities still apply: this does not implement NPCDex cloud sync. | U11 |
| Auto-Sync Data | Checked when enabled; controls both workspaces through the existing coordinator. Off pauses automatic remote transfers while preserving local work. | U11 |
| Connection Details | Restore the window and open the existing connection dialog, retaining workspace context. The header connection light remains the direct in-window entry point. | U11 |
| Check for Updates | Open the later update workflow. Notify and ask before downloading/installing; update failures remain separate from save/connection indicators. Omit this entry until that workflow exists rather than displaying a nonfunctional command. | U13B |
| About ROMDex | Show installed version/build and relevant local-save/cloud capability information. No credentials or private project content. Reuse and refresh the retained About dialog. | U11 |
| Quit ROMDex | Persist local edits and pending work, then stop the application and its background service. Network availability is not a prerequisite; unsent work remains for reopening. | U11 |

## Close Behavior

The normal window Close button and Alt+F4 hide the window to the Windows tray. Explicit Quit ROMDex exits. The first close should briefly explain that ROMDex is still running and that Quit is available from the tray; do not introduce a repeated confirmation dialog. The tray menu remains accessible when the window is hidden. Do not enable launch at Windows startup as part of this work.

## Scope and Acceptance

- UX01 produces this reviewed placement decision and updates planning records only. It changes no application files, saves, credentials or live services.
- U11 separately implements and verifies the menu, close-to-tray, orderly Quit, instance/profile ownership and background service lifecycle. Its own PASSKEY remains required.
- U12 migrates the latest authoritative live web data. The desktop preview's older baseline must not replace it.
- U13B implements update checks and approved update installation. No update feed, download or installation is introduced here.
- NPCDex cloud persistence remains U14–U19; tray Save must describe its actual current capability accurately.

The user approved the tray placement, menu grouping and close behavior after clarification of the Windows tray. U11 requires its own PASSKEY before implementation.

# ROMDex 0.4.3 — Workspace Switching

Open ROMDex using Start-ROMDex.cmd. The red circle immediately left of Auto-Sync opens the workspace menu. Choose ROMDex or NPCDex. ESC dismisses the menu. The title identifies the active workspace.

Switching retains the same running view: selectors, filters, scroll, Details layout/navigation, checkbox selection, cursor positions, unfinished comments and open edit forms/dialogs. It does not apply or cancel a form. Continue editing when you return. ROMDex starts in All Tasks on a new launch; restoring a workspace during the same session keeps its current scope.

The shared Save Changes button coordinates both providers and awaits their results independently. Both workspaces initialize their providers on launch. Auto-Sync controls the existing YouTrack queue; NPCDex uses manual local exports with local recovery checkpoints. Cloud sync remains a later phase. See [Save and Recovery Guide](U09-Save-and-Recovery-Guide.md). The button stays red when NPCDex has unsaved local content or native task edits need attention. Switching itself does not save, synchronize or publish NPCDex content.

For the first NPCDex save, use Inventory Settings → Data and choose a dedicated save folder, such as the existing NPCDex package in Downloads. Subsequent manual saves write npcdex-agent-export.json to that destination. Browser storage and remembered folder access belong to this browser profile. The original Downloads files were not overwritten during installation. A manual snapshot download remains available through Data.

This build's first-launch NPCDex baseline is the verified saved revision 72, captured October 15. It includes the current content, annotations, images, preferences, request/receipt history and stable IDs. Existing integrated NPCDex saves take precedence on subsequent launches. The old standalone NPCDex browser database is kept separate and is not deleted or silently imported.

The connection indicator opens the existing YouTrack dialog in ROMDex while preserving NPCDex's view. The application header cog/menu was removed; Connections, Application Updates, About and Quit have a deferred placement review. Electron, tray lifecycle and installer/update delivery remain later tasks. External file drops onto tickets are planned in U10F.

The view host retains two trusted same-origin first-party documents. NPCDex scripts are external local assets under the existing script policy. Only the two workspace pages allow same-origin embedding; the application shell still disallows framing. The host does not accept arbitrary workspace URLs or cross-window commands.

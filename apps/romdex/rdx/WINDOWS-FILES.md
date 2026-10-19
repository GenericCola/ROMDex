# Windows RDX Files — RD08

Windows opens portable `.rdx` files through the existing ROMDex instance. A map opens NPCDex's local import preview; a plan opens ROMDex's task-plan preview. The file's validated internal namespace and kind determine the workspace. Names and extensions do not select code.

Opening a file never approves an import, replaces the active managed map, binds a document, publishes to YouTrack, dispatches an agent or clears testing requirements. Confirm the local import in the preview. Task placement and cloud binding retain their separate review steps. A returned agent-result document must use the task reconciliation workflow; ordinary file opening cannot bypass its human testing gate.

If an editor/dialog is in use, ROMDex retains that view and waits. Incoming requests are bounded to 16 distinct local files. Current fields are checkpointed before activating the preview. The original file is read into a bounded immutable snapshot and remains unchanged. A rejected file stays available to dismiss or retry; Later/ESC suspends that request until another native open or explicit review. If the application exits before approval, open the original file again; pending native requests are not an imported save.

## Installation and Default App Choice

The per-user MSI registers `ROMDexDesktop.RDX`, its open command, capabilities, and one `.rdx\OpenWithProgids` value. Windows may ask you to choose ROMDex and make it the default the first time. Existing extension defaults, other Open With entries, and Windows UserChoice are preserved. Once ROMDex is chosen, opening a file works with the app closed or already running. The registered command quotes the executable and `%1` separately; no shell command is constructed from document content.

The installer owns individual registration values and its application files. Upgrades refresh its command/icon paths. Uninstall removes its owned registration without deleting shared `.rdx` keys, other handlers, or the application's Data folder. Windows continues to own the user's default-choice state. Do not add recursive registry cleanup or write UserChoice in a future installer.

The association uses the exact `shared-ui/npcdex-pokeball.svg`, rasterized at a 16-pixel source grid with nearest-neighbor scaling. Windows ICO sizes: 16, 24, 32, 48, 64, 128 and 256. The application and tray use `shared-ui/romdex-pixel.svg`, a stepped Pokédex rendition matching the established palette and edge style. The unmodified former `app.ico`, `app.png` and `public/icon.svg` are preserved in `desktop/icons-original/`.

This is source and isolated installer integration. Current production map adoption remains RD10; no installer should replace live maps from an old fixture or baseline.

Implementation follows [Electron's single-instance API](https://www.electronjs.org/docs/latest/api/app#event-second-instance) and [Windows application registration](https://learn.microsoft.com/en-us/windows/win32/shell/app-registration), including [Open With registration](https://learn.microsoft.com/en-us/windows/win32/shell/how-to-include-an-application-on-the-open-with-dialog-box).

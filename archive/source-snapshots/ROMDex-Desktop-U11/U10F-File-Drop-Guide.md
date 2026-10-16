# ROMDex Desktop Preview — File Attachments by Drop

Drag files from File Explorer or the desktop onto a task row in the ROMDex Work Pane. The highlighted row and blue message identify the one destination ticket. Dropping does not check a box, change parents/order or open Details. Checkbox selections do not change which ticket receives the files.

Up to **10 files** per drop, **50 MB each**. Drop regular disk files; folders, links/text and generated browser-only File objects are rejected. If a source file changes or disappears before it is kept locally, drop it again. A batch that fails preflight adds no attachments.

After acceptance, the existing paperclip/file list shows pending attachments. With Auto-Sync Off, files remain queued until Save Changes or resumed automatic sync. A network failure retains their local bytes. Existing Cancel Upload, image preview, download and conflict/retry behavior apply. After local acceptance, the original source file need not stay in place.

The isolated preload resolves disk-backed files without returning their paths to web content. Main/service validate the ticket and file batch and reuse the existing native queue; there is no second uploader. Paths are not placed in ticket fields or outgoing attachment metadata.

## Current Data and Preview Boundary

**The user confirms the live web save is correct. The desktop baseline differs.** Continue using the **0.4.3 web release for the live project** until U12 previews and migrates the latest web save, queued work/files and remembered connection. This build does not adopt, replace or reset those saves. The existing desktop preview profile is also preserved.

Open **ROMDex.exe** in this preview folder. Normal preview data remains outside the program folder at **%LOCALAPPDATA%/ROMDexDesktopData/preview-u10**. The separate U10F verification launcher uses a fixture-only profile and enables loopback debugging for QA; normal launches do not.

Closing the window still exits the preview; tray lifecycle and command placement remain U11/UX01. NPCDex cloud persistence remains U14–U19. Native attachment buttons and internal hierarchy/bulk dragging remain available.

Technical reference: [Electron disk-backed File handling](https://www.electronjs.org/docs/latest/api/web-utils).

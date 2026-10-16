# ROMDex Desktop Preview — U10

This private Windows x64 development preview includes Electron 44.7.2 and its own Chromium/Node runtime. Open **ROMDex.exe**; Chrome and a command window are not required. Installation and Start Menu shortcuts remain U13A.

## Current Boundary

This is an independent preview, not the ownership handoff from your current browser workspace. Continue using ROMDex 0.4.3 for your working project until the U12 migration. The preview's initial datasets are packaged baselines; they must never replace your latest browser data automatically. The existing browser release, saved token and original NPCDex Downloads folder are preserved.

Normal preview data is separate from program files, under **%LOCALAPPDATA%/ROMDexDesktopData/preview-u10**. The native task queue, file bytes and NPCDex accepted-edit recovery are stored by the application service. Preview settings survive reopening. NPCDex manual export initially uses the profile's **exports** folder; Data can select another destination using a native folder dialog.

Both workspaces remain loaded when switching. The native engine runs in a utility process with its own clock, rather than using foreground renderer timers. Sandboxed views have no Node integration or arbitrary filesystem/IPC access. Only trusted packaged code loads in the window; approved YouTrack links open externally. The desktop service does not listen on a localhost HTTP port.

**Closing the window exits this U10 preview.** Close-to-tray, explicit Quit placement, instance/profile locking and supervised crash recovery remain U11. Explorer/desktop file drops remain U10F; native attachment selection already uses the existing durable upload queue.

Shared Save still processes both providers independently, and a manual Save while Auto-Sync is Off leaves it Off. NPCDex remains local-only; cloud persistence is U14–U19. Unapplied modal forms are retained while switching; finish or cancel them before closing the preview.

## Verification Launch

The separate **Launch-U10-Verification.cmd** supplied outside the program folder opens a fixture-only verification profile, with no token or production YouTrack access. Its temporary debugging endpoint is restricted to loopback for this QA session. It is not the normal application shortcut. Close that verification window after acceptance; ordinary ROMDex.exe launches do not enable debugging or fixture mode.

## Runtime and Delivery

The exact Electron runtime version, official download/checksum locations and SHA-256 are recorded in **desktop/runtime-lock.json**. Electron's LICENSE and LICENSES.chromium.html are bundled. The preview is private and unsigned; installer/update work remains separately approved.

Technical references: [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model), [utility processes](https://www.electronjs.org/docs/latest/api/utility-process), [custom protocols](https://www.electronjs.org/docs/latest/api/protocol), [security guidance](https://www.electronjs.org/docs/latest/tutorial/security).

# U10 — Desktop Host and Bridge Contract

October 15, 2026. U10 implements the approved Electron direction. Graphical acceptance is recorded separately from headless/browser evidence.

| Component | Responsibility |
| --- | --- |
| Electron main | Native window, secure custom protocol, caller validation, native dialogs, controlled export destinations and external-link policy. |
| Sandboxed shell and retained views | Existing HTML/CSS/JS, workspace context, explicit editor acceptance, provider presentation and manual-export coordination. No renderer Node integration. |
| Utility service | Single native WorkspaceEngine/clock, durable task state and queued files, existing YouTrack adapter and operation journal, named NPCDex/coordinator stores. |
| Browser adapter | Retained for the working 0.4.3 release, browser regressions and recovery. It is not a second owner inside the desktop app. |

## Loading and Privileges

The desktop origin is **romdex-app://shell/**. The secure standard scheme supports relative imports, storage and fetch. It serves packaged public files after path/origin validation; the desktop does not start the browser HTTP listener. Only explicit read routes are served under /api. Mutations use an enumerated domain command bridge, not raw HTTP, evaluated functions or arbitrary transactions.

The sandbox preload exposes capabilities only to the top-level shell. Main validates the sending WebContents, root frame, origin and root path on every invocation. Commands, storage keys, preferences, payload limits and native attachment counts are checked before dispatch. The trusted first-party child documents use the shell's narrow facade. They share an origin deliberately; this is not an isolation contract for untrusted add-ons.

U02 identified WebContentsView as a preferred container. U10 retains U08's same-origin documents inside the sandboxed BrowserWindow to preserve their tested direct view/state interfaces and editing context. Native capabilities remain scoped at the shell bridge, and remote pages are never loaded as tool views. Future untrusted/downloadable add-ons would require a different origin/bridge model and are out of scope.

CSP keeps scripts self-only, disallows objects and limits frames to self. NPCDex retains credential-free HTTP/HTTPS image fetching; fetched image bytes do not gain native access. New windows/navigation are denied, with only approved HTTPS YouTrack links handed to the system browser. Permissions and webview attachment are denied. Debugging and fixtures are enabled only by the separate QA launch, not ordinary ROMDex.exe launches.

## Durable State and Files

The development profile is **%LOCALAPPDATA%/ROMDexDesktopData/preview-u10**, outside the program. QA uses a separate workspace directory. No legacy browser IndexedDB, token or profile adoption is performed; U12 remains the handoff gate.

Accepted task edits are persisted in the utility before their RPC resolves. Queued attachment bytes are stored with their checksum independently of the operation queue. A native file dialog grants selected file paths only to privileged code; renderers receive operations/metadata. Existing 10-file/50-MB-per-file validation and native attachment journaling remain in use. Content viewing follows the existing bounded attachment path, not unrestricted file reads.

NPCDex committed snapshots and recovery/held records use named durable stores in the service. Manual export writes only the fixed NPCDex JSON filename within the selected destination, using a serialized flushed temporary-file replacement. The default export destination is inside the preview profile. Neither JSON stores nor file paths contain connection tokens. The existing Windows protected-connection adapter remains privileged; compatible live credential migration remains U12.

## Remaining Gates

U10's basic close checkpoints accepted work and exits; it does not provide the approved final tray lifecycle. U11 still covers close-to-tray, explicit Quit, single-instance/profile ownership, bounded utility recovery and shutdown/resume behavior. U10F adds Explorer drops. U12 captures the latest working browser saves and queues before migration. U13A/U13B provide the installer and approved updater. NPCDex cloud sync remains U14–U19.

The GUI-facing provider coordinator still invokes user-driven NPCDex export in the renderer; it persists result metadata through the service. The native task clock and queue do not depend on renderer visibility/timers. NPCDex automatic remote delivery does not exist yet and is reported as unavailable.

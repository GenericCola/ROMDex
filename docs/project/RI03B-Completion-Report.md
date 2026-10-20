# RI03B — Offline MAPDex Workspace

Status: **Complete in source — October 20, 2026.** Authorized by its own PASSKEY. The user named the workspace **MAPDex** during implementation.

MAPDex now appears in the shared header/workspace chooser and Windows tray menu. It reads a ROM, lists its catalog, prepares a selected map in a separate local RDX store, previews source content/images/conditions, permits display cleanup and exports one portable map. Source identities come from the managed RDX's embedded source index; a matching portable map on another instance can supply the lineage without a user-managed sidecar.

The three trays follow the approved design. Preparation, current editor text, selection and pane state survive local checkpoints/workspace changes. Map-specific stage labels/order preserve source conditions and use Roman numerals. The contextual preview includes Other / Unassigned Conditions. Changed area membership requires re-preparation; excluded areas do not silently return to the staged hierarchy or delete existing NPCDex content. Newer cleanup edits, exact source bytes, notes/plans and testing obligations remain preserved.

Send to NPCDex is an explicit inline review, with fresh-baseline checks and readable conflict alternatives. It saves locally and records recoverable publication intent; it does not dispatch agent work. The existing cloud owner performs later private binding/preflight inside its cancellable cycle. Auto-Sync and the explicit NPCDex pause remain authoritative. Local success is reported separately from confirmed cloud delivery. Failed local saves reach the shared status; user retry preserves the pending text. Unknown staging versions remain untouched and do not prevent healthy task work or safe Quit.

The worker has source/time/memory bounds, cancellation, free-scratch checks and retained previous preparations. Only recorded extraction scratch is disposable through the cleanup action. Cached display summaries/source-lineage metadata use immutable journal heads; export, editing and handoff still verify current working bytes. Unrelated maps' image containers are not repeatedly decoded for lineage discovery.

## Verification

- **106 distinct focused tests passed:** 88 previously existing affected checks, 17 MAPDex/identity/staging/recovery checks and one added native-boundary policy check. The affected suite initially passed 98; later changed boundaries received their targeted rechecks rather than repeating the whole application suite.
- The supplied ROM alone produced the real catalog and full Violet City preparation. Re-preparation retained local display cleanup. The real check exposed sibling areas being re-added and a missing causal membership revision; both were corrected. Final area filtering/merge was replayed against that completed extraction, proving seven-area selection, eight-area restoration, one logical map, unchanged original bytes, stable identities and paused local handoff without redundant ROM decoding.
- The final real proof exported a 3,260,471-byte RDX with its accumulated preparation/correction history. The file contains one logical Violet City map, not a region/multi-map bundle. It remains local and excluded from Git.
- Eleven distinct source-UI behaviors were checked against the real desktop service in an isolated Chromium host: MAPDex selection, source images/cleanup/Roman stages, workspace/pane preservation, portable export, inline paused handoff, optional NPCDex navigation, short-window fit, contextual condition filtering, local-save error/retry, stale-preview protection during rapid item selection and shared checkpoint. No browser runtime errors remained. A check intentionally reached the existing still-opening-frame guard; the final checkpoint succeeded after readiness, most recently in 95 ms.
- The curated payload includes the ROM worker and format tables and excludes Data/credentials/ROMs. The bundled Electron 44.7.2 / Node 24.21.0 runtime loaded the packaged workspace and started its worker. This is a source-payload/module smoke check, not Windows installer or native-file-dialog acceptance.

## Limits and next task

Extraction support remains the reviewed supplied ROM and Violet City. Other catalog groups are visible but marked unverified. Neutral names, possible static branches, unresolved runtime text, palette alternatives and uncertain scene chronology remain explicit. There is no ROM modification, emulator/in-game verification, batch extraction or automatic production reset.

The installed release, production saves/queue, remembered credentials and NPCDex pause were not changed. The feature ships through later integrated acceptance and release gates. No YouTrack records or production cloud branches were written during RI03B.

**Next: RI03P — Map Cloud-Delivery Performance, Sol / High**, with a separate PASSKEY; then RI03C and U28–U30. [MAPDex guide](../../apps/romdex/rom/MAPDEX.md), [approved design](RI03A-ROM-Import-Workspace-Design.md), [overall checklist](NPCDex-ROMDex-Action-Checklist.md).

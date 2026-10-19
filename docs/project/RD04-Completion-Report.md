# Managed Documents and Portable Export Completed

**October 18, 2026. Status: source implementation complete and verified.** RD04 was authorized by PASSKEY. Installed ROMDex remains **0.5.14**. Existing maps have **not** been replaced with RDX files, and live saves, queues, remembered connections and YouTrack records are unchanged.

## Delivered

- A reusable disconnected document store and developer CLI, isolated under the explicitly selected application **Data/RDX** folder. Working files use stable dataset/document identities; the imported original is never modified.
- FULL SQLite transactions for complete document versions, exact deduplicated assets and before/after checkpoint intents. A separate SQLite ownership lock prevents concurrent writers and is released by the OS on process exit.
- Verified/fsynced sibling staging files, retained prior checkpoints, atomic working-file replacement and matching journal acknowledgement. Restart resumes the durable newer head; it does not silently restore stale content or report an unfinished file as saved.
- Local view/edit/save/reopen/export without a connection. Saves preserve prior document history, original assets, pending proposals/notes and optional namespaced data. Ordinary local edits record user provenance; agent-result evidence and required human testing remain intact.
- Self-contained export into a new file, followed by exact readback. Exports serialize against saves and refuse stale checkpoints, managed paths, original/existing destinations and raced outputs. A clean unconnected store can import the export and retain every document/asset byte.

The [managed-document guide](ROMDex/rdx/MANAGED-DOCUMENTS.md) documents the Data layout, API, CLI, storage bounds and recovery behavior. [Two portable examples](RD04-Examples/README.md) demonstrate actual edited/reopened/exported map and plan files. [Verification evidence](RD04-Verification.json) records the checks and source hashes.

## Verification

Passed **107 focused checks**: 31 managed-document tests, 48 existing RDX tests and 28 existing native-content/catalog checks. The 31 managed-document tests also pass under the existing bundled Electron runtime in Node mode. Five new JavaScript files pass syntax checks. No browser, new application window, installer or user-assisted restart was needed.

Eight real disposable child processes exit at controlled save points, from the committed journal through staging, previous-copy retention, replacement and final acknowledgement. Reopening recovers the newer draft and exact assets in every case. Other tests cover failed/rolled-back journaling, disk-full staging, partial staging/prior-copy recovery, missing/known-old working files, external edits, corrupt cache/assets, quota rejection, ownership, stale edits, no-op idempotency, portable export interruption/races and human-testing protection.

A final source review corrected ordinary local-edit provenance. Seven affected offline/no-op/agent/CLI checks were then rechecked on both Node and bundled Electron, rather than repeating the entire suite. The first export experiment encountered sandbox hard-link restrictions; export now uses exclusive creation, fsync and exact readback with its verified stage retained until success. No permission was weakened or new launcher requested.

The separate synthetic acceptance run saved, closed, reopened and exported both a map and a plan, imported each into a clean unconnected store, compared the complete documents and every asset byte, and produced byte-identical repeated exports. Original inputs remained unchanged. The examples contain fictional data only; no production data, SQLite saves or credentials are committed.

## Boundaries and Limitations

This is the managed-file foundation and developer tooling. The installed NPCDex interface still has no modern RDX import/export controls, and no existing map has been converted. RD05/RD06 integrate import previews, RD07 proves real bidirectional YouTrack binding, RD08 adds Windows association, and RD10 adopts current maps only after the live proof and accepted fresh preview. No live backend synchronization or authenticated result acceptance is claimed here.

Unknown external working-file changes remain reviewable with both versions retained. Recovery attempts once per document/open or explicit request; it does not blindly overwrite unknown files or loop uploads. The 2 GiB default local-store quota retains versions/previous files and recovery evidence; it never silently discards history to fit. Reviewed retention/compaction is future work. An interrupted portable export may leave a partial new destination and verified stage, but cannot report successful completion. Process-crash/injected-I/O checks do not certify physical power-cut or destructive disk-failure behavior.

**RD04 is checked off. Next: RD05 — NPCDex Map Import and Update Preview, Sol / High**, requiring a new PASSKEY. Current production maps remain in their existing native storage until RD10.

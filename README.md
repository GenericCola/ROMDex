# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published private release: [ROMDex 0.5.14](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.14). Installed and verified with the native NPCD transition committed, its queue empty, current content and all saved connections preserved. [U20I completion report](docs/project/U20I-Completion-Report.md). The RDX roadmap now precedes U21: RD01 is approved; RD02–RD06 are source-complete without changing installed production maps. Next: **RD07 — Document Bindings and Bidirectional Cloud Sync, Sol / High**, after a new PASSKEY. [RD06 report](docs/project/RD06-Completion-Report.md).

- **apps/romdex/** — current application source, desktop host, web UI and tests.
- **packages/tool-suite-ui/** — reusable suite assets, including the Standard Settings Icon.
- **docs/project/** — action plans, decisions, deferred features, completion reports and verification evidence. Historical reports retain their original filenames and may refer to local delivery artifacts.
- **archive/source-snapshots/** — earlier source/patch checkpoints and pre-change backups; partial Before snapshots are historical references.
- **archive/npcdex-reference/** — preserved NPCDex development reference.
- **archive/selector-tiles-2026-10-13/** — preserved earlier tile design/data for possible future reuse.
- **archive/generated-build-sources/** — checksum-indexed, deduplicated source from superseded generated packages; used to recover disk space without losing unique development source.
- **tools/** — preserved development, migration, verification and delivery scripts; review their original task-relative paths before reuse.
- **GitHub Releases** — private Windows installers and signed release metadata; binaries do not belong in Git history.

Current live saves, queued work, remembered credentials, private signing keys, dependency caches and bundled runtime binaries are excluded. Source snapshots may contain the original packaged project baseline; they must never replace newer application Data. Protected local save backups remain outside this repository.

For current scope and deferred work, see [the action checklist](docs/project/NPCDex-ROMDex-Action-Checklist.md), [the unified plan](docs/project/NPCDex-ROMDex-Unified-App-Action-Plan.md), and [deferred application commands](docs/project/Deferred-Application-Commands.md).

Run application tests from apps/romdex with Node 24: `node --test tests/*.test.mjs`. Electron and installer versions are pinned in the application/runtime manifests; no Actions workflow or billing feature is enabled by this repository setup.

## U20I Completed

Native content assembly, reviewed map imports and agent extraction/format instructions are delivered. The original export is retained for recovery/history; normal frontend construction uses structured NPCD records and referenced assets. Human acceptance, backup/restoration, installed preservation, exact native parity and fresh remote readback passed. U21 has not started.

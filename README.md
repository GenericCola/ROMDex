# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published and installed private release: [ROMDex 0.5.15](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), with separate managed RDX map files and all saved connections preserved. [RD10 acceptance](docs/project/RD10-Completion-Report.md).

**U21–U27 and RI02A–RI02C are complete in source.** The ROM-only Violet City compiler produced a real one-map RDX and passed local editing, reviewed native YouTrack changes, portable recovery and owned QA cleanup. [RI02C report](docs/project/RI02C-Completion-Report.md), [compiler guide](apps/romdex/rom/COMPILING-RDX.md). ROM import is core work before U28–U30; **RI03A — Sol / High** is next under a separate PASSKEY. Installed production remains 0.5.15 plus U26B repairs, with NPCDex cloud sync paused, local saving enabled and all 133 queued entries preserved.

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

## Current Work

RI02C acceptance is complete in source. RI03A reviews the ROM Import workspace; RI03B implements the approved design; RI03C proves broader/new-build coverage. U28–U30 cover integrated acceptance and the next packaged release. The isolated proof does not authorize replacing production data or resuming its queue.

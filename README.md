# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published and installed private release: [ROMDex 0.5.15](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), with separate managed RDX map files and all saved connections preserved. [RD10 acceptance](docs/project/RD10-Completion-Report.md).

**U21–U22 are complete in source**, with fixed JSON Map Package previews, familiar CHANGE/REMOVE/FINAL selection, context-only packages and explicit existing/new PMON task attachment. 197 targeted tests, native UI/quit checks and real private synthetic-task delivery passed. [U21 report](docs/project/U21-Completion-Report.md), [package guide](apps/romdex/rdx/MAP-PACKAGES.md). U22 adds exact task/map/package/target links and item/group delivery progress; [report](docs/project/U22-Completion-Report.md). Installed 0.5.15 awaits a later packaged release for these features. **Next: U23 — Sol / High**, under a new PASSKEY. Returned-RDX automation remains U23–U27; ROM extraction is a post-release stretch goal.

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

U20I and RD01–RD10 are complete. U21 source is verified without changing the current installed app, production saves or existing user tasks. Task-bound returned files, reconciliation and human-testing gates remain separately authorized later work.

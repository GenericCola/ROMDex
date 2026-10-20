# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published and installed private release: [ROMDex 0.5.15](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), with separate managed RDX map files and all saved connections preserved. [RD10 acceptance](docs/project/RD10-Completion-Report.md).

**U21–U26A are complete in source** and await a later packaged release. U26B's targeted responsiveness, saving and warning-free shutdown repairs are installed in the existing 0.5.15 application. **U26C is complete:** a clean one-map RDX imported, accepted local and reviewed native YouTrack changes, exported and recovered into empty profiles without duplicate records. Temporary QA records were removed. Production NPCDex cloud sync remains explicitly paused, local saving enabled and all 133 queued entries preserved. [U26C report](docs/project/U26C-Completion-Report.md), [fictional examples](docs/project/U26C-Examples/README.md). **Next: U27 — Sol / High**, under a new PASSKEY. ROM extraction remains a post-release stretch goal.

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

U26C acceptance is complete. U27 adds verification-gated task completion; U28–U30 cover final integrated acceptance and the next packaged release. A production dataset replacement is not authorized by the isolated proof and requires a current preview and acceptance.

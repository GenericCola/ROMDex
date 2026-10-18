# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published private release: [ROMDex 0.5.12](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.12). It is installed with current saves and remembered connections preserved. U20I is authorized and in progress: the user accepted the native transition and normal Quit/reopen passed; queued delivery and final readback remain pending. The 0.5.13 correction passes 87 focused tests, 182 syntax checks, 17 packaged-runtime checks and fresh live-history verification; private publication and installation are next. See the [sync recovery report](docs/project/U20I-Sync-Recovery-Report.md). U21 depends on U20I completion and a new PASSKEY.

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

## U20I Development Checkpoint

Native content assembly and reviewed map imports are installed in 0.5.12. Human transition acceptance and normal Quit/reopen passed. The 0.5.13 source adds bounded readback time and retryable connection handling; it has not yet been published or installed. See [U20I Checklist](docs/project/U20I-Native-Content-Tree-Plan.md) and [Compatibility Review](docs/project/U20I-Native-Content-Compatibility-Report.md). Do not treat this checkpoint as completed cloud delivery or permission to begin U21.

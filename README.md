# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published private release: [ROMDex 0.5.11](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.11). Installed and verified with the original NPCDex feedback interface restored over the versioned database, current saves and remembered connections preserved. See the [U20H completion report](docs/project/U20H-Completion-Report.md). Next: [U20I — Complete the Native Content Tree](docs/project/U20I-Native-Content-Tree-Plan.md), Sol / High, awaiting a new PASSKEY. U21 depends on U20I acceptance.

- **apps/romdex/** — current application source, desktop host, web UI and tests.
- **packages/tool-suite-ui/** — reusable suite assets, including the Standard Settings Icon.
- **docs/project/** — action plans, decisions, deferred features, completion reports and verification evidence. Historical reports retain their original filenames and may refer to local delivery artifacts.
- **archive/source-snapshots/** — earlier source/patch checkpoints and pre-change backups; partial Before snapshots are historical references.
- **archive/npcdex-reference/** — preserved NPCDex development reference.
- **archive/selector-tiles-2026-10-13/** — preserved earlier tile design/data for possible future reuse.
- **tools/** — preserved development, migration, verification and delivery scripts; review their original task-relative paths before reuse.
- **GitHub Releases** — private Windows installers and signed release metadata; binaries do not belong in Git history.

Current live saves, queued work, remembered credentials, private signing keys, dependency caches and bundled runtime binaries are excluded. Source snapshots may contain the original packaged project baseline; they must never replace newer application Data. Protected local save backups remain outside this repository.

For current scope and deferred work, see [the action checklist](docs/project/NPCDex-ROMDex-Action-Checklist.md), [the unified plan](docs/project/NPCDex-ROMDex-Unified-App-Action-Plan.md), and [deferred application commands](docs/project/Deferred-Application-Commands.md).

Run application tests from apps/romdex with Node 24: `node --test tests/*.test.mjs`. Electron and installer versions are pinned in the application/runtime manifests; no Actions workflow or billing feature is enabled by this repository setup.

## U20I Development Checkpoint

Native content assembly and reviewed map imports are implemented in the 0.5.12 candidate. Live transition acceptance and installed release checks remain pending; 0.5.11 remains installed. See [U20I Checklist](docs/project/U20I-Native-Content-Tree-Plan.md) and [Compatibility Review](docs/project/U20I-Native-Content-Compatibility-Report.md). Do not treat this checkpoint as a completed migration or permission to begin U21.

# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published and installed private release: [ROMDex 0.5.15](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), with separate managed RDX map files and all saved connections preserved. [RD10 acceptance](docs/project/RD10-Completion-Report.md).

**U21–U27 and RI02A–RI03P are complete in source.** [MAPDex](apps/romdex/rom/MAPDEX.md) provides offline ROM preparation and an explicit reviewed NPCDex handoff. [RI03P cloud delivery](docs/project/RI03P-Completion-Report.md) reduces the same real Violet City map's object attachments/payload by about 65%, with measured cold/delta/unchanged/native/recovery checks and private QA cleanup. **Next: RI03C — Coverage and Integrated Feature Acceptance, Sol / High**, requiring a new PASSKEY; then U28–U30. Installed production remains 0.5.15 plus its existing repairs, with NPCDex cloud sync paused and local saving enabled. This source task did not alter its Data, queue or credentials.

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

RI03A design is approved; RI03B/MAPDex and RI03P cloud performance are source-complete. RI03C owns broader/build/identity feature acceptance before U28–U30 integrated review and the next packaged release. Cloud commit v2 requires upgraded readers; frozen v1 intents remain compatible. Source test helpers require separately retained local ROM-derived artifacts and isolated profiles, which are excluded from Git. No production reset or sync resumption is authorized.

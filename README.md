# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published and installed private release: [ROMDex 0.5.15](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), with separate managed RDX map files and all saved connections preserved. [RD10 acceptance](docs/project/RD10-Completion-Report.md).

**U21–U27 and RI02A–RI03B are complete in source.** The [MAPDex workspace](apps/romdex/rom/MAPDEX.md) prepares a ROM-derived map locally, retains source identities and exact evidence, supports presentation cleanup/Roman stages and exports a portable RDX or explicitly hands it to NPCDex. [RI03B report](docs/project/RI03B-Completion-Report.md). Extraction is currently verified for the supplied build and Violet City; other catalog groups are marked unverified. **Next: RI03P — Map Cloud-Delivery Performance, Sol / High**, under a new PASSKEY; then RI03C and U28–U30. Installed production remains 0.5.15 plus its existing repairs, with NPCDex cloud sync paused and local saving enabled. This source task did not alter its Data or queue.

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

RI03A design is user-approved and RI03B/MAPDex is complete in source. RI03P addresses cloud-delivery performance before RI03C broader/build/identity acceptance. U28–U30 cover integrated acceptance and the next packaged release. Source test helpers may require separately retained local ROM/RDX artifacts; those game files and test profiles are excluded from Git. Use desktop/package-source.mjs for future payloads so the ROM worker and pinned format tables are included.

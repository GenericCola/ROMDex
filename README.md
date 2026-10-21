# ROMDex

Private development home for ROMDex and its NPCDex add-on.

Latest published private release: [ROMDex 0.5.15](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.15), with separate managed RDX map files. Current installed evaluation build: **0.5.23**, with source-derived entity names, sub-area grouping and front-standing sprite defaults; saved connections are preserved. [Evaluation delivery](docs/project/RI03U-Completion-Report.md). [RD10 acceptance](docs/project/RD10-Completion-Report.md).

**U21–U27 and RI02A–RI03P are complete in source.** [MAPDex](apps/romdex/rom/MAPDEX.md) provides offline ROM preparation and an explicit reviewed NPCDex handoff. [RI03P cloud delivery](docs/project/RI03P-Completion-Report.md) reduces the same real Violet City map's object attachments/payload by about 65%, with measured cold/delta/unchanged/native/recovery checks and private QA cleanup. **Next: RI03C — Coverage and Integrated Feature Acceptance, Sol / High**, requiring a new PASSKEY; then U28–U30. Installed evaluation 0.5.22 adds saved entity presentation and front-facing source previews; independent-map migration, NPCD tier labels, other ROM layouts and broader RI03C acceptance remain open. RI03U cross-ROM update implementation is delivered; actual two-build acceptance remains deferred. The subsequent user-authorized clean NPCDex reset archived the old dataset/queue, cleared its 224 NPCD records, preserved task/metadata stores and credentials, and re-established NPCDex sync for fresh RDX imports. [Reset report](docs/project/NPCDex-Clean-RDX-Test-Preparation.md).

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

RI03A design is approved; RI03B/MAPDex and RI03P cloud performance are source-complete. RI03C owns broader/build/identity feature acceptance before U28–U30 integrated review and the next packaged release. Cloud commit v2 requires upgraded readers; frozen v1 intents remain compatible. Source test helpers require separately retained local ROM-derived artifacts and isolated profiles, which are excluded from Git. The separate October 20 user-requested NPCDex reset/reconnection is complete; future imported test data must not be cleared implicitly. User acceptance proceeds from RDX import/local edits through NPCD mapping and accepted incoming updates, then MAPDex extraction after packaged acceptance.


0.5.23 delivers reviewed updates across linked ROM builds: a stable existing map, side-by-side entity/passage matching, retained planning and mandatory human testing. The backend proof preserved issue IDs and nested parent links, recovered exact data in another profile, and removed all marked test records. Verification uses actual 0.6.3 extraction and explicitly controlled cross-build cases; another real build is unavailable. The repeated Connection Details popup is also corrected. [Operator guide](apps/romdex/rom/UPDATING-MAPS.md) · [Completion/evidence](docs/project/RI03U-Completion-Report.md).


0.5.25 is installed and verified: immediate sprite preview with explicit apply, reviewed shared-character tiles, readable regions and source-linked scene context. Cold saved-data startup and normal quit/restart passed after deferring presentation checkpoints until MAPDex loads. Full narrative-phase extraction remains open. [Completion and limits](docs/project/MAPDex-0.5.25-Completion-Report.md).


0.5.26 delivers consistent checkbox/text gaps and form-action padding across MAPDex, task dialogs, NPCDex native dialogs and Updates, preserving header geometry and current Data/connections. The owner will evaluate MAPDex before scoping a broader overhaul. [Completion and evidence](docs/project/UI-Spacing-0.5.26-Completion-Report.md).

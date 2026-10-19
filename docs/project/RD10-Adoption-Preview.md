# RD10 — Existing Map Adoption Preview

> **Superseded packaging:** The user clarified that an RDX must not contain other maps, including hidden recovery exports or unrelated assets. The whole-catalog packaging described below will not be activated. A revised, strictly map-scoped preview is being verified. Original complete backups remain separate. The earlier approval remains historical evidence, not acceptance of a changed file representation.

**Status:** Prepared October 19, 2026; awaiting acceptance of this preview. RD10 is **not complete**. Installed ROMDex remains **0.5.14** and its working storage is unchanged.

The [approved action plan](NPCDex-ROMDex-Unified-App-Action-Plan.md) requires acceptance of a fresh preview before switching existing maps to managed `.rdx` documents. This preview uses current native NPCD content, not an archived save or a fictional example.

## Current Data

The read-only check completed at **11:10 UTC on October 19**. The local working head and freshly verified NPCD head match:

`fbb5dcdf7ecd8e420222cc13bf6d25ce7ffbf8e6dca3a427d53afa3b273009b8`

- **211** content records, with **211** existing YouTrack issue bindings.
- **3** maps, **198** presentation revisions, **94** plan revisions and **85** review revisions. Revision counts include history; they are not counts of distinct pending changes.
- **40** exact assets, totaling **10,456,321 bytes**, including retained recovery material.
- **0** pending synchronization operations and **0** unresolved reviews.
- No live save writes, remote writes or credential changes were made by these checks.

## Proposed Working Maps

| Map | Existing YouTrack Issue ID | Map-Owned Records | Shared Context Records | Compressed File Size |
| --- | --- | ---: | ---: | ---: |
| New Bark Town | `3-429` | 62 | 58 | 6,096,599 bytes |
| Route 29 | `3-491` | 22 | 58 | 6,058,855 bytes |
| Cherrygrove City | `3-513` | 69 | 58 | 6,121,337 bytes |

Each file has a stable document identity derived from the existing workspace and map identities. Map, sub-zone, character/profile, entity, point, block, prompt and view identities remain intact. The files retain current content separately from proposed changes and human testing data.

Global Dialogue, Item Gifts, Hidden Item Messages, Photographer Dialogue, Shared Routines, Narrative Progression and the shared character directory remain shared context. They are not turned into additional physical maps or discarded. The original save/migration evidence remains recovery material.

This first preservation-focused packaging retains the complete original asset inventory and recovery export in each portable map. Files are self-contained and losslessly compressed; image bytes are not re-encoded. The managed store can share identical binary objects between map documents. These copies may therefore include recovery data from other maps; they are not privacy-filtered, map-only handoff packages. The later JSON Map Package workflow selects the agent's required context explicitly.

## Preservation Checks Already Passed

- Actual candidate files were packed, read back and checked against their JSON and asset hashes.
- All three real candidate files were imported into an isolated managed store, closed and reopened. Every working-file hash remained exact, and the reopened catalog reproduced the same 211 records and domain hash. This is a candidate-store proof, not a complete application Data restoration or an installed-upgrade test.
- Joining their content reproduces **every original domain collection exactly**, including ordering, records, seals, plans, reviews, mappings, views and asset metadata.
- The combined **male and female NPCDex views match the current source views exactly**.
- Four focused automated tests cover multiple-map splitting, original export recovery, exact assets and issue bindings, deterministic identities, newer local notes, mixed/missing source rejection, corrupt assets and independent local import/export.
- Portable copies do not contain credentials or acquire writable YouTrack authority from their embedded binding evidence. Importing testing claims on another instance does not authenticate them as that user's verification.

Candidate files and the consistent SQLite capture are in the protected task area. They have **not** been placed into live application Data or uploaded to GitHub/YouTrack.

## Remaining RD10 Work After Acceptance

1. Complete the existing-catalog adapter so managed map checkpoints preserve the existing NPCD identities and synchronization journal. Do not use the new-map creation route to duplicate existing records.
2. Verify saves, accepted incoming changes, shared-context consistency, restart/recovery and export against isolated copies. Keep the original NPCDex controls and appearance.
3. Prepare the production build and perform focused packaged/installer checks, including the completed RDX file integration and preserved original application icons.
4. At the final installation boundary, ask the user to finish edits and quit ROMDex. Make a fresh **complete Data backup**, verify an isolated restoration and all three remembered credentials, and recheck that the accepted preview is still current. This read-only content capture is **not** a substitute for that backup.
5. Activate the accepted adoption, verify every working map against the current backend, reopen the installed app and mark RD10 complete only after those checks pass. A changed source requires a refreshed preview; do not silently substitute a different baseline.

U21 package attachment and later authenticated agent-return automation remain separate tasks requiring their own PASSKEYs.

## Acceptance

Approve adopting these three existing maps into managed `.rdx` working documents, retaining their shared content, current NPCD identities and exact data as described above. This approval does not waive the complete-backup/restoration, current-baseline or installation checks.

# Existing Data, Working Files and Portable Copies

## Current Production and RD10

At the RD09 checkpoint production is still installed 0.5.14, with accepted native NPCD content. Its existing maps have **not** been replaced by the new managed RDX working documents. RD10 owns that adoption and needs its own PASSKEY plus acceptance of a fresh data preview. This guide/kit does not migrate or upload anything.

RD10 should capture the latest authoritative structured records, local edits/queue, presentation metadata, exact assets, plans, flags/notes, history and testing state. Back up the complete application Data consistently, retain all remembered connections and prove restoration before adopting files. Inventory current maps and separately retained shared/global content. Compare against the current backend, preserving its actual workspace/record/project/issue identities and pending operations.

Create one managed map RDX per existing map with its required shared dependencies; review exact contents and any unresolved differences. Retain the original export as recovery/history evidence. The previous U20 migration and fictional starter are not current baselines. Do not re-extract or rebuild existing NPCD content merely to change its working-file representation, do not create duplicate content tickets through the new-map route, and do not discard Global Dialogue because it is not a physical map.

When an existing map has not yet been adopted, request its fresh native identity/context and accepted adoption output from the owner rather than inventing a replacement RDX identity. After adoption, its exported RDX supplies the continuing portable baseline for the coding agent.

## Export in an RDX-Capable Build

1. Save or resolve current editors and pending/review states. Complete accepted incoming changes so an older checkpoint is not presented as current.
2. Open the intended managed map. Use the existing **Tray 2 Cog → Export Current Map RDX** action. Task plans have **Export Plan RDX** in their plan menu.
3. Choose/save the portable download and run the local `validate`/`inspect` commands if needed. The export contains current saved content, exact assets and retained history; filenames can be descriptive, while internal IDs remain unchanged.
4. Import that copy on another instance through its normal preview. It can be viewed/edited locally before connecting to YouTrack. Later review cloud binding or existing PMON task matches explicitly; imported provenance is not authority to select another connection or overwrite a target.

The continuing working file is app-managed under the selected application's **Data/RDX/working/<document-key>.rdx**. The document key derives from dataset/document identities. Local saves and accepted YouTrack changes checkpoint that working document; the originally imported file and previously exported copies stay unchanged. Export again to obtain newer edits.

The SQLite journal, asset store, prior versions and recovery evidence cooperate with the working file. Never edit that live file in place, copy a live database without its consistent journal, delete WAL/recovery files, or run the local CLI against the app-owned Data while its service owns it. Use the application exporter for transfer and the approved complete-data backup workflow for recovery. The kit's separate scratch stores exercise portability without touching the running app.

## What Travels and What Does Not

- Travels: stable portable identities, exact implemented content, proposed changes, contextual flags/notes, presentation, images/files, mapping/evidence, original history and historical testing claims.
- Stays separately protected: credentials, writable native binding ledgers, machine paths, connection/account authorization and local human-verification authority.
- Requires review: contradictory ancestry, changed shared context, missing baselines/assets, existing-ID collisions, unsupported required features and destination changes.

A genuine independent duplicate needs a deliberately reviewed rewrite of all identities/references; the first workflow supports updating existing documents after preview instead. Do not rename IDs or reset history to force a new copy. A foreign instance cannot turn an imported testing claim into authenticated human approval, and any agent-result file remains marked for human review/testing.

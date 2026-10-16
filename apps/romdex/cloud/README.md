# NPCDex Initial Cloud Import

U15 creates a user-approved initial copy in the pinned private GitHub save repository. It does not activate ongoing edits, incoming synchronization, semantic merging or shared cloud indicators. The installed application's local service remains the primary save owner.

`bootstrap.json` contains the approved public configuration and integrity pin, without a credential. Runtime access comes from the separately protected connection in application Data. The one-time Windows import helper holds the existing profile lease so the desktop cannot edit the source during review and publication.

`npcdex-import.mjs` captures only the current NPCDex save and its two known recovery stores. It rejects unresolved recovery snapshots instead of picking a winner. Verified originals remain in `Data/.../cloud/imports/`. The persisted import session assigns its operation ID and creation time once, permitting retries and restart after uncertain outcomes. Approval applies to one exact record ID; a source or staged-backup change invalidates that approval.

The initial record format is `ROMDexNPCDexImport/1`, with namespace `npcdex`, the pinned workspace and sole approved owner, the original device/operation identity, empty semantic parents, exact-byte document descriptors and a content summary. Its SHA-256 identifies its precise UTF-8 JSON encoding. Existing NPCDex documents, identities, field order, whitespace, request hashes and historical images are retained as raw bytes; none uses this transport encoding for its legacy hashes.

Remote paths under the workspace root:

- `npcdex/genesis.json` names the immutable initial record.
- `npcdex/records/<record-sha256>.json` stores that import descriptor.
- `objects/<hash-prefix>/<chunk-sha256>` stores exact raw chunks up to 512 KiB.

The publisher appends a complete tree to the observed Git head with a non-force reference update. An unrelated competing write is retained. A different existing genesis, unknown NPCDex namespace data, truncated discovery or branch rollback requires review. Retrying the same verified record makes no additional commit. A successful upload alone does not establish an accepted import: downloaded descriptor/chunks must reconstruct the exact originals before the local seed marker is written.

The local `ROMDexNPCDexCloudSeed/1` marker records the accepted record/commit, source hashes, backup location and summary. `automaticCloudSync` remains false and `primarySave` remains `local-service`. U16 must use this verified initial record as the semantic base, retain edits made after import as new work, and never replace a newer local document with this snapshot. U16–U17 add their separately approved queue, discovery, merge and review contracts. U18–U19 add ROMDex metadata and combined cloud controls.

All agent-required handoffs and Integration Receipts remain on YouTrack. The private bulk-save repository is not an agent dependency.

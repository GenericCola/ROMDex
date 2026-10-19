# Managed RDX Documents and Portable Export

RD04 adds the local storage/service API and developer CLI for disconnected map/plan work. It does not change installed ROMDex, convert current maps, or add the NPCDex import/export screens. RD05/RD06 connect import previews; RD07 proves backend binding and two-way updates; RD10 adopts current maps after a fresh accepted preview. Existing native saves remain usable and untouched.

## Location and Ownership

The host supplies the application Data directory explicitly. The store creates only its dedicated `RDX` subfolder:

```text
Data/
  RDX/
    store.json
    ownership.sqlite
    documents.sqlite          # SQLite journal; WAL/SHM may also exist
    working/<identity-key>.rdx
    previous/<identity-key>-<container-hash>.rdx
    recovery/<identity-key>.incomplete-<unique-id>.rdx
```

The identity key hashes the portable dataset/document identities, not the title, source filename or YouTrack issue key. Exported copies can use descriptive names such as `NewBarkMap.rdx`. The original imported file is read-only input and is never updated in place. No credentials or backend connection settings are copied into the store or exported documents.

SQLite stores canonical document versions, exact hash-deduplicated assets and the before/after checkpoint journal. A managed `.rdx` is the complete portable checkpoint. One process owns a Data/RDX folder through an exclusive lock in a separate SQLite database. A crash releases that OS lock automatically; there is no stale PID deletion or timeout-based takeover. All imported identities remain data, never filesystem paths.

## Save and Recovery

1. Validate an initial import, or check an explicit local draft against its expected current revision. A stale edit, identity change or existing-document replacement requires review instead of overwriting.
2. Retain original assets/history and append the exact prior document as typed history. Recompute the outer revision; nested native artifacts must retain valid seals. Asset identity reuse with different bytes is rejected.
3. Commit the complete new document, missing exact assets, before/after references and local-only intent to the FULL SQLite journal. A failed transaction leaves the previous head intact.
4. Write a sibling staging `.rdx` in chunks, verify it, fsync it, retain/verify the prior file, then rename the stage over the working file. Verify the replaced file before marking the matching checkpoint complete in SQLite.
5. On reopening, replay each pending checkpoint once. A valid stage or already-replaced new file is reused. An incomplete stage/prior copy is moved to recovery and rebuilt from exact journal data. Missing files and known older checkpoint renames are restored to the newest journaled head. Unknown external edits/corrupt working files remain a review with both versions preserved.

A durable edit can have `saved:false` and `checkpointPending:true` when its file write fails. View/edit recovery can still read the newer journaled document; export and further saves are blocked until recovery finishes. Never claim an older file is current. Recovery errors affect their own document; unrelated healthy documents remain usable. No-op saves and identical imports do not create another version or upload.

The default store quota is 2 GiB, with bounded file enumeration and no automatic history discard. Exact blobs are shared in SQLite; prior document versions, previous checkpoint files and failed staging evidence remain retained. Long-running use can therefore reach the quota, at which point the store reports it before accepting more work. A reviewed retention/compaction policy is future work; do not manually delete journal, assets, WAL files or recovery evidence to make a save appear successful.

Files are fsynced and SQLite uses FULL synchronization. Windows Node cannot flush directory handles; if a rename is lost, the journal can reconstruct its accepted head. The tested guarantees cover process termination/restart and injected I/O failures, not destructive disk failure or an independently tested physical power cut. Keep existing protected backups and cloud sync.

## Portable Export

Export requires a verified current checkpoint, serializes against saves, and includes its complete document, exact assets, notes/proposals, namespaced values and retained history. A clean unconnected store can import and reopen it. The result remains `unbound-local`; it is never falsely reported cloud-delivered.

A verified sibling export stage is retained until the new output is written exclusively, fsynced and read back. Existing or raced output files are never overwritten. Managed-storage paths are refused as export destinations. This works without hard-link support. An interrupted export can leave a partial **new** output and its verified stage, but never returns success; validate the output before using it and choose a new filename when retrying. The working document and imported original remain unchanged.

Agent-result provenance and its required human-testing marker cannot be removed through local save/export. Imported testing claims do not establish human verification. No command publishes, dispatches agent work, marks tickets Complete, accepts backend authority or clears a human-review requirement.

## Developer API and CLI

`ManagedDocuments.open({dataDirectory})` opens and recovers an explicitly selected Data folder. Close it in `finally`. Methods are `ingest`, `view`, `list`, `save`, `recover`, and `exportFile`. Views return the document/asset map and verified checkpoint status. `save(key, {documentBytes, blobs, expectedRevision})` accepts an explicit local draft; it is not an untrusted-file replacement/import-preview API. Only one mutating operation runs at a time; concurrent operations return Busy rather than silently racing. No network code is imported by this module.

```powershell
node rdx/local-cli.mjs import C:/ROMDex-Test/Data NewBarkMap.rdx
node rdx/local-cli.mjs list C:/ROMDex-Test/Data
node rdx/local-cli.mjs show C:/ROMDex-Test/Data DOCUMENT_KEY
node rdx/local-cli.mjs export C:/ROMDex-Test/Data DOCUMENT_KEY NewBark-Portable.rdx
node rdx/local-cli.mjs recover C:/ROMDex-Test/Data DOCUMENT_KEY
```

For a developer-edited JSON draft, unpack a portable export with the RD03 CLI, edit its document, and supply the key/current revision from `show`:

```powershell
node rdx/local-cli.mjs save C:/ROMDex-Test/Data DOCUMENT_KEY EXPECTED_REVISION document.json blobs
```

Old assets can be recovered from the journal; genuinely new assets must have their declared exact `<sha256>.bin` bytes in the supplied blobs folder. Nested record/plan/view edits require the existing native version/seal rules. The CLI recomputes the outer document revision and preserves its base, not arbitrary nested seals. These commands are foundation/verification tools; normal installed UI operation follows later integration.

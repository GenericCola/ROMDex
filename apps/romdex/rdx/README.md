# RDX Container Tools

RD03 implements the version 1 file container and deterministic local tooling. RD04 adds [managed local documents and portable export](MANAGED-DOCUMENTS.md). RD05 adds [NPCDex map import/update previews and export](MAP-IMPORT.md). RD06 adds [local task-plan import and reviewed PMON publication](PLAN-IMPORT.md). These are source implementations; the installed interface is unchanged. Bidirectional binding and Windows association follow in RD07–RD08. The CLI commands below never upload, change tickets, dispatch work or certify human testing. No AI, connection or token is required for local tooling.

## Commands

Run from the application source folder with Node 22 or newer:

```powershell
node rdx/cli.mjs pack map.document.json blobs NewBarkMap.rdx
node rdx/cli.mjs validate NewBarkMap.rdx
node rdx/cli.mjs inspect NewBarkMap.rdx
node rdx/cli.mjs unpack NewBarkMap.rdx NewBark-Unpacked
node rdx/cli.mjs pack NewBark-Unpacked/document.json NewBark-Unpacked/blobs NewBark-Copy.rdx
node rdx/cli.mjs revision map.document.json
```

`pack` takes an approved-contract map or plan JSON document and a directory of exact `<sha256>.bin` blobs. It validates the supplied revision, references, assets and structure before producing a new file. `revision` prints the computed semantic revision without editing the input; it is not permission to reseal inconsistent nested artifacts. The original input is unchanged. Output files and unpack directories must not already exist. A failed disk write can leave an incomplete new output; validation must succeed before treating it as usable. Atomic managed-document replacement/recovery belongs to RD04.

`unpack` validates the complete file before creating its destination. Its only output names are `document.json` and `blobs/<sha256>.bin`, derived from validated hashes. Imported names, ROM locators and extension values never become extraction paths or executable commands. Packing that directory at the same level produces identical bytes under the same runtime/zlib implementation. Cross-runtime compression bytes can differ; canonical document revisions and decoded asset bytes must agree.

Success reports are JSON. Exit status is 0 for successful commands, 2 for unsupported required formats/features, and 1 for invalid input, bounds or filesystem errors. `inspect` can recognize legacy inputs without claiming to validate them. Recognition is determined by bytes and internal discriminators, never the filename or extension.

## Reusable API

- `packRdx(documentBytes, blobs, options)` returns a Buffer. Blobs are a Map from full SHA-256 to Buffer.
- `unpackRdx(bytes, options)` and `readRdxFile(path, options)` return the parsed document, exact canonical document bytes, decoded blobs, manifest and exact container hash.
- `validateDocument(bytes, {blobs})` checks a canonicalizable unpacked contract and its dependencies. It does not infer backend authority.
- `identifyInput(bytes)` reports a recognition route, explicitly marked unvalidated.
- `dispatchInputFile(path, {legacyMigration, legacyMapJSON, ...options})` dispatches modern RDX to its reader. Legacy inputs require trusted host-provided context-bound handlers. Wire them to the existing `desktop/migration.mjs` reader and `content/catalog.mjs:buildContentImport` preview at their respective application entry points. Imported data cannot supply handlers. No handler means a clear unsupported result, with the source preserved.

Options accept an AbortSignal and limits that may only lower the hard ceilings. Level 9 raw DEFLATE is the default; `level` accepts 0–9 and `compress:false` stores entries. Optional namespaced extensions are retained without interpretation. Unknown namespaces/kinds/schema majors, required capabilities and codecs are unsupported, rather than guessed or stripped. A host can retain/copy the original bytes for unsupported documents; no writable import is claimed.

## Framing and Integrity

The eight-byte magic is ASCII `ROMDXR01`, followed by a four-byte unsigned little-endian manifest length, the uncompressed strict UTF-8 `RDXContainer/1` manifest, then contiguous entry bodies. Offsets are relative to the body area. Exactly one `document` entry holds canonical `RDXDocument/1` JSON; blobs use `blob:<full-sha256>`. Duplicate bytes share one body even when several logical assets refer to them. Empty attachment blobs are supported.

Entries are `store` or `deflate-raw`. No embedded paths, links, dictionaries, recursive compressed containers, unlisted bodies, gaps, overlaps or trailing streams are accepted. Inflation streams through bounded chunks, checks actual decoded length, cancellation and elapsed time, and verifies consumed compressed bytes and decoded hashes. All entries and referenced assets must match; missing content is never silently dropped. The document hash excludes only top-level `revision`, using the pinned native canonicalization. Hashes show integrity, not author authenticity.

The local schema evaluator supports exactly the keywords in the pinned RD01/native resources. It checks every keyword/reference at startup, rejects resource drift and never downloads schemas. It is not a general JSON Schema engine or independently certified metaschema implementation. Native graph and presentation validation remain in use. Full import comparison, task authorization, result reconciliation and human-testing enforcement still belong to their later workflow stages. A valid returned map is explicitly reported as requiring human testing with `authorization: not-established`.

## Bounds and Measurement

| Bound | Hard Ceiling |
| --- | --- |
| Manifest | 1 MiB |
| Stored file | 512 MiB |
| Aggregate decoded entries | 1 GiB |
| Physical entries | 10,000 |
| Document/structured JSON entry | 16 MiB |
| Binary entry | 50 MiB |
| JSON depth / values | 64 / 300,000 per entry |
| Pack or decode work deadline | 30 seconds |
| Planning image | 4,096 pixels per side; 8 Mi pixels total |

The bounded API materializes the validated document and blobs in memory; it is not constant-memory storage for a 1 GiB document. File input, decoded buffers, compression buffers and parsed objects contribute to peak memory. These ceilings are rejection limits, not a promise that every maximum-sized file will fit every machine or finish within the deadline. Native YouTrack chunk/upload/image limits remain separate. Rejected source files are preserved without resizing images, truncating history or relaxing limits.

RD03 surveyed the preserved installed-0.5.14 corpus: 998 immutable objects, 32,218,266 bytes, including current/pending artifacts, history and exact original PNG/JPEG/WebP bytes. Level 9 stored 10,540,985 body bytes (67.28% saving), with approximately 1,064 ms encoding and 331 ms decoding. Level 6 used 10,608,042 bytes and 880 ms encoding; level 1 used 11,327,268 bytes and 644 ms. Level 9 saves more space at a small measured cost. Image bytes are never re-encoded; an expanding WebP/PNG entry falls back to `store`. A separate synthetic GIF fixture verifies lossless GIF handling because the surveyed corpus contains no standalone GIF.

Independent benchmark processes sampled peak RSS around 180 MiB; this is a 2 ms sample, not a guaranteed operating-system peak. Numbers measure body codec cost, excluding framing and full document validation. The largest complete JSON object measured 9,915,298 bytes, 113,224 values and depth 19. One incomplete cached transport chunk was correctly distinguished from a complete JSON entry. All measured complete entries fit the hard limits. A full current-map dependency-closure preview and live two-way `.rdx` proof remain RD05/RD07/RD10; this survey neither converts production maps nor accepts stale data as current.

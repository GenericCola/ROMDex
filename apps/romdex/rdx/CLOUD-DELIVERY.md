# Map Cloud Delivery

RI03P adds compressed delivery packs to the RDX document cloud adapter. This is a transport change: each managed/exported RDX still contains one logical map, and each permanent content record retains its stable identity, private YouTrack ticket and parent links. Opening a ROM or preparing a map does not publish it. The explicit NPCDex service pause still takes precedence over Auto-Sync and manual delivery.

## Layout and integrity

New publication intents use `RDXCloudCommit/2`. Previously accepted objects remain at their original attachment identities. Newly required registry-owned objects are sorted by hash and grouped into immutable `RDXCloudPack/1` deliveries. Native record artifacts retain their existing ticket attachments; they are not moved into a different hierarchy.

Each pack is raw DEFLATE, at most 512 KiB stored and 4 MiB decoded. Its descriptor records the encoded attachment hash/length/identity and observed update metadata, the decoded hash/length, and each object's offset/length/hash. Reconstruction verifies all of these, rejects trailing encoded bytes, then runs the existing complete document/schema/asset validation. Incompressible or oversized objects use the existing bounded chunk route. Empty assets use the existing zero-byte route. Original image, source and history bytes are preserved exactly.

Only new objects are grouped. A later edit reuses immutable prior references and sends its new artifacts/reference tables; it does not repack an old map or resend unchanged source/images. A cycle caches a decoded pack with a bounded cache to avoid repeatedly decompressing it. Verified encoded bytes are retained in the existing local content cache. Fresh attachment listings still check identity, author, size and observed update metadata before cached content is trusted during reconstruction. Missing/changed files block acceptance; caching does not authorize replacing them.

The existing 40-write, three-minute cycle, request/read budgets, commit-last readback, durable slots, uncertain-response review, cancellation, ancestry/conflict handling and native metadata review remain in force. No bound is raised and no history is pruned. Publication exposes record/object progress; queued work remains pending until the final commit and document reconstruction pass. Last successful synchronization is separate from an attempted remote check.

MAPDex shows a loading bar immediately during local handoff, then counted cloud-publication progress with a separate final verified-commit step. A paused cloud service leaves local saving available. Polling updates publication state without rebuilding fields or taking focus away from an editor.

## Fewer metadata requests

Record discovery reuses one paginated dataset search within a cycle. Each cycle starts fresh. Native metadata checks use a fresh paginated dataset listing for each verification pass, validating ownership/visibility and retaining description, parent and comment evidence. Missing/shared records fall back to individual reads; incomplete comment listings are fetched separately. The final pre-commit check is a new snapshot, not the earlier cache.

Validated native snapshots also seed same-cycle issue metadata. Document reconstruction and shared-context attachment checks prefetch at most eight inventories concurrently, with at most 256 inventories prefetched per pass; other required inventories retain the original lazy route. Every result is inspected and errors still block acceptance. This reduces serial round-trip delay while preserving fresh file checks and the existing budgets.

## Compatibility and rollout

Readers accept cloud commit versions 1 and 2. A frozen version-1 intent finishes with its original layout and commit; only a newly created intent opts into version 2. Old immutable attachments/commits remain unchanged. Local/exported `.rdx` container and document formats do not change.

Older cloud clients do not understand version 2 and must be upgraded before sharing a newly published version-2 map. They stop on an unknown commit format rather than interpreting it incorrectly. RI03P is source work; native integrated acceptance and the installed release remain separately gated. The installed application, production saves/queue, credentials and explicit NPCDex sync pause are not changed by this task.

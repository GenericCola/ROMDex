# RDX Documents and JSON Map Package Contracts

**October 18, 2026 — RD01 design approved October 18, 2026.** These contracts define portable map and task-plan documents, readable execution packages and returned map results. They extend the installed native content system without changing its interface. Application implementation, live two-way proof and conversion of existing maps belong to later tasks.

The user acceptance criterion is a test `.rdx` that imports, maps successfully to YouTrack, sends local edits, receives native YouTrack edits and retains both after reopening/exporting. RD07 proves that route using isolated real backend records. RD10 then converts existing maps after a fresh backup and accepted preview. Do not delete/rebuild NPCD or reuse an old migration baseline.

## Documents and Workflow

| Artifact | Internal discriminator | Meaning |
| --- | --- | --- |
| Editable map `.rdx` | `RDXDocument/1`, `org.romdex.npcdex`, `map` | One primary map and its portable dependency closure, feedback, proposals, assets and retained history. |
| Editable plan `.rdx` | `RDXDocument/1`, `org.romdex.tasks`, `plan` | Task hierarchy, fields, comments and attachments, with explicit destination preview. |
| Fixed Map Package `.json` | `NPCDexMapPackage/2` | Selected approved work plus read context, dependency groups, ROM targets, agent instructions and accessible YouTrack assets. |
| Task attachment binding | `RDXTaskBinding/1` | Exact package bytes bound to a verified task and attachment. Stored separately to avoid circular hashes. |
| Returned map `.rdx` | Map document with `origin.role: agent-result` and `RDXAgentResult/1` | Actual implementation evidence and outcomes tied to the exact task/package/base. ROMDex reconciles it. |

An agent extracts actual source data and prepares a map file. NPCDex imports it deterministically and displays current content with staged proposals. The user packages selected changes as JSON and explicitly attaches them to an existing or newly chosen task. Packaging and attachment never dispatch work. After separate human handoff, the agent changes the ROM and attaches an updated map `.rdx` to the same task. ROMDex discovers, validates and reconciles the return, publishes accepted record changes to NPCD, checkpoints the managed file and requires human testing. A separate receipt file is unnecessary.

The new package version is `/2` because `/1` describes the earlier direct-agent-write return route. Preserve historical `/1` bytes; do not silently relabel them or enable their old instructions for new work. U23 reviews the final execution identity and end-to-end agent instructions before return automation is enabled.

## Portable Identity and Revisions

- `documentId` identifies the continuing document; `datasetId` identifies the portable content lineage. Neither is a YouTrack project or machine identity. Preserve existing native workspace/record IDs during adoption. New identities are allocated once, never derived from display titles, filenames, sprites, offsets or issue keys.
- `revision` is SHA-256 of the canonical document excluding only its top-level `revision`. Parent revisions identify ancestry; timestamps never choose a winner. Map revisions and existing artifact digests use the pinned native canonicalization: sorted object keys, exact strings and ordered arrays, safe integer numbers, no duplicate/reserved keys, invalid Unicode or negative zero. This is the project's algorithm, not an assertion of RFC 8785 equivalence.
- `parents` alone is not a complete merge base. Include referenced baseline artifacts and their exact bytes/hashes in the current payload or retained history. If any required base cannot be materialized, show review rather than guessing. Old source bytes and historical hash algorithms remain unchanged.
- Backend bindings are a local, separately protected table keyed by dataset/document/record identity and the verified instance/project/issue identity. Portable files contain no credentials, machine paths or writable backend commands. Task bindings in result evidence are provenance, never authority to change a connection or destination.
- Reimport uses stable IDs and observed base revisions. Identical content is a no-op; independent changes may merge; overlapping/unknown ancestry is reviewed. Same ID with contradictory provenance is a collision, not permission to replace data. Creating a deliberate independent copy requires a reviewed identity rewrite across all references, and is deferred initially.
- A second instance importing the same file retains portable IDs and creates or explicitly matches destination bindings after preview. It must not reuse source instance issue IDs blindly. Native YouTrack edits continue to sync both ways.

## Container Framing and Compression Proposal

RD03 will implement the following proposed version 1 framing. No compressed `.rdx` is produced by RD01; examples are unpacked design fixtures.

| Bytes | Meaning |
| --- | --- |
| 0–7 | ASCII magic `ROMDXR01`. The legacy migration magic is `ROMDEXM1`; route it to its existing dedicated reader. |
| 8–11 | Unsigned 32-bit little-endian manifest byte length. |
| Next manifest length | Strict UTF-8 `RDXContainer/1` JSON manifest, uncompressed. |
| Remaining bytes | Contiguous entry bodies in manifest order; offsets are relative to this body area. |

Each entry declares a logical ID, codec, offset, stored length, decoded length and SHA-256 of decoded bytes. Exactly one `document` entry contains the canonical document JSON. Binary entries use `blob:<sha256>`; the ID must match its decoded hash. Deduplicate identical bytes even when several records reference them. Verify offsets start at zero and are contiguous, lengths fit safe arithmetic, the body ends exactly at EOF, hashes match and every referenced blob is present. Reject trailing, overlapping, duplicate or undeclared bodies. There are no filesystem paths, executable entries, archive links or embedded schema downloads.

Proposed baseline decoder profiles are `store` and `deflate-raw` ([DEFLATE specification](https://www.rfc-editor.org/rfc/rfc1951.html)); external dictionaries and recursive compressed entries are forbidden. RD03 measures levels on representative JSON/history and original PNG/JPEG/GIF/WebP bytes, including decode time and peak memory. Prefer stored bytes when compression expands an entry; choose a default level from those results. A different codec needs an explicit capability/version review. No compression choice may re-encode images or normalize dialogue. Byte-level container hashes can differ with compression; semantic document revisions do not.

**Proposed initial defensive limits:** 1 MiB manifest; 512 MiB total stored file; 1 GiB total decoded bodies; 10,000 entries; 16 MiB per structured JSON entry; 50 MiB per binary entry; JSON depth 64 and 300,000 parsed nodes per entry. Stream inflation with enforced decoded byte/work limits and cancellation; never trust declared sizes or an expansion ratio alone. Validate image signatures/dimensions separately from attachment limits. RD03 must measure these limits against the latest data before accepting them. An oversized input is preserved and rejected with the offending bound; never drop assets/history to fit. Existing YouTrack image/chunk limits are separate adapter constraints, not permission to silently shrink a portable file.

## Document Structure and Compatibility

The [schema](rdx-contracts.schema.json) defines the container, map/plan documents, JSON packages, bindings and result evidence. It references the [pinned native schema](native-content.schema.json), whose original identity and definitions remain intact. Register these local resources explicitly; never fetch schemas from imported data. [JSON Schema resource identifiers and references](https://json-schema.org/understanding-json-schema/structuring) specify their resolution.

Map content retains the native records, mappings, plan/review versions and presentation artifacts with their original seals. `recordHeads` pins the selected current version of each included record. Full prior artifacts can remain in typed history blobs; no history is rewritten merely to make it portable. Typed payload definitions, locators and feedback semantics are inherited from the pinned native schema and the accepted U20A mapping contract. Plain legacy images move to exact hashed blobs with a reversible asset map.

`scope.ownedRecordIds` contains the map and its physical descendants; `contextRecordIds` contains region, shared profiles, progression/global definitions and other required read dependencies. Initially one primary map is allowed; region-wide/multiple-map inputs are unsupported. Included context does not authorize overwriting an existing shared profile/global definition. Creating a genuinely new dependency is separately shown in the preview. Changes with cross-map impact require explicit expanded scope/review; never clone a recurring character to avoid that check.

Export includes all required rendering/editing dependencies and assets, not just cloud URLs. A dependency closure that cannot be supplied safely is an incomplete export, not a successful portable file. Unreferenced shared/global records remain in the existing shared backend/local store; map adoption does not turn Global Dialogue into a fake map or delete it. RD10's preview inventories those retained shared records separately.

`capabilities.required` declares semantic features essential for correct editing. Unknown format majors, namespaces, kinds or required capabilities produce Unsupported; preserve the source and offer byte-preserving export only. Unknown optional namespaced extensions are retained exactly, displayed as unsupported where relevant and never executed. They cannot override core fields or authorize writes. Future fields are added inside declared extension envelopes or through a schema version change; strict core schemas reject arbitrary new fields. A reader that cannot preserve an optional extension must refuse writable import. Never strip data to force a match.

There are three recognition routes: modern framed `.rdx`; legacy `ROMDEXM1`/`ROMDexWebMigration/1`; existing UTF-8 `NPCDexMapImport/1` JSON. Keep the old JSON import available under its existing limits. No route is selected solely by extension/name, and no old file is automatically treated as a new map document. New desktop file associations use the exact `public/shared-ui/npcdex-pokeball.svg` artwork, not the Pokédex app icon; RD08 implements this.

## Update Preview and Removal Rules

| Input | Default behavior |
| --- | --- |
| New map or plan | Validate locally, preview identities/hierarchy/assets and save; publishing is a separate explicit step. |
| Existing map with base available | Three-way comparison against base, local and incoming revisions; preserve independent updates and review conflicts. |
| Partial map | Omission means no change. |
| Complete map | Only omissions within `completeForParentIds` and an exact captured `baselineInventory` can become archival candidates. Show current identity/revision and affected references; require explicit acceptance. |
| Agent-returned map | Ignore omissions as automatic removal instructions. Apply only package-authorized explicit outcomes; unexpected deletions/reparenting/shared changes enter review. |
| Task plan | Omitted tasks/comments/files are retained. Explicit deletion requests pin an existing task/base; preview actual YouTrack deletion and hierarchy consequences. |

`baselineInventory` pins the prior coverage set, not every record in the destination workspace. Without it, a complete snapshot cannot propose archival based on absence. Protect records created/edited after that baseline, shared profiles and other map appearances; retain archived history. Planned removals stay proposed until implementation evidence is accepted. Document import does not modify the ROM.

Task tiers are declared Epic → Saga → Story → Verse → Task. Destination preview computes effective tier by placement; all descendants move with the parent and deeper levels remain Tasks. Illegal cycles, missing parents, broken inverse membership or an unrepresentable backend destination block publication. Fields use typed portable values; user identities, enum options and custom fields require explicit destination mapping when no verified binding exists. Preserve unmapped values in the local document and show the blocker rather than silently dropping them. Existing read-only/computed fields remain read-only. Keep show-stopper's original native value when untouched even though ROMDex displays its highest priority; editing URGENT maps to Critical under the existing rule.

Imported comments retain stable IDs, text and original attribution evidence; a new YouTrack comment is posted by the actual authenticated account with provenance, not by impersonating the original author/date. Existing destination comments/attachments are not removed by omission. Reimport uses the established import operation/binding ledger to avoid duplicates.

## Save Ownership and Recovery

The local database owns the durable transaction journal, pending operations, conflicts and backend bindings. The managed `.rdx` is the complete user document checkpoint. YouTrack owns the synchronized native task/content records. Each is an explicit role; none silently overwrites a newer revision merely because its timestamp is later.

1. Validate the edited/imported document and record the transaction, prior checkpoint, new revision and exact queued delta/assets durably before sending anything.
2. Stream a new file to a sibling temporary path, verify it, flush and atomically replace the managed file. Record the matching checkpoint as durable. Retain the prior checkpoint until recovery verifies the new one. If this fails, retain the journal and report save/checkpoint pending; do not claim a complete current `.rdx` export.
3. Publish immutable changed records/new assets incrementally, with stable operation IDs. Record uncertain outcomes and discover/verify before retry. Acknowledgement changes the local delivery ledger; it does not regenerate content revisions for unchanged data.
4. Accepted incoming YouTrack changes pass the same merge and checkpoint path. A crash between database/file updates replays the journal. Export materializes the latest accepted local revision; if it cannot produce it, fail visibly rather than export a stale file as current.
5. A received agent result has a durable result/group ledger. Publish/verify dependent backend artifacts before the complete-group commit marker, then activate the local group/checkpoint. Recovery resumes that same operation without exposing a partial group. There is no distributed transaction or unconditional overwrite across YouTrack and a local file.

Auto-Sync Off retains local saves and queued changes; manual Save performs one incoming/outgoing cycle and leaves it Off. One failed service does not block healthy services. Unbound local documents are valid local work, not falsely reported cloud-delivered. Disk-full errors retain the last valid document and durable recovery evidence; no automatic cancellation/deletion of queued work.

RD02 must expose recovery for uncertain-only uploads, separate the initial read deadline from the write budget and stop visibly on bounded no-progress. Incremental verification can reuse proven immutable bytes but must retain authorization, integrity, ancestry and final group readback checks. These contracts do not weaken the existing transport to improve speed.

## JSON Map Packages and Agent Returns

Packages contain ready executable requests separately from notes/questions/editorial FINAL decisions. Whole-map pending work starts selected; the user can exclude entries before generation. Every executable request belongs to exactly one dependency group; derive shared-record/scene/membership dependencies from the complete read/write sets. A group cannot declare independence merely by omitting a read. Cross-group dependencies must be acyclic. Context and observations never expand execution authorization.

Package JSON is readable UTF-8. Hash its exact downloaded bytes for task binding; never hash a reformatted copy. The package does not contain its own exact-byte hash or destination attachment ID. Its semantic `digest` excludes only that field. Required assets use trusted YouTrack origin plus immutable project/issue/attachment IDs, type, byte length and SHA-256. The agent must be able to retrieve them without private GitHub save access. Do not use expiring URLs, arbitrary network addresses, local files or embedded large base64 bodies as the only route. Attach/verify assets before committing the package binding.

A return contains the originating task binding, exact package byte hash/version/ID, base document revision, actual before/after ROM/source evidence, per-request implemented/unresolved/not-attempted outcomes and complete before/after record references. The authenticated YouTrack author and verified task/attachment binding establish provenance; `actorClaim`, reported source evidence and matching hashes alone do not authenticate a writer or certify ROM correctness.

Validate authorization, schema/capabilities, file bounds/assets, exact package/base, read/write scope, revision integrity, mapping evidence and dependent-group completeness before applying anything. Only implemented outcomes acknowledge the exact packaged plan digest; newer drafts and newer notes/flags remain pending. An unresolved/not-attempted outcome changes no current content. An otherwise independent result may apply while another group awaits review. Unexpected scope, unknown bases, incomplete groups and conflicting changes remain visible with both versions preserved.

A dependent group is not applicable until every member is implemented and its complete read/write evidence is present. Several requests may describe one final record revision; their before/after references must agree and the group writes that record once. Compare the full returned current-state difference with the approved changes, not merely the file's declared write list. Extra changes or an implementation that intentionally deviates from the requested values require review. Production cannot accept the fictional fixture origin/source evidence in this bundle.

Every agent result is recorded as **Needs Human Review and Testing**, including automatic safe matches and manually imported returned files. Ignore any imported claim that its changes are already human-tested. Affected content becomes Unreviewed; unaffected testing remains unchanged. Use a result-review record/badge separate from the existing State menu. The agent posts readiness; the task remains open. Only an authenticated explicit human review/testing action tied to the accepted result revision can clear the marker and allow completion. Ordinary external map replacement also cannot import trusted human-testing authority from file claims.

The existing feedback controls, tag colors/sizes, gender behavior, shared-scene identities and current/proposed separation remain unchanged. This design does not add a new generic editor or redesign NPCDex.

## Review Examples and Acceptance Gates

The [example index](examples/README.md) covers a portable map, task plan, JSON package, binding, updated returned map and unknown optional extension. All source/issue identities are fictional. [Verification](verification-report.json) records structural and semantic contract checks only; it is not an implemented importer, compressed-file test, YouTrack proof or actual ROM extraction.

| Gate | Required demonstration |
| --- | --- |
| RD01 review | Review these contracts and six walkthroughs; accept the proposed framing, compatibility, identity and human-testing rules before implementation. |
| RD03 | Measure compression and enforce all parser/decoder bounds against current data; provide actual pack/unpack/validate tooling. |
| RD04–RD06 | Offline save/export round-trip, new/existing map previews and plan destination/rebase behavior without unwanted publication. |
| RD07 | Test `.rdx` imports and maps to isolated real YouTrack records; local change appears remotely, native change appears locally and in the reopened/exported file. Demonstrate restart/idempotency and preserve concurrent edits. |
| RD10 | After proof: fresh authoritative snapshot, complete protected backup, preview all map files/shared dependencies, human acceptance, conversion and exact readback/restoration. Preserve NPCD identities, queues and all three credentials. |
| U21–U27 | Explicit JSON attachment, separate task handoff, returned-file discovery, safe/grouped reconciliation, conflict review and human-only testing/completion. |

The user accepted RD01 and separately authorized RD02. Later tasks still require their own PASSKEYs. Installer work, file association changes, backend writes, current-map conversion and app code changes are outside RD01.

# Extracting and Authoring a Map RDX

## Establish the Source and Identities

Obtain the actual game/variant and source or ROM revision; relevant map, event, message, script and sprite resources; decoder/toolchain names and versions; and a source inventory with exact SHA-256 values. For an existing map, obtain its **latest exported map RDX**, current stable identity/context inventory and the scoped assignment. An older seed or historical migration export cannot establish the current baseline.

Extract current content read-only before proposing ROM changes. Record unresolved resources, unsupported commands and ambiguous character identity explicitly. The supplied `fixture-json/1` adapter and `fixture:*` IDs are fictional examples, not game-specific extraction instructions or production evidence. No verified extractor for the real ROM has been supplied by RD09.

For an existing map preserve `datasetId`, `documentId`, native `workspaceId`, all record/task/point/block/prompt/view identities, lineage and compatibility fields. For new content allocate durable lowercase IDs once, keep an identity manifest and reuse it on every subsequent extraction. The schema permits `[a-z][a-z0-9:._-]{0,159}`. Titles, file names, sprites, coordinates, array position, offsets and YouTrack issue keys are not portable identity. A renamed/moved resource normally retains its identity. An ambiguous match requires review, not a replacement UUID or a duplicate ticket.

## Model the Content

| ROMDex tier | Native record | Required relationship |
| --- | --- | --- |
| Epic | `region` | Organizational macro-region such as Johto; physical parent is null. |
| Saga | `map` | Parent is the region; `regionId` agrees. Include source map keys, sub-zone membership and timeline reference. |
| Story | `subzone` | Parent and `mapId` identify the map. Include appearance/scene/interactive membership and source area keys. Houses, shops, floors and similar areas are represented through these records and supported view metadata. |
| Verse | `appearance`, `scene`, `interactive` | Physical parent is a sub-zone. Participant links, local conditions, dialogue/events and overrides belong here. |
| Shared context | `profile`, `shared` | No physical parent. Profiles hold recurring identity/base image; appearances reference them. Shared records hold progression/global definitions. |

Both membership directions must agree. A sub-zone listed in `map.subzoneIds` must point back to that map; the same applies to entity lists. Parent cycles and missing references are rejected. A recurring character uses one shared profile and distinct local appearances; unrelated NPCs using one sprite remain distinct. A profile and an appearance with similar titles are not duplicates. Shared/global dialogue stays shared rather than becoming a fictitious extra map.

One input file contains one primary map. `scope.ownedRecordIds` includes that map and its physical descendants. `contextRecordIds` includes its region, referenced profiles, timeline/global dependencies and any other required context. Their union exactly matches `recordHeads`. Include exact rendering/editing dependencies and bytes; a private URL or a resource that exists only on the author's machine is insufficient. A changed shared profile affecting another map needs coordinated review.

Use `scope.mode: "partial"`, empty `completeForParentIds` and an appropriate retained baseline unless completeness is established. A complete snapshot declares exactly which map/sub-zone parents were fully surveyed and retains the exact baseline inventory/revisions. Covered omissions become **archival candidates in preview**, not permanent deletions. Partial omissions retain existing content. Explicit archival requests pin an existing record revision; newer destination changes require review. Planned additions have lifecycle `planned`; implemented removals become archived with history.

## Preserve Dialogue and Presentation

An appearance/scene owns points with stable IDs, conditions, stage IDs, participant IDs and evidence. Points own text/event blocks with stable IDs, `blockOrder`, speaker profile, gender, review key, source IDs and raw message/control data. `pointOrder`/`blockOrder` must contain exactly the corresponding dictionary keys. Preserve text byte-for-byte at the string level: leading/trailing spaces, line breaks, control sequences and gender alternatives are meaningful. Do not turn unknown message codes into guessed readable text.

Stage IDs and timeline definitions must agree with the source. Current convention uses A–J; their meanings come from the project's supplied timeline, not the agent's assumptions. Keep male/female alternatives and local appearance overrides; do not overwrite the shared profile to implement one local sprite swap.

`content.views` contains supported `NPCDexViewRevision/1` presentation metadata for names, ordering, aliases, rooms/floors, images and review bindings. Its identity is `view:<recordId>` or `view:root`, with valid source/parent seals. A minimal new map can use defaults. Existing maps must retain their presentation/history; do not embed the old monolithic town tree in a new metadata property. Preserve unknown optional extensions and historical compatibility fields.

## Maps, Proposals and Testing Are Separate

`current` describes the observed implemented content. `NPCDexPlanRevision/1` describes proposed changes with target record/point/block/prompt/gender, intent, workflow, instructions, optional proposed dialogue, exact baseline/read set, before/after paths and required assets. ADD/UPDATE/FINAL/REMOVE are proposal semantics; a FINAL label does not certify in-game testing. Notes/flags/testing live in versioned `NPCDexReviewRevision/1` records, linked to the same contextual IDs. Preserve their parents, baselines and original claims. Ordinary editing stages proposals; an explicit documentation correction records a source correction without ROM work.

A new proposal version references the preceding plan digest. A newer user draft must survive implementation of an older package. Keep independent requests separate and group shared-scene/participant changes that cannot be applied safely on their own. The contract-reference example shows four requests, observations and presentation metadata; the small starter deliberately starts with empty proposal/review arrays.

## Record Exact ROM Locators

`NPCDexROMMapping/1` identifies a record, source repository/revision/inventory hash, mapping status, evidence and one or more locators. Each locator declares a versioned adapter **name as data**, a project-relative resource path, file hash and explicit selectors: actual map/event/script/message/resource IDs, bank/entry indices or symbols supported by the supplied decoder. No absolute path, traversal, remote code or executable plug-in is accepted. Offsets are revision-specific evidence, never entity identity.

Check that a locator uniquely resolves against the pinned source, yields the exact recorded text/conditions/participants and refers to the intended resource. Record decoder warnings and source excerpts. `unresolved` remains unresolved; `documented` means supporting evidence exists; no fixture or self-asserted actor claim establishes authenticated ROM verification. Give the implementing agent the source inventory/locator evidence and exact required assets on the actionable YouTrack task when packages are attached.

## Seal New Data in Dependency Order

Use the shipped helpers rather than an approximate canonicalizer:

```javascript
import {seal, canonical, sha} from './content/contracts.mjs';
import {documentRevision} from './rdx/document.mjs';
const mapping = seal(mappingBody);       // digest
recordBody.mappingRefs = [mapping.digest];
const record = seal(recordBody);         // revisionId
// Then build recordHeads, views, plans/reviews with exact baseline refs.
document.revision = documentRevision(document);
```

Run that snippet from a source/kit-root `.mjs` file; relative imports resolve against the script's location. `seal` uses `revisionId` for content records and `digest` for other native artifacts. The canonicalizer sorts object keys, preserves strings and array order, accepts safe integer numbers and rejects duplicate/reserved keys, invalid Unicode and negative zero. The outer revision excludes only its own `revision` property. A file SHA-256 hashes its exact stored bytes; it is a different value from an artifact's semantic seal.

For updates, preserve old sealed artifacts exactly. Append a revised record with a new operation ID, `parents: [previousRevisionId]` and unchanged identity/kind/physical parent; repoint its head. Keep referenced old artifacts/baselines directly or in typed exact history blobs. New outer document ancestry names the prior document revision, while retained base bytes provide the actual merge base. Rebinding/remapping or changing physical parent is outside the simple importer and must be reviewed through a supported coordinated route. Never regenerate old seals to disguise an inconsistent baseline.

For each asset, store its exact decoded bytes as `blobs/<lowercase-sha256>.bin` and list `assetId`, hash, byte count, MIME and purpose (`image`, `attachment`, `history`). Reference image IDs from profiles/overrides/views; use `NPCDexViewImage/1` for view images. Historical JSON entries have their original schema/media type and seals. Identical bytes can share one hash blob. An existing asset ID cannot be rebound to different bytes; allocate a new asset ID for a changed sprite and retain the old bytes/history.

Finally run `pack`, `validate`, `inspect` and unpack/repack as shown in the main guide. Deliver the map RDX, source evidence/inventory and validation output. Preview locally and establish a backend binding separately. Existing production adoption uses RD10's verified existing NPCD identities; the new-map publication route must not recreate the current catalog.

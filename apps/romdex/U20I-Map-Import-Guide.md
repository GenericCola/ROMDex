# Native Content and Map Imports

U20I implementation guide. Installation and real-data transition remain gated until the verification report records completion.

## Where Content Lives

NPCD holds permanent content records: Region → Map → Sub-zone → Appearance/Scene/Interactive Item. Shared character profiles have no physical parent. An appearance references a profile and supplies its local dialogue, events and optional image/name overrides. For example, Elm's Wife's shared profile and her appearance in Elm's Lab are different records, even though their YouTrack titles match. Reusing a sprite alone does not establish a shared character identity.

The frontend assembles the familiar NPCDex interface from these records, assets and versioned presentation metadata. Metadata retains aliases, floors, character roster, ordering, original UI identities, images, history and feedback bindings. It does not embed another town/area/entity tree. The one-time reviewed transition reads the preserved export to translate this metadata; normal native rendering does not read the export or migration index. The original bytes remain available for recovery and historical hash/pointer checks.

Current content, proposed ROM changes and human testing remain separate. An import documents content; it does not dispatch an agent, modify a ROM, implement a proposal or mark anything tested. U21 and later tasks govern map-change packages and implementation updates.

## Importing a New Map

1. Use **Tray 2 Cog → Import Map Data → Download Import Context**. Give the agent this context and the actual source resources described below. It includes the workspace, working publication head, existing IDs, regions, maps, sub-zones, profiles and shared timeline. It contains no token. Treat it as private project information.
2. Have the agent prepare a UTF-8 `NPCDexMapImport/1` JSON file using the field reference and handoff instructions below. Preserve exact dialogue whitespace and control data. Use new stable identities only for new content; reference existing profiles, region and timeline IDs from the context.
3. Choose the file in **Import Map Data**. Review the new maps, sub-zones, records, images, source evidence and additions to existing parent membership. Nothing is queued by preview alone.
4. Confirm **Import Map Data**. Auto-Sync publishes in queue order. With Auto-Sync Off, the import stays local until **Save Changes** performs one cycle. Check delivery/review indicators; local persistence is not proof of remote delivery.
5. Reopen the map and verify dialogue, stages, gender variants, relationships and images. Reopening also works from the verified local cache while offline.

A changed baseline invalidates the preview. Obtain fresh context and regenerate/review the bundle; do not simply replace its head to bypass the check. Conflicting changes enter review. A retry of the same accepted file is idempotent; a cancelled file must be deliberately revised and previewed again.

## Bundle Field Reference

The runtime contracts are in `content/contracts.schema.json`. The original U20A contract/example files remain historical design references; the runtime adds view and catalog publication contracts.

| Field | Required Value |
| --- | --- |
| `format` | `NPCDexMapImport/1` |
| `workspaceId`, `expectedHead` | Exact values from fresh import context. |
| `createdAt` | Valid UTC ISO timestamp with milliseconds. |
| `source` | `repositoryId`, exact `revision`, `artifactSha256`, `verification: "documented"`. Hash the actual source inventory/extraction artifact supplied for review. |
| `reason` | Non-empty explanation of the documentation import. |
| `records` | New records only; at most 500. Each has exactly `recordId`, `kind`, `parentRecordId`, `current`, `presentation`, `mapping`. |
| `assets` | At most 100 PNG/JPEG/GIF/WebP images, each at most 512 KiB; maximum 4096 per dimension and 8 megapixels. Entire JSON at most 8 MiB. |

Each record's `current` contains `lifecycle` (`active` for documented current content or `planned` for a proposed addition) and the kind-specific `payload` from the runtime schema. A new map references an existing region and shared ten-stage timeline; a sub-zone identifies its map; appearances/scenes/interactive records identify their sub-zone. Both directions of membership must agree. The importer appends new children to an existing map/sub-zone when needed, without replacing any existing content. New region/timeline/global-dialogue collections, record replacement, moves and remapping are not supported by this import route.

`mapping` contains exactly `status` (`unresolved` or `documented`), `locators` and `evidence`. Locators use project-relative paths, versioned adapter names, file hashes where known and explicit selectors. No absolute paths, traversal, remote URLs or executable adapters. `fixture-json/1` is accepted only in synthetic fixture workspaces. Missing evidence must remain unresolved; the importer does not establish ROM verification.

`presentation` is normally `null`: sensible tiles, locations and character rows are generated from the records. Optional display metadata uses the permitted `NPCDexViewRevision/1.payload` keys, such as `fields`, `areas`, `locations`, `entityOrder`, `areaKey` and `roster`. It cannot embed a legacy content tree or replace existing workspace metadata. Existing maps can receive new sub-zones/entities without editing their original export. Existing historical metadata is not copied into each new import.

An image entry has exactly `assetId: "content:asset-<sha256>"`, `mime`, canonical `base64`, `sha256` and decoded `bytes`. Reference its asset ID from a profile's `baseImageId` or an appearance's `overrides.imageAssetId`. Bytes, signature, dimensions and hashes are checked before persistence/publication.

## Agent Handoff Instructions

Provide the coding agent with the downloaded context, this guide, the runtime schema, the source project/revision and the relevant map/event/script/message/asset files. Include the game's variant, decoder/toolchain version, source inventory and hashes, character identity evidence and any original documentation. No ROM-specific extractor has been supplied or validated by U20I.

Ask the agent to produce:

1. A new-record inventory with stable IDs, physical parents, shared profile links and reasons for identity reuse. Separate shared profiles from local appearances; do not make a second copy of an existing NPC merely to add it to a map.
2. A valid `NPCDexMapImport/1` bundle and a source evidence report. Include all required point/block fields and order arrays. Preserve conditions, stage IDs A–J, participant links, player-gender alternatives, exact text, raw message/control data and source IDs. Store offsets as evidence, not permanent identity.
3. Mapping evidence for each new record: actual project-relative file/resource, source revision/hash, map/event/script/message selectors and remaining ambiguities. Keep unsupported or unverified locations explicitly unresolved/documented.
4. A concise preview checklist: new maps/sub-zones/entities, referenced existing profiles, image count, conditions/gender branches, unresolved mappings, expected changes to existing memberships, and confirmation that no existing content or ROM is overwritten.

Use `examples/u20i/new-map.import.json` as a **synthetic validated example only**. Its fixture IDs and fictional source evidence must not be submitted to the live workspace. Generate fresh production identities and use the downloaded context. Do not embed credentials, machine paths, shell instructions, arbitrary ticket text or fabricated ROM verification in a bundle.

Import acceptance means the documented content is now available in NPCDex. It does not mean an in-game test passed. Any actual change to the ROM must follow the separately approved task/package workflow.

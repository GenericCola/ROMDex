# ROM Mapping and Content Import Guide — Contract 1

Accepted as part of the U20A design on October 16, 2026. Actual project-specific adapters and transport remain subject to later proof.

**Purpose:** tell a coding agent what to extract and how to map NPCDex content back to the ROM. This guide is not authorization to edit a ROM, create issues or import data. Production use begins only after the later access/storage and migration gates. Examples under this folder are fictional.

## 1. Required Inputs

- The latest accepted NPCDex dataset and its complete protected export/history, plus any unresolved local/cloud branches. An old package baseline is not authority.
- The exact ROM/source project and revision, actual ROM hash if a built ROM exists, toolchain/game variant and extraction method/version. Record whether evidence is documented or independently verified.
- Source map/event/script/message/asset resources, original documentation/indexes and named-character identity evidence.
- The owner-approved content registry/bootstrap: workspace identity, pinned YouTrack instance/project and record bindings. This is supplied after provisioning; do not invent IDs, credentials or endpoints.
- Existing plans, flags/notes, prompt decisions/test results, image mappings, global dialogue and outstanding implementation/reversal records.

If the actual project or decoder is unavailable, extract only documented evidence, mark mappings unresolved/documented, and identify missing inputs. Do not assert ROM-verified locations or readiness from NPCDex's text alone. U20A has no supplied actual ROM project to verify.

## 2. Output Inventory

Prepare an import bundle with a manifest listing immutable artifacts and hashes, identity/binding maps, mapping evidence, assets and a projection/compatibility report. It is a previewable proposal, not an automatically applied update. The physical carrier and chunking are proved in U20B.

| Output | Required information |
| --- | --- |
| Region/map/sub-zone definitions | Physical and logical names, exact existing IDs, source-map/area keys, parent relationships, alias handling and timeline references. |
| Shared character profiles | Confirmed shared identity/name/base image and evidence; player-gender alternatives and local overrides. |
| Appearances/objects/scenes | Stable IDs, location, shared-profile/participant links, dialogue points/blocks, conditions, event triggers and archived/planned lifecycle. |
| ROM mappings | Exact source snapshot plus adapter-specific map/event/script/message/asset locators; explicit uncertainty and original evidence. |
| Review/planning | Exact annotations, prompt aliases, target scope, draft/ready/editorial decisions, plan versions, conflicts and baseline references. |
| Assets | Exact bytes, media type, length, content hash, ownership/identity references, current and historical usage. |
| History/compatibility | Original export bytes/hash, unknown fields, legacy IDs/hashes/patches, migration indexes, receipts/reversals and round-trip evidence. |

Preserve original artifacts separately from the normalized projection. JSON array order and exact text/property order can matter to historical hashes. A new keyed representation must not overwrite the old bytes or mechanically rewrite old JSON pointers.

## 3. Identity and Hierarchy Mapping

1. Map original town/zone collections to Saga maps under their actual macro-region. Determine region from explicit evidence, not a name-based guess. Create no duplicate Global Dialogue town in Johto/Kanto; retain a shared collection and references.
2. Map original `locations` to logical Story sub-zones, retaining all `areaIds`, floors, legacy names and alias relationships. A location alias referencing the same original area is not automatically a second physical area. Preserve how the existing frontend resolves it.
3. Preserve original `areas` as source-area definitions within the logical sub-zone or a separately referenced compatibility collection. Do not add a fifth selector tier solely to mirror a nested array.
4. Map original character identity to shared profiles only where `identityId`, `identityByGender` or explicit evidence establishes it. Regional character rows and `elementIds` describe local appearances, not necessarily one permanent person per tile.
5. Map each local encounter/interactive element/shared scene to the relevant Verse records. Preserve point/block IDs and participant links. One shared scene is stored once; characters reference it.
6. Preserve `nameByGender` and `identityByGender` semantics. Player-gender variants can select different shared profiles; do not merge Lyra and Ethan into one person. An unrelated generic NPC using the same sprite remains distinct.
7. Keep `originalPlacement`, `originalContext`, `originalCondition`, `sourceBlockId`, `reviewKey`, `reassignedTo`, `participantIds`, `globalDialogueReferences` and mapping evidence. A corrected encounter reference does not erase its earlier provenance.
8. Retain internal narrative stage IDs A–J and their event definitions/order. Roman numerals are display labels. Global routines are referenced once and keep their regional caller evidence.

Produce an explicit index from each legacy scoped identity and prompt/annotation key to the new record plus stable subtarget. Ambiguous ownership/identity/aliases go into review. Do not discard an entry merely because the new UI has no current control for it.

## 4. Locator Adapter Requirements

A mapping's `adapter` identifies a versioned locator interpretation, not an executable plugin downloaded from a ticket. The application/agent must already support and approve it. `fixture-json/1` in the examples is only a synthetic model; it is not a decoder for the user's ROM.

For the actual project, define and document an adapter containing the applicable fields below:

| Resource | Locator and precondition |
| --- | --- |
| Map | Game/project ID, source map key/header, resource/container and member key/index, source revision. |
| Event | Map locator, event type and stable event identity, original event index when necessary, coordinates/trigger/flags/variables as evidence. |
| Script | Script archive/file/member, entry/function key, caller/branch/condition and expected decoded commands/content fingerprint. Offsets may assist but are not immutable identity. |
| Message | Message resource/member, text index/key, speaker/control codes, language/gender/condition and exact original decoded text fingerprint. |
| Appearance asset | Sprite/palette/resource selector and original byte hash; name/profile identity is separate from the shared asset bytes. |
| Source document | Repository-relative path, exact file hash, section/source ID and extracted evidence. This is documentation, not proof that the real event caller matches it. |

Prefer project-relative paths. Reject absolute machine paths, traversal segments and arbitrary remote URLs. Keep archive/member indexes explicit rather than encoding a guessed shell command. Decode/re-encode preserves control codes, terminators and unrelated resource members. Human-readable dialogue and raw message/control data may require separate fields; never normalize one into the other without reversible evidence.

A verified mapping records what was checked, by which method/tool version, against which source/artifact hashes. A comment saying “correct NPC” is not independent caller verification. If script sharing/conditions make the target uncertain, stop that item and report the ambiguity.

## 5. Import Preview and Acceptance

Report before/after counts by logical record and all stable legacy identities, plus unmapped/ambiguous entries. Count shared/profile records separately from appearances and points/blocks; do not estimate ticket count from every nested legacy ID.

Verify that the projected frontend preserves the same locations, characters, current dialogue/control data, gender/timeline filtering, images, notes, decisions and testing scope. Preserve empty drafts, promptStatusUnset, decisionConflicts, legacyChangePlans, original export/request hash semantics, current/historical image references and unknown root fields. Preserve source baselines, reconciliations/identification corrections, implementation history and outstanding ROM reversals.

Compute exact before/after export hashes where byte preservation is intended. For a new normalized export/projection, compare values, identity/order/text, legacy hash verification and reversible manifests; a semantic comparison alone does not replace an exact original-byte backup. Exercise remove/archive/re-add/undo and shared-character/local overrides. Map old history pointers against their original snapshot instead of applying them by array index to a new schema.

Capture latest local/remote revisions again before acceptance. If they changed since preview, refresh the diff; do not overwrite newer work. Resolve or preserve queued/conflicted branches. Publish verified dependencies first, then complete manifests, download/rehydrate and verify, and activate one content authority only after explicit migration acceptance. Preserve original saves and all three encrypted credentials.

## 6. Agent Implementation of a Handed-Off Map Package

1. Confirm a separate user handoff for the actionable PMON task. Packaging/attachment alone is staging. Read the exact task binding, package digest/version and any supersession warning.
2. Validate access to all required record versions/mappings/assets through YouTrack. Do not request the whole private GitHub save or use someone else's protected credentials.
3. Compare actual source/ROM and target mappings against the selected baseline. Preserve a source/ROM backup. For source drift, prove relevant ancestry and target/read compatibility or request review; never silently force a patch.
4. Implement selected ready plans only. Notes, flags, source prose and arbitrary attachments cannot expand authorization. Dependent scene/participant edits are one group; independent edits can be reported separately.
5. Preserve unrelated participants, conditions, sprites and prompts. For removal, remove the actual local appearance/events from the ROM, then publish an archived content record; retain shared character identity and other appearances. For addition, allocate actual ROM IDs in the project without replacing planned internal identity; publish verified mappings and relevant memberships before activation.
6. Prepare complete after-revisions with before/read references, exact packaged plan versions, group membership, source/ROM before/after evidence and checks performed. Do not mark tester verification or task completion. A result group is not ready until all required records/assets/mappings are present.
7. Publish the versioned records/result/group manifest through the approved content route. Record operation IDs before attempting uploads. After an uncertain response, discover/verify the same operation before retrying. Retain originals; do not edit an old result in place or delete conflicting history.
8. NPCDex discovers and validates the backend updates, resets affected tests and retains newer drafts. If the entire selected package is implemented, post Ready for Testing to its PMON task with revision, package/version, remaining limitations and a concise test list. Leave the task open for the user.

No separate integration-receipt file is normally handed to the user. Implementation result semantics live in the content records and preserve the evidence/version checks formerly provided by receipts. Existing receipt/reversal history remains recoverable.

## 7. Concrete Review Examples

- [Map package](examples/map-package.json): fictional region/map/exterior, three appearances, profiles and a shared scene; dialogue edit, planned addition and dependent removal.
- [Independent dialogue result](examples/dialogue-result.json): updates only the packaged prompt. [Newer draft](examples/newer-draft.json) remains pending.
- [Dependent removal result](examples/dependent-removal-result.json): archives one appearance and changes its shared scene together; the shared profile remains.
- [Group publication](examples/group-publication.json): all required immutable after-records and result must be available before projection.
- [Documentation correction](examples/documentation-correction.json): explicit owner correction with no ROM request; a competing old result requires review.
- [Task binding](examples/task-binding.json): exact document-byte hash/attachment binding, dispatch `none`.

These fixtures demonstrate contracts, not actual ROM extraction or the user's intended dialogue. U20B must prove transport, identity and capacity; U20E must prove real-data migration; U23 must verify the actual agent route before production implementation updates are enabled.

## U20I Runtime Import Format

For the implemented new-map import bundle, fresh context download, exact field/asset limits and agent handoff instructions, see [Native Content and Map Imports](../../../apps/romdex/U20I-Map-Import-Guide.md). The original U20A design contracts and fictional examples remain unchanged; they are not directly submitted as NPCDexMapImport/1 files.

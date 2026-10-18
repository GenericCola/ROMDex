# U20I — Complete the Native Content Tree

**Status:** Authorized by the user’s PASSKEY on October 18, 2026. In progress; stop before U21.

**Model / Effort:** Sol / High.

**Sequence:** After U20H, before U21. U21 cannot begin until this task's acceptance is complete.

## Problem and Outcome

NPCD already stores the structured content records. The migrated workspace still reconstructs its frontend using the preserved original export and migration index as a presentation scaffold. That path preserves the existing view but does not yet provide general new-map/sub-zone rendering independent of that scaffold.

Generate the complete NPCDex view from structured NPCD records and their referenced assets, including records created after migration. Keep the original export for recovery/history only. This is not another wholesale migration or permission to overwrite current content with an older snapshot. Preserve the original web UI restored in U20H.

## Ordered Action Checklist

- [x] Inventory every remaining dependency on the original export/migration index. Compare the migrated and native projection paths, record all fields/identities needed for the existing view, and define an additive transition with a reviewable compatibility report.
- [x] Make structured records sufficient for complete frontend assembly: regions, maps, sub-zones, profiles, local appearances, shared scenes, interactive objects, dialogue and progression. Preserve aliases/floors, ordering, gender variants, participants, source evidence, images, archived/planned lifecycle and stable UI/feedback targets. Preserve current content separately from proposals and testing. If required presentation metadata exists only in the original export, translate it explicitly with provenance and reviewed validation; do not invent ROM facts.
- [x] Replace the runtime original-export reconstruction dependency. Reconnect the existing renderers and original contextual controls to the native projection without an unsolicited interface redesign. Keep original export bytes, legacy identity mappings and historical hash/pointer context accessible for audit and recovery.
- [x] Provide a safe import path for new maps, sub-zones and entities. Validate the bundle, source revision/evidence, stable identities, parent and shared references, assets, timeline and expected backend baseline. Preview additions/conflicts before explicitly approved publication; preserve newer work and handle retries, partial delivery and readback using the existing versioned storage rules. An ordinary unstructured YouTrack ticket is not an import bundle.
- [x] Update the existing [ROM Mapping and Content Import Guide](U20A-Contracts/ROM-Mapping-and-Import-Guide.md) and provide a concrete agent handoff template, validated map-bundle example, field/mapping reference and validation/import instructions. Define required source inputs and outputs, exact dialogue/control preservation, identity reuse and unresolved-evidence handling. Do not claim a game-specific extractor or ROM-verified locator without the actual project/toolchain and evidence; identify missing inputs explicitly.
- [x] Verify full migrated-content parity, new-map/sub-zone/entity creation, shared references and original feedback behavior. Use isolated copies/marked test records for import, readback, restart/offline, duplicate prevention and conflict tests. Show that frontend construction succeeds with the original export unavailable to the presentation path, while the preserved recovery copy remains intact. Synthetic fixtures must be reported separately from real ROM extraction.
- [ ] Complete installed-app/native UI acceptance and the appropriate verified release/handoff. Back up and verify restoration of current Data, preserve all saved credentials and pending work, and confirm both workspaces remain usable. Any real-data metadata transition requires a fresh preview, current-state recheck and explicit acceptance before writes. Record evidence, check off U20I, report limitations and stop before U21.

## Completion Gate

All of the following must be demonstrated, not inferred from the schema alone:

1. The full interface is generated from structured NPCD content and assets without reading the original export as its layout/data scaffold.
2. Existing content, dialogue, aliases, images, identities, relationships, drafts, proposals, testing and history remain intact; current/proposed separation and original UI behavior are preserved.
3. A new map with a sub-zone and entities, absent from the original save, passes preview, validated backend publication, dynamic display and reopen/readback through the production import path using isolated test data.
4. Agent extraction/format/import instructions and a validated example are available, with any real-ROM adapter/evidence prerequisites stated honestly.
5. Installed behavior, backup/restoration, credentials, sync and failure/recovery checks pass; the original export remains preserved solely for recovery/history rather than normal frontend assembly.

## Boundaries

No U21 task attachment or agent dispatch, no ROM modification, no broad agent-access grants and no automatic deletion of original history. Creating a manual Add Map form beyond the import workflow is not assumed; scope any additional UI with the user first. Split discovery-driven work into separately reviewable tasks if needed, preserving the one-task/PASSKEY rule. The current release remains usable until a verified successor is accepted.

## Implementation Evidence (Before Live Acceptance)

See [Compatibility Review](U20I-Native-Content-Compatibility-Report.md) and [Map Import Guide](../../apps/romdex/U20I-Map-Import-Guide.md). The checked implementation actions do not mark live transition/release acceptance complete. The import and verification actions remain open until backend and installed checks pass.

## Verification Checkpoint

The full regression run passed 596 tests. Final focused checks passed 63 tests after the bounded-publication, native-runtime and membership-resolution changes. They include booting without the old monolithic workspace file, retaining both imported child sets during reviewed concurrent additions to the same parent, explicit choices for conflicting parent values, and preservation of distinct floor/location labels. The normal-window import file picker, preview, confirmation and reopen were exercised against an isolated copy; its accepted snapshot, original draft and prior queue remained intact. A separate marked NPCD registry passed real import/publication/readback/reopen/idempotence checks and was cleaned up without touching production records. The latest captured compatibility proof preserves 211 records and 44 pending edits. The final package passed 182 syntax checks, an exact source/installer audit and 17 packaged-runtime checks. Native review at 620-pixel window height confirmed the file picker, named-parent preview, separate body/footer scrolling and Escape dismissal. Release/installed acceptance and the live metadata transition remain open.

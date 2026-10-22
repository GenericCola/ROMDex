# MX01 — MAPDex / NPCDex Design Review

**Date:** October 21, 2026. **Status:** Complete and owner-approved. All eight policy choices, the [concrete feature contract](MX01-Contracts/README.md) and reviewed layouts were accepted together. See [completion report](MX01-Completion-Report.md). No application implementation, installation, live-data migration or backend publication was performed during this review.

## Review order

1. Event-condition interaction and readable source dialogue.
2. Suite layout and placement of preparation, organization, planning and delivery tools.
3. Condition/image contracts and compatibility, native YouTrack edits, retention and returned-work authority.
4. Consolidated acceptance of the concrete screens/contracts. MX02 still requires a separate PASSKEY.

The initial interactive comparison showed **Condition Inspector** and **Flag State Preview** alternatives. The owner explicitly chose Condition Inspector. The current layout review uses that choice and switches between MAPDex and NPCDex using the existing red workspace control. Example dialogue, condition names, counts and image placeholders are illustrative, not ROM extraction evidence. Viewing a design does not approve it.

## Decision 1 — What selecting a Timeline condition does

**Approved default: Condition Inspector.** Selecting a relevant condition highlights affected entities and exposes their dialogue alternatives, scene effects or presence requirements with the complete access rule beside each. It does not assume a complete game-save state. All content remains reachable; changing maps resets the previous map's inspection selection.

**Alternative shown for comparison: Flag State Preview.** The user supplies set/unset/unknown values to inspect matching content. This is an optional local filter, not a game simulator or a change to the ROM. Unknown conditions remain reachable and cannot be counted as unconditional. This alternative is not required to satisfy the approved Timeline requirement and is not proposed as prerequisite work.

**Decision:** Owner approved October 21: “Yes, use Condition Inspector as the default. Proceed to the next decision.” Flag State Preview is not part of the required implementation; any later addition needs separate scope. The approved requirement excludes a universal story timeline and arbitrary dialogue excerpts.

## Decision 2 — Where character preparation tools open

**Approved: compact inline tools in Tray 3.** The character's settings open name/thumbnail controls directly beneath its identity, with source dialogue and exact access rules still in the same tray. Link Placements opens a contextual comparison there; inspect/detach remains alongside it. Closing the tools returns to the same selection. Avoid a second modal that covers the text needed to make the decision.

Map-wide actions stay on the map: Prepare Map / Assign to Parent / Update Existing Map in the tile's hover/focus cog; equal Export RDX / Send to NPCDex at the selected-map heading. The Map Setup view holds configuration, not a second duplicate action toolbar. NPCDex retains its original contextual planning controls and Tray 2 settings groups. These existing user-directed placements are carried forward.

**Decision:** Owner approved October 21: “Approved—keep the character tools inline in Tray 3. Proceed to the next decision.” No installed UI has changed.

## Decision 3 — Default location images

Automatic supported-ROM location imagery is already a required feature; this decision chooses its presentation defaults.

**Approved defaults:**

- A map/route tile uses a representative outdoor overview.
- A building or dungeon entrance tile uses a crop of its actual exterior/entrance within the parent area, when the source mapping supports it.
- An interior or floor tile uses a view of that exact room/floor. Sprout Tower's parent tile therefore shows its entrance/exterior, while its 1F/2F/3F descendants show their respective interiors.
- Selecting a location opens the larger view in Tray 3 with its available exterior/interior/floor choices. Preview corrections remain inline: choose a view/crop or keep a manual image. No extra permanent toolbar is required.
- If the exterior association is uncertain, label it unresolved and use a clearly labeled available interior rather than choosing an unrelated building image. Unsupported rendering remains explicit.
- Generate defaults automatically during preparation. Preserve owner-selected views, crops and image overrides across re-preparation; flag source changes for review without silently replacing those choices. Include the chosen images in the portable map RDX/backend artifacts.

**Decision:** Owner approved October 21: “Approved—use those image defaults and preserve my overrides. Proceed to the next decision.” Actual recognizable rendering must still be proven under LP01 before implementation can be claimed.

## Decision 4 — Direct YouTrack edits

**Approved: automatically accept supported, non-conflicting presentation edits; review content/structural changes.** A mapped issue summary can update that record's display name in NPCDex and its managed RDX after validation. The record kind determines scope: renaming a shared profile affects its linked character views; renaming a placement affects its local label. Unknown fields and arbitrary comments are not interpreted as content edits.

For example, a supported rename from “Lab Assistant” to “Research Assistant” flows through without a second approval when the record binding and baseline match. A competing local rename is held for review with both versions preserved.

Changes to recorded dialogue, condition rules, parent membership or character links require an explicit validated review/correction route. Preserve exact extracted source evidence and history. A documentation correction does not claim that the ROM changed or that in-game testing passed. Invalid structures, unmapped fields or unsafe cross-map moves remain blocked rather than being inferred from prose.

Accepted changes update the current NPCDex view and managed working RDX durably, with visible local/pending/verified status. Apply dependent changes together; never silently overwrite newer work. Existing user image overrides remain protected by Decision 3. The normal coding-agent implementation return remains the task-attached, authorized RDX route with mandatory human testing.

**Decision:** Owner approved October 21: “Approved—automatically apply safe name updates, and require review for content changes and conflicts. Proceed to the next decision.” Exact additional editable fields and native storage mapping remain part of the consolidated contract; no global YouTrack configuration change is assumed or authorized.

## Decision 5 — Agent results for plain-English requests

**Approved: preserve automatic reconciliation for precisely bounded results; review the exact returned differences for prose-only requests.** The user can keep writing ordinary contextual instructions without a Draft/Ready gate or a compulsory structured editor.

For example, a package containing an exact supported dialogue replacement can be matched to its validated return and applied automatically when authorization, scope, identity, baseline and other checks pass. A request such as “Make the assistant explain the next objective more clearly” authorizes agent work through the same explicit package/task handoff, but the application cannot deterministically establish which wording or additional effects the prose permits.

For that prose case, discover and validate the task-attached returned RDX automatically, then show its exact before/after dialogue and any other changed fields. The owner explicitly accepts or rejects the concrete result before it updates NPCDex/NPCD and the working RDX. Current content remains unchanged while review is pending. Review cannot bypass invalid identities, missing source/output evidence, wrong package bindings or incomplete dependent groups; additional requested scope needs explicit authorization. Superseded results and newer-local conflicts retain their existing review rules.

Both routes retain mandatory Needs Human Testing and an open task until the owner verifies the ROM. Approving the returned data is not passing in-game testing. No runtime AI interprets the request, expands authorization or generates instructions. Review is part of the existing returned-work interface, not a new permanent toolbar.

**Decision:** Owner approved October 21: “Approved—require review of the exact returned changes for open-ended requests. Proceed to the next decision.” The current prose-only validator limitation remains to be implemented under MX08; this design does not claim that route already works.

## Decision 6 — Storage cleanup boundaries

**Approved: automatically trim proven-disposable caches; review backups/history cleanup.** This is a design policy, not authorization to delete files during MX01. MX07 must inspect actual storage and establish bounded cache budgets before enabling cleanup.

- Eligible automatic candidates are unreferenced, reproducible cache copies or completed temporary files whose successful checkpoint is verified. Protect files in use, pending imports, interrupted operations and recovery checkpoints. Availability of the exact reconstruction source must be verified; a remembered path to a missing ROM is insufficient.
- Images stored inside a working RDX are map content, not disposable thumbnails. Preserve owner overrides, current/prepared map files, local edits, queued operations, source evidence and remembered credentials.
- Preserve package baselines, outstanding returned-work reviews, mandatory testing/history and rollback/recovery dependencies. Do not silently compact or prune these as ordinary cache cleanup.
- Older installers, complete backups and retained historical material require a concrete itemized review showing size, dependencies and what remains available. Honor the user's established preference for collecting approved obsolete files into a clearly marked manual-delete folder. No speculative cleanup targets or arbitrary age-based save deletion.
- Expose storage usage and cleanup access through grouped map/application data tools, with an explanation of what is rebuildable. No new permanent header control is required.

**Decision:** Owner approved October 21: “Approved—automatically clean up disposable caches, but require review for backups and history. Proceed to the next decision.” No files are deleted or moved by this review.

## Decision 7 — Readable backend content kinds and nested hierarchy

**Approved: use explicit content kinds with native parent links, retaining task-tier terminology for actionable plans.** The physical NPCD tree is Region → Map → nested Zone/Building/Floor → Placement/Interactive Element/Scene. Zones can nest as deeply as the actual location requires. A shared Character Profile is referenced by appearances and is not duplicated into every physical branch.

For example: Johto → Violet City → Sprout Tower → 1F → Sage placement. Tower 2F/3F remain siblings of 1F beneath Sprout Tower, and all remain inside Violet City's one RDX. Readable record labels distinguish “Marill — Character Profile” from “Marill — Outdoors Placement”; stable record identities, not titles or sprites, determine whether records are duplicates.

Preserve existing published issue identities and links during any correction. Store the explicit domain kind in versioned NPCDex metadata and display it with the verified parent tree, issue link and publication state in YouTrack Mapping. Do not force nested floors into a fixed four-level task hierarchy. Shared profiles and system/registry records are separated from the default physical-content view but remain inspectable.

Epic/Saga/Story/Verse remain the ROMDex task-plan tiers in PMON. Their earlier use for NPCD remains an organizational analogy, not a restriction on physical nesting or a claim about current native YouTrack Type values. No new global issue types, administrator intervention or project-field mutation is required by this proposal. Any optional native Content Kind field is separately reviewed project setup, not assumed present.

**Decision:** Owner approved October 21: “Approved—use explicit content kinds and nested parent relationships in NPCD, keeping Epic/Saga/Story/Verse for ROMDex tasks. Proceed to the next decision.” This describes the intended inspectable mapping; fresh live hierarchy proof remains MX06, not part of MX01.

## Decision 8 — Existing and newer-format RDX compatibility

**Approved: upgrade supported older managed documents on save, preserving a recoverable original and all existing work.** Importing a file continues to leave the external source file unchanged. The application validates and previews the import before creating/updating its managed working copy; there is no extra per-file format wizard for a supported conversion.

- Preserve stable identities and bindings, nested hierarchy, exact images/owner overrides, source evidence, notes/flags, plans, package references, history and outstanding testing. Commit the converted working document atomically with recovery; do not republish content solely because its format changed.
- Do not invent new condition evidence from old timeline labels. Retain legacy annotations/labels in a clearly identified legacy/reference view; show missing condition analysis as unresolved until actual source evidence supports it. If a target cannot be mapped safely, retain the original annotation and require review rather than attaching it to an unrelated passage.
- Existing images remain usable. Mark missing generated location previews as pending/unsupported until the renderer can produce them; a format upgrade is not proof of successful rendering or extraction.
- For an RDX requiring unsupported newer capabilities, allow only a safe supported metadata preview or refuse opening with a clear explanation. Block editing, resaving and publication that could discard unknown content. Do not pretend to fully display an unsupported payload.
- Preserve the established one-map scope. Conversion does not combine maps, replace current content with archived data, reset a queue or change saved connections.

**Decision:** Owner approved October 21: “Approved—automatically upgrade supported older RDX files while preserving originals and all existing data. Proceed to the next decision.” Exact capabilities, wire representation and acceptance cases are now in the [concrete feature contract](MX01-Contracts/README.md), awaiting consolidated acceptance.

## Proposed layout and tool placement

| Location | MAPDex | NPCDex |
| --- | --- | --- |
| Shared header | Existing workspace control, Auto-Sync, Save Changes and centered connection light | Same components and geometry |
| Tray 1 | Open ROM; map catalog; nested zones; readable location thumbnails | Import RDX; current map catalog; nested zones and thumbnails |
| Hover/focus cog inside map tile | Prepare Map first; Assign to Parent; Update Existing Map | Import/update/organization actions with reviewed published-map regrouping |
| Selected-map heading | Equal Export RDX and Send to NPCDex actions; preparation/delivery state | Current map, local-save and cloud-delivery state |
| Tray 2 | Area/entity browser; Content and Map Setup views; contextual settings | Same browser; Add Character to the left of gender selector; existing standard cog |
| Map Setup | Included areas, nested grouping, preparation and source-project/build settings | Map Data view and inspectable backend mapping |
| Tray 3 | Selected identity and placement, actual source dialogue, readable access requirements, source evidence; contextual name/thumbnail/link/detach tools | Current content plus contextual proposals; familiar FINAL/CHANGE/REMOVE and Flag Prompt/Add Note controls |
| Tray 2 cog | Grouped map setup/inspection controls | Map Data: Data/Flags, mapping and imports; Planning: Package Map Changes; Delivery/Review: linked work, returns and testing |
| Bottom Timeline | Only conditions affecting the selected map and descendants | Same conditions and effects, with actual aggregate review/testing state |

Preparation stays local. Send to NPCDex is an explicit handoff with review and visible progress. Export RDX and Send to NPCDex have equal hierarchy and dimensions. Cloud delivery remains separate from local saving and honors the shared setting plus any explicit NPCDex pause.

Implementation must reuse existing suite header/settings/status components and the original contextual planning controls; the mockup is a layout proposal, not a replacement specification for their exact CSS. No persistent expand/collapse button is added. Preserve the existing context-sensitive TAB behavior, ordinary form navigation, one-step Close/Escape and focus return. Inputs/buttons require consistent padding and checkbox-label gaps; dialog footers remain outside their scrolling form body.

## Condition contract summary

- A condition describes a source requirement; an effect identifies the exact placement, prompt/passage, scene or script behavior it affects. Presence, dialogue selection and script execution are distinct effects.
- Preserve set and unset checks, variable comparisons and full AND/OR/NOT predicates with source branch/call evidence. A flag write is not itself an access requirement.
- Include a condition in a map only when source evidence connects it to that map's content or a nested area. A shared script bank alone does not establish relevance. A prerequisite may be set elsewhere and still affect this map.
- Roman numerals are display indexes, not time order, condition identity or a claim that independent flags are sequential milestones. Display names can be corrected without changing stable references.
- Readable labels sit beside inspectable raw identifiers and exact source locators. Unsupported dynamic/native behavior is explicit unknown data with retained evidence, never guessed truth.
- Review flags/notes and review/testing lights remain separate from ROM flags. An unreviewed status must not be represented as Needs Testing. Accepted agent results always require human testing; tasks remain open until the owner verifies them.
- The normal initial view must expose the map's content without assuming a saved game's progression. Condition inspection is reversible and must not strand always-available or unresolved content.

## Portable-data and image contract summary

- Require `org.romdex.npcdex.condition-effects-v1` for `NPCDexConditionIndex/1` and `org.romdex.npcdex.location-previews-v1` for `NPCDexLocationPreviews/1`, using the existing RDX envelope. Exact carriers, feature bindings and backend negotiation are defined in the concrete contract. Unsupported readers must reject unsafe mutation or open a supported read-only metadata preview; they must not drop fields silently.
- Keep one map per managed/exported RDX, including its nested areas, referenced shared dependencies, exact asset bytes and existing work. Stable map/entity/passage references survive renaming and ROM-build lineage review.
- Preserve current content, proposals, notes, flags, images/overrides, history, linked package baselines, queue operations and human-testing obligations across upgrade/export/import/backend reconstruction. No archived seed replaces newer work.
- Generated location images carry their target, source dependency hashes, renderer/version, selected view and image hash. Cache unchanged images and retain explicit owner overrides. Another instance can display the portable images without owning the ROM.
- Automatic exterior/interior/floor rendering remains required supported-ROM work under LP01–LP03. The mockup's placeholders are not proof of rendering. Unsupported resources get precise warnings; no AI image, stock image or point grid substitutes for a recognizable ROM render.

## Final consolidated decision — approved

Accept the concrete contract, schema/example fragments, reviewed MAPDex/NPCDex layouts and eight recorded policy choices as MX01's implementation baseline. This final review covers exact condition/effect/source references, required feature gates, one-map storage, image provenance/overrides, native edit scope, nested hierarchy, safe upgrade/recovery, retention and returned-work/testing authority.

Owner accepted October 21: “Approved. Mark MX01 complete. PASSKEY — proceed with MX02 and MX03”. MX01 is complete. The same message supplies the required new PASSKEY for MX02 and MX03, in order. Stop before LP01 afterward. The existing later sequence remains LP01 → MX04 → LP02 → LP03 → MX05 → MX06 → MX07 → MX08 → MX09 → RI03C → U28–U30; notifications follow the principal release.

## Review verification

The illustrative interface was checked for map-dependent condition lists, condition selection, workspace switching, tile settings, map tools, Escape/Close and narrow-layout overflow. The initial comparison's optional flag-state interaction was also checked before the owner chose Inspector. The revised inline tools retain visible source dialogue at 736px and 320px widths, with no overflow or script errors.

Twenty-one focused design checks passed for the schema's used construct subset, fictional feature fragments, references, unsupported expressions, missing coverage, unresolved presence guards, three-valued logic and image selection/crop/provenance constraints. See [design verification](MX01-Contracts/design-verification.json). This is not a general JSON Schema certification or complete RDX/asset validation. It does not prove ROM extraction, actual image rendering, cloud mapping, migration or installed behavior. No application suite or installer was rerun for this design-only task.

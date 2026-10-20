# RI01 — Approved ROM-Only Extraction Scope

Approved by the user October 19, 2026, including map-specific timelines with Roman-numeral labels. RI01 is complete. This approves the design baseline and task sequence; each implementation task requires a separate PASSKEY. The production extractor/workspace and live-data replacement have not been implemented or authorized by this approval.

## The requirement

ROMDex must read the supplied `.nds` itself, generate map JSON/assets and compile a usable one-map `.rdx`. It must not depend on an editable project, another agent's extraction, DSPRE export folders, hand-authored dialogue or an AI service. Open-source format readers/tools may be incorporated with pinned versions and appropriate license/attribution review. The final app must bundle its required runtime and work offline for local extraction/import.

The original ROM stays read-only. This feature reads and exports; it does not patch, rebuild or run the ROM. Actual ROM changes remain the coding agent's separate task-bound workflow.

## What this investigation established

The input is `0.6.3_noduplicates.nds`, 192,240,096 bytes, SHA-256 `cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd`. Its header identifies `POKEMON HG`, English game code `IPKE`. Its 537 filesystem entries include 384 named files and 308 NARC archives. All inspected filesystem/archive ranges fit the supplied file. No ROM payload was uploaded or changed.

The expected English HeartGold ARM9 header-table location contains structurally consistent records. Nineteen ARM9 pointer literals reference that table's RAM address. This supports the candidate layout; it is not proof that every runtime path uses it, nor that every retail constant applies to the modified build.

New Bark Town is the recommended first proof map, containing eight physical map headers: **60–66 and 384**. They resolve to script banks **842–849**, message banks **542–549**, and event banks **57–63 and 341**. Their location-name entries decode to New Bark Town. Public retail area names are useful annotations, but the authoritative hierarchy must be checked against this ROM's headers, warps and scripts rather than imported from a vanilla content list.

| Probe result | What it means |
| --- | --- |
| 24 overworld placements | NPCs and other placed objects, not a promise of 24 distinct named characters. |
| 230 message entries | All entries in those banks decoded without unknown character codes. Some may be unused or share context; they are not automatically 230 distinct spoken prompts. Control codes remain explicit. |
| 52 local script entry points | A bounded walk using public fixed-width command definitions found no unknown instruction widths in these local flows. This does not resolve every native command's meaning, movement list, shared script, external message or runtime condition. |
| 1,656 sprite-table rows | A relocated table was found through overlay 1's pointer into overlay 131. Relevant static entries resolve to BTX0 texture members. Dynamic sprite ID 101 is not a static table row and needs conditional resolution. |

This is **ROM-only feasibility evidence**, not a finished extraction/RDX/YouTrack POC. Sprite rendering, complete dialogue attribution, shared calls and fresh RDX import/readback still have to pass the proof tasks below.

## Proposed initial coverage

Read the actual map catalog and let the user select a map/zone. Violet City's outdoor area and seven interiors form **one logical map RDX**, with physical areas represented as sub-zones. Reuse the existing region → map → sub-zone → entity model, shared character profiles/local appearances, assets, locators and portable revision machinery.

The extractor should retain:

- Header/map IDs, physical-area relationships, warps, NPC/object local IDs, placements, sprite references, visibility flags and interaction/trigger links.
- Exact message/control data, gender alternatives, script entry points and branches, concrete variable/flag conditions, relevant shared-script/external-message dependencies, and movement/event references. The output must distinguish bank entries from actual dialogue prompts and keep ambiguous attribution visible.
- ROM-derived appearance images with the correct textures/palettes and conditional alternatives. Never substitute a stock sprite when this ROM supplies a different one.
- Stable entity/prompt identities, the source ROM/resource hashes and exact archive/member/script/message selectors needed by the implementing agent. Offsets remain revision-specific evidence, not permanent identity.
- Coverage diagnostics and retained references for unsupported native behavior. Unknown commands/data must not be guessed, silently skipped or described as fully decoded. A structurally complete snapshot is permitted only for explicitly surveyed parents; ordinary incomplete extraction stays partial and cannot silently archive omitted content.

A static extractor cannot determine every possible playthrough or assign editorial story meanings to all flags. It must preserve actual predicates and identify unresolved behavior. Human-friendly character names and scene titles are editorial metadata where the ROM does not uniquely encode them. Use ROM-proven names where available and stable neutral labels otherwise; allow user corrections. Do not invent character identities or manufacture story-stage assignments to fill the UI. This is a review/enrichment step, not a dependency on another agent's prepared JSON.

### Each map defines its own timeline

User clarification: each map/zone RDX must carry its own clearly defined timeline, based on changes and stages that actually affect that map. There is no compulsory global timeline, fixed ten-stage limit or required A–J progression for newly extracted maps. Sub-zones within one map RDX use that map's timeline; a zone maintained as its own RDX has its own timeline.

Display stages with **Roman numerals: I, II, III, IV, …**, followed by a descriptive name and the relevant event/access condition. This preserves the current build's visible Roman-numeral convention. The current source uses legacy A–J identifiers behind that presentation; these are internal references, not the required labels or future stage vocabulary.

Derive relevant milestones from this ROM's dialogue/event/visibility changes and dependencies. Shared world flags may be referenced by several maps, but each map selects only those that affect its own content. Retain gender, time-of-day, optional branches and independent flag predicates without forcing them into a false universal linear progression. Where sequence or meaning is ambiguous, show the actual condition and the uncertainty for review rather than inventing an ordering. Human-friendly stage names/order can be corrected without another agent preparing content JSON.

Stage identity, ordinal and display label are separate. Each stage has a stable map-scoped identity; Roman numerals are generated from that map's displayed order. Renaming/reordering stages must preserve attached prompts, plans, flags, notes, source mappings and testing history. Never join stages across maps merely because both are labeled II. Include the complete map-specific timeline and references inside exported RDX files so another instance reconstructs the same view offline.

The native projection and legacy validation currently still require one ten-stage definition. Removing that assumption is explicit implementation work, not something this scope claims already exists. Prove two maps with different stage counts/orders, switching between them, and export/import round trips. Existing saves retain their identities and Roman-numeral appearance; any timeline conversion needs a previewed mapping rather than silent reassignment. If new capabilities require a format/compatibility declaration, older clients must reject unsupported requirements clearly instead of misreading them.

Repeat extraction of the same ROM must reuse identities. When comparing a newer build, retain the existing RDX/identity registry and its plans, flags, notes, views and testing history. Changed IDs, moved events or ambiguous matches require previewed review rather than new duplicate records. ROM hash changes alone must not create a new map identity. A first-time user needs only the ROM; an existing map's own saved RDX/registry supplies its editing lineage.

## Proposed proof and implementation tasks

Keep RI01 as the investigation/design gate. Refine the earlier RI02/RI03 umbrella tasks into separately authorized steps:

| Task | Deliverable and acceptance | Model / effort |
| --- | --- | --- |
| RI02A — ROM reader and source mapping | Bounded read-only reader, build fingerprint, actual header/relocation discovery, map/warp/event inventory and portable locator/identity manifest. Validate ranges/references; detect unsupported builds and ambiguity explicitly. No external editable project or prepared map input. | Sol / High |
| RI02B — Dialogue, events and appearance extraction | Resolve the eight-area Violet City proof's local/shared dialogue dependencies, control/gender branches, visibility conditions and dynamic sprites. Derive this map's relevant timeline milestones and retain concrete predicates/ambiguities. Render the ROM's assets. Compare decoded structures to their exact source locations; account for each relevant object, message reference and unresolved dependency. Native behavior that cannot be interpreted remains explicit and cannot be counted as understood. | Sol / High |
| RI02T — Map-specific timelines and Roman-numeral stages | Remove global/fixed-ten-stage assumptions across native/legacy projection, validation, filtering/editing and portable mapping. Use each map's stable timeline references, descriptive conditions and Roman-numeral labels. Verify maps with differing stage counts/orders, switching, legacy preservation, renamed/reordered stages and RDX export/import; preserve notes/plans/testing. Complete before the real-map round-trip proof. | Sol / High |
| RI02C — Compile and prove the real one-map RDX | Build VioletCityMap.rdx directly from the ROM-only extraction, validate/unpack/repack, import into an empty isolated profile, display both gender views and images, save a local note/flag/change, publish only clearly marked isolated YouTrack records, accept a reviewed native edit, then export/reimport into another empty profile. Preserve exact content/assets, stable identities, proposals and human-testing obligations; clean owned test records. No production reset or queue resumption. This is the decisive POC. | Sol / High |
| RI03A — Review ROM Import workspace design | Review map selection/grouping, build support, coverage warnings, preview, existing-map matching, map-specific timelines and explicit import/export. Confirm Roman-numeral stage names/conditions, neutral character names and unresolved conditions without disrupting familiar NPCDex editing. Approve a concrete design before implementation. | Sol / High |
| RI03B — Implement the offline workspace | Wrap the proven decoder/compiler with native file selection, progress/cancellation, bounded scratch use, explicit actions and recoverable checkpoints. No AI, source-project requirement, automatic publication or task dispatch. ROMs stay outside application backups/releases unless separately requested. | Sol / High |
| RI03C — Coverage and integrated feature acceptance | Check a contrasting second area such as Route 29, plus a structurally different scene/interior selected from actual inventory. Verify repeat extraction, newer-build comparison, ambiguous identities, malformed/unknown formats and preservation of user edits. Document supported coverage and honest per-map limitations before U28. | Sol / High |

RI02C must succeed before the feature is considered to have replaced the other agent's extraction work. Parsing archives or producing plausible text alone does not satisfy it. Existing production maps remain protected; any later replacement needs a fresh accepted preview and verified backup.

## Tools and boundaries

Prefer a small deterministic adapter integrated with the existing RDX compiler. DSPRE, pret/pokeheartgold and ndspy provide useful format/reference implementations; no tool's retail compatibility claim establishes compatibility with this modified build. Resolve relocation/custom formats from this ROM. Pin any adopted component, review its redistribution requirements before packaging, and retain required notices. Do not make the user install a full editor or invoke its write/repack workflow simply to extract a map.

No new cloud provider, token, billing setup or production data migration is needed for RI01. The later isolated cloud proof uses the existing protected connection through the established Windows verification route. A live helper should be requested only when those checks are ready.

Public references inspected:

- [DSPRE](https://github.com/DS-Pokemon-Rom-Editor/DSPRE/tree/e751187b45d6ddf237a24dab8407a5a6cf0d36dd), particularly [RomInfo](https://github.com/DS-Pokemon-Rom-Editor/DSPRE/blob/e751187b45d6ddf237a24dab8407a5a6cf0d36dd/DS_Map/RomInfo.cs), [event format](https://github.com/DS-Pokemon-Rom-Editor/DSPRE/blob/e751187b45d6ddf237a24dab8407a5a6cf0d36dd/DS_Map/ROMFiles/EventFile.cs) and its [license](https://github.com/DS-Pokemon-Rom-Editor/DSPRE/blob/e751187b45d6ddf237a24dab8407a5a6cf0d36dd/LICENSE). References distinguish relocated HGSS sprite tables from vanilla fixed offsets.
- [pret/pokeheartgold](https://github.com/pret/pokeheartgold/tree/6988158691eb6178cff697cda0428045ddcba5fb), including [map header structure](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/map_header.h), [script encodings](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/asm/macros/script.inc), and [message allocation/encoding](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/tools/msgenc/MessagesConverter.h). These are public format references, not an editable copy of the user's project.
- [ndspy NARC documentation](https://ndspy.readthedocs.io/en/stable/api/narc.html) describes container-level reading; it does not supply game-specific NPC/script interpretation.

## Accepted decision

The user approved the ROM-only requirement, New Bark Town eight-area POC, map-specific timelines with Roman-numeral stage labels, explicit semantic limits and the refined sequence **RI02A → RI02B → RI02T → RI02C → RI03A → RI03B → RI03C**. This completes RI01's scope gate only. The next implementation task, RI02A, still needs its own PASSKEY.

## Authorized testbed revision — October 20

The user replaced the active proof map with **Violet City** to prevent conflation with existing data. Its ROM location section 128 decodes to Violet City and contains headers **73, 135, 157, 158, 159, 160, 162 and 167**. Sprout Tower has a separate ROM location identity and is outside this map group. RI02B/RI02T/RI02C use this fresh isolated group and VioletCityMap.rdx. Earlier New Bark probe results above remain historical evidence, not input content. No production data replacement is authorized.

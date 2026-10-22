# MAPDex and NPCDex Pipeline Audit and Workflow Design

Review date: October 21, 2026. Application baseline: ROMDex 0.5.26. Assessment and design proposal only.

## Executive finding

The pipeline can extract source material, produce portable map files, retain identities and assets, and transport versioned records. It does not yet consistently turn that material into the accurate, organized map overview needed for planning. The most consequential failure occurs before transfer: dialogue branches and availability are poorly translated into NPCDex timeline assignments. A successful import can therefore produce a structurally valid map that is difficult to understand and unsuitable as a reliable change-planning baseline.

The UI compounds this problem. MAPDex separates the selected entity, its editing controls and its source evidence; mixes map setup with character cleanup; and exposes script-state descriptions as if they were useful story stages. NPCDex then displays the consequences as empty stages, weak names and a large collection of unresolved conditions. Repositioning controls alone cannot repair these semantic gaps.

The recommended order is to establish meaningful extraction and timeline behavior, align both workspaces around the existing NPCDex tray arrangement, expose backend mappings and delivery truth clearly, then prove the complete change-request and agent-return cycle. Preserve the existing RDX identity, recovery, authorization and testing machinery. The archived save is a usability reference and comparison oracle, never an automatic replacement for current work or proof that its old interpretation matches the supplied ROM.

The owner’s October 21 clarification defines the Timeline as the selected map’s relevant ROM event conditions and their effects on dialogue, scripts and presence. It is not a global story progression or a collection of scene excerpts. This supersedes this report’s earlier emphasis on arranging generic narrative milestones. Route 29 and New Bark Town require independently derived condition sets; they share an entry only when the same source condition actually affects both maps.

## 1 Intended responsibilities and data ownership

| Component | Responsibility | Successful result |
| --- | --- | --- |
| MAPDex | Read a supported ROM without changing it; identify map groups, nested areas, placements, dialogue, conditions, scripts and appearance assets; organize a local preparation. | One comprehensible, source-mapped RDX per logical map, with all included descendants and honest unresolved findings. |
| NPCDex | Display current map content and conditions accurately; let the user organize documentation, review dialogue, stage proposed changes and prepare work. | Current content remains separate from proposals; every proposal has a clear target and scope. |
| ROMDex | Hold actionable PMON tasks, selected JSON Map Packages, explicit authorization and progress. | The user knows which task and fixed package authorize work. NPCDex does not dispatch an agent. |
| YouTrack | Store NPCD content records and their hierarchy; carry actionable PMON tasks, agent files and returned RDX attachments. | Stable record bindings and verified publications support reconstruction without interpreting arbitrary prose as structured content. |
| Coding agent | Read the authorized task/package and actual ROM; implement changes; produce a correctly bound returned RDX and announce readiness for testing. | Returned content describes the ROM actually produced, retains stable identities and reports incomplete work. |
| ROMDex reconciliation | Discover and validate returns, apply eligible independent groups, publish accepted content and checkpoint the managed RDX. | Newer proposals and unrelated edits survive. Conflicts require targeted review. Human testing remains outstanding. |

The normal cycle should be:

```text
Supported ROM
  → MAPDex extraction and local preparation
  → reviewed handoff into NPCDex
  → verified NPCD publication
  → contextual planning in NPCDex
  → fixed JSON Map Package attached to a chosen PMON task
  → explicit task/package authorization and separate agent handoff
  → ROM changes and returned map RDX attached to that task
  → validated automatic reconciliation or a specific review
  → NPCDex, NPCD and the managed map RDX updated
  → human testing, followed by explicit task completion
```

The managed map RDX is the local portable checkpoint. NPCD supplies verified cloud revisions and native parent relationships. Neither a filename nor the latest timestamp chooses authority. MAPDex preparation is a separate local candidate; it must not silently replace a newer accepted NPCDex map. A portable export carries content, assets and feedback, but does not grant cloud-write authority or human verification. Full recovery still requires the complete application Data backup because bindings, authorization and recovery journals are not all portable map content.

“Accurate” should mean that asserted content and mappings agree with the supported ROM, with an explicit account of unresolved behavior. A reviewable partial import may remain allowed, as previously approved, but must retain its interpretation warnings in NPCDex and exports. A generic warning acknowledgement must never turn unresolved coverage into verified completeness. Corrupt source structures and unusable target mappings still block import.

## 2 Evidence and comparison with the archived save

### 2.1 Confirmed New Bark Town regression

The comparison used the three working map RDX files inside the protected October 20 archive and the current New Bark Town preparation and NPCDex working files. The archive was read without restoration. A dialogue/event group below is a stored point, not an individual line or speaker turn.

| Measurement | Archived New Bark Town | Current New Bark Town |
| --- | ---: | ---: |
| Current domain records | 79 | 95 |
| Dialogue/event groups | 91 | 68 |
| Groups with a stage assignment | 66 | 3 |
| Groups without a stage assignment | 25 | 65 |
| NPC appearance groups | 60 | 24 |
| NPC appearance groups with stage assignments | 43 | **0** |
| Timeline entries | 10 familiar milestones | 12 source-state descriptions |

The current MAPDex and NPCDex files have matching timeline definitions and entity stage assignments. Transfer did not strip these assignments: the preparation already lacks them. Different grouping strategies mean the count differences do not establish missing dialogue or missing characters. A source-level coverage reconciliation is needed to distinguish consolidation, omitted interpretation and actual loss.

The archived milestones include New Game, First Steps, Elm’s Research and Return Home. The current labels include long scene excerpts and command names. Neither label set is the acceptance target: the required view identifies this map’s actual access conditions and their effects. It must not copy the old global ten-stage timeline into every map.

### 2.2 Root cause in the compiler

`rom/compile-map.mjs` gathers reachable flows and message sites under each root. Its own metadata says this represents static possible sites, not linear playback. A point receives a stage only when its root has an equality predicate matching an observed scene-variable value. Ordinary object interactions generally do not enter through that narrow path.

Consequently, mutually exclusive dialogue can be collected together without useful branch-level stage assignments. Extracted visibility flags and other predicates remain in source evidence, but are not fully translated into the overview’s availability model. `rom/source-context.mjs` improves labels using nearby text and actions; it does not establish the required access-condition/effect relationships. The native `workspace-runtime.js` selects a map’s referenced stage list and displays lights for assigned points, so missing assignments still produce empty stages. Existing map references do not prove the displayed list is relevant or free of stale cross-map state.

### 2.3 What the existing work does establish

Keep the bounded ROM reader, source locators, exact asset hashing, one-map RDX container, nested-zone records, separate profiles/placements, managed checkpoints, immutable packages, stable backend bindings, conflict preservation and mandatory human testing. These are useful foundations.

Historical proofs establish isolated transport and recovery behavior. They do not establish that every imported map is understandable, that every branch is correctly assigned, or that the actual coding-agent environment has completed a real ROM change and returned it successfully. Current read-only connector access authenticated as GenericCola and exposed the NPCD field schema, but an NPCD issue search returned no visible issues. This audit therefore does not certify a fresh production hierarchy readback or current cloud delivery completion.

The accompanying evidence JSON records source hashes, map-file hashes, counts and the prepared-to-NPCDex comparison. No extraction, installer, broad regression suite or backend write was repeated for this assessment.

## 3 Function gaps and workflow regressions

Priority meanings: **Blocker** prevents the core workflow from meeting its stated purpose; **High** causes substantial confusion, manual repair or unsafe interpretation; **Medium** impairs efficiency or supportability. Evidence distinguishes current code/file findings, historical observations and acceptance still required.

| ID | Priority | Finding and evidence | Required correction |
| --- | --- | --- | --- |
| F01 | Blocker | **Timeline availability is largely unpopulated.** Current file comparison: none of 24 NPC appearance groups has a stage assignment. | Derive prompt availability from source conditions and carry it through preparation, RDX, NPCDex and cloud reconstruction. |
| F02 | Blocker | **Possible branches are flattened into root-level groups.** Compiler traversal retains possible message sites without a proven spoken sequence. | Preserve branch predicates, choices, shared-call context and speaker associations at the point where they affect text. Show alternatives separately. |
| F03 | High | **Observed variable values and dialogue excerpts are presented as a timeline.** They do not explain which event conditions control the current map. | Build the map’s relevant condition/effect index. Show required flag states, scene-variable comparisons and affected content; retain independent conditions without forcing a linear story sequence. |
| F04 | High | **Presence and availability evidence is not fully expressed in the overview.** Visibility flags exist in extraction metadata; current stage assignments do not make that evidence usable. | Evaluate supported visibility predicates per stage/context. Distinguish present, absent and unresolved; never infer absence from a missing assignment. |
| F05 | High | **Coverage lacks an actionable completeness account.** Neutral placeholders and unassigned text preserve bytes, but do not explain what the user can safely plan against. | Give each area an inventory of resolved objects/prompts and named unresolved dependencies, with direct navigation to each affected item. |
| F06 | High | **Naming remains approximate.** Current presentation uses source speaker labels, sprite roles, short dialogue cues and a small role table. | Show a short name plus location/role, retain naming basis, distinguish suggestions from confirmed identity and allow persistent overrides. Do not require AI naming. |
| F07 | High | **Display assets are not always resolved.** Front-frame handling was corrected, but unknown frame families, palettes and dynamic sprite dependencies remain. | Preview each candidate immediately, preserve per-placement overrides and show a neutral unresolved state when runtime evidence is insufficient. |
| F08 | High | **Location recognition is incomplete.** Friendly reference names can be wrong when a modified ROM changes a building’s use; rendered zone previews remain scoped future work. | Preserve reference/source names separately from reviewed names. Provide area context now; implement recognizable spatial previews through the separate preview scope. |
| F09 | High | **Character linking is not a complete identity-management workflow.** Linking exists, but the current menus are limited to the map and do not present an equally clear detach/reassign action. | Provide inspect placements, link, change shared profile and detach placement with a before/after preview. Prove cross-map profile reuse separately. |
| F10 | High | **Grouping has an important boundary.** Nested grouping works, while combining independently prepared or published maps requires separate migration review. | Show this boundary before assignment. Provide a reviewed migration route preserving existing issue IDs, edits, files and descendants; do not recreate published content. |
| F11 | Blocker for broad compatibility | **Any Pokémon ROM is not supported.** The reviewed profile targets the supplied English HGSS build; some compatible layout changes can be validated. | Display the detected game/build and supported scope before extraction. Add separately tested adapters; never substitute another game’s offsets or names. |
| F12 | High | **Cross-build update design exists, but acceptance with two actual builds is pending.** Only one supplied build is available. | Retain project/build association and identity review; complete the two-real-build proof when a second build exists. Opening an older ROM must not roll back content. |
| F13 | High | **A local handoff can be mistaken for a completed backend integration.** Local import, queued binding and verified publication are separate operations. | Show both facts in the handoff result and an inspectable mapping tree. A successful local save must not imply that NPCD is current. |
| F14 | High | **Native hierarchy is not equivalent to native tier fields.** Publication uses parent links and domain record kinds. The live NPCD Type field offers Milestone, Task and Subtask, not Epic/Saga/Story/Verse. | Explicitly document and display the semantic mapping. Decide whether a dedicated project-level content-kind field is useful; do not silently alter global YouTrack configuration. |
| F15 | High | **Shared records look like duplicates.** A character profile can exist separately from its local appearances; registries and timeline records also exist outside the ordinary area tree. | Label record kind and full path in backend inspection. Separate shared profiles and system records from physical content navigation; compare identities before calling records duplicates. |
| F16 | High | **Native YouTrack edits have narrower meaning than “two-way sync” suggests.** Titles need reviewed documentation corrections; arbitrary prose/comments are not typed NPC content; parent changes need coordinated membership updates. | Provide a supported-edit matrix and a direct review action. Specify exactly how dialogue changes are authored and versioned. Never treat comment prose as automatic content instructions. |
| F17 | High | **Routine sync still has material overhead.** Latest recorded RI03P full-map checks: unchanged 9.3 s/109 requests; new note/flag delivery 34.8 s/209 requests; second-instance incoming update 58.4 s/276 requests. | Profile and reduce unchanged inventories and repeated reconstruction. Keep typing/navigation/local saves independent from network cycles. These historical timings are not current guarantees. |
| F18 | High | **Publication progress measures work units, not elapsed time.** Record/object counts and final verification are useful, but object costs vary. | Name the current phase and completed units, show last progress and actionable paused/review states, and never present the percentage as a reliable time estimate. |
| F19 | Blocker for unrestricted automatic returns | **Instructions-only requests cannot pass automatic result application.** The validator requires concrete packaged changes; prose-only returns remain blocked by the present review rules too. | Preserve prose planning. Add typed changes for supported operations and an explicit review route that authorizes an exact returned difference for prose work. Do not guess scope or claim universal automatic reconciliation. |
| F20 | High | **An ordinary re-extracted map is not an authorized agent return.** Automatic application requires the exact task/package/base, outcome groups, source evidence and agent-result envelope. | Provide a deterministic return-construction command that reuses the authorized baseline and validates identity preservation. Plain MAPDex export must remain a normal map document. |
| F21 | High | **Agent file-transfer capability is environment-dependent.** Ticket/comment MCP access does not by itself provide binary download/upload in the agent’s execution environment. | Include a one-time, non-production capability check and a versioned tool bundle. Reuse securely configured access; never ask for a token in chat. |
| F22 | High | **Completion records overstate end-to-end readiness if read as product acceptance.** Many source tasks are marked complete while integrated/live acceptance remains RI03C and U28–U30. | Track delivered implementation, supported coverage and accepted user workflow separately. Keep a small set of real user scenarios as release gates. |
| F23 | Medium | **Guides contain stale installed-version and activation statements.** Several still describe 0.5.15 or pre-integration states. | Produce one current user guide and compatibility matrix. Retain dated reports as history with clear supersession links. |
| F24 | Medium | **Retention is bounded without a complete long-term maintenance workflow.** Journals, previous files, manifests and histories accumulate; limits stop work rather than prune silently. | Add inspected storage usage and reviewed cleanup/export tooling. Preserve pinned package baselines, unsent work and recovery evidence. |
| F25 | High | **Map and location tile images are not generated or applied.** Extraction renders character textures; the compiler does not generate terrain/building/location previews, and the generic projection creates map/area/location objects without assigning their thumbnail images. | Add deterministic source-derived location rendering, automatic representative thumbnail selection, portable asset references and consistent display in MAPDex and NPCDex. This is missing implementation, not an inherent inability of the game engine to display its maps. |
| F26 | Blocker | **Timeline content does not meet map-specific relevance requirements.** The owner reports identical timelines across maps; the archived catalog also uses one shared ten-stage definition. New per-map references exist in code, but that alone does not establish the required behavior. | Derive and render only conditions affecting the selected map and descendants. Test Route 29 versus New Bark Town, selection/filter reset, shared-script dependencies and RDX/backend persistence; exclude unrelated conditions and stale selections. |

The highest-value change is F01–F04 together with F26. Assigning every NPC to every stage would make lights appear, but would fabricate availability and conceal the actual defect. The absence of imported testing approval is correct: new files should not inherit a trusted human pass merely because a prior save contained one.

### 3.1 Automatic map and location images

The owner clarified that map/building tile artwork should be automated wherever the source supports it. Treat recognizable map and sub-zone thumbnails as a required part of the supported-ROM workflow, rather than optional cosmetic polish. Initial generation may take time with visible progress; unchanged previews should then be cached.

For supported HGSS resources, the feasible route is to reconstruct a static view from the ROM’s map geometry, matrix/layout, building placements, textures and palettes, then render a thumbnail. The ROM need not contain a ready-made PNG of each location. DSPRE’s own documentation lists HGSS support, 3D map visualization, building-model viewing and map screenshot export. That establishes feasibility for this class of source data; it does not establish that ROMDex already renders the supplied modified ROM. [DSPRE project documentation](https://github.com/DS-Pokemon-Rom-Editor/DSPRE).

There are two current implementation gaps. The ROM reader/compiler has no complete static map/building renderer: its existing image output is character sprite frames, and its texture decoder also explicitly leaves compressed 4×4 textures unresolved. Separately, generated previews need a presentation path: verified image references must be attached to the correct map, nested area and location tile. Preserving NPC sprites alone cannot populate those tiles. Existing native presentation metadata supports retained images, but fresh compiled maps do not currently receive equivalent generated location artwork.

| Tile target | Automatic default | Optional user adjustment |
| --- | --- | --- |
| Parent map such as New Bark Town | Recognizable overview of its outdoor layout, with included areas clearly identified | Crop, camera and representative area; a parent without a meaningful single exterior can use a labeled overview of its children. |
| Building or nested zone | Exterior/model crop when the source provides an identifiable exterior association; otherwise the actual interior/location view | Choose exterior versus interior and the preferred view. Do not guess a building association from its name. |
| Floor or room | Preview of that exact physical area | Crop/zoom and representative camera. Do not reuse a generic town image on every floor. |

Generate defaults during preparation without requiring manual screenshot capture, AI image generation or a coding agent. Store image bytes, target identity, source hashes and renderer settings/version with the map RDX; publish their references through the normal verified backend route. NPCDex and another installation must display them without needing the original ROM. Recompute only when relevant geometry, textures or view settings change. Preserve owner-selected overrides across reprepare and reviewed ROM updates.

Place the representative thumbnail on the map/location tile in both workspaces. Selecting an area opens a larger source preview in the contextual pane, with entity/entrance markers only after coordinate alignment is verified. Its image selector/crop controls belong in that area’s settings, next to its preview. Use the suite’s existing hover cog and tile treatment; do not add another global image menu.

Static rendering is distinct from reproducing every in-game frame. Time-of-day lighting, weather, animated textures, scripted objects, runtime visibility and custom engine formats may require additional support. Label these specific omissions beside the preview. An unsupported resource should produce an explicit unavailable/partial-preview state, never invented artwork or an unexplained blank tile. The first proof must use the actual supplied ROM, including outdoors, an interior and a multi-floor location; adopting third-party code also requires dependency/license review.

## 4 UI issues and design principles

### 4.1 Current problems

| ID | Issue | Effect on the user | Design response |
| --- | --- | --- | --- |
| UX01 | Entity selection is in Tray 3 while name, image and linking controls sit inside Tray 2 Display Cleanup. | The user must remember which object is being edited while searching another scrolling pane. | Put object selection in Tray 2 and its editing controls beside its evidence in Tray 3. |
| UX02 | One setup column contains project linking, areas, grouping, testing, names, sprites, stage fields and output actions. | Tasks at different scopes compete; key actions disappear below long forms. | Separate map setup, selected-item editing and workflow review. Keep map output actions in a stable local header. |
| UX03 | Large dropdowns hide area relationships and give similar names little distinguishing context. | Finding and comparing entities becomes a memory task. | Use the existing tile vocabulary with area grouping, search and full breadcrumbs; retain compact row display where density helps. |
| UX04 | Long excerpt-based stage labels are truncated across a dozen timeline buttons. | Roman numerals imply progression while labels fail to explain access conditions. | Use short condition/event labels with required states and affected-content details. Roman numerals are display indexes, never proof of chronology. Do not hide essential meaning in a tooltip. |
| UX05 | The selected stage can be empty while the NPC has unresolved prompts elsewhere. | “No dialogue” looks like failed extraction or an empty character. | Explain the actual state and offer Show All Prompts or Review Unplaced Prompts directly in the empty pane. |
| UX06 | Character linking is inside a distant accordion and compares names without simultaneous source evidence. | Users cannot confidently determine whether placements are the same character. | Open a local comparison showing both areas, sprites, dialogue and conditions before linking. |
| UX07 | Map inspection, publication, return review and human testing are scattered across menus and long forms. | The next step and the difference between current content and pending work are unclear. | Give each workflow a clear entry point and retain links between the map, fixed package and task. |
| UX08 | Technical IDs and warnings dominate some screens while more useful semantic context is absent. | The interface exposes extraction internals without explaining the map. | Put names, location, role and dialogue first; place IDs and low-level evidence under Source Details. Keep unresolved work actionable. |
| UX09 | Prior releases had overlapping dialog footers, inconsistent spacing, duplicate note entry points and unreliable Close/Escape behavior. | Users lose confidence in saving, navigation and scope. | Retain the existing corrections as regression requirements; use shared dialog/spacing components rather than another bespoke form. These historical defects are not all asserted to remain in 0.5.26. |
| UX10 | Connection, save, availability, review and testing states can be mistaken for one another. | A healthy connection may be read as correct content or completed delivery. | Keep distinct state meanings with concise text details; preserve familiar lights without introducing an indicator dashboard. |

### 4.2 Principles applied to this suite

**Match controls to their scope.** Put character actions beside the character; map actions beside the map; task authorization beside the fixed task package. Microsoft’s command guidance supports placing frequent commands near the affected content and using contextual menus for secondary actions. Preserve the owner’s existing choice to access Prepare Map and Assign to Parent through the map tile cog. [Microsoft commanding guidance](https://learn.microsoft.com/en-us/windows/apps/design/basics/commanding-basics).

**Prefer recognition over recall.** Show the area path, sprite, source text and selected scope together. A user should not need to memorize Object 7 or a distant dropdown selection to edit a name safely.

**Disclose complexity when it matters.** Keep source offsets, raw controls and detailed recovery logs available without making them the first thing a planner sees. A warning must say which item is affected, what remains usable and which action resolves it. A generic acknowledgement checkbox does not repair a missing availability model.

**Keep navigation and feedback predictable.** Keyboard order should follow the visible workflow; ordinary Tab must continue moving through form controls. Preserve the suite’s pane-size Tab behavior only outside those controls. Close should work immediately, Escape should dismiss the topmost layer once, and focus should return to the invoking control. [W3C focus order guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

**Make controls comfortably operable.** Preserve the shared 10 px checkbox-label gap, shared button padding and consistent action spacing. Compact cogs need an adequate effective target even when their artwork is small. WCAG 2.2’s minimum target criterion uses 24 × 24 CSS pixels with defined exceptions; use larger effective targets where the layout permits. [W3C target size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

**Keep focus and status visible.** Dialog content must end above its action footer. Progress and save messages should be announced without taking focus; routine refresh must not reopen Connection Details or replace the user’s selection. [W3C focus visibility guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [W3C status message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

These principles guide the proposal; this audit is not a completed accessibility conformance test.

## 5 Recommended suite layout and complete tool placement

### 5.1 Preserve the existing NPCDex geography

Use the established NPCDex arrangement for MAPDex: Tray 1 on the left; Tray 2 across the upper work area; Tray 3 below it; the map timeline along the bottom. This lets preparation and planning use the same selection model. The earlier side-by-side mockup remains an alternative, not an approved redesign; consistency with the actual NPCDex screen now makes the stacked arrangement the preferred foundation.

```text
Suite header: workspace chooser · Auto-Sync · Save Changes · connection light
┌────────────────────┬──────────────────────────────────────────────────┐
│ Tray 1             │ Tray 2                                           │
│ Maps and zones     │ Selected-map header and contextual map actions    │
│                    │ Nested areas, characters, entities and scenes      │
│ Nested children    ├──────────────────────────────────────────────────┤
│ remain navigable   │ Tray 3                                           │
│ inside their map   │ Selected item: identity + condition + source text  │
│                    │ MAPDex: documentation cleanup / interpretation     │
│                    │ NPCDex: current content / proposed changes         │
│                    ├──────────────────────────────────────────────────┤
│                    │ This map’s timeline + unresolved conditions        │
└────────────────────┴──────────────────────────────────────────────────┘
```

Keep the red shell, green screens, yellow selection, shared settings artwork and existing header positions. Keep the workspace button small, red and without a drop shadow. Do not add another global settings cog, footer workspace switch or persistent expand/collapse button. Tile cogs remain inside the top-right corner on hover or keyboard focus, with an accessible context-menu equivalent.

### 5.2 MAPDex placement specification

The tables specify the proposed arrangement, including additions that are not implemented. The mapping inspector, convenient detach/reassign controls, direct MAPDex availability correction and prose-result difference authorization are among those additions. Existing working controls should be reused rather than replaced merely to fit the layout.

| Tool or information | Location | Behavior |
| --- | --- | --- |
| Open ROM, current ROM/project/build and map search | Tray 1 header | Open reads the source; changing ROM does not overwrite prepared maps. Show compatibility immediately. |
| Parent maps and nested zones | Tray 1 catalog | Show Sprout Tower beneath Violet City after assignment; it is no longer a separate top-level output map. |
| Prepare Map / Reprepare | Map tile cog, first relevant command | Available as soon as the map is selected. An unprepared Tray 2 state points to this command rather than burying another button below setup. |
| Assign to Parent / review grouping | Map tile cog | Select parent, preview complete descendant tree and any published-data migration implications, then confirm. |
| Update Existing Map | Map tile cog | Select existing target and run the saved whole-map update review; do not use a normal new-map handoff as a shortcut. |
| ROM project/build association | Tray 1 source context, with an inline setup panel | First-use setup is prominent; existing association is summarized. Linking a build does not bypass adapter validation. |
| Export RDX and Send to NPCDex | Selected-map header at top of Tray 2 | Same size and emphasis; both act on the same prepared revision. Disable with a nearby reason when preparation is required. |
| Content / Map Setup / Map Stages | Local views within Tray 2 | These switch task context without opening another workspace or destroying the selected entity. |
| Included areas, reviewed names, region and nesting | Map Setup view | A readable hierarchy and inclusion controls replace source-code checklists. One parent map still produces one RDX. |
| Area/room selection, entity search and category grouping | Content view in Tray 2 | Show characters, interactive objects and scenes separately. Preserve nested location paths and selection. |
| Display name and naming basis | Tray 3 selected-item header | Edit the selected identity beside its source evidence. Keep suggestions distinguishable from owner-confirmed names. |
| Thumbnail selection and preview | Tray 3 identity section | Selection immediately updates the local preview. Commit through the same local save model; do not require a distant Apply button to understand the result. |
| Generated map/location thumbnails and larger spatial preview | Map/area tiles in Trays 1/2; selected location preview in Tray 3 | Generate defaults automatically. Area settings beside the preview offer crop/camera and exterior/interior choice where supported; preserve overrides. |
| Placement selector and Link Placements | Tray 3 identity section / selected tile cog | Show location and conditions for each placement. Open a focused side-by-side comparison for linking or detaching. |
| Dialogue, branches, speaker turns and event actions | Main content of Tray 3 | Default to all available source prompts until a valid stage filter is selected. Do not present possible branches as one guaranteed conversation. |
| Availability correction | Beside the affected prompt’s condition | Show the source predicate and proposed stage association together. Persist an explicit documentation correction with history. Extend current preparation editing to support this directly. |
| Stage selection | Bottom timeline, matching NPCDex | Selection filters the same content in both workspaces. Show unresolved prompt count and a direct review entry point. |
| Condition names, display order and interpretation | Map Stages / Event Conditions view | Short Roman-numeral event-condition labels, exact required states, affected items and source evidence. Renaming/reordering does not change condition identity or imply execution order. |
| Extraction warnings | Affected area/entity plus map-level review summary | Click a finding to select its actual target. Separate blocking corruption from reviewable interpretation. |
| Extraction / handoff / publication progress and Cancel | Stable status strip in Tray 2 | Show the active phase; preserve last completed preparation on cancellation. Local transfer and cloud publication have different completion states. |
| Send to NPCDex review | Temporary review mode using Tray 2 summary and Tray 3 differences | Show the exact map, destination, additions/updates, unresolved interpretation and sync policy. Stay in MAPDex after success; offer Open in NPCDex. |
| Resume / discard update review | Selected-map context and review header | Retain partial review across restart. Discard removes the candidate review, not accepted NPCDex content. |
| Clear Extraction Scratch | Source/maintenance context menu | Show reclaimable disposable bytes. Never mix this with deleting prepared maps or live RDX history. |
| Testing an accepted ROM update | Link from the affected NPCDex map and ROMDex task; MAPDex review keeps a reciprocal link | Testing belongs to accepted content, not to an uncommitted extraction candidate. Reuse the existing verification backend. |

### 5.3 NPCDex placement specification

| Tool or information | Location | Behavior |
| --- | --- | --- |
| Maps and nested locations | Tray 1 | Preserve familiar map tiles and expansion. Do not make Import a Map look like a content tile. |
| Import RDX | Explicit empty-workspace button and existing Tray 2 cog entry when populated | Validate, preview and create/update by stable identity. No automatic agent involvement. |
| Area/room selector and tile browsing | Tray 2 | Show the same hierarchy and placement groupings prepared in MAPDex. Switching views retains context. |
| Map, building and floor artwork | Corresponding tiles in Trays 1/2; larger view for the selected location | Read verified portable preview assets from the RDX/backend. Keep the same identity-to-image association as MAPDex; do not require a local ROM. |
| Add Character | Tray 2 header, left of the gender toggle | Create a planned addition in the selected area. Existing current content remains unchanged until implementation. |
| Male / Female view | Tray 2 header | Preserve the existing control and gender-specific source branches. It must not change identity or lose notes. |
| Map tools | Standard Tray 2 cog | Group entries under Map Data, Planning and Delivery/Review. Do not expose a flat miscellaneous list. |
| Entity settings | Inside selected/hovered entity tile’s top-right corner | Identity, placements, image, documentation correction and archive/history actions act on that entity. |
| Current dialogue and conditions | Tray 3 | Accurate current content remains readable while proposals are appended. Keep location, speaker and branch context visible. |
| FINAL / CHANGE / REMOVE | Existing contextual control beside the relevant prompt or item | Preserve original colors, size and behavior. No extra Draft/Ready decision. FINAL remains context rather than a ROM-change instruction. |
| Flag Prompt / Add Note / Selected Line Only | Existing Tray 3 dialogue toolbar | Unchecked covers the whole current dialogue prompt, including turns/passages; checked targets the selected line. Show inherited item flags separately from prompt flags. |
| Tester status | Existing prompt testing controls | Keep per-prompt Verified/Inaccessible separate from implementation acceptance and task completion. |
| Flags, Notes and Changes summary | Tray 2 cog → Data / Flags, scoped to current selector; global access remains in Tray 1 | Show full target path, scope, decision and actual note/instructions. Avoid repeated bare FINAL labels. No redundant note box. |
| Documentation corrections | Entity cog → Edit Recorded Content; map-level correction under Map Data | Explicitly distinguish fixing the record from asking the agent to alter the ROM. Warn when a shared profile affects other placements. |
| Export current map RDX | Map Data in Tray 2 cog | Export the accepted managed document, including local proposals/assets/history; show any known unresolved incoming state. |
| Publish / Synchronize / Review RDX Sync | Delivery/Review group in Tray 2 cog; direct link from an actionable status | Retain explicit binding and pause behavior. Show exact NPCD destination and verified revision. |
| Inspect YouTrack Mapping | Map Data in Tray 2 cog, with an entity-level Open in YouTrack link | Show kind, nested parent path, stable ID, issue link and delivery/readback status. Hide system records by default, but make them inspectable. |
| Package Map Changes | Planning group in Tray 2 cog | Whole map and descendants preselected; preview requested actions separately from notes, flags and FINAL context. |
| Package/task progress | Delivery/Review group, with reciprocal map/task links | Show fixed versions, newer local proposals, authorization, results, delivery and testing as separate facts. |
| Returned-file review | Direct action on a held result and in Delivery/Review | Compare packaged original, current content and returned values. Preserve reviewed overwrite, defer, reject and retry. |
| Result history, testing and reversal | Affected item/task link and Delivery/Review | Record a tested build and human decision. Reversal prepares new work; it does not automatically undo ROM or content. |
| Recovery drafts and storage review | Actionable save-status link / relevant map tools | Resume the exact retained draft or recovery item. Do not require searching unrelated menus or clearing a queue. |

### 5.4 ROMDex and coding-agent tools

| Tool | Placement | Contract |
| --- | --- | --- |
| Choose existing task / create new task | Package review, after choosing map changes | Show PMON destination and complete hierarchy before attachment. Preserve existing task fields. |
| Attach fixed JSON package | Package review action footer | Assets, JSON and binding are verified; later planning edits do not rewrite this attachment. |
| Authorize / withdraw / replace authorization | The fixed package in task Details and reciprocal package view | Exact task/map/version authorization; no automatic messaging or agent launch. Superseded returns are held. |
| Copy Agent Instructions / Download Handoff | Beside an authorized fixed package | Deterministic template with exact files, hashes, tool version and source prerequisites. |
| Agent fetch / validate / pack / return commands | Versioned agent kit linked by the handoff | Secure file transport, stable identity preservation, correct agent-result envelope and duplicate-safe upload. |
| Readiness and Needs Testing | Existing task and affected NPCDex lights, with accessible text details | Agent announces readiness; task stays open. A light alone must not hide blocking conflicts or unresolved testing obligations. |
| Human verification and completion | Accepted result review and ordinary task status control | Verify the current affected revisions against the named ROM build, then explicitly complete the task. |

Keep the suite header dedicated to workspace switching, Auto-Sync, Save Changes and connection details. Global Save checkpoints local work and requests a bounded sync cycle; it should not hold the editor disabled until a remote backlog completes. A healthy connection is not a certificate of extraction accuracy.

## 6 Timeline, hierarchy and return behavior

### 6.1 Timeline and indicator contract

**The Timeline identifies only the ROM event conditions that affect dialogue, scripts, scenes or entity presence in the selected map and its included sub-zones.** It must answer “What must be true to access this content?” It must not reuse a global storyline, show arbitrary source dialogue as an event title, or include every flag found anywhere in a shared script bank.

Derive conditions from map-bound interactions, scene/load hooks, presence logic and reachable shared calls, preserving the branch context that actually controls each effect. A shared bank’s unused text or unrelated entry is not evidence that its flags affect this map. A flag set on another map belongs here if this map reads it to control relevant content. A script writing a flag is not, by itself, proof of an access prerequisite. Include reads/writes only with a demonstrated effect on the map’s content.

Each relevant entry must carry:

- A stable source identity and a short human-readable event/condition label. If meaning is unresolved, show the actual flag/variable identifier instead of inventing a story event.
- The necessary state: set, unset, exact scene-variable value, comparison or supported compound expression. Relevant badge, party, time, gender and choice predicates must remain visible when they affect access, rather than being dropped because they are not Boolean event flags.
- Which map areas, NPC placements, scenes, scripts and dialogue variants it affects.
- The effect of the condition: appearance/disappearance, dialogue replacement, scene activation or another supported change.
- Its exact source references and the limits of the inferred condition.

Route 29 and New Bark Town must be derived separately. A genuinely shared milestone can appear in both only with a map-specific effect link. The number, order and labels need not match. A map with no supported event-dependent content must not receive a fabricated timeline. When a child zone is assigned to a parent, its relevant conditions enter the parent’s condition index with their target paths; unrelated map conditions do not.

Keep Roman numerals as the approved display indexes. Independent or reversible flags must not be forced into an irreversible I → II → III sequence. Selecting an entry highlights affected content and shows its alternatives and prerequisites; it does not imply that a real game save has that flag or that the app has advanced the ROM. If combined-state preview is provided, preserve AND/OR/NOT relationships and identify unspecified predicates rather than treating one selected flag as the complete access condition.

For example, an illustrative prompt might require `Flag A = set AND Flag B = clear`, while an NPC placement additionally requires `Scene Variable = 2`. The displayed access rule must combine placement visibility and the chosen dialogue branch. This example defines behavior, not the actual flag IDs or logic of either supplied map. Milestone names should be grounded in ROM evidence or explicit documentation, with raw identifiers always recoverable.

Keep event conditions separate from user review flags. “Flag Prompt” and critical red flags are annotations; they are not ROM event flags. Existing colored timeline lights describe review/planning/testing for affected prompts. Availability determines which prompts are relevant; the lights do not establish source correctness. Preserve FINAL/CHANGE/REMOVE appearance, and do not reuse connection or upload success as dialogue verification.

Unknown conditions remain visible under Review Unresolved Conditions, attached to their actual targets and source evidence. Unconditional prompts remain available without a false event prerequisite. Distinguish “no prompt applies to this condition,” “no spoken dialogue,” “condition unresolved” and “extraction failed.” New imports remain unreviewed; accepted agent changes retain Needs Human Testing on the affected content and task. Preserve color precedence, accessible details and reduced-motion behavior.

### 6.2 Backend hierarchy contract

The intended physical content tree is Region → Map → nested Zones/Buildings/Floors → Placements/Interactive Elements/Scenes. A logical character profile is shared identity referenced by placements, rather than another physical object in the map. A timeline definition and registry are supporting records. Deeper floors or rooms must not be flattened merely to fit four task-tier names.

The earlier Epic/Saga/Story/Verse terminology can remain a semantic organizational analogy. Current native Type values do not encode it. Publish parent relationships and stable content kinds explicitly; show the mapping in the app. If a dedicated NPCD Content Kind field is later adopted, configure it through an approved project change and retain the domain identity contract.

Inspect YouTrack Mapping should make duplicate analysis concrete: same record identity bound twice is a defect; one profile plus two appearances is legitimate; two unrelated NPCs sharing a sprite are legitimate. Use readable record labels such as “Marill — Character Profile” and “Marill — Outdoors Placement” rather than indistinguishable summaries. System records should not clutter the default physical content view.

Support two clearly described update routes. A versioned cloud document publication can update current content after validation. An ordinary native title edit needs a documentation-correction review; a comment does not rewrite dialogue. Proposed native dialogue/metadata editors need a typed, versioned contract and conflict checks before being advertised as editable backend content. Agent implementation returns must use the task-bound path, not unrestricted native edits.

### 6.3 Change packages and automatic reconciliation

Keep readable JSON Map Packages and editable map RDX files distinct. A package pins the selected request versions, current baselines, ROM targets, required assets and instructions. It authorizes nothing until the explicit task/package authorization and separate agent handoff. Notes, flags and FINAL entries remain context.

For typed changes, validate the exact requested fields and returned content automatically. Preserve independent-group application and all-or-together dependent groups. A newer local proposal survives acceptance of an older packaged version. Source/build changes invalidate stale assumptions; matching titles or source slot numbers alone never establish identity.

For prose-only work, do not pretend the client can infer an authorized patch. Two product paths are needed: a typed operation editor for common changes, and a review step that approves the agent’s exact proposed content difference for requests that cannot be expressed in advance. This extends current behavior: current return review does not unblock instructions-only requests. No runtime AI is required for displaying, selecting, validating or applying those exact differences.

The agent needs the real ROM/build toolchain separately from the package, plus the versioned deterministic RDX/file-transfer kit. After modifying the ROM, it must verify returned content against the output ROM and attach an agent-result RDX to the same task. A general re-extraction with new identities is not a substitute. Discovery, acceptance, local application, NPCD publication and human testing should each be visible in the task/package history. An accepted result is never silently undone by a later delivery failure.

## 7 Prioritized correction sequence

The October 21 [overall action plan](NPCDex-ROMDex-Unified-App-Action-Plan.md) and [checklist](NPCDex-ROMDex-Action-Checklist.md) now carry this proposed corrective sequence. It does not authorize implementation or reopen completed historical tasks automatically.

| Order | Work package | Required outcome |
| --- | --- | --- |
| 11A | Corrected contracts and suite UI review — MX01 | Approve the condition/effect and image contracts, compatibility rules, native/prose return boundaries and concrete screens/tool placement before implementation. |
| 11B | Actual map event conditions — MX02, MX03 | Extract branch/presence rules and carry them through RDX, timeline/projection and cloud. Contrast Route 29 with New Bark Town; explain unknowns. |
| 11C | Suite UI and automatic location images — LP01, MX04, LP02, LP03 | Prove source rendering, implement the approved contextual layout, generate/assign/cache portable map/building/floor previews, then verify the packaged candidate. |
| 11D | Identity, backend mapping and sync — MX05, MX06, MX07 | Complete placement and published-map organization, inspect exact native mappings, reconcile supported edits, and improve measured responsiveness/storage handling. |
| 11E | Planning and coding-agent return compatibility — MX08, MX09 | Preserve contextual prose/typed planning; authorize exact prose result differences and prove deterministic tooling plus an actual ROM change/return. |
| 11F then Phase 9 | Feature acceptance — RI03C; final review/release — U28–U30 | Accept the supported complete workflow, then conduct focused integrated/live review and package the final installer/current guides. Notifications remain after U30. |

Cross-build acceptance with two real ROM builds remains a separate deferred case until another build is supplied. The owner’s image clarification makes automatic supported-ROM location imagery a required workflow outcome, retaining LP01–LP03 as its scoped implementation sequence. Those tasks still need implementation authorization; this audit does not implement the renderer. Their sequencing should not postpone fixing the currently demonstrated missing availability assignments.

Recommended performance acceptance targets: selection and ordinary controls give visible feedback within roughly 100–200 ms on the reference machine; local checkpoint completion is measured separately from sync; background sync never freezes typing or navigation. Treat these as proposed budgets to measure, not achieved results. For cloud performance, compare cold publication, unchanged checks, one-field outgoing updates and incoming updates separately, with request counts and transferred bytes. Reuse valid existing evidence rather than repeatedly republishing maps or running the entire suite.

## 8 Acceptance checklist for the intended workflow

### Extraction and preparation

- [ ] Open the supplied ROM read-only and list its full supported catalog with no map preselected; use neutral empty-state headings.
- [ ] Prepare New Bark Town into one RDX with all eight included physical areas. Account for every relevant object, interaction, script root, message site and unresolved dependency.
- [ ] Explain the archived/current discrepancies for recognizable characters and prompts without asserting that different group counts mean lost text.
- [ ] Show supported dialogue branches, speaker/gender alternatives, visibility and exact condition context. Derive a separate relevant condition/effect set for Route 29 and New Bark Town; exclude unrelated flags, global story entries and stale labels.
- [ ] For a changing-dialogue NPC and a conditionally present character/scene, show the required set/unset states and compound predicates, plus the actual affected variants and placements. Retain raw source identifiers and evidence.
- [ ] Verify shared-script relevance, negated conditions, independent flags, conditional calls and no-condition maps. Selecting another map changes its condition index and cannot retain a stale filter from the previous map.
- [ ] For representative NPCs, selecting stages produces the expected prompt sets and review lights. Unknown mappings are explicitly reachable, never disguised as no dialogue.
- [ ] Rename an item, change its thumbnail, link two placements, detach/reassign a placement and group a nested zone. Verify identity, per-placement dialogue and history survive reprepare/export/reopen.
- [ ] Prepare a contrasting map and an interior/scene-heavy case; report supported and unresolved behavior. Reject unsupported ROM layouts intelligibly without writing the source.
- [ ] Automatically render recognizable map, building/location and exact-floor previews from the supplied ROM. Apply them to the correct tiles in both workspaces; verify source/marker alignment and explicit partial-render conditions.
- [ ] Export/reimport and recover the previews from YouTrack on a profile without the ROM. Preserve exact image bytes, associations and user crop/view overrides; reuse cached previews during ordinary saves/sync.

### NPCDex and YouTrack

- [ ] Send a reviewed map, remain in MAPDex, then open the exact map in NPCDex. Names, nested paths, sprites, timeline filtering and source text agree.
- [ ] Publish to the approved NPCD project and verify each current record’s identity, native parent, kind and asset references. Confirm no accidental duplicate records, collapsed floors or orphaned placements.
- [ ] Verify region/map/zone/entity relationships separately from the native Type field, and clearly identify shared profiles and system records.
- [ ] Save local name/image/annotation/proposal changes, publish them, recover on another profile and export/reimport the current RDX with exact retained assets.
- [ ] Make a supported native edit, review it where required, and prove that accepted content reaches NPCDex and the managed RDX. Test an unsupported native comment/parent change and show a clear review rather than silent mutation.
- [ ] Distinguish local saved, cloud queued, sync paused, blocked review and verified remote states. Restart/offline/cancellation must preserve work and keep unrelated services usable.

### Planning and agent return

- [ ] Add a planned character; stage dialogue, removal and other supported changes; retain notes/flags and original contextual controls without an extra Draft/Ready gate.
- [ ] Package selected work and context across nested zones; preview full target paths and source mappings; choose/create the PMON task and attach verified JSON/assets.
- [ ] Authorize the exact package, use the deterministic handoff in the actual coding-agent environment and verify binary file access.
- [ ] Implement one real change in the ROM, validate its target and output build, and return a correctly bound RDX on the same task.
- [ ] Reconcile a typed change automatically; keep a newer draft pending. Hold superseded, conflicting, wrong-map and out-of-scope returns. Apply a valid dependent group together.
- [ ] Complete the proposed reviewed exact-diff path for a prose request before claiming that the whole planning vocabulary supports reconciliation.
- [ ] Verify accepted content in NPCDex, NPCD and the managed RDX. Show Needs Human Testing; leave the task open; record a tested build and explicit human decision before completion.
- [ ] Interrupt once at the relevant delivery/application checkpoint and resume without duplicate tickets, uploads, application or lost proposals. Restore a complete backup on an isolated profile.

### UI and release

- [ ] Confirm the suite’s tray layout, shared cogs, original status controls, Add Character position, form spacing and readable summaries with the owner before implementation is accepted.
- [ ] Exercise keyboard navigation, one-Escape/Close behavior, short windows, zoom, long text, reduced motion and dialogs with long content. Keep footer controls clear of form content.
- [ ] Confirm that refresh and workspace switching preserve selection and do not reopen Connection Details or block Quit on remote backlog.
- [ ] Measure local interaction/checkpoint latency independently from cloud delivery; do not substitute a passing parser or upload test for a useful map overview.
- [ ] Package, install and reopen the accepted build with a fresh verified Data backup and preserved connections; update user/agent documentation to the actual delivered behavior.

## 9 Evidence references and limits

| Evidence | Source |
| --- | --- |
| Archive/current counts, matching stage assignments and source/map hashes | [Audit evidence](MAPDex-NPCDex-Pipeline-Audit-2026-10-21-Evidence.json) |
| Static flow compilation and narrow stage assignment | [compile-map.mjs](../../apps/romdex/rom/compile-map.mjs:32) |
| Scene descriptions and unresolved chronology | [source-context.mjs](../../apps/romdex/rom/source-context.mjs) |
| Current preparation form and control distribution | [rom-import.html](../../apps/romdex/public/rom-import.html) |
| Native map-specific stage selection and prompt-light filtering | [workspace-runtime.js](../../apps/romdex/content/workspace-runtime.js:230), [timelines.mjs](../../apps/romdex/content/timelines.mjs) |
| Nested physical hierarchy and profile grouping | [hierarchy.mjs](../../apps/romdex/content/hierarchy.mjs), [character-tiles.mjs](../../apps/romdex/content/character-tiles.mjs) |
| Location renderer scope, current texture limits and missing generic tile-image assignment | [Location preview scope](MAPDex-Location-Preview-Scope.md), [textures.mjs](../../apps/romdex/rom/textures.mjs), [projection.mjs](../../apps/romdex/content/projection.mjs) |
| Backend record creation, ownership and native parent verification | [youtrack-store.mjs](../../apps/romdex/rdx/youtrack-store.mjs), [document-cloud.mjs](../../apps/romdex/rdx/document-cloud.mjs) |
| Two-way sync and native edit boundary | [CLOUD-SYNC.md](../../apps/romdex/rdx/CLOUD-SYNC.md) |
| Recorded cloud request counts and timings | [RI03P completion report](RI03P-Completion-Report.md) |
| Concrete-patch requirement and automatic result application | [result-validation.mjs](../../apps/romdex/rdx/result-validation.mjs:29), [RESULT-APPLICATION.md](../../apps/romdex/rdx/RESULT-APPLICATION.md) |
| Agent transport, authoring and package authorization | [AGENT-FILE-TRANSFER.md](../../apps/romdex/rdx/AGENT-FILE-TRANSFER.md) |
| Return review and human-only testing requirements | [RETURN-REVIEW.md](../../apps/romdex/rdx/RETURN-REVIEW.md), [HUMAN-TESTING.md](../../apps/romdex/rdx/HUMAN-TESTING.md) |
| Current installed baseline and spacing corrections | [0.5.26 completion report](UI-Spacing-0.5.26-Completion-Report.md) |
| Remaining integrated acceptance | [Action checklist](NPCDex-ROMDex-Action-Checklist.md) |

The current application, Data, archived saves, credentials and backend were not modified. The full report is a source/file comparison and workflow audit, supported by prior screenshots and recorded live proofs; it is not a new complete Windows or production YouTrack acceptance pass. Historical guides that still name an older installed version are cited for their contracts, not as authoritative statements of today’s installation.

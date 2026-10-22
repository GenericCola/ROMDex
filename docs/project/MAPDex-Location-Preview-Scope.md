# MAPDex Zone and Sub-zone Location Previews

Status: LP01, LP02 and LP03 complete under the October 21 Phase 11C PASSKEY, with MX04 layout integration. [Completion and proof boundaries](LP03-Completion-Report.md). Installed 0.5.26 remains unchanged; U30 owns final production delivery.

October 21 workflow requirement: automatic map, building/location and floor thumbnails are required wherever the supported ROM resources permit them. The supported-ROM rendering and image-association pipeline is now implemented and verified in the isolated desktop candidate. Generate representative defaults during preparation, apply them to the corresponding MAPDex/NPCDex tiles, preserve optional owner crop/view overrides, and carry the verified assets and target associations through RDX and YouTrack. Show specific unsupported-resource states. The [pipeline audit](MAPDex-NPCDex-Pipeline-Audit-2026-10-21.md) records this as F25; the subsequent Phase 11C PASSKEY authorized this implementation.

The goal is a recognizable view of each real ROM location, so a user can identify its building/floor and associate an entity with its dialogue. A parent such as Violet City lists its outdoor area, buildings and Sprout Tower. A child tower lists its floors; selecting a floor shows that exact floor rather than a generic town image.

## LP01 — Prove rendering from the ROM alone

- Trace the selected header through area data, matrix cells, map models, building placements and texture resources. Reuse existing verified event coordinates, but validate their conversion into the rendered location’s coordinate system.
- Decode/render the required static geometry and textures deterministically. Compare Violet City outdoors, one Sprout Tower floor and a contrasting interior against the ROM’s own location layout. No AI-generated substitute or prepared agent JSON.
- Report unsupported models, textures, animation dependencies and coordinate ambiguities clearly. A point grid may aid diagnostics but is not acceptance of recognizable location rendering.
- Evaluate source/dependency licenses before adopting an implementation. Inspect DSPRE’s map renderer and referenced format research; decide whether a suitable licensed component can be incorporated or whether an independent decoder is needed. Do not silently copy third-party implementation.

Our current reader already extracts headers, matrices, events, scripts, messages and character sprites. The completed static renderer adds the terrain/building/model/texture pipeline for the validated source layouts. The dependency chain is supported by the community’s [Generation IV mapping documentation](https://ds-pokemon-hacking.github.io/docs/generation-iv/guides/mapping/) and the [DSPRE project](https://github.com/DS-Pokemon-Rom-Editor/DSPRE); the LP01 and LP03 evidence now establishes the implemented renderer’s tested boundaries.

## LP02 — Add contextual navigation and portable previews

- Show a source-derived location image with entrances, NPCs and interactive-element markers. Clicking a marker opens the matching entity and its actual linked text; selecting the entity opens its source text in the contextual detail pane.
- Parent overview lists child locations/floors with thumbnails and readable breadcrumbs. Provide fixed angled/top-down camera choices and saved crop overrides with exact source area selection; interactive 3D/pan/zoom is not implemented in this first version. Preserve the map’s own stage selection; uncertain presence conditions stay visible as warnings.
- Store generated preview images, marker coordinates, renderer version and source hashes in the single map RDX. NPCDex and another installation can show the approved preview without the original ROM.
- Keep static source previews distinct from proposed ROM changes. User names and sprite choices are display cleanup; they do not rewrite source evidence.

## LP03 — Verify and deliver

- Prove outdoors/interior/multi-floor alignment, nested group navigation, entity-text linkage, missing-resource handling and export/import portability.
- Check first render progress and cached reopen responsiveness. Store assets once by hash; do not rebuild unchanged images during ordinary sync.
- Complete native packaged-candidate review, reusing unchanged checks. Under the October 21 revised overall plan, U30 owns the final backed-up production installer/upgrade; do not repeat installs solely for unchanged behavior. Keep source ROMs and extracted copyrighted location assets out of development Git/release fixtures; portable user documents retain their authorized data locally/backend.

Acceptance: recognizable actual locations, correct markers and child-floor navigation, exact retained source mapping, portable display on a second local profile, and no runtime agent involvement. All three implementation stages are now complete under the owner’s combined Phase 11C authorization; the next task, MX05, needs a separate PASSKEY.

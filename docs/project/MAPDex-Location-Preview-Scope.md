# MAPDex Zone and Sub-zone Location Previews

Status: scoped alongside parent/child grouping; rendering implementation needs a later task-specific PASSKEY.

The goal is a recognizable view of each real ROM location, so a user can identify its building/floor and associate an entity with its dialogue. A parent such as Violet City lists its outdoor area, buildings and Sprout Tower. A child tower lists its floors; selecting a floor shows that exact floor rather than a generic town image.

## LP01 — Prove rendering from the ROM alone

- Trace the selected header through area data, matrix cells, map models, building placements and texture resources. Reuse existing verified event coordinates, but validate their conversion into the rendered location’s coordinate system.
- Decode/render the required static geometry and textures deterministically. Compare Violet City outdoors, one Sprout Tower floor and a contrasting interior against the ROM’s own location layout. No AI-generated substitute or prepared agent JSON.
- Report unsupported models, textures, animation dependencies and coordinate ambiguities clearly. A point grid may aid diagnostics but is not acceptance of recognizable location rendering.
- Evaluate source/dependency licenses before adopting an implementation. Inspect DSPRE’s map renderer and referenced format research; decide whether a suitable licensed component can be incorporated or whether an independent decoder is needed. Do not silently copy third-party implementation.

Our current reader already extracts headers, matrices, events, scripts, messages and character sprites. It does not yet provide the terrain/building/model/texture rendering pipeline. The dependency chain is supported by the community’s [Generation IV mapping documentation](https://ds-pokemon-hacking.github.io/docs/generation-iv/guides/mapping/) and the [DSPRE project](https://github.com/DS-Pokemon-Rom-Editor/DSPRE); these references establish feasibility to investigate, not completion of ROMDex’s renderer.

## LP02 — Add contextual navigation and portable previews

- Show a source-derived location image with entrances, NPCs and interactive-element markers. Clicking a marker opens the matching entity and its actual linked text; selection in the item list highlights the marker.
- Parent overview lists child locations/floors with thumbnails and readable breadcrumbs. Allow zoom/pan with exact source area selection. Preserve the map’s own stage selection; uncertain presence conditions stay visible as warnings.
- Store generated preview images, marker coordinates, renderer version and source hashes in the single map RDX. NPCDex and another installation can show the approved preview without the original ROM.
- Keep static source previews distinct from proposed ROM changes. User names and sprite choices are display cleanup; they do not rewrite source evidence.

## LP03 — Verify and deliver

- Prove outdoors/interior/multi-floor alignment, nested group navigation, entity-text linkage, missing-resource handling and export/import portability.
- Check first render progress and cached reopen responsiveness. Store assets once by hash; do not rebuild unchanged images during ordinary sync.
- Complete native review and a backed-up installer upgrade. Keep source ROMs and extracted copyrighted location assets out of development Git/release fixtures; portable user documents retain their authorized data locally/backend.

Acceptance: recognizable actual locations, correct markers and child-floor navigation, exact retained source mapping, portable display on a second local profile, and no runtime agent involvement. Each implementation stage needs its own PASSKEY.

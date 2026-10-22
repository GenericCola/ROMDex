# LP01 — Static Location Rendering Proof

**Complete in source, October 21, 2026.** The owner authorized all of Phase 11C. Continue in order with MX04, LP02, then LP03. Production installation, saves, queues, sync pause and remembered connections remain unchanged.

The supplied ROM alone produces recognizable textured location images. No editable project, agent JSON, AI image, stock image or schematic point grid supplies the location content.

| Source area | Matrix cells | Placed buildings/objects | Triangles | Verified texture/palette material bindings |
| --- | ---: | ---: | ---: | ---: |
| Violet City outdoors, header 73 | 4 | 40 | 5,931 | 147 across 21 unique terrain/building models |
| Violet City mart, header 157 | 1 | 19 | 1,563 | 35 across 13 models |
| Sprout Tower 1F, header 110 | 1 | 9 | 1,539 | 19 across 5 models |

The reader follows the exact map header → area data → matrix → land member → terrain model/building placements → indoor/outdoor model and texture namespaces. Resource hashes and locators are retained. Header and altitude matrix layers are decoded separately; missing layers and empty cells are handled explicitly. Building fixed-point positions/scales and geometry/bone transforms are applied, then an independently authored bounded CPU rasterizer produces the PNG.

All material texture/palette matches in the three proofs are unique within the source-selected resources. Tentative or missing matches are not accepted as verified defaults. Static geometry uses the source model's base pose and texture state; it does not emulate the game, animated water, lighting, current flags, actors or time of day.

## Coordinate proof

The matrix uses 32×32-tile cells, 16 world units per tile and a centered model origin. Zero-height event tile centers convert into the same world/camera space. All 19 source entrances in the three proofs project inside their images. The mart entrance lands on its actual red entrance mat, with an explicit pixel check. Source nonzero event heights and events outside selected cells remain unresolved until terrain-height validation; they are not guessed. The tested source buildings have zero rotation and unit scale. Other building rotations remain an explicit unsupported case for the first renderer.

## Decoder and license decision

Use the unmodified **Apicula 0.1.1-dev** Windows decoder, pinned to upstream commit `3d4e91e14045392a49c89e86dab8cb936225588c`. Its executable SHA-256 is `b546d35960a9b48514457d9998a1ae8b214019fcbd2406c782cb7a15d98597d8`. The executable reports that build commit and has been exercised successfully in this session. It decodes Nitro models/textures into bounded local GLB/PNG intermediates; ROMDex owns selection, resource associations, placement, camera, rasterization, portability and application behavior.

Apicula is [0BSD licensed](https://github.com/scurest/apicula/blob/3d4e91e14045392a49c89e86dab8cb936225588c/LICENSE). Its pinned lock contains 217 root/dependency entries. Registry archives were checked against their locked SHA-256 values and available license/notices retained. Declared dependency licenses are permissive; the pinned Glium fork is Apache-2.0. Windows GNU import-library notices are retained with their upstream winapi notices. Apple's dispatch crate is a macOS-only dependency, not part of this Windows executable. LP02's distributed decoder must carry the retained notices and pinned manifest.

DSPRE's current license is AGPL-3.0. Its code is not copied or bundled; descriptive resource/format facts were cross-checked. The [mapping guide](https://ds-pokemon-hacking.github.io/docs/generation-iv/guides/mapping/), [pinned DSPRE format descriptions](https://github.com/DS-Pokemon-Rom-Editor/DSPRE/tree/e751187b45d6ddf237a24dab8407a5a6cf0d36dd/DS_Map/ROMFiles), the [Noclip HGSS reader](https://github.com/magcius/noclip.website/blob/e47a8cc8a9fe16e83adc0bf19153ff04c666ceca/src/nns_g3d/Scenes_PokemonHGSS.ts) and Apicula's source were consulted as references. ROMDex's new JavaScript is independently authored; no game implementation is adopted.

## Checks and boundaries

10 focused tests pass: matrix layers/limits, interior member identity, resource type/range validation, sound/land sections, coordinate conversion, PNG color/alpha, true geometry depth, texture sampling, placement, cancellation and unsafe converted texture paths. The actual ROM proof and all 201 material-binding checks pass. Local render/provenance images remain outside development Git and release fixtures.

This proves static location rendering for the validated supplied HGSS layout. It does not add arbitrary Pokémon ROM compatibility or claim an in-game screenshot. Unsupported resources, ambiguous palette matches, nonzero building rotations, unvalidated event heights and animated/runtime state require explicit handling. Automatic preparation, owner overrides, tile associations and portable previews belong to the next authorized LP02 task, after MX04. LP03 owns the isolated packaged candidate; U30 retains the production installer.

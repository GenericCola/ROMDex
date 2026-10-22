# LP02 — Automatic Portable Location Thumbnails

**Complete in source, October 21, 2026. LP03 is next under the existing Phase 11C authorization.** Production installation, Data, queues, cloud pause and tokens are unchanged.

Preparation now follows the source-selected terrain/building resources automatically and produces angled and top-down images for supported locations. The map receives a representative overview; interiors and exact tower floors retain separate images. Nested group containers can use a child-floor preview. Map and location tiles use these portable images; Tray 3 exposes a larger preview, child navigation and source-coordinate markers that open the corresponding entity's text or a known destination inside the map. Unknown heights/positions remain explicitly unresolved.

Location Image / Crop controls preview another camera and save an owner-selected image or crop. An owner PNG is retained alongside generated originals. Re-preparation preserves owner selections; reviewed source updates remap image targets while preserving owner crops. Images do not change ROM content or establish human testing.

Each RDX carries exact PNG bytes, typed view revisions, target/source identities, resource hashes/locators, renderer settings, markers and required capability `org.romdex.npcdex.location-previews-v1`. Fresh profiles need no ROM to display them. Verified model and final-image caches reuse unchanged resources. Apicula's pinned executable and permissive dependency notices ship with the source package; no game assets ship in application code.

The supplied ROM produced Violet City outdoors, its mart and Sprout Tower's three floors, then one grouped RDX with seven image-bearing targets. Export/reimport and factored cloud recovery preserve the images. A separate fresh cloud reader recovered a location-bearing fixture using the actual storage protocol. The cached outdoor render, including fresh source verification, took about 1.3 seconds in the recorded check; this is not a universal performance guarantee.

Real Chrome checks pass in MAPDex and NPCDex with the ROM-derived isolated copy: tile/floor images, marker-to-dialogue navigation, camera selection, saved crop, nested floor navigation, source evidence and short windows. Native packaged review remains LP03. No new live YouTrack write is claimed. Actual two-build ROM acceptance remains pending another supplied build; controlled source-update checks pass.

Image-only saves keep current record bodies unchanged. The storage verifier now reuses an earlier decode only when a fresh read hashes to exactly the same verified container bytes; it still reads/hashes the whole file and honors cancellation/custom limits. This avoids repeated decoding during a checkpoint. All 31 managed-storage and process-crash recovery checks pass, alongside the focused image, cloud, condition, presentation, grouping and source-update cases.

**Wire-format clarification:** the approved normalized crop is represented by integers from 0 to 1,000,000 because canonical RDX JSON permits safe integers only. The interface displays percentages. The normalized meaning and owner policy are unchanged; schema/reference checks are updated together.

Supported output is static geometry for the validated HGSS layout, not an emulated screenshot. Actors, animation, lighting/time and runtime flag state are not simulated. Ambiguous resources, unsupported rotations or unverified event heights show warnings instead of guessed images or positions. Arbitrary Pokémon-ROM support is not claimed.

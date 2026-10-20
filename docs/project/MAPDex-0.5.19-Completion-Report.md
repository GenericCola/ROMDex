# MAPDex 0.5.19 — Readable Map Contents

Installed and reopened October 20, 2026. **New Bark Town is one map RDX containing its outdoor area and seven interior/floor areas.** Each checkbox chooses a sub-area inside that same file. The previous interface displayed raw ROM codes and ambiguous wording; the underlying one-map/eight-child structure was already correct.

The setup now explicitly shows **One map file — New Bark Town.rdx**, explains that all checked sub-areas are contained within it, and lists readable names such as Elm's Lab — 1F, Player's House — 2F and Southwest House. Technical codes and numeric area IDs are retained under collapsed **Source Details**. The native export picker suggests the selected map's name rather than a generic Map.rdx.

The source model, portable format, file ownership and existing identities are unchanged. Readable defaults format the view; existing source names/content are not rewritten. A user's explicitly edited area name overrides the reference label, and that edit remains part of the normal map document. Unknown or changed area codes receive a neutral name requiring review. Reference labels require both a matching internal code and header ID; numeric ID alone does not establish a building's identity.

Building names are display hints from the pinned HGSS [area-name reference](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/constants/maps.h). Modified buildings may need review or renaming in Display Cleanup. Dialogue, entities, scripts, images and source mappings still come from the selected ROM or existing RDX, not from the name table. Full NPC/entity naming and script/chronology interpretation retain their existing review requirements.

## Validation and saves

Four focused unit checks passed for New Bark Town labels, source-code/ID matching, another town and safe export filenames. Six source UI checks passed, including all 121 catalog groups, eight readable included sub-areas, user-name precedence, hidden technical IDs and exclusion from the same map file. Three packaged native checks passed. The actual native export suggested New Bark Town.rdx and contained exactly **one map, eight sub-areas, all parented to that map**. Normal shutdown of the isolated test app completed; no cloud test records or credentials were used there.

All 117 current Data files were freshly backed up, restored and individually verified in isolation. All three saved connections were verified without exposing tokens. The installer returned 0; all 380 installed files match its manifest, and Data matched the backup exactly before reopening. The installed app retains 299 tasks and 0 NPCDex documents and opens MAPDex with its saved selection/preparation. No map was imported or published to production by verification.

Keep `Protected/Before-MAPDex-0.5.19/Data.zip`, its previous-source ZIP and the earlier protected recovery copies. The current unsigned private evaluation installer is `ROMDex-Installer-0.5.19/ROMDex-0.5.19-x64.msi`. Private update-channel publication remains at 0.5.15; this task does not publish a new update release. Other ROM layouts, broader RI03C and the user's live NPCDex/NPCD round trip remain open.

Another 784,068,119 bytes of obsolete installer/build/test/restoration copies were collected under `DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-20/MAPDex-0.5.19-build-leftovers` for manual deletion. No moves were skipped and nothing was permanently deleted. Current source, installer, app Data and compressed recovery ZIPs remain outside that folder.

[Verification evidence](MAPDex-0.5.19-Verification.json).

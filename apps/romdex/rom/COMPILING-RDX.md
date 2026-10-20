# ROM-only RDX compilation

RI02C adds a source-level compiler for the reviewed English HeartGold build and Violet City. It runs locally without AI, an editable ROM project, prepared agent JSON or existing NPCDex saves. The ROM is read-only. This CLI remains a bounded source tool; [MAPDex](MAPDEX.md) now provides its app-managed offline preparation workflow in source. Neither is a general-purpose emulator.

Run with the Node runtime used by ROMDex:

```powershell
node rom/cli.mjs compile INPUT.nds NEW_OUTPUT_DIRECTORY
```

The new directory contains `VioletCityMap.rdx`, `identities.json` and `compilation.json`. Keep the identity manifest with the project. Every subsequent compilation of this same source must reuse it:

```powershell
node rom/cli.mjs compile INPUT.nds ANOTHER_NEW_DIRECTORY --previous-identities=PREVIOUS_DIRECTORY/identities.json
```

Outputs never overwrite an existing directory. No command here publishes to YouTrack. A changed ROM/source layout requires identity and adapter review rather than silently reusing matching indices. MAPDex manages these bindings from its working files and portable source index; the sidecar instructions above apply to direct CLI use.

The compiler performs inventory and extraction directly from the ROM, translates native region/map/subzone/profile/appearance/interactive/scene records, seals their source mappings, validates the graph and RDX contracts, then compresses one logical map. Violet City's interiors are subzones; Sprout Tower is excluded as a separate map identity.

Each placed object has its own profile. Identical sprite artwork does not merge unrelated people. Neutral source labels such as `T22 · Object 0` are intentional: a sprite name or source index does not establish a character's identity. All extracted frames/palettes accompany the file. Two ambiguous palette bindings have no guessed default thumbnail.

Dialogue blocks retain exact decoded text, gender alternatives, command/message locations and references to the raw source archive. Static possible branches and shared calls are not presented as a proven chronological conversation. Runtime-dependent text gets a visible explanatory note; unassigned text is retained separately as source notes. Script instructions, edges, conditions, mutations, movements, trainer tables, raw message tokens and sprite bindings remain reconstructable inside the RDX.

The source archive is factored into bounded JSON sections plus an index. This preserves the complete extraction digest without increasing parser limits or embedding an opaque unbounded JSON file. Images are deduplicated by their exact byte hashes. The compiler requires valid image hashes before returning a portable file.

Violet City's four observed scene-variable values use stable IDs and Roman-numeral display labels. Their display order is numeric source-state order, **not a verified complete gameplay chronology**. Initial states, independent flags/badges and runtime paths remain explicit review work. Conditions without a proven stage association stay under Other Conditions. RI02T supports later reviewed names/order/conditions without changing identity.

Imported content remains subject to human testing. Neither a parser result, a successful backend save nor portable review claims establish in-game verification. The extractor file does not authorize an agent or represent an agent return; returned work must use the separately approved task/package reconciliation contract.

Keep the supplied ROM, extracted game text/images, generated map RDX and private source identity files out of the development repository and release assets. Commit the compiler, fictional tests, documentation and aggregate proof results only.

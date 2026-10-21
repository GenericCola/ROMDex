# Clean NPCDex RDX acceptance test

The standalone `VioletCityMap.rdx` is the unedited, ROM-only Violet City extraction used in RI02C/RI03P. It contains one map, with its areas, entities, source mappings and images. It is an input document, not an agent result or an authorization to change the ROM.

1. In NPCDex, open the Tray 2 settings button, then **Import Map Data → Import RDX Map**. Select `VioletCityMap.rdx`, review the preview, and confirm the local import.
2. Browse its areas, entities and dialogue. Add a recognizable note or other local edit, save, and export the current map RDX to verify portability.
3. In the same map controls, choose **Publish Map to YouTrack**, review the binding preview, and confirm. Importing a file alone does not publish it. Allow initial publication to finish before checking the NPCD tree.
4. Inspect NPCD's hierarchy and source mappings. For the supported incoming-edit test, rename one bound entity's title in YouTrack; do not alter its identity markers or attachment bytes. Synchronize the map, review the incoming title, and accept it. Confirm NPCDex shows it and a fresh exported RDX retains both the local note and accepted title.
5. After the first round trip passes, test MAPDex ROM extraction and the next map. MAPDex and RI03P's loading/performance improvements are installed in evaluation build 0.5.20. Open MAPDex from the workspace button or Windows tray; choose Open ROM, select a ROM-derived map group, Prepare Map, then review/export or Send to NPCDex. The supplied ROM exposes 121 groups; New Bark Town and Route 29 were also independently compiled. Additional ROM layouts and broader RI03C acceptance remain pending.

Save updates the app-managed working RDX in the installed application's `Data/thegobindsingh-PMON/RDX/working` folder. The original file selected for import stays unchanged. Use **Export Current Map RDX** to obtain a current portable copy.

Existing NPCDex content and its legacy queue were archived separately for recovery. Do not restore that retired provider or queue into this clean test workspace.

MAPDex shows one named RDX containing the checked sub-areas. Building/floor labels are reference hints; user-reviewed names override them and raw IDs remain under Source Details. Export suggests the map name.

0.5.20 persists readable sub-area/entity presentation into prepared RDX files. Review evidence-derived names and front-facing source thumbnails before handoff. Ambiguous palettes/identities remain reviewable; explicit names and thumbnail overrides win. Custom parent/child map grouping and NPCD tier Type assignment remain follow-up work.

# Clean NPCDex RDX acceptance test

The standalone `VioletCityMap.rdx` is the unedited, ROM-only Violet City extraction used in RI02C/RI03P. It contains one map, with its areas, entities, source mappings and images. It is an input document, not an agent result or an authorization to change the ROM.

1. In NPCDex, open the Tray 2 settings button, then **Import Map Data → Import RDX Map**. Select `VioletCityMap.rdx`, review the preview, and confirm the local import.
2. Browse its areas, entities and dialogue. Add a recognizable note or other local edit, save, and export the current map RDX to verify portability.
3. In the same map controls, choose **Publish Map to YouTrack**, review the binding preview, and confirm. Importing a file alone does not publish it. Allow initial publication to finish before checking the NPCD tree.
4. Inspect NPCD's hierarchy and source mappings. For the supported incoming-edit test, rename one bound entity's title in YouTrack; do not alter its identity markers or attachment bytes. Synchronize the map, review the incoming title, and accept it. Confirm NPCDex shows it and a fresh exported RDX retains both the local note and accepted title.
5. After the first round trip passes, test MAPDex ROM extraction and the next map. MAPDex and RI03P's loading/performance improvements are installed in evaluation build 0.5.16. Open MAPDex from the workspace button or Windows tray; choose Open ROM, select Violet City, Prepare Map, then review/export or Send to NPCDex. Only Violet City's eight areas are currently supported; another map and broader RI03C acceptance remain pending.

Save updates the app-managed working RDX in the installed application's `Data/thegobindsingh-PMON/RDX/working` folder. The original file selected for import stays unchanged. Use **Export Current Map RDX** to obtain a current portable copy.

Existing NPCDex content and its legacy queue were archived separately for recovery. Do not restore that retired provider or queue into this clean test workspace.

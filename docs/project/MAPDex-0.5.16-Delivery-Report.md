# MAPDex 0.5.16 Evaluation Delivery — October 20, 2026

ROMDex 0.5.16 is installed and open in **MAPDex**, using the existing saved YouTrack connection. The live check found 299 tasks and zero NPCDex map documents, ready for the user's clean trial. No map was imported into production on the user's behalf.

The build packages MAPDex and its ROM workers/tables, the current NPCDex/task workflows and RI03P's delivery improvements/loading bars. Empty NPCDex now presents working **Import RDX Map** and **Open MAPDex** actions instead of a synthetic map tile.

## Start the trial

1. In MAPDex, click **Open ROM** and select the supplied `0.6.3_noduplicates.nds`.
2. Select **Violet City**, review the eight included areas, then choose **Prepare Map**. Inspect the extracted content and review warnings; optional display cleanup stays local.
3. **Export RDX** creates a portable, single-map document. **Send to NPCDex** reviews and commits the prepared map to NPCDex; publication then follows the shared synchronization controls and shows its progress.
4. Browse/edit the map in NPCDex. Verify the NPCD tree after initial publication. For the supported native-edit trial, rename a bound entity's title in YouTrack, synchronize and accept its reviewed incoming edit. A fresh exported RDX must preserve both that accepted edit and the local changes.

You may instead begin by importing `Testing/VioletCityMap.rdx` directly into empty NPCDex. That import uses the normal reviewed RDX importer; publish the imported map explicitly through its map controls. The original selected input file is not overwritten. Local Save updates the app-managed working RDX; Export produces a current portable copy.

## Evidence and preservation

- 29 focused regression tests passed. Ten native packaged checks passed: empty-state routing, actual ROM scan, 134-record compilation, one-map RDX export, local handoff/loading meter, generated NPCDex tiles, unchanged ROM bytes, and normal Quit/restart with retained map/preparation.
- MSI version/upgrade identity passed. The installed app's 376 files match the packaged manifest; Windows Installer returned 0 and replaced the previous registered version through the same upgrade identity.
- All 113 Data files were archived, restored into an isolated folder and verified. The three remembered connections were decrypted successfully during the restoration check without logging their secrets. Data was byte-for-byte unchanged before reopening the upgraded app.
- Keep `Protected/Before-MAPDex-0.5.16/Data.zip` and `Previous-Application-Source.zip`; the latter preserves the repaired 0.5.15 source separately from its older installer. The earlier complete pre-reset local/YouTrack archive remains protected too.
- The test initially tried Quit while an iframe was still opening. Its guard correctly refused; the corrected readiness/restart check passed without a message. An expired-job recovery race was repaired in the helper. The first installation command used path separators MSI rejected before changing the app; the corrected command installed the same verified MSI. No extraction or cloud proof was repeated to resolve these harness issues.

## Limits and next gate

This is an **unsigned private evaluation build**, not completion of broader RI03C acceptance. Extraction is verified for **Violet City and its eight reviewed areas** in the supplied ROM. Other catalog groups remain visibly unverified and cannot yet be prepared. Neutral labels, uncertain scene ordering and ambiguous sprite palettes remain review warnings; extraction is static analysis, not proof of every runtime condition. No ROM is bundled or modified.

The user's live round-trip acceptance and a second supported map remain open. The published private updater release remains 0.5.15; this locally installed evaluation build is newer and is not a downgrade target.

Obsolete 0.5.15 installer, disposable packaged app/test profile/build output, generated export and duplicate restoration folder were collected into `DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-20/MAPDex-0.5.16-build-leftovers` for manual deletion. This adds 781,926,122 bytes (about 782 MB) to the cleanup folder. No permanent deletion occurred. The active temporary folder and protected helper profile were left in place when Windows denied moving them.

[Verification evidence](MAPDex-0.5.16-Verification.json). The current installer and application manifest are in `ROMDex-Installer-0.5.16` at the outputs root.

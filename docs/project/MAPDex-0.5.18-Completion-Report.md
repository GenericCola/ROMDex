# MAPDex 0.5.18 — ROM Loading and Map Selection Correction

Installed and reopened October 20, 2026. The actual installed application loaded the user's supplied ROM successfully and displays **540 physical map headers grouped into 121 named maps/zones**, without automatically choosing Violet City. Tray 2 says **Select a Map / Zone** while nothing is selected. The live saved YouTrack connection works; 299 tasks and 0 existing NPCDex documents were retained. No map was imported into production by the verification.

The prior build incorrectly carried its Violet City proof scope into startup, selection, area membership and compilation. These restrictions are removed. Map groups and names now come from the ROM, selection controls the included areas, and compilation uses that selected scope. New Bark Town (8 areas / 95 records) and Route 29 (2 areas / 38 records) produced separate, validated portable RDX files in isolated checks. Map stages derive from the selected source's observed scene/variable states and retain Roman numeral display labels, rather than imposing Violet City's four stages on every map.

The reader formerly treated ctime metadata changes as proof the ROM changed. Windows/OneDrive can update that field without changing its bytes. The corrected guard checks source size, modification time and file identity; fingerprint and resource/locator hash checks remain. The supplied ROM still matches its expected SHA-256. Metadata-only changes now pass the focused test, while source modification/identity changes still fail.

Map switching restores a saved preparation for the selected scope, refreshes its contextual preview, and preserves separate local UI drafts. A different ROM fingerprint clears the prior source's UI position instead of applying its draft to another map. Legacy source identities and scope keys remain recoverable from existing RDX files.

## Hidden editor shutdown correction

The user's normal Quit attempt revealed Connection Details left open inside the hidden task workspace, although MAPDex was visible. The previous guard treated every open dialog as an unsaved editor. No connection token or changed setting was present. The stale status dialog was closed after verifying this, and the normal lifecycle shutdown succeeded without discarding unsaved work.

The final application now automatically dismisses unchanged Connection Details on Quit. Entered tokens, changed remember settings and running connection requests still block shutdown. A genuine task/NPCDex editor that prevents Quit is brought into view, so the error points to a visible workspace. This follow-up is versioned 0.5.18 because 0.5.17 had already installed when the user requested a permanent prevention fix. No forced shutdown was used.

## Using the corrected app

The supplied ROM is already loaded in MAPDex. Pick any listed map/zone, review its included areas and choose **Prepare Map**. Review the source content and warnings, make any display cleanup, then **Export RDX** or explicitly **Send to NPCDex**. Preparation and exports remain local; a reviewed handoff queues publication according to the existing synchronization settings. Existing conflict, testing and agent-authorization boundaries are retained.

Region display names can remain neutral **ROM Region n** labels until reviewed. Neutral object/building names and uncertain palette/runtime/chronology details remain explicit source evidence or review warnings. A listed map is selectable without a city whitelist; malformed or unsupported source constructs still fail with their actual validation error.

## Validation and preservation

38 distinct focused reader/catalog/compilation/workspace checks and seven additional quit-editor regressions passed. The isolated UI verified real Open ROM, all 121 named groups, the neutral title, New Bark Town selection and Route 29's own preview/stages. Seven packaged Windows catalog/export/handoff/restart checks passed on the preceding 0.5.17 candidate. Three focused native checks passed in the final 0.5.18 package: an unchanged connection dialog hidden behind MAPDex no longer blocks Quit; genuine unsaved connection input stays intact and reveals the task workspace; finishing that input permits a normal Quit retry. No credentials were copied into that test, and no cloud test records were created.

Windows Installer validated the unchanged application/upgrade identity and returned 0. All 378 installed files match the application manifest. All 117 current Data files were backed up and individually restored/verified in isolation; all three remembered connections were checked without logging tokens. Data matched exactly before the app reopened. The subsequent installed read-only ROM scan saved its normal MAPDex source/catalog checkpoint; it did not change ROM bytes or import a map.

Keep the complete Data and previous-source ZIPs in `Protected/Before-MAPDex-0.5.18`, plus the earlier pre-reset NPCDex archive. The current private evaluation installer is `ROMDex-Installer-0.5.18/ROMDex-0.5.18-x64.msi` at the outputs root. It remains unsigned for private testing; the published updater channel remains at 0.5.15.

Another 1,530,249,023 bytes of obsolete 0.5.16/0.5.17 installers and disposable build/test/restoration copies were moved into `DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-20/MAPDex-0.5.18-build-leftovers` for manual deletion. There were no skipped moves and nothing was permanently deleted. The current installer, installed Data, source and compressed recovery backups remain outside that folder.

## Compatibility work still open

This correction removes the city restriction for the supplied ROM. It does **not** implement a universal Pokémon ROM reader. The current decoder uses the reviewed HeartGold/SoulSilver source layout and this build's verified fingerprint. Other ROM revisions and game families need independently validated layout/readers, including a clear compatibility report instead of guessed offsets. The user's requirement for all maps/zones applies to each supported input; broader build/game compatibility remains tracked under RI03C and must not be marked complete by this fix.

[Verification evidence](MAPDex-0.5.18-Verification.json).

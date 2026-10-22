from pathlib import Path
import json
root=Path.cwd();out=root/'outputs';w=root/'work/mapdex-0518';g=root/'work/mapdex-general';h=out/'Documentation/History/MAPDex-0.5.18';h.mkdir(parents=True,exist_ok=True)
a=json.loads((w/'installation-result.json').read_text());n=json.loads((w/'native-proof.json').read_text());live=json.loads((w/'installed-proof.json').read_text());b=json.loads((w/'build.json').read_text());c=json.loads((g/'catalog-proof.json').read_text());c.pop('catalog',None)
assert a['status']=='installed' and n['status']==live['status']=='passed'
evidence={'version':'0.5.18','purpose':'Correct the ROM-loading error and remove the Violet City proof restriction from the product','distinctFocusedChecks':45,'additionalQuitRegressionChecks':7,'priorCatalogNative':json.loads((root/'work/mapdex-0517/native-proof.json').read_text()),'sourceCatalog':c,'sourcePreparation':json.loads((g/'preparation-proof.json').read_text()),'sourceUI':json.loads((g/'ui-proof.json').read_text()),'native':n,'installerValidation':json.loads((w/'msi-check.json').read_text()),'installed':live,'preservation':{k:a[k] for k in ['backup','restoration','savedConnectionsVerified','installerExitCode','dataPreservedExactly','applicationFilesVerified']},'installer':b['installer'],'universalPokemonROMSupport':False}
if (w/'cleanup.json').exists():evidence['cleanup']=json.loads((w/'cleanup.json').read_text())
(h/'MAPDex-0.5.18-Verification.json').write_text(json.dumps(evidence,indent=2)+'\n')
report=f'''# MAPDex 0.5.18 — ROM Loading and Map Selection Correction

Installed and reopened October 20, 2026. The actual installed application loaded the user's supplied ROM successfully and displays **540 physical map headers grouped into 121 named maps/zones**, without automatically choosing Violet City. Tray 2 says **Select a Map / Zone** while nothing is selected. The live saved YouTrack connection works; {live['application']['tasks']} tasks and {live['application']['npcdexDocuments']} existing NPCDex documents were retained. No map was imported into production by the verification.

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

Windows Installer validated the unchanged application/upgrade identity and returned {a['installerExitCode']}. All {a['applicationFilesVerified']} installed files match the application manifest. All {a['backup']['files']} current Data files were backed up and individually restored/verified in isolation; all three remembered connections were checked without logging tokens. Data matched exactly before the app reopened. The subsequent installed read-only ROM scan saved its normal MAPDex source/catalog checkpoint; it did not change ROM bytes or import a map.

Keep the complete Data and previous-source ZIPs in `Protected/Before-MAPDex-0.5.18`, plus the earlier pre-reset NPCDex archive. The current private evaluation installer is `ROMDex-Installer-0.5.18/ROMDex-0.5.18-x64.msi` at the outputs root. It remains unsigned for private testing; the published updater channel remains at 0.5.15.

## Compatibility work still open

This correction removes the city restriction for the supplied ROM. It does **not** implement a universal Pokémon ROM reader. The current decoder uses the reviewed HeartGold/SoulSilver source layout and this build's verified fingerprint. Other ROM revisions and game families need independently validated layout/readers, including a clear compatibility report instead of guessed offsets. The user's requirement for all maps/zones applies to each supported input; broader build/game compatibility remains tracked under RI03C and must not be marked complete by this fix.

[Verification evidence](MAPDex-0.5.18-Verification.json).
'''
(h/'MAPDex-0.5.18-Completion-Report.md').write_text(report)
section='''
## MAPDex 0.5.18 — Loading and City Restriction Correction, October 20, 2026

- [x] Correct metadata-only source-change false positives while retaining modification/identity/hash validation.
- [x] Show the supplied ROM's complete 540-header / 121-group named catalog, with no automatic city selection.
- [x] Prevent hidden unchanged Connection Details from blocking Quit; preserve genuine edits and reveal their workspace.
- [x] Use **Select a Map / Zone** as Tray 2's neutral title, then the selected ROM-derived map name.
- [x] Remove the proof-only preparation scope; derive areas and observed source stages from the chosen map.
- [x] Preserve map-specific preparation, identity lineage and local drafts; prove New Bark Town and Route 29 independently.
- [x] Pass 45 distinct focused checks, isolated source/UI proof, seven preceding catalog workflow checks and three final packaged quit checks; back up/verify current Data and install/reopen 0.5.18 with the live catalog.
- [ ] RI03C: validate additional ROM revisions and game-family readers, with explicit compatibility reporting; universal Pokémon ROM support remains unimplemented.
- [ ] Complete the user's real NPCDex/NPCD edit-and-return acceptance. No production map was imported by this correction.

[Completion report](Documentation/History/MAPDex-0.5.18/MAPDex-0.5.18-Completion-Report.md). Broader RI03C remains open.
'''
p=out/'NPCDex-ROMDex-Action-Checklist.md';p.write_text(p.read_text().rstrip()+'\n'+section)
p=out/'NPCDex-ROMDex-Unified-App-Action-Plan.md';p.write_text(p.read_text().rstrip()+'''\n\n## MAPDex Correction and Compatibility Requirement — October 20, 2026

The Violet City proof scope must not constrain the product's catalog, default title or selected-map compiler. Corrective 0.5.18 removes those restrictions, validates the supplied ROM's complete catalog and two independent maps, and preserves current Data/connections. Each supported ROM must expose all its maps/zones. Additional ROM revisions and Pokémon game families require validated adapters and an explicit compatibility report; neither one reviewed HGSS fingerprint nor this corrective delivery completes universal input support or broader RI03C. The user's live NPCDex/NPCD round trip also remains open. [Report](Documentation/History/MAPDex-0.5.18/MAPDex-0.5.18-Completion-Report.md).\n''')
p=out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md';p.write_text(p.read_text().rstrip()+'''\n\n## October 20 — Proof Scope Is Not a Product Restriction

The user rejected being locked to Violet City and required the map catalog to come from the ROM. Correct 0.5.18 accordingly: neutral Tray 2 title, complete catalog, selected-map area/compiler scope and local source-derived stages. Preserve old identities, map-specific preparations/drafts and saved connections. The provided ROM passed the source/UI/native/installed loading proofs. A hidden unchanged Connection Details dialog was also corrected: it no longer blocks Quit; genuine input remains protected and its workspace is revealed. Additional Pokémon ROM layouts remain explicit RI03C work rather than being represented as implemented universal compatibility. [Report](../History/MAPDex-0.5.18/MAPDex-0.5.18-Completion-Report.md).\n''')
p=out/'README.md';s=p.read_text().replace('**0.5.16**, now including MAPDex, current NPCDex/Map Package workflows and RI03P loading/delivery improvements. Violet City extraction is supported; broader RI03C acceptance remains open.','**0.5.18**, with ROM-derived map selection/catalog, neutral startup title and selected-map preparation. The supplied ROM exposes all 121 named groups; additional ROM layouts and broader RI03C acceptance remain open.').replace('ROMDex-Installer-0.5.16/ROMDex-0.5.16-x64.msi','ROMDex-Installer-0.5.18/ROMDex-0.5.18-x64.msi').replace('| ROMDex-Installer-0.5.16 |','| ROMDex-Installer-0.5.18 |');s=s.replace('- [MAPDex 0.5.16 Delivery', '- [MAPDex 0.5.18 Loading and Selection Correction](Documentation/History/MAPDex-0.5.18/MAPDex-0.5.18-Completion-Report.md)\n- [MAPDex 0.5.16 Delivery',1);p.write_text(s)
p=out/'Testing/README.md';s=p.read_text().replace('evaluation build 0.5.16','evaluation build 0.5.18').replace("choose Open ROM, select Violet City, Prepare Map, then review/export or Send to NPCDex. Only Violet City's eight areas are currently supported; another map and broader RI03C acceptance remain pending.","choose Open ROM, select a ROM-derived map group, Prepare Map, then review/export or Send to NPCDex. The supplied ROM exposes 121 groups; New Bark Town and Route 29 were also independently compiled. Additional ROM layouts and broader RI03C acceptance remain pending.");p.write_text(s)
p=out/'Build-MAPDex-0.5.18.cmd'
if p.exists():p.rename(h/p.name)
print('Recorded completed correction and retained compatibility/live-user acceptance gates.')

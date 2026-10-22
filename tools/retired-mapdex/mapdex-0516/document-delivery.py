from pathlib import Path
import json,shutil,re
root=Path.cwd();out=root/'outputs';w=root/'work/mapdex-0516';h=out/'Documentation/History/MAPDex-0.5.16';h.mkdir(parents=True,exist_ok=True)
install=json.loads((w/'installation-result.json').read_text());native=json.loads((w/'native-proof.json').read_text());live=json.loads((w/'installed-proof.json').read_text());cleanup=json.loads((w/'cleanup.json').read_text());build=json.loads((w/'build.json').read_text());assert install['status']=='installed' and native['status']==live['status']=='passed'
evidence={'version':'0.5.16','purpose':'Private MAPDex evaluation delivery; RI03C broader acceptance remains open','focusedChecks':29,'native':native,'installerValidation':json.loads((w/'msi-check.json').read_text()),'installed':live,'preservation':{k:install[k] for k in ['backup','restoration','savedConnectionsVerified','installerExitCode','dataPreservedExactly','applicationFilesVerified']},'installer':build['installer'],'cleanup':cleanup,'knownTestHarnessIssuesResolved':['Wait for workspace document readiness before Quit; no product guard bypass','Refresh the reviewed continuation before releasing a stalled test; restart an exited helper','Pass a native Windows path to MSI; first failed attempt stopped at CostFinalize before installation']}
(h/'MAPDex-0.5.16-Verification.json').write_text(json.dumps(evidence,indent=2)+'\n')
report='''# MAPDex 0.5.16 Evaluation Delivery — October 20, 2026

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
'''
(h/'MAPDex-0.5.16-Delivery-Report.md').write_text(report)
append='''
## MAPDex 0.5.16 Evaluation Delivery — October 20, 2026

- [x] Replace the fake empty map tile with functional RDX import and MAPDex actions.
- [x] Package MAPDex, ROM workers/tables and RI03P progress/delivery changes in the private 0.5.16 installer.
- [x] Pass 29 focused tests, ten native workflow/restart checks, MSI checks and installed connection verification.
- [x] Verify the complete current Data backup/restoration and preserved credentials, then upgrade and reopen MAPDex: 299 tasks, zero NPCDex maps.
- [x] Keep the current installer/recovery ZIPs; collect another 782 MB of obsolete build/test files for manual deletion.
- [ ] Complete the user's live RDX/NPCD round trip and broader RI03C coverage, including another supported map.

**Violet City's eight areas are supported for extraction; other catalog groups remain unverified. RI03C remains open and needs its own PASSKEY for further implementation.** [Delivery report](Documentation/History/MAPDex-0.5.16/MAPDex-0.5.16-Delivery-Report.md).
'''
p=out/'NPCDex-ROMDex-Action-Checklist.md';p.write_text(p.read_text().rstrip()+'\n'+append)
p=out/'NPCDex-ROMDex-Unified-App-Action-Plan.md';p.write_text(p.read_text().rstrip()+'\n\n## Operational Delivery — MAPDex Evaluation Build, October 20, 2026\n\nAt the user\'s request, installed 0.5.16 after focused/native verification, a full current Data backup and verified restoration. The empty NPCDex import actions work, and MAPDex can scan the supplied ROM, prepare Violet City, export one map and explicitly hand it to NPCDex with publication progress. Current saves/connections were preserved; the live app remains ready with 299 tasks and no maps. This delivers the test build without marking broader RI03C acceptance complete. The clean live round trip and another supported extraction remain open. [Report](Documentation/History/MAPDex-0.5.16/MAPDex-0.5.16-Delivery-Report.md).\n')
p=out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md';p.write_text(p.read_text().rstrip()+'\n\n## October 20 — MAPDex Evaluation Delivery\n\nThe user requested the actual MAPDex build instead of a source-only empty NPCDex screen. Deliver 0.5.16 with functional import actions and Violet City ROM extraction after 29 focused tests, ten packaged/native checks, verified backup/restoration and installed connection checks. Preserve the freshly reset dataset and all future test work; do not silently import a map or clear Data again. Extraction of other catalog groups remains blocked until supported; broader RI03C remains a separate gate. [Report](../History/MAPDex-0.5.16/MAPDex-0.5.16-Delivery-Report.md).\n')
p=out/'README.md';s=p.read_text().replace('Current installed release: **0.5.15**. U21–U26 Map Package selection/delivery, authorization/handoff, returned-file discovery validated result application and controlled human review are complete in source and await a later packaged release.','Current installed evaluation build: **0.5.16**, now including MAPDex, current NPCDex/Map Package workflows and RI03P loading/delivery improvements. Violet City extraction is supported; broader RI03C acceptance remains open. Latest published private updater release: **0.5.15**.');s=s.replace('ROMDex-Installer-0.5.15/ROMDex-0.5.15-x64.msi','ROMDex-Installer-0.5.16/ROMDex-0.5.16-x64.msi').replace('| ROMDex-Installer-0.5.15 | Current verified installer and release metadata. |','| ROMDex-Installer-0.5.16 | Current verified evaluation installer and application manifest. |');s=s.replace('- [Overall Action Plan]','- [MAPDex 0.5.16 Delivery and Test Steps](Documentation/History/MAPDex-0.5.16/MAPDex-0.5.16-Delivery-Report.md)\n- [Overall Action Plan]',1);p.write_text(s)
p=out/'Testing/README.md';s=p.read_text().replace('MAPDex and RI03P\'s loading/performance improvements are currently complete in source and still require the RI03C packaged acceptance step before they appear in the installed app.','MAPDex and RI03P\'s loading/performance improvements are installed in evaluation build 0.5.16. Open MAPDex from the workspace button or Windows tray; choose Open ROM, select Violet City, Prepare Map, then review/export or Send to NPCDex. Only Violet City\'s eight areas are currently supported; another map and broader RI03C acceptance remain pending.');p.write_text(s)
for name in ['Build-MAPDex-0.5.16.cmd','Finish-MAPDex-Verification.cmd']:
 p=out/name
 if p.exists():p.rename(h/name)
p=w/'checkpoint.json';v=json.loads(p.read_text());v.update(status='installed-and-verified',installedVersion='0.5.16',installerBuilt=True,productionDataPreservedExactly=True,pendingUserLaunch=None,cleanupBytes=cleanup['bytes']);v['nextSteps']=['Finish source/documentation backup','User live round-trip acceptance; further RI03C implementation requires PASSKEY'];p.write_text(json.dumps(v,indent=2))
print('Updated delivery report, verification evidence, project checklist/plan/decisions and test guide. Completed launchers filed under History.')

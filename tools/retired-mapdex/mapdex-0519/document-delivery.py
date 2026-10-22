from pathlib import Path
import json
root=Path.cwd();out=root/'outputs';w=root/'work/mapdex-0519';h=out/'Documentation/History/MAPDex-0.5.19';a=json.loads((w/'installation-result.json').read_text());live=json.loads((w/'installed-proof.json').read_text());n=json.loads((w/'native-proof.json').read_text());b=json.loads((w/'build.json').read_text());assert a['status']=='installed' and live['status']==n['status']=='passed';h.mkdir(parents=True,exist_ok=True)
e={'version':'0.5.19','scope':'Readable sub-areas within one map RDX','focusedUnitChecks':4,'sourceUI':json.loads((w/'ui-proof.json').read_text()),'native':n,'installerValidation':json.loads((w/'msi-check.json').read_text()),'installed':live,'preservation':{k:a[k] for k in ['backup','restoration','savedConnectionsVerified','installerExitCode','dataPreservedExactly','applicationFilesVerified']},'installer':b['installer'],'formatAndIdentityChanges':False,'reference':'https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/constants/maps.h'}
if (w/'cleanup.json').exists():e['cleanup']=json.loads((w/'cleanup.json').read_text())
(h/'MAPDex-0.5.19-Verification.json').write_text(json.dumps(e,indent=2)+'\n')
report=f'''# MAPDex 0.5.19 — Readable Map Contents

Installed and reopened October 20, 2026. **New Bark Town is one map RDX containing its outdoor area and seven interior/floor areas.** Each checkbox chooses a sub-area inside that same file. The previous interface displayed raw ROM codes and ambiguous wording; the underlying one-map/eight-child structure was already correct.

The setup now explicitly shows **One map file — New Bark Town.rdx**, explains that all checked sub-areas are contained within it, and lists readable names such as Elm's Lab — 1F, Player's House — 2F and Southwest House. Technical codes and numeric area IDs are retained under collapsed **Source Details**. The native export picker suggests the selected map's name rather than a generic Map.rdx.

The source model, portable format, file ownership and existing identities are unchanged. Readable defaults format the view; existing source names/content are not rewritten. A user's explicitly edited area name overrides the reference label, and that edit remains part of the normal map document. Unknown or changed area codes receive a neutral name requiring review. Reference labels require both a matching internal code and header ID; numeric ID alone does not establish a building's identity.

Building names are display hints from the pinned HGSS [area-name reference](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/constants/maps.h). Modified buildings may need review or renaming in Display Cleanup. Dialogue, entities, scripts, images and source mappings still come from the selected ROM or existing RDX, not from the name table. Full NPC/entity naming and script/chronology interpretation retain their existing review requirements.

## Validation and saves

Four focused unit checks passed for New Bark Town labels, source-code/ID matching, another town and safe export filenames. Six source UI checks passed, including all 121 catalog groups, eight readable included sub-areas, user-name precedence, hidden technical IDs and exclusion from the same map file. Three packaged native checks passed. The actual native export suggested New Bark Town.rdx and contained exactly **one map, eight sub-areas, all parented to that map**. Normal shutdown of the isolated test app completed; no cloud test records or credentials were used there.

All {a['backup']['files']} current Data files were freshly backed up, restored and individually verified in isolation. All three saved connections were verified without exposing tokens. The installer returned {a['installerExitCode']}; all {a['applicationFilesVerified']} installed files match its manifest, and Data matched the backup exactly before reopening. The installed app retains {live['application']['tasks']} tasks and {live['application']['npcdexDocuments']} NPCDex documents and opens MAPDex with its saved selection/preparation. No map was imported or published to production by verification.

Keep `Protected/Before-MAPDex-0.5.19/Data.zip`, its previous-source ZIP and the earlier protected recovery copies. The current unsigned private evaluation installer is `ROMDex-Installer-0.5.19/ROMDex-0.5.19-x64.msi`. Private update-channel publication remains at 0.5.15; this task does not publish a new update release. Other ROM layouts, broader RI03C and the user's live NPCDex/NPCD round trip remain open.

[Verification evidence](MAPDex-0.5.19-Verification.json).
'''
(h/'MAPDex-0.5.19-Completion-Report.md').write_text(report)
p=out/'NPCDex-ROMDex-Action-Checklist.md';p.write_text(p.read_text().rstrip()+'''

## MAPDex 0.5.19 — Readable Single-Map Contents, October 20, 2026

- [x] Verify the existing New Bark Town RDX already contains one map with eight child sub-areas.
- [x] Replace raw included-area codes with readable building/floor labels; keep technical IDs in collapsed Source Details.
- [x] Explicitly show one named map file and preserve user-edited area names.
- [x] Suggest the selected map's filename in the native export picker.
- [x] Pass four focused checks, six source UI checks and three packaged checks, including one-map/eight-child native export.
- [x] Back up/restore current Data, preserve connections and current preparation, install and verify 0.5.19.

[Completion report](Documentation/History/MAPDex-0.5.19/MAPDex-0.5.19-Completion-Report.md). Broader RI03C and the live NPCD round trip remain open.
''')
p=out/'NPCDex-ROMDex-Unified-App-Action-Plan.md';p.write_text(p.read_text().rstrip()+'''

## MAPDex Readability Correction — October 20, 2026

0.5.19 makes the established hierarchy explicit: one RDX for a logical map such as New Bark Town, containing all selected sub-areas. Included-area rows are not separate RDX documents. Use readable building/floor labels, preserve user names, retain source IDs in optional details, and suggest the selected map's export filename. Native export proved one map with eight child sub-areas. This is a presentation/export-naming correction; document structure and current source identities remain unchanged. [Report](Documentation/History/MAPDex-0.5.19/MAPDex-0.5.19-Completion-Report.md).
''')
p=out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md';p.write_text(p.read_text().rstrip()+'''

## October 20 — One Map File, Readable Sub-Areas

The user clarified that New Bark Town is the RDX and buildings/floors are contained sub-areas. Inspection confirmed that the existing file already has one map and eight children; the confusing technical labels/wording were the defect. 0.5.19 adds an explicit one-file summary, readable reference labels with user-name precedence, collapsed source IDs and a named native export. Keep the portable format and source mappings unchanged. Modified building purposes remain reviewable rather than inferred from their ID alone. [Report](../History/MAPDex-0.5.19/MAPDex-0.5.19-Completion-Report.md).
''')
p=out/'README.md';s=p.read_text().replace('**0.5.18**, with ROM-derived map selection/catalog, neutral startup title and selected-map preparation.','**0.5.19**, with readable area/building labels, an explicit single-map RDX summary and named exports.').replace('ROMDex-Installer-0.5.18/ROMDex-0.5.18-x64.msi','ROMDex-Installer-0.5.19/ROMDex-0.5.19-x64.msi').replace('| ROMDex-Installer-0.5.18 |','| ROMDex-Installer-0.5.19 |');s=s.replace('- [MAPDex 0.5.18 Loading','- [MAPDex 0.5.19 Readable Map Contents](Documentation/History/MAPDex-0.5.19/MAPDex-0.5.19-Completion-Report.md)\n- [MAPDex 0.5.18 Loading',1);p.write_text(s)
p=out/'Testing/README.md';s=p.read_text().replace('evaluation build 0.5.18','evaluation build 0.5.19');s+='\nMAPDex shows one named RDX containing the checked sub-areas. Building/floor labels are reference hints; user-reviewed names override them and raw IDs remain under Source Details. Export suggests the map name.\n';p.write_text(s)
p=out/'Build-MAPDex-0.5.19.cmd'
if p.exists():p.rename(h/p.name)
print('Recorded completed readable-area correction; broader acceptance gates remain open.')

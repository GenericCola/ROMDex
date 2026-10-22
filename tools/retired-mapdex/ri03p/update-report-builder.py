from pathlib import Path
p=Path('work/ri03p/finish-docs.py');s=p.read_text(encoding='utf-8')
s=s.replace("live=json.loads((work/'live-proof.json').read_text());assert live['status']=='passed' and live['cleanup']['status']=='passed'", "live=json.loads((work/'live-proof.json').read_text());assert live['status']=='passed' and live['cleanup']['status']=='passed'\nagile=json.loads((work/'agile-proof.json').read_text());assert agile['status']=='passed' and agile['cleanup']['status']=='passed'\nui=json.loads((work/'progress-ui.json').read_text());assert ui['passed']")
s=s.replace("js(evidence/'runtime.json',runtime)", "js(evidence/'runtime.json',runtime)\njs(evidence/'publication-ui.json',ui)\njs(evidence/'agile-followup.json',{'task':'RI03P','status':agile['status'],'purpose':agile['purpose'],'measurements':agile['measurements'],'records':len(agile['records']),'cleanup':agile['cleanup'],'productionChanged':False})")
s=s.replace("'distinctPassed':54", "'distinctPassed':60").replace("'syntaxChecks':5", "'syntaxChecks':10").replace("'The 25 existing cloud tests overlap.", "'The 25 existing cloud tests overlap.")
s=s.replace("17 MAPDex checks plus 30 cloud checks plus 7 pack/transport checks = 54 distinct checks.", "18 MAPDex checks plus 30 cloud checks plus 8 pack/transport checks plus 4 progress checks = 60 distinct checks. A final bounded prefetch/reference-cache guard and loading bar were added after the full-map helper started, then targeted checks, five UI behaviors and the bundled runtime were rechecked. Final warm delivery is measured separately using one prepared interior, without repeating the full-map upload.")
s=s.replace("## Measured live proof", "## Measured full-map baseline")
s=s.replace("The Windows-launched helper used the saved protected credential", "This helper started before the final eight-at-a-time attachment-metadata prefetch/cache reuse was added. These full-map timings are a baseline for the compressed delivery layout, not final-prefetch timing claims. The Windows-launched helper used the saved protected credential")
s=s.replace("## Preservation and recovery", """## Final-code agility and progress follow-up

The final code prefetches attachment metadata at most eight requests at a time (at most 256 inventories prefetched; any further required inventories use the existing lazy route). Fresh, validated native snapshots also supply the same-cycle issue metadata cache. No API field, request budget or validation check is bypassed.

To measure that correction without another complete 134-record upload, the same helper prepared one already-extracted Violet City interior and used separate private proof records, then confirmed all {agile['cleanup']['verifiedAbsent']} exact follow-up IDs absent. It retained all original source/assets and the local note. This smaller-scope measurement establishes a final-code warm-save result, not a full-map timing guarantee.

| Final-code follow-up | Wall time | Requests | Writes |
| --- | ---: | ---: | ---: |
| Interior setup ({len(agile['records'])} records) | {agile['measurements']['interiorSetup']['milliseconds']/1000:.1f} s | {agile['measurements']['interiorSetup']['requests']} | {agile['measurements']['interiorSetup']['writes']} |
| Local note/flag update | {agile['measurements']['localNoteDelta']['milliseconds']/1000:.1f} s | {agile['measurements']['localNoteDelta']['requests']} | {agile['measurements']['localNoteDelta']['writes']} |
| Unchanged sync | {agile['measurements']['unchangedSync']['milliseconds']/1000:.1f} s | {agile['measurements']['unchangedSync']['requests']} | {agile['measurements']['unchangedSync']['writes']} |

The user clarified that initial publication may take longer, provided it has a loading bar and routine synchronization is agile. MAPDex now displays a counted publication bar, explicit queued/manual/paused/review states, and a separate final verified-commit step. Polling updates only publication status rather than rebuilding fields or stealing focus. Five source-UI checks passed at normal and short window sizes; screenshots were inspected locally and excluded from Git. Native installed-window acceptance remains U28–U30.

## Preservation and recovery""")
s=s.replace('54 distinct focused checks passed: 17 MAPDex, 30 cloud and 7 delivery/transport checks.', '60 distinct focused checks passed: 18 MAPDex, 30 cloud, 8 delivery/transport and 4 progress checks.')
s=s.replace('Five changed source/test modules passed syntax checks.', 'Ten changed source/test modules passed syntax checks. A final reference-consistency guard passed two focused cache checks and the bundled-runtime recheck.')
s=s.replace("'distinctFocusedTests':54", "'distinctFocusedTests':60").replace("'syntaxChecks':5", "'syntaxChecks':10")
s=s.replace("'cleanup':live['cleanup'],'nextTask'", "'cleanup':{'fullMap':live['cleanup'],'finalCodeFollowup':agile['cleanup']},'sourceUIBehaviors':5,'nextTask'")
p.write_bytes(s.encode('utf-8'))
p=Path('work/ri03p/prepare-backup.py');s=p.read_text(encoding='utf-8');s=s.replace("'README.md','CHANGELOG.md']", "'README.md','CHANGELOG.md','rom/workspace.mjs','public/rom-import.mjs','public/rom-import.html','public/mapdex-progress.mjs','tests/rom-workspace.test.mjs','tests/mapdex-progress.test.mjs']")
s=s.replace("'verify-live.cjs','host.mjs']", "'verify-live.cjs','verify-agile.cjs','progress-ui.mjs','host.mjs']")
p.write_bytes(s.encode('utf-8'))
print('Updated report/backup builders for loading bar and targeted final-code agility evidence')

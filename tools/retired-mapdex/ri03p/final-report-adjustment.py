from pathlib import Path
p=Path('work/ri03p/finish-docs.py');s=p.read_text(encoding='utf-8')
s=s.replace("agile=json.loads((work/'agile-proof.json').read_text());assert agile['status']=='passed' and agile['cleanup']['status']=='passed'\n",'')
start=s.index("js(evidence/'agile-followup.json'");end=s.index('\n',start);s=s[:start]+s[end:]
s=s.replace("'initialAttempt'", "'initialAttempt'")
s=s.replace("'cleanup':live['cleanup'],'productionChanged':False}", "'cleanup':live['cleanup'],'initialAttempt':live.get('initialAttempt'),'productionChanged':False}")
s=s.replace("Final warm delivery is measured separately using one prepared interior, without repeating the full-map upload.", "The initially running full-map reader hit its serial metadata time limit after every object was uploaded. A controlled isolated-reader restart resumed those verified uploads with bounded parallel prefetch; the same full map then supplied final-code warm-save measurements. No repeated full-map upload or second dataset was needed.")
s=s.replace("names={'coldPublication':'Initial publication'", "names={'verifiedUploadResume':'Resume verified initial upload'")
s=s.replace('## Measured full-map baseline','## Measured full-map proof')
s=s.replace("This helper started before the final eight-at-a-time attachment-metadata prefetch/cache reuse was added. These full-map timings are a baseline for the compressed delivery layout, not final-prefetch timing claims. The Windows-launched helper used the saved protected credential", "The initially running reader hit the cycle time limit during serial metadata verification, after all 595 objects were delivered. Its frozen intent/files were retained; only that identified isolated process was stopped, and the existing host resumed with the final bounded parallel implementation. No object reupload was needed. The Windows-launched helper used the saved protected credential")
start=s.index('## Final-code agility and progress follow-up');end=s.index('## Preservation and recovery',start)
s=s[:start]+'''## Routine synchronization and visible progress

The table measures the final parallel implementation on the complete 134-record map. The first row is recovery from an already verified upload, not a clean cold-publication benchmark. The initial attempt plus diagnosis/restart reached its verified checkpoint after {live['initialAttempt']['observedTotalMilliseconds']/1000:.1f} seconds measured from the original helper launch; this includes the interrupted serial verification and manual restart wait. Initial-run HTTP totals were not persisted before that restart and are not invented. Layout/file/byte comparisons remain deterministic on the exact same input. Warm local/native/unchanged and second-instance measurements are uninterrupted final-code measurements.

Attachment metadata prefetch uses at most eight requests concurrently and prefetches at most 256 inventories; further required inventories retain the original lazy route. Fresh validated native snapshots supply the same-cycle issue metadata cache. Each referenced attachment still requires current identity/ownership/size/update checks. No request/read bound is increased.

The user clarified that initial publication may take longer if it has a loading bar, while routine synchronization should be agile. MAPDex now displays a counted publication bar, explicit queued/manual/paused/review states and a separate final verified-commit step. Polling updates only publication status instead of rebuilding fields or stealing focus. Five source-UI checks passed at normal and short window sizes; screenshots were inspected locally and excluded from Git. Native installed-window acceptance remains U28–U30.

'''+s[end:]
s=s.replace("'cleanup':{'fullMap':live['cleanup'],'finalCodeFollowup':agile['cleanup']}","'cleanup':live['cleanup']")
p.write_bytes(s.encode('utf-8'))
p=Path('work/ri03p/prepare-backup.py');s=p.read_text(encoding='utf-8').replace("'verify-live.cjs','verify-agile.cjs','progress-ui.mjs'", "'verify-live.cjs','verify-resume.cjs','progress-ui.mjs'");p.write_bytes(s.encode('utf-8'))
print('Final report will distinguish interrupted initial publication from complete-map final warm-save measurements')

from pathlib import Path
import json,os,datetime
root=Path.cwd().resolve();w=root/'work/mapdex-0516';proof=json.loads((w/'installed-proof.json').read_text());assert proof['status']=='passed' and proof['installedApplicationOpen'];assert json.loads((w/'host-state.json').read_text())['phase']=='Stopped normally'
trash=(root/'DELETE-ME-ROMDEX-NPCDEX-OLD-FILES-2026-10-20'/'MAPDex-0.5.16-build-leftovers').resolve();assert trash.is_relative_to(root);trash.mkdir(parents=True,exist_ok=False)
paths=['work/mapdex-0516/package','work/mapdex-0516/make','work/mapdex-0516/tmp','work/mapdex-0516/qa-profile','work/mapdex-0516/private-profile','work/mapdex-0516/VioletCity-Packaged-Export.rdx','outputs/ROMDex-Installer-0.5.15','outputs/Protected/Before-MAPDex-0.5.16/Restore-Verification']
report={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'folder':str(trash),'moved':[],'skipped':[],'bytes':0,'installedApplicationChanged':False,'permanentlyDeleted':False}
for relative in paths:
 s=(root/relative).resolve();d=(trash/relative).resolve();assert s.is_relative_to(root) and d.is_relative_to(trash) and s!=root
 if not s.exists():continue
 try:
  entries=list(s.rglob('*')) if s.is_dir() else [s];files=[p for p in entries if p.is_file()];assert not any(p.is_symlink() for p in entries);n=sum(p.stat().st_size for p in files);d.parent.mkdir(parents=True,exist_ok=True);assert not d.exists();s.rename(d);report['moved'].append({'source':str(s),'destination':str(d),'bytes':n,'files':len(files)});report['bytes']+=n
 except Exception as e:report['skipped'].append({'path':str(s),'error':str(e)})
(w/'cleanup.json').write_text(json.dumps(report,indent=2));(trash/'READ-ME.txt').write_text('Obsolete 0.5.15 installer, verified disposable test/build files and the duplicate restoration check. Current installed ROMDex and the 0.5.16 installer are outside this folder. Protected compressed backups remain in outputs/Protected. Delete this folder manually when ready.\n')
print(json.dumps({'bytes':report['bytes'],'moved':len(report['moved']),'skipped':report['skipped']}))

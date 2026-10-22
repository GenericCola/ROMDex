from pathlib import Path
import json,shutil,os
root=Path(__file__).resolve().parents[2];w=Path(__file__).parent
assert json.loads((w/'git-archive-verified.json').read_text())['remoteMatched']
assert json.loads((w/'installed-proof.json').read_text())['status']=='passed'
targets=[Path(p) for p in json.loads((w/'feature-workdirs.json').read_text())]
targets += [p for p in (root/'outputs').iterdir() if p.is_dir() and p.name.startswith('ROMDex-Installer-') and p.name!='ROMDex-Installer-0.5.15-Restored']
history=root/'outputs/Documentation/History'
targets += [p for p in history.iterdir() if p.is_dir() and p.name.startswith(('RI0','MX0','LP0','MAPDex-','Phase11','UI-Spacing-0.5.26'))]
project=root/'outputs/Documentation/Project'
targets += [p for p in project.iterdir() if p.is_dir() and p.name.startswith(('MX0','LP0','RI0','MAPDex-','Phase-11'))]
targets += [p for p in (root/'outputs').iterdir() if p.is_file() and p.name.startswith(('Build-MAPDex-','Finish-MAPDex-','Build-ROMDex-0.5.26'))]
targets += [p for p in (root/'outputs/Testing').iterdir() if p.name=='VioletCityMap.rdx'] if (root/'outputs/Testing').exists() else []
targets += [w/name for name in ['isolated','package','make','tmp','source-pre-mapdex']]
# Ignored third-party compiler binaries may survive a Git source restore.
targets += [root/'work/u13b/repository/apps/romdex/rom']
result={'status':'complete','removed':[],'retained':[],'logicalBytesRemoved':0,'preserved':['Protected backups','Original supplied ROM','Current task data and credentials','Restored 0.5.15 installer','Git archive branch']}
for p in targets:
 if not p.exists():continue
 assert p.resolve().is_relative_to(root) and p.resolve()!=root and p.resolve()!=w
 assert not p.is_symlink()
 assert not p.resolve().is_relative_to(root/'outputs/Protected')
 size=sum(f.stat().st_size for f in p.rglob('*') if f.is_file() and not f.is_symlink()) if p.is_dir() else p.stat().st_size
 try:
  if p.is_dir():shutil.rmtree(p)
  else:p.unlink()
  result['removed'].append(str(p.relative_to(root)));result['logicalBytesRemoved']+=size
 except OSError as e:result['retained'].append({'path':str(p.relative_to(root)),'error':str(e)})
if result['retained']:result['status']='partial-locked-files'
(w/'cleanup-result.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'status':result['status'],'removedDirectoriesOrFiles':len(result['removed']),'logicalBytesRemoved':result['logicalBytesRemoved'],'retained':result['retained']}))

from pathlib import Path
import json,base64,hashlib,time
root=Path.cwd();w=root/'work/mapdex-0517';w.mkdir(exist_ok=True)
p=root/'outputs/ROMDex/package.json';v=json.loads(p.read_text());v['version']='0.5.17';p.write_text(json.dumps(v,indent=2)+'\n')
p=root/'outputs/ROMDex/public/index.html';p.write_text(p.read_text().replace('0.5.16','0.5.17'))
p=root/'outputs/ROMDex/CHANGELOG.md';p.write_text('''## 0.5.17 — ROM Catalog and Map Selection Correction

- Ignore metadata-only ctime updates when checking whether a ROM changed; preserve size, modification time, file identity and fingerprint checks.
- Derive every map/zone group and display name from the ROM; no city is preselected.
- Prepare the selected map's areas and observed source stages instead of compiling only the Violet City proof scope.
- Retain independent map drafts, saved preparations, source identities and original ROM bytes.
- The current source reader supports the reviewed HGSS layout; other game/build layouts still require their own validated adapters.

'''+p.read_text())
for name in ['package.mjs','host.mjs','run-msi-check.mjs','validate-msi.ps1','run-install.cjs','restore-check.py','run-installed-check.mjs']:
 s=(root/'work/mapdex-0516'/name).read_text().replace('mapdex-0516','mapdex-0517').replace('0.5.16','0.5.17').replace('0.5.15','0.5.16')
 if name=='run-install.cjs':s=s.replace("'APPLICATIONROOTDIRECTORY='+application","'APPLICATIONROOTDIRECTORY='+path.win32.normalize(application)")
 (w/name).write_text(s)
s=(root/'work/mapdex-0516/launch.ps1').read_text().replace('mapdex-0516','mapdex-0517').replace('0.5.16','0.5.17');(w/'launch.ps1').write_text(s)
(root/'outputs/Build-MAPDex-0.5.17.cmd').write_text('@echo off\npowershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand '+base64.b64encode(s.encode('utf-16le')).decode()+'\n')
p=w/'package.mjs';(w/'job.json').write_text(json.dumps({'id':'build-catalog-fix-0517','file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'at':int(time.time()*1000)}))
print('0.5.17 build helper prepared after the successful source/runtime/UI proof; no installer built or production changes made yet.')

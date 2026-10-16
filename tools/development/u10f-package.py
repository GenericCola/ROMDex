from pathlib import Path
import json,hashlib,shutil,subprocess
root=Path.cwd();source=root/'outputs/ROMDex';release=root/'outputs/ROMDex-Desktop-U10F';runtime=root/'work/u10/runtime/electron'
pkg=json.loads((source/'package.json').read_text());pkg['version']='0.5.0-preview.10f';(source/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
index=source/'public/index.html';text=index.read_text(encoding='utf-8');index.write_text(text.replace('ROMDex 0.5.0-preview.10 · NPCDex Add-On','ROMDex 0.5.0-preview.10f · NPCDex Add-On'),encoding='utf-8')
release.mkdir(exist_ok=False)
for item in runtime.iterdir():
 if item.name=='electron.exe':shutil.copyfile(item,release/'ROMDex.exe')
 elif item.is_dir():shutil.copytree(item,release/item.name)
 else:shutil.copyfile(item,release/item.name)
baseline=json.loads((root/'work/u10f/baseline.json').read_text());paths={r['path'] for r in baseline['files']};paths.update(['public/file-drop.mjs','desktop/native-attachments.mjs','tests/file-drop.test.mjs','U10F-File-Drop-Guide.md']);syntax=0
for rel in sorted(paths):
 data=((root/'outputs/U10F-Before/preview.png') if rel=='preview.png' else source/rel).read_bytes();target=release/'resources/app'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 if rel.endswith(('.mjs','.cjs','.js')):
  r=subprocess.run(['C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe','--check',str(target)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError(r.stderr)
  syntax+=1
shutil.copyfile(source/'U10F-File-Drop-Guide.md',release/'READ-ME-FIRST.md');records=[]
for file in sorted(release.rglob('*')):
 if file.is_file():records.append({'path':file.relative_to(release).as_posix(),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
manifest={'task':'U10F','version':pkg['version'],'electron':'44.7.2','platform':'win32-x64','testsPassed':245,'syntaxChecks':syntax,'files':records,'bytes':sum(x['bytes'] for x in records),'credentialsExcluded':True,'includesPrivateProjectData':True,'graphicalAcceptancePending':True}
(root/'outputs/U10F-Desktop-Manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({k:v for k,v in manifest.items() if k!='files'}))

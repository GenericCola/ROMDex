from pathlib import Path
import json,hashlib,shutil,subprocess
root=Path.cwd();source=root/'outputs/ROMDex';release=root/'outputs/ROMDex-Desktop-U10';runtime=root/'work/u10/runtime/electron'
pkg=json.loads((source/'package.json').read_text());pkg['version']='0.5.0-preview.10';(source/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
index=source/'public/index.html';text=index.read_text(encoding='utf-8');index.write_text(text.replace('ROMDex 0.4.3 · NPCDex Add-On','ROMDex 0.5.0-preview.10 · NPCDex Add-On'),encoding='utf-8')
shutil.copyfile(root/'work/u10/runtime/runtime.json',source/'desktop/runtime-lock.json')
release.mkdir(exist_ok=True)
for item in runtime.iterdir():
 if item.name=='electron.exe':shutil.copyfile(item,release/'ROMDex.exe')
 elif item.is_dir():shutil.copytree(item,release/item.name,dirs_exist_ok=True)
 else:shutil.copyfile(item,release/item.name)
manifest=json.loads((root/'outputs/ROMDex-v0.4.3-Manifest.json').read_text());paths={str(Path(x['path']).relative_to('ROMDex')) for x in manifest['files']}
paths.update(str(x.relative_to(source)) for x in (source/'desktop').glob('*') if x.is_file())
paths.update(['public/desktop-workspace.mjs','public/desktop-methods.mjs','tests/desktop-policy.test.mjs','U10-Desktop-Preview-Guide.md'])
checks=0
for rel in sorted(paths):
 data=((root/'outputs/U10-Before/preview.png') if rel=='preview.png' else source/rel).read_bytes();target=release/'resources/app'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 if rel.endswith(('.mjs','.cjs','.js')):
  result=subprocess.run(['C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe','--check',str(target)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr)
  checks+=1
shutil.copyfile(source/'U10-Desktop-Preview-Guide.md',release/'READ-ME-FIRST.md')
records=[]
for f in sorted(release.rglob('*')):
 if f.is_file():records.append({'path':f.relative_to(release).as_posix(),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
result={'task':'U10','version':pkg['version'],'electron':'44.7.2','platform':'win32-x64','syntaxChecks':checks,'files':records,'bytes':sum(r['bytes'] for r in records),'credentialsExcluded':True,'includesPrivateProjectData':True,'graphicalAcceptancePending':True}
(root/'outputs/U10-Desktop-Manifest.json').write_text(json.dumps(result,indent=2))
print(json.dumps({k:v for k,v in result.items() if k!='files'}))

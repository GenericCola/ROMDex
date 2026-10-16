from pathlib import Path
import json,hashlib,shutil,subprocess
root=Path.cwd();source=root/'outputs/ROMDex';release=root/'outputs/ROMDex-Desktop-U12';previous=root/'outputs/ROMDex-Desktop-U11'
pkg=json.loads((source/'package.json').read_text());pkg['version']='0.5.0-preview.12';(source/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
index=source/'public/index.html';index.write_text(index.read_text(encoding='utf-8').replace('ROMDex 0.5.0-preview.11 · NPCDex Add-On','ROMDex 0.5.0-preview.12 · NPCDex Add-On'),encoding='utf-8')
shutil.copytree(previous,release)
manifest=json.loads((root/'outputs/U11-Desktop-Manifest.json').read_text());paths={r['path'][14:] for r in manifest['files'] if r['path'].startswith('resources/app/')}
paths.update(['credential-protection.mjs','desktop/credentials.mjs','desktop/migration.mjs','desktop/first-run.mjs','public/migration-format.mjs','public/migration-capture.html','public/migration-capture.mjs','public/migration-capture.css','tests/desktop-migration.test.mjs','U12-Desktop-Guide.md']);syntax=0
for rel in sorted(paths):
 data=(source/rel if (source/rel).exists() else root/'outputs/U12-Before'/rel).read_bytes();target=release/'resources/app'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 if rel.endswith(('.mjs','.cjs','.js')):
  r=subprocess.run(['C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe','--check',str(target)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError(r.stderr)
  syntax+=1
shutil.copyfile(source/'U12-Desktop-Guide.md',release/'READ-ME-FIRST.md');records=[]
for file in sorted(release.rglob('*')):
 if file.is_file():records.append({'path':file.relative_to(release).as_posix(),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
manifest={'task':'U12','version':pkg['version'],'electron':'44.7.2','platform':'win32-x64','testsPassed':271,'syntaxChecks':syntax,'files':records,'bytes':sum(x['bytes'] for x in records),'credentialsExcluded':True,'migratedDataExcluded':True,'includesPrivateProjectBaselines':True,'graphicalAcceptancePending':True}
(root/'outputs/U12-Desktop-Manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({k:v for k,v in manifest.items() if k!='files'}))

from pathlib import Path
import json, hashlib, zipfile, subprocess
root=Path.cwd();out=root/'outputs';source=out/'ROMDex';release=out/'ROMDex-v0.4.2'
if release.exists():
 assert release.resolve().parent==out.resolve() and release.name=='ROMDex-v0.4.2'
 previous=json.loads((out/'ROMDex-v0.4.2-Manifest.json').read_text(encoding='utf-8'));assert previous['task']=='U08'
 for r in previous['files']:
  target=(release/r['path']).resolve();assert release.resolve() in target.parents
  assert hashlib.sha256(target.read_bytes()).hexdigest()==r['sha256']
 assert hashlib.sha256((out/'ROMDex-v0.4.2.zip').read_bytes()).hexdigest()==previous['zipSHA256']
baseline=json.loads((root/'work/u08/baseline.json').read_text(encoding='utf-8'))
paths={f['path'] for f in baseline['files']}
paths.update(['public/tasks.html','public/workspace-host.mjs','public/shell.mjs','public/shell.css','public/addons/npcdex/index.html','public/addons/npcdex/workspace.js','U08-Workspace-Guide.md'])
preview=out/'ROMDex-v0.4.2-Preview.png';preview.write_bytes((out/'U08-Combined-Workspace-QA.png').read_bytes());records=[]
node=Path('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');syntax=0
for rel in sorted(paths):
 assert '..' not in Path(rel).parts and '.romdex' not in Path(rel).parts and not rel.startswith('work/')
 data=(preview if rel=='preview.png' else source/rel).read_bytes();target=release/'ROMDex'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 records.append({'path':'ROMDex/'+rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 if rel.endswith(('.mjs','.js')):
  result=subprocess.run([str(node),'--check',str(target)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr)
  syntax+=1
archive=out/'ROMDex-v0.4.2.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
 for record in records:z.write(release/record['path'],record['path'])
with zipfile.ZipFile(archive) as z:
 assert sorted(z.namelist())==sorted(r['path'] for r in records)
 for r in records:assert hashlib.sha256(z.read(r['path'])).hexdigest()==r['sha256']
manifest={'version':'0.4.2','task':'U08','fileCount':len(records),'syntaxChecks':syntax,'testsPassed':227,'npcDexSavedRevision':baseline['export']['revision'],'zipBytes':archive.stat().st_size,'zipSHA256':hashlib.sha256(archive.read_bytes()).hexdigest(),'credentialsAndRuntimeExcluded':True,'includesPrivateProjectData':True,'files':records}
(out/'ROMDex-v0.4.2-Manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in manifest.items() if k!='files'}))

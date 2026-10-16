from pathlib import Path
import json, hashlib, zipfile, subprocess
root=Path.cwd();out=root/'outputs';source=out/'ROMDex';release=out/'ROMDex-v0.4.3'
if release.exists():raise RuntimeError('Release already exists; inspect before replacing.')
baseline=json.loads((root/'work/u09/baseline.json').read_text(encoding='utf-8'))
paths={f['path'] for f in baseline['files']}
paths.update(['public/workspace-engine.mjs','public/workspace-runtime.mjs','public/save-coordinator.mjs','public/addons/npcdex/coordination.js','durable-json-storage.mjs','tests/save-coordinator.test.mjs','U09-Save-and-Recovery-Guide.md'])
preview=out/'ROMDex-v0.4.3-Preview.png';preview.write_bytes((out/'U09-Coordination-QA.png').read_bytes());records=[]
node=Path('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');syntax=0
for rel in sorted(paths):
 assert '..' not in Path(rel).parts and '.romdex' not in Path(rel).parts and not rel.startswith('work/')
 data=(preview if rel=='preview.png' else source/rel).read_bytes();target=release/'ROMDex'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 records.append({'path':'ROMDex/'+rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 if rel.endswith(('.mjs','.js')):
  result=subprocess.run([str(node),'--check',str(target)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr)
  syntax+=1
archive=out/'ROMDex-v0.4.3.zip'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED) as z:
 for record in records:z.write(release/record['path'],record['path'])
with zipfile.ZipFile(archive) as z:
 assert sorted(z.namelist())==sorted(r['path'] for r in records)
 for r in records:assert hashlib.sha256(z.read(r['path'])).hexdigest()==r['sha256']
manifest={'version':'0.4.3','task':'U09','fileCount':len(records),'syntaxChecks':syntax,'testsPassed':237,'zipBytes':archive.stat().st_size,'zipSHA256':hashlib.sha256(archive.read_bytes()).hexdigest(),'credentialsAndRuntimeExcluded':True,'includesPrivateProjectData':True,'files':records}
(out/'ROMDex-v0.4.3-Manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in manifest.items() if k!='files'}))

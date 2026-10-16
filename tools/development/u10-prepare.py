from pathlib import Path
import json,hashlib,zipfile
root=Path.cwd();out=root/'outputs';source=out/'ROMDex';dest=out/'U10-Before'
manifest=json.loads((out/'ROMDex-v0.4.3-Manifest.json').read_text())
dest.mkdir(exist_ok=True)
for r in manifest['files']:
 rel=Path(r['path']).relative_to('ROMDex');data=((out/'ROMDex-v0.4.3'/r['path']) if str(rel)=='preview.png' else source/rel).read_bytes()
 # The release's preview is generated from QA independently of source.
 if str(rel)!='preview.png' and hashlib.sha256(data).hexdigest()!=r['sha256']:raise RuntimeError('Source drift '+str(rel))
 target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists() and target.read_bytes()!=data:raise RuntimeError('Backup mismatch '+str(rel))
 target.write_bytes(data)
runtime=root/'work/u10/runtime';meta=json.loads((runtime/'runtime.json').read_text());target=runtime/'electron'
target.mkdir(exist_ok=False)
with zipfile.ZipFile(runtime/f"electron-v{meta['version']}-win32-x64.zip") as z:z.extractall(target)
print(json.dumps({'protectedFiles':len(manifest['files']),'runtimeExtracted':meta['version']}))

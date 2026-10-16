from pathlib import Path
import json, hashlib, zipfile, subprocess
root=Path.cwd()
out=root/'outputs'
old=json.loads((out/'ROMDex-v0.4-Manifest.json').read_text(encoding='utf-8'))
release=out/'ROMDex-v0.4.1'
if release.exists():
    raise RuntimeError('Release destination already exists; inspect before replacing it.')
paths=[entry['path'][7:] for entry in old['files']]+['tests/attachment-deletion.test.mjs']
assert len(paths)==len(set(paths))==70
preview=out/'ROMDex-v0.4.1-Preview.png'
preview.write_bytes((out/'S01-Attachment-Delete-QA.png').read_bytes())
records=[]
for rel in sorted(paths):
    assert '..' not in Path(rel).parts and '.romdex' not in Path(rel).parts
    source=preview if rel=='preview.png' else out/'ROMDex'/rel
    data=source.read_bytes()
    target=release/'ROMDex'/rel
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(data)
    records.append({'path':'ROMDex/'+rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
archive=out/'ROMDex-v0.4.1.zip'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED) as z:
    for entry in records:z.write(release/entry['path'],entry['path'])
with zipfile.ZipFile(archive) as z:
    assert sorted(z.namelist())==sorted(e['path'] for e in records)
    for entry in records:
        data=z.read(entry['path']);assert len(data)==entry['bytes'] and hashlib.sha256(data).hexdigest()==entry['sha256']
manifest={'version':'0.4.1','task':'S01','fileCount':len(records),'testsPassed':227,'zipBytes':archive.stat().st_size,'zipSHA256':hashlib.sha256(archive.read_bytes()).hexdigest(),'privateRuntimeExcluded':True,'files':records}
(out/'ROMDex-v0.4.1-Manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
node=Path('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
modules=[]
for entry in records:
    if entry['path'].endswith('.mjs'):
        check=subprocess.run([str(node),'--check',str(release/entry['path'])],capture_output=True,text=True)
        if check.returncode:raise RuntimeError(check.stderr)
        modules.append(entry['path'])
result={'files':len(records),'syntaxChecks':len(modules),'zipVerified':True,'privateRuntimeExcluded':True,'installation':str(release/'ROMDex')}
(root/'work/s01/package-verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))

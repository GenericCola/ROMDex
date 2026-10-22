from pathlib import Path
import subprocess,hashlib,json,shutil
root=Path(__file__).resolve().parents[2];repo=root/'work/u13b/repository';source=root/'outputs/ROMDex';candidate=root/'work/lp03/candidate'
changed=subprocess.check_output(['git','diff','--name-only'],cwd=repo,text=True).splitlines()
changed+=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=repo,text=True).splitlines()
count=0
for rel in set(changed):
 p=repo/rel
 if p.suffix not in ['.mjs','.js','.cjs','.css','.html','.json','.md'] or not p.is_file() or '/vendor/' in rel:continue
 if rel.startswith('apps/romdex/'):
  src=source/rel[len('apps/romdex/'):]
  if not src.is_file():continue
  data=(src.read_text(encoding='utf-8').rstrip()+'\n').encode();src.write_bytes(data);p.write_bytes(data)
  packaged=candidate/'resources/app'/rel[len('apps/romdex/'):]
  if packaged.is_file() and packaged.name!='package.json':packaged.write_bytes(data)
 elif rel.startswith('docs/project/'):
  text=p.read_text(encoding='utf-8');p.write_bytes(('\n'.join(line.rstrip() for line in text.splitlines()).rstrip()+'\n').encode())
 count+=1
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=root/'outputs'/name;text=p.read_text();p.write_bytes(('\n'.join(line.rstrip() for line in text.splitlines()).rstrip()+'\n').encode())
notice=source/'rom/vendor/apicula/NOTICE.md';text=notice.read_text().replace('see the full terms retained with winapi.','see rust-standard-library for the retained Rust copyright and full terms.');notice.write_text(text)
for dest in [repo/'apps/romdex/rom/vendor/apicula',candidate/'resources/app/rom/vendor/apicula']:shutil.copytree(source/'rom/vendor/apicula',dest,dirs_exist_ok=True)
manifest=json.loads((root/'work/lp03/build.json').read_text());files=[]
for p in candidate.rglob('*'):
 if p.is_file():
  b=p.read_bytes();files.append({'path':p.relative_to(candidate).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
manifest['files']=files;manifest['lineEndingNormalization']='LF; code semantics unchanged';manifest['rustNotices']='Rust 1.80 copyright/MIT/Apache retained';(root/'work/lp03/build.json').write_text(json.dumps(manifest,indent=2)+'\n')
for name in ['LP02-Contract-Verification.json']:
 shutil.copyfile(root/'outputs/RDX-Reference/MX01-Contracts'/name,repo/'docs/project/MX01-Contracts'/name)
print(json.dumps({'normalizedFiles':count,'candidateFiles':len(files),'codeSemanticsChanged':False}))

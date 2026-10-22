from pathlib import Path
import shutil,json,hashlib,re
root=Path.cwd();src=root/'outputs/ROMDex';dst=root/'work/u13b/repository/apps/romdex';changed=[]
files=[]
for d in ['cloud','content','desktop','examples','public','rdx','rom','shared-ui','tests']:
 files.extend(p for p in (src/d).rglob('*') if p.is_file())
files.extend(p for p in src.iterdir() if p.is_file() and (p.suffix in ['.mjs','.cjs','.md'] or p.name=='package.json'))
for p in files:
 rel=p.relative_to(src);q=dst/rel;b=p.read_bytes()
 if not q.exists() or q.read_bytes()!=b:q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q);changed.append(str(rel))
logs=['work/mx08-focused.log','work/mx08/queue-recheck.log','work/mx09/tools-recheck.log','work/mx09/final-regressions.log','work/mx09/discovery-repair-recheck.log','work/mx09/prose-history-recheck.log']
names=set();counts=[]
for file in logs:
 text=(root/file).read_text(encoding='utf-8-sig');found=set(re.findall(r'^✔ (.*?) \([0-9.]+ms\)',text,re.M));names.update(found);counts.append({'log':file,'distinctPassingTitles':len(found)})
(root/'work/phase11e/test-counts.json').write_text(json.dumps({'distinctPassingTests':len(names),'logs':counts},indent=2),encoding='utf-8')
print(json.dumps({'mirroredFiles':len(changed),'changed':changed,'distinctTests':len(names)},indent=2))

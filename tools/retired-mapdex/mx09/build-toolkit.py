from pathlib import Path
import re,json,hashlib,zipfile
root=Path.cwd();source=root/'outputs/ROMDex';dest=root/'outputs/RDX-Reference';dest.mkdir(exist_ok=True)
pending=['rdx/agent-cli.mjs'];seen=set()
while pending:
 rel=pending.pop()
 if rel in seen:continue
 p=source/rel;assert p.is_file() and not p.is_symlink(),rel
 assert p.suffix in ['.mjs','.cjs','.js','.json'],rel
 seen.add(rel)
 if p.suffix=='.json':continue
 text=p.read_text(encoding='utf-8-sig')
 references=re.findall(r'''(?:from\s*|import\s*\(|import\s+|new URL\s*\()\s*['"](\.[^'"\n]+)['"]''',text)
 for ref in references:
  target=(p.parent/ref).resolve();assert target.is_relative_to(source),ref
  pending.append(target.relative_to(source).as_posix())
files={r:(source/r).read_bytes() for r in sorted(seen)}
files['README.md']=(source/'rdx/authoring/BOUND-RETURNS.md').read_bytes()
files['package.json']=(json.dumps({'name':'romdex-agent-tools','version':'0.5.26-11e.1','private':True,'type':'module','engines':{'node':'>=24.19.0'}},indent=2)+'\n').encode()
manifest={'format':'ROMDexAgentFileTools/2','version':'0.5.26-11e.1','containsCredentials':False,'containsROM':False,'containsLiveData':False,'files':[{'path':r,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for r,b in sorted(files.items())]}
files['tool-manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode()
zip_path=dest/'Phase-11E-Agent-Tools.zip'
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for r,b in sorted(files.items()):
  info=zipfile.ZipInfo(r,date_time=(2026,10,21,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,b)
scratch=root/'work/mx09/toolkit-smoke';scratch.mkdir(exist_ok=True)
for r,b in files.items():
 p=scratch/r;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
result={'path':str(zip_path),'sha256':hashlib.sha256(zip_path.read_bytes()).hexdigest(),'bytes':zip_path.stat().st_size,'files':len(files),'sourceManifest':manifest}
(root/'work/mx09/toolkit-manifest.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='sourceManifest'}))

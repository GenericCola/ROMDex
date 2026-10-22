from pathlib import Path
import json,re,subprocess,hashlib
root=Path.cwd();work=root/'work/ri03p';out=root/'outputs';repo=root/'work/u13b/repository';paths=[]
assert json.loads((work/'checkpoint.json').read_text())['status']=='complete_in_source_pending_private_backup'
def put(source,dest,doc=False):
 data=source.read_bytes().replace(b'\r\n',b'\n');source.write_bytes(data)
 if doc:
  s=data.decode('utf-8').replace('../../../ROMDex/','../../apps/romdex/').replace('../../Project/','').replace('Documentation/Project/','').replace('(ROMDex/','(../../apps/romdex/')
  s=re.sub(r'Documentation/History/[^/()]+/([^()]+)',r'\1',s);s='\n'.join(line.rstrip() if line.startswith('**Plans:**') else line for line in s.split('\n'));data=s.encode('utf-8')
 p=repo/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);paths.append(dest)
source=['rdx/cloud-delivery.mjs','rdx/document-cloud.mjs','rdx/youtrack-store.mjs','tests/cloud-delivery.test.mjs','tests/rdx-cloud.test.mjs','rdx/CLOUD-SYNC.md','rdx/CLOUD-DELIVERY.md','README.md','CHANGELOG.md','rom/workspace.mjs','public/rom-import.mjs','public/rom-import.html','public/mapdex-progress.mjs','tests/rom-workspace.test.mjs','tests/mapdex-progress.test.mjs']
for name in source:put(out/'ROMDex'/name,'apps/romdex/'+name)
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:put(out/name,'docs/project/'+name,True)
put(out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md','docs/project/NPCDex-ROMDex-Decision-Log.md',True)
history=out/'Documentation/History/RI03P';put(history/'RI03P-Completion-Report.md','docs/project/RI03P-Completion-Report.md',True)
for p in sorted((history/'RI03P-Evidence').glob('*.json')):put(p,'docs/project/RI03P-Evidence/'+p.name)
for name in ['measure-layout.mjs','real-model-proof.mjs','package-check.mjs','verify-live.cjs','verify-resume.cjs','verify-final.cjs','progress-ui.mjs','host.mjs']:
 s=(work/name).read_text(encoding='utf-8').replace('../../outputs/ROMDex/','../../apps/romdex/').replace("'outputs/ROMDex", "'apps/romdex")
 p=repo/'tools/ri03p'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(s.encode('utf-8'));paths.append(p.relative_to(repo).as_posix())
p=repo/'README.md';s=p.read_text(encoding='utf-8');a=s.index('**U21–U27');b=s.index('\n\n',a);s=s[:a]+'**U21–U27 and RI02A–RI03P are complete in source.** [MAPDex](apps/romdex/rom/MAPDEX.md) provides offline ROM preparation and an explicit reviewed NPCDex handoff. [RI03P cloud delivery](docs/project/RI03P-Completion-Report.md) reduces the same real Violet City map\'s object attachments/payload by about 65%, with measured cold/delta/unchanged/native/recovery checks and private QA cleanup. **Next: RI03C — Coverage and Integrated Feature Acceptance, Sol / High**, requiring a new PASSKEY; then U28–U30. Installed production remains 0.5.15 plus its existing repairs, with NPCDex cloud sync paused and local saving enabled. This source task did not alter its Data, queue or credentials.'+s[b:];a=s.index('## Current Work');s=s[:a]+'## Current Work\n\nRI03A design is approved; RI03B/MAPDex and RI03P cloud performance are source-complete. RI03C owns broader/build/identity feature acceptance before U28–U30 integrated review and the next packaged release. Cloud commit v2 requires upgraded readers; frozen v1 intents remain compatible. Source test helpers require separately retained local ROM-derived artifacts and isolated profiles, which are excluded from Git. No production reset or sync resumption is authorized.\n';p.write_bytes(s.encode('utf-8'));paths.append('README.md')
for name in paths:
 assert not re.search(r'\.(rdx|nds|sqlite|encrypted|png|ico|key|pem)$',name,re.I),name
 assert '/Data/' not in name and '/private-profile/' not in name,name
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True);check=subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],capture_output=True,text=True);assert check.returncode==0,check.stdout[:2000]
tree=subprocess.check_output([git,'-C',str(repo),'write-tree'],text=True).strip();manifest={'paths':paths,'tree':tree,'parent':'3f39d31dbea2817581f07b3c3084d05c36be5ec1','baseTree':'dedd62227e3f32414c63b14bdd23e4fa1e24a40b','blobs':[]}
for name in paths:
 b=(repo/name).read_bytes();manifest['blobs'].append({'path':name,'sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'content':b.decode('utf-8')})
(work/'backup-manifest.json').write_text(json.dumps(manifest),encoding='utf-8');print(json.dumps({'files':len(paths),'tree':tree,'privateDataIncluded':False}))

from pathlib import Path
import json,shutil,re,subprocess
root=Path.cwd();work=root/'work/ri03b';out=root/'outputs';repo=root/'work/u13b/repository';paths=[]
def put(source,dest,doc=False):
 target=repo/dest;target.parent.mkdir(parents=True,exist_ok=True);data=source.read_bytes().replace(b'\r\n',b'\n');source.write_bytes(data)
 if doc:
  text=data.decode('utf-8');text=text.replace('../../../ROMDex/','../../apps/romdex/').replace('../../../NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Action-Checklist.md').replace('../../Project/','').replace('../History/RI03B/','').replace('../History/RI03A/','').replace('Documentation/Project/','').replace('(ROMDex/','(../../apps/romdex/')
  text=re.sub(r'Documentation/History/[^/()]+/([^()]+)',r'\1',text);text='\n'.join(line.rstrip() if line.startswith('**Plans:**') else line for line in text.split('\n'));data=text.encode('utf-8')
 target.write_bytes(data);paths.append(dest)
for name in json.loads((work/'source-files.json').read_text()):put(out/'ROMDex'/name,'apps/romdex/'+name)
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:put(out/name,'docs/project/'+name,True)
for name in ['NPCDex-ROMDex-Decision-Log.md','RI03A-ROM-Import-Workspace-Design.md']:put(out/'Documentation/Project'/name,'docs/project/'+name,True)
history=out/'Documentation/History/RI03B';put(history/'RI03B-Completion-Report.md','docs/project/RI03B-Completion-Report.md',True)
for file in sorted((history/'RI03B-Evidence').glob('*.json')):put(file,'docs/project/RI03B-Evidence/'+file.name)
for name in ['rom-proof.mjs','replay-scope-proof.mjs','verify-ui.mjs','package-check.mjs']:
 p=repo/'tools/ri03b'/name;p.parent.mkdir(parents=True,exist_ok=True);s=(work/name).read_text().replace('../../outputs/ROMDex/','../../apps/romdex/').replace("path.resolve('outputs/ROMDex", "path.resolve('apps/romdex");p.write_bytes(s.encode('utf-8'));paths.append(p.relative_to(repo).as_posix())
p=repo/'README.md';s=p.read_text();a=s.index('**U21–U27');b=s.index('\n\n',a);s=s[:a]+'**U21–U27 and RI02A–RI03B are complete in source.** The [MAPDex workspace](apps/romdex/rom/MAPDEX.md) prepares a ROM-derived map locally, retains source identities and exact evidence, supports presentation cleanup/Roman stages and exports a portable RDX or explicitly hands it to NPCDex. [RI03B report](docs/project/RI03B-Completion-Report.md). Extraction is currently verified for the supplied build and Violet City; other catalog groups are marked unverified. **Next: RI03P — Map Cloud-Delivery Performance, Sol / High**, under a new PASSKEY; then RI03C and U28–U30. Installed production remains 0.5.15 plus its existing repairs, with NPCDex cloud sync paused and local saving enabled. This source task did not alter its Data or queue.'+s[b:]
a=s.index('## Current Work');s=s[:a]+'## Current Work\n\nRI03A design is user-approved and RI03B/MAPDex is complete in source. RI03P addresses cloud-delivery performance before RI03C broader/build/identity acceptance. U28–U30 cover integrated acceptance and the next packaged release. Source test helpers may require separately retained local ROM/RDX artifacts; those game files and test profiles are excluded from Git. Use desktop/package-source.mjs for future payloads so the ROM worker and pinned format tables are included.\n';p.write_text(s,encoding='utf-8');paths.append('README.md')
for name in paths:
 assert not re.search(r'\.(rdx|nds|sqlite|encrypted|png|ico|key|pem)$',name,re.I),name
 assert '/Data/' not in name and '/private-profile/' not in name,name
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe'
subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True)
for name in paths:
 p=repo/name;p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n'))
subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True)
check=subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],capture_output=True,text=True)
if check.returncode:raise RuntimeError('\n'.join(check.stdout.splitlines()[:8]))
tree=subprocess.check_output([git,'-C',str(repo),'write-tree'],text=True).strip();manifest={'paths':paths,'tree':tree,'parent':'6fdb1fd0f277885d8c8ed7c5e27aca679f7bd3e6','baseTree':'ba2122df668e685e18b2c9010953823ab9cebd2e'};(work/'backup-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'files':len(paths),'tree':tree,'privateDataIncluded':False}))

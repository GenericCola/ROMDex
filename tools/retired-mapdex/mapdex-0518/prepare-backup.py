from pathlib import Path
import json,re,subprocess,hashlib
root=Path.cwd();out=root/'outputs';repo=root/'work/u13b/repository';w=root/'work/mapdex-0518';paths=[]
def put(source,dest):
 s=source.read_text().replace('\r\n','\n').replace('../../../ROMDex/','../../apps/romdex/').replace('../../Project/','').replace('Documentation/Project/','').replace('(ROMDex/','(../../apps/romdex/')
 s=re.sub(r'(?:Documentation/History/|\.\./History/)[^/()]+/([^()]+)',r'\1',s);s=s.replace('../../../Testing/README.md','NPCDex-RDX-Test-Guide.md');s='\n'.join(x.rstrip() if x.startswith('**Plans:**') else x for x in s.split('\n'))
 p=repo/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((s.rstrip()+'\n').encode());paths.append(dest)
for name in ['NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Action-Checklist.md']:put(out/name,'docs/project/'+name)
put(out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md','docs/project/NPCDex-ROMDex-Decision-Log.md');put(out/'Testing/README.md','docs/project/NPCDex-RDX-Test-Guide.md')
for name in ['MAPDex-0.5.18-Completion-Report.md','MAPDex-0.5.18-Verification.json']:put(out/'Documentation/History/MAPDex-0.5.18'/name,'docs/project/'+name)
p=repo/'README.md';s=p.read_text().replace('**0.5.16**, including MAPDex and the empty-state correction; saved connections are preserved. [Evaluation delivery](docs/project/MAPDex-0.5.16-Delivery-Report.md).','**0.5.18**, with complete ROM-derived map selection, the neutral MAPDex title and safe visible quit review; saved connections are preserved. [Evaluation delivery](docs/project/MAPDex-0.5.18-Completion-Report.md).').replace('Installed evaluation 0.5.16 now packages the current source, MAPDex and RI03P improvements; broader RI03C coverage remains open.','Installed evaluation 0.5.18 includes the source, MAPDex/RI03P improvements, full supplied-ROM catalog and hidden-dialog quit correction; other ROM layouts and broader RI03C acceptance remain open.')
p.write_bytes((s.rstrip()+'\n').encode());paths.append('README.md')
import shutil
source_names=['rom/reader.mjs','rom/workspace-worker.mjs','rom/workspace.mjs','rom/extract.mjs','rom/compile-map.mjs','rom/staging-document.mjs','public/rom-catalog.mjs','public/rom-import.mjs','tests/rom-catalog.test.mjs','tests/rom-compilation.test.mjs','tests/rom-workspace.test.mjs','package.json','public/index.html','CHANGELOG.md','public/app.mjs','public/shell.mjs','public/quit-editors.mjs','tests/quit-editors.test.mjs']
for name in source_names:
 p=repo/'apps/romdex'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((out/'ROMDex'/name).read_text().encode('utf-8'));paths.append('apps/romdex/'+name)
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';g=lambda *a:subprocess.check_output([git,'-C',str(repo),*a]).decode().strip()
subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True);subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],check=True)
manifest={'parent':g('rev-parse','HEAD'),'baseTree':g('rev-parse','HEAD^{tree}'),'tree':g('write-tree'),'blobs':[]}
for name in paths:
 b=(repo/name).read_bytes();manifest['blobs'].append({'path':name,'sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'bytes':len(b)})
(w/'github-backup-manifest.json').write_text(json.dumps(manifest));print(json.dumps(manifest))

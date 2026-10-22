from pathlib import Path
import json,re,subprocess,hashlib
root=Path.cwd();out=root/'outputs';repo=root/'work/u13b/repository';w=root/'work/mapdex-0516';paths=[]
def put(source,dest):
 s=source.read_text().replace('\r\n','\n').replace('../../../ROMDex/','../../apps/romdex/').replace('../../Project/','').replace('Documentation/Project/','').replace('(ROMDex/','(../../apps/romdex/')
 s=re.sub(r'(?:Documentation/History/|\.\./History/)[^/()]+/([^()]+)',r'\1',s);s=s.replace('../../../Testing/README.md','NPCDex-RDX-Test-Guide.md');s='\n'.join(x.rstrip() if x.startswith('**Plans:**') else x for x in s.split('\n'))
 p=repo/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((s.rstrip()+'\n').encode());paths.append(dest)
for name in ['NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Action-Checklist.md']:put(out/name,'docs/project/'+name)
put(out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md','docs/project/NPCDex-ROMDex-Decision-Log.md');put(out/'Testing/README.md','docs/project/NPCDex-RDX-Test-Guide.md')
for name in ['MAPDex-0.5.16-Delivery-Report.md','MAPDex-0.5.16-Verification.json']:put(out/'Documentation/History/MAPDex-0.5.16'/name,'docs/project/'+name)
p=repo/'README.md';s=p.read_text().replace('Latest published and installed private release:','Latest published private release:').replace('with separate managed RDX map files and all saved connections preserved.','with separate managed RDX map files. Current installed evaluation build: **0.5.16**, including MAPDex and the empty-state correction; saved connections are preserved. [Evaluation delivery](docs/project/MAPDex-0.5.16-Delivery-Report.md).',1).replace('Installed production remains 0.5.15 plus its existing repairs.','Installed evaluation 0.5.16 now packages the current source, MAPDex and RI03P improvements; broader RI03C coverage remains open.');p.write_bytes((s.rstrip()+'\n').encode());paths.append('README.md')
paths += ['apps/romdex/'+p for p in ['content/empty-workspace.js','rdx/map-workspace.mjs','content/desktop-assets.mjs','content/workspace-runtime.js','content/import-ui.js','content/native.css','tests/npcdex-empty.test.mjs','package.json','public/index.html','CHANGELOG.md']]
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';g=lambda *a:subprocess.check_output([git,'-C',str(repo),*a]).decode().strip()
subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True);subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],check=True)
manifest={'parent':g('rev-parse','HEAD'),'baseTree':g('rev-parse','HEAD^{tree}'),'tree':g('write-tree'),'blobs':[]}
for name in paths:
 b=(repo/name).read_bytes();manifest['blobs'].append({'path':name,'sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'bytes':len(b)})
(w/'github-backup-manifest.json').write_text(json.dumps(manifest));print(json.dumps(manifest))

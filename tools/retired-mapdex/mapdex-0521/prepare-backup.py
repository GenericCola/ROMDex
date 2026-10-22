from pathlib import Path
import json,re,subprocess,hashlib
root=Path.cwd();out=root/'outputs';repo=root/'work/u13b/repository';w=root/'work/mapdex-0521';paths=[]
def put(source,dest):
 s=source.read_text().replace('\r\n','\n').replace('../../../ROMDex/','../../apps/romdex/').replace('../../Project/','').replace('Documentation/Project/','').replace('(ROMDex/','(../../apps/romdex/')
 s=re.sub(r'(?:Documentation/History/|\.\./History/)[^/()]+/([^()]+)',r'\1',s);s=s.replace('../../../Testing/README.md','NPCDex-RDX-Test-Guide.md');s='\n'.join(x.rstrip() if x.startswith('**Plans:**') else x for x in s.split('\n'))
 p=repo/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((s.rstrip()+'\n').encode());paths.append(dest)
for n in ['NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Action-Checklist.md']:put(out/n,'docs/project/'+n)
put(out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md','docs/project/NPCDex-ROMDex-Decision-Log.md');put(out/'Testing/README.md','docs/project/NPCDex-RDX-Test-Guide.md')
for name in ['MAPDex-0.5.21-Completion-Report.md','MAPDex-0.5.21-Verification.json']:put(out/'Documentation/History/MAPDex-0.5.21'/name,'docs/project/'+name)
put(out/'Documentation/Project/MAPDex-Location-Preview-Scope.md','docs/project/MAPDex-Location-Preview-Scope.md')
p=repo/'README.md';s=p.read_text().replace('**0.5.19**, with readable area/building labels, an explicit one-map RDX summary and named exports; saved connections are preserved.','**0.5.21**, with source-derived entity names, sub-area grouping and front-standing sprite defaults; saved connections are preserved.').replace('MAPDex-0.5.19-Completion-Report.md','MAPDex-0.5.21-Completion-Report.md').replace('Installed evaluation 0.5.19 includes those corrections plus readable single-map setup/export; other ROM layouts and broader RI03C acceptance remain open.','Installed evaluation 0.5.21 adds saved entity presentation and front-facing source previews; editable nested map groups, NPCD tier labels, other ROM layouts and broader RI03C acceptance remain open.')
s=s.replace('0.5.20','0.5.21').replace('editable nested map groups, NPCD tier labels, other ROM layouts','independent-map migration, cross-ROM update continuity, NPCD tier labels and other ROM layouts')
s+='\n\n0.5.21 adds contextual parent/child map grouping, expanded source dialogue and TAB pane cycling. The required RI03U cross-ROM update/rebase workflow remains open; a fresh extraction from a changed fingerprint does not yet guarantee an update to the same logical map. See the overall checklist and location-preview scope for later gates.\n'
p.write_bytes((s.rstrip()+'\n').encode());paths.append('README.md')
names=json.loads((w/'source-changes.json').read_text())
for name in names:
 p=repo/'apps/romdex'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((out/'ROMDex'/name).read_text().encode());paths.append('apps/romdex/'+name)
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';g=lambda *a:subprocess.check_output([git,'-C',str(repo),*a]).decode().strip()
subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True);subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],check=True)
m={'parent':g('rev-parse','HEAD'),'baseTree':g('rev-parse','HEAD^{tree}'),'tree':g('write-tree'),'blobs':[]}
for name in paths:
 b=(repo/name).read_bytes();m['blobs'].append({'path':name,'sha':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'bytes':len(b)})
(w/'github-backup-manifest.json').write_text(json.dumps(m));print(json.dumps(m))

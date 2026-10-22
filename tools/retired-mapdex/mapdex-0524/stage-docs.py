from pathlib import Path
import json,re,subprocess,hashlib
w=Path('work/mapdex-0524');repo=Path('work/u13b/repository');paths=json.loads((w/'staged-paths.json').read_text())
assert json.loads((w/'installed-proof.json').read_text())['status']=='passed'
mapping={
'outputs/NPCDex-ROMDex-Action-Checklist.md':'NPCDex-ROMDex-Action-Checklist.md',
'outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md':'NPCDex-ROMDex-Unified-App-Action-Plan.md',
'outputs/README.md':'ROMDex-Outputs-README.md',
'outputs/Documentation/Project/NPCDex-ROMDex-Decision-Log.md':'NPCDex-ROMDex-Decision-Log.md',
'outputs/Documentation/Project/MAPDex-Preparation-and-Character-Identity.md':'MAPDex-Preparation-and-Character-Identity.md',
'outputs/Documentation/History/MAPDex-0.5.24/MAPDex-0.5.24-Source-Report.md':'MAPDex-0.5.24-Source-Report.md',
'outputs/Documentation/History/MAPDex-0.5.24/Source-Verification.json':'MAPDex-0.5.24-Source-Verification.json',
'outputs/Documentation/History/MAPDex-0.5.24/Candidate-Verification.json':'MAPDex-0.5.24-Candidate-Verification.json',
'outputs/Documentation/History/MAPDex-0.5.24/MAPDex-0.5.25-Completion-Report.md':'MAPDex-0.5.25-Completion-Report.md',
'outputs/Documentation/History/MAPDex-0.5.24/MAPDex-0.5.25-Verification.json':'MAPDex-0.5.25-Verification.json'}
def flat(s):
 s=re.sub(r'(?:\.\./)*(?:Documentation/)?(?:Project/|History/[^/]+/)', '',s)
 s=s.replace('Source-Verification.json','MAPDex-0.5.24-Source-Verification.json').replace('[Windows build helper](Build-MAPDex-0.5.24.cmd)','the Windows helper is retained locally under outputs/Documentation/History/MAPDex-0.5.24')
 s=re.sub(r'\]\((?:\.\./)+(NPCDex-ROMDex-[^)]+)\)', r'](\1)',s)
 return s
for src,name in mapping.items():
 p='docs/project/'+name;dst=repo/p;s=flat(Path(src).read_text());old=dst.read_text() if dst.exists() else ''
 # Preserve existing Markdown hard breaks where the line itself is unchanged.
 hard={line.rstrip():line for line in old.splitlines() if line.endswith('  ')}
 s='\n'.join(hard.get(line.rstrip(),line.rstrip()) for line in s.splitlines())+'\n';dst.write_text(s,newline='\n')
 if p not in paths:paths.append(p)
p=repo/'README.md';s=p.read_text();s=re.sub(r'0\.5\.24 preparation corrections are source/browser verified[^\n]*', '0.5.25 is installed and verified: immediate sprite preview with explicit apply, reviewed shared-character tiles, readable regions and source-linked scene context. Cold saved-data startup and normal quit/restart passed after deferring presentation checkpoints until MAPDex loads. Full narrative-phase extraction remains open. [Completion and limits](docs/project/MAPDex-0.5.25-Completion-Report.md).',s);p.write_text(s,newline='\n')
if 'README.md' not in paths:paths.append('README.md')
(w/'staged-paths.json').write_text(json.dumps(paths))
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';subprocess.run([git,'-C',str(repo),'add','--']+paths,check=True);subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],check=True);print(subprocess.check_output([git,'-C',str(repo),'diff','--cached','--stat']).decode())

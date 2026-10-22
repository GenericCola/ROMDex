from pathlib import Path
import json,subprocess,shutil
root=Path(__file__).resolve().parents[2];w=Path(__file__).parent;repo=root/'work/u13b/repository'
proof=json.loads((w/'git-archive-verified.json').read_text(encoding='utf-8'));assert proof['remoteMatched']
assert json.loads((w/'installed-proof.json').read_text(encoding='utf-8'))['status']=='passed'
def git(*args):return subprocess.check_output(['git','-C',str(repo),*args],text=True).strip()
assert git('rev-parse','archive/mapdex-2026-10-22')==proof['commit']
assert not git('status','--porcelain')
git('switch','main')
git('restore','--source=548295a249a66b6adaf55dfd3f0ef338e8b9f752','--staged','--worktree','--','apps/romdex','docs/project','README.md','tools')
# Exact delivered source is the archived application, including the accepted shutdown repairs.
source=w/'source-pre-mapdex';out=root/'outputs/ROMDex'
assert out.resolve().is_relative_to(root/'outputs') and not out.is_symlink()
shutil.rmtree(out);shutil.copytree(source,out)
headline='''# MAPDex retired — 2026-10-22

The owner rejected RI03C and retired the entire MAPDex/ROM-extraction branch. Do not continue RI03C or start U28 on that design. A replacement solution needs fresh scoping.

The complete source, tests, design documents and supporting extraction/build/verification scripts are preserved on the private Git archive branch `archive/mapdex-2026-10-22`. The branch is retained; retirement does not claim usability acceptance.

The delivered application is restored from the exact 0.5.15 application-source archive captured before MAPDex 0.5.16. NPCDex is restored from the verified archive captured before the MAPDex clean-data test: New Bark Town, Route 29, Cherrygrove City and Global Dialogue, with 44 plans, 145 history entries and 85 annotations. Current task-manager data and saved credentials are preserved. Local saving remains enabled. NPCDex cloud delivery stays paused because its former backend records were deleted during the earlier reset; republishing that dataset needs a deliberate replacement/reconnection plan.

The active development source is returned to its pre-MAPDex U27 baseline. The restored installed payload retains the original accepted 0.5.15 shutdown repairs. Protected save/application backups remain outside Git. Local MAPDex runtime copies, preparation state, ROM-derived test artifacts and caches are removed only after the remote archive and restored client are verified. The original supplied ROM is preserved.
'''
(repo/'docs/project/MAPDex-Retirement-2026-10-22.md').write_text(headline,encoding='utf-8',newline='\n')
(repo/'README.md').write_text(headline+'\n## Existing documentation\n\nSee [the action checklist](docs/project/NPCDex-ROMDex-Action-Checklist.md) and [action plan](docs/project/NPCDex-ROMDex-Unified-App-Action-Plan.md). Earlier completion records are historical; MAPDex is retired.\n',encoding='utf-8',newline='\n')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=repo/'docs/project'/name;s=p.read_text(encoding='utf-8');s='> **2026-10-22 owner-directed rollback:** MAPDex is retired and archived. RI03C was not accepted. Restore pre-MAPDex NPCDex and its archived save; keep cloud delivery paused pending replacement design. Do not start U28 from the abandoned MAPDex roadmap.\n\n'+s;p.write_text(s,encoding='utf-8',newline='\n');(root/'outputs'/name).write_text(s,encoding='utf-8',newline='\n')
project=root/'outputs/Documentation/Project'
for p in list(project.glob('*.md'))+list(project.glob('*.json')):
 if p.name.startswith(('MX0','LP0','RI0','MAPDex-','Phase-11')):
  assert p.resolve().is_relative_to(project);p.unlink()
for p in (repo/'docs/project').iterdir():
 if p.is_file():shutil.copy2(p,project/p.name)
tools=repo/'tools/mapdex-retirement-20261022';tools.mkdir(parents=True,exist_ok=True)
for p in w.iterdir():
 if p.is_file() and p.suffix in ['.py','.mjs','.cmd','.ps1']:shutil.copy2(p,tools/p.name)
git('add','--','apps/romdex','docs/project','README.md','tools/mapdex-retirement-20261022')
git('commit','-q','-m','Retire MAPDex and restore the pre-MAPDex NPCDex development baseline')
(w/'source-restored.json').write_text(json.dumps({'status':'restored','mainCommit':git('rev-parse','HEAD'),'archiveCommit':proof['commit'],'activeSourceHasMAPDex':False}),encoding='utf-8')
print('Pre-MAPDex active source and roadmap restored.')

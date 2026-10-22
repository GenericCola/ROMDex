from pathlib import Path
import json
import shutil
import subprocess

root=Path.cwd()
out=root/'outputs'
design=out/'Documentation/Project/RI03A-ROM-Import-Workspace-Design.md'
s=design.read_text(encoding='utf-8')
s=s.replace('Status: **In progress — decisions recorded; concrete preview ready for final design review. Authorized by the October 20, 2026 PASSKEY.**','Status: **Complete — the user approved the consolidated RI03A design on October 20, 2026.**')
s=s.replace('## Decisions to discuss','## Approved decisions')
s=s.replace('Proposed division for the concrete preview:', 'Approved division:')
s=s.replace('The user specified import setup across both trays; this detailed division remains part of the upcoming design review.', 'The user approved this division in the consolidated design review.')
s=s.replace('Prior decisions carried forward; detailed review pending.', 'Accepted in the consolidated October 20 review.')
s=s.replace('Proposed actions are Prepare Map, Export RDX and Send to NPCDex; exact labels and placement remain part of the concrete preview.', 'Approved actions are Prepare Map, Export RDX and Send to NPCDex, as shown in the concrete preview.')
s=s.replace('Jobs/recovery details below are proposed engineering defaults for the final design review.', 'The consolidated approval includes the jobs/recovery boundaries below.')
s=s.replace('## Proposed concrete workspace','## Approved concrete workspace')
s=s.replace('## Proposed technical and recovery boundaries','## Approved technical and recovery boundaries')
s=s.replace('RI03A (this design review)', 'RI03A (approved design review)')
s=s.replace('Record the user\'s decisions, provide a concrete workspace preview and review the resulting design and implementation boundaries. RI03A remains unchecked until that design is approved.', 'The user reviewed the recorded decisions and concrete workspace preview, then selected “Approve RI03A Design” on October 20, 2026. RI03A is complete and checked off.')
s=s.replace('The final review covers the proposed tray division/action labels, local staging and explicit handoff, recoverable jobs and managed identities, plus the agreed RI03B → RI03P → RI03C sequence. User approval is still pending; no implementation task is marked complete by these mockup checks.', 'The approval covers the tray division/action labels, local staging and explicit handoff, recoverable jobs and managed identities, plus the RI03B → RI03P → RI03C sequence. It completes the design gate only; implementation and installed-app acceptance remain separately gated. See the [completion report](../History/RI03A/RI03A-Completion-Report.md).')
design.write_text(s,encoding='utf-8',newline='\n')

for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
    p=out/name;s=p.read_text(encoding='utf-8');lines=s.splitlines()
    if name.endswith('Checklist.md'):
        i=next(i for i,l in enumerate(lines) if l.startswith('**Current:**'))
        lines[i]='**Current:** **RI03A is complete and user-approved, October 20, 2026.** The [approved design](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md) and [completion report](Documentation/History/RI03A/RI03A-Completion-Report.md) record the three-tray local staging workspace and explicit NPCDex handoff. **Next: RI03B — Implement the offline workspace, Sol / High, awaiting its own PASSKEY.** Sequence: RI03B → RI03P → RI03C → U28–U30. No installed build, production queue or sync pause changed.'
        i=next(i for i,l in enumerate(lines) if l.startswith('- [ ] **RI03A —'))
        lines[i]='- [x] **RI03A — Review ROM Import workspace design** — Sol / High. **User-approved October 20; [design](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md), [report](Documentation/History/RI03A/RI03A-Completion-Report.md).** Three trays: map catalog, local staging/setup, contextual preview/review; adjustable areas, optional presentation cleanup, per-map Roman stages, managed identity/recovery, explicit Send to NPCDex and accurate local/paused/remote states. RI03P follows RI03B before acceptance. No implementation/install or production sync change.'
        s='\n'.join(lines)+'\n'
        s+='\n## RI03A — Design Approved, October 20, 2026\n\n- [x] Recorded the accepted three-tray layout, one-map staging RDX, optional cleanup and explicit reviewed handoff.\n- [x] Reviewed the interactive preview and local/paused-cloud reporting; approved recoverable jobs and managed identities.\n- [x] Added separately gated RI03P cloud-delivery performance between RI03B and RI03C.\n- [x] Marked RI03A complete after the user selected “Approve RI03A Design.”\n\n**Next: RI03B — Implement the offline workspace, Sol / High; new PASSKEY required.** [Completion report](Documentation/History/RI03A/RI03A-Completion-Report.md).\n'
    else:
        s='\n'.join(lines)+'\n'
        s=s.replace('**Revised:** October 19, 2026.', '**Revised:** October 20, 2026.')
        s=s.replace('RI02C is complete in source. Installed data, pause and queue remain unchanged.', 'RI02C is complete in source. RI03A is complete and user-approved; RI03B is next under a separate PASSKEY, followed by RI03P and RI03C. Installed data, pause and queue remain unchanged.')
        s=s.replace('**RI03A — Sol / High** design review is in progress under the October 20 PASSKEY;', '**RI03A is complete and user-approved** ([design](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md), [report](Documentation/History/RI03A/RI03A-Completion-Report.md)); **next: RI03B — Sol / High, awaiting a new PASSKEY**, then RI03P and RI03C;')
        lines=s.splitlines();i=next(i for i,l in enumerate(lines) if l.startswith('| RI03A —'))
        lines[i]='| RI03A — Review ROM Import workspace design | **Complete; user-approved October 20; [design](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md), [report](Documentation/History/RI03A/RI03A-Completion-Report.md).** Map catalog in Tray 1, local staging/setup in Tray 2, contextual preview/review in Tray 3; optional cleanup, one-map RDX, Roman stages, managed identities and recoverable jobs. Explicit Send to NPCDex honors the cloud pause. RI03P follows RI03B before acceptance. No implementation/install or production sync change. | Sol / High |'
        s='\n'.join(lines)+'\n'
    s=s.replace('RI02A, RI02B, RI02T and RI02C are complete in source. Remaining: RI03A → RI03B → RI03P → RI03C → U28 → U29 → U30.', 'RI02A, RI02B, RI02T and RI02C are complete in source; RI03A design is user-approved. Remaining: RI03B → RI03P → RI03C → U28 → U29 → U30.')
    p.write_text(s,encoding='utf-8',newline='\n')

log=out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md'
s=log.read_text(encoding='utf-8')
s+='\n\n## October 20 — RI03A ROM Import Design Approved\n\nThe user approved the concrete three-tray design: read-only ROM catalog/maps in Tray 1; locally saved selected-map setup/preparation in Tray 2; contextual content, source evidence, per-map Roman stages, warnings and inline handoff review in Tray 3. Suggested area groups remain adjustable; every prepared/exported RDX contains one logical map. Optional cleanup changes display metadata while retaining source content, stable identities and uncertainty. Semantic warnings may proceed with review; broken structure/unusable mappings block output.\n\nPreparation remains local and recoverable. Export RDX produces a portable copy; Send to NPCDex is an explicit reviewed handoff that keeps the workspace open. Shared Auto-Sync applies after handoff and cannot override the explicit NPCDex pause. Existing-map updates preserve newer edits and recheck their baseline. Bounded worker cancellation/checkpoints and shutdown independent of cloud backlogs are accepted.\n\nAt the user\'s request, add RI03P — Map Cloud-Delivery Performance after RI03B and before RI03C to reduce cold-publication/later-sync request overhead without losing exact data, stable hierarchy or conflict safety. Final sequence: RI03B → RI03P → RI03C → U28–U30. RI03A is complete; each following task still needs its own PASSKEY. No production saves, queue, credentials, sync pause or installed build changed.\n'
log.write_text(s,encoding='utf-8',newline='\n')

repo=root/'work/u13b/repository'
copies={
 'docs/project/NPCDex-ROMDex-Action-Checklist.md':out/'NPCDex-ROMDex-Action-Checklist.md',
 'docs/project/NPCDex-ROMDex-Unified-App-Action-Plan.md':out/'NPCDex-ROMDex-Unified-App-Action-Plan.md',
 'docs/project/RI03A-ROM-Import-Workspace-Design.md':design,
 'docs/project/NPCDex-ROMDex-Decision-Log.md':log,
 'docs/project/RI03A-Completion-Report.md':out/'Documentation/History/RI03A/RI03A-Completion-Report.md',
 'docs/project/RI03A-Evidence/preview-review.json':root/'work/ri03a/preview-review.json',
 'docs/project/RI03A-Evidence/rom-import-workspace-design.html':Path('C:/Users/mrgen/.codex/visualizations/2026/10/13/01a135f2-44b2-76d2-8bd4-062ec143dbd9/rom-import-workspace-design.html'),
}
for dest,src in copies.items():
    target=repo/dest;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,target)
paths=list(copies)
(root/'work/ri03a/backup-paths.json').write_text(json.dumps(paths,indent=2)+'\n',encoding='utf-8')
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe'
subprocess.run([git,'-C',str(repo),'add','--',*paths],check=True)
subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],check=True)
tree=subprocess.check_output([git,'-C',str(repo),'write-tree'],text=True).strip()
print(json.dumps({'documents':len(paths),'tree':tree,'paths':paths}))

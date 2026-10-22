from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[2];out=root/'outputs';repo=root/'work/u13b/repository'
files=['public/mapdex-layout.mjs','public/rom-import.mjs','public/rom-import.css','rom/workspace.mjs','content/editor-ui.js','content/classic-ui.js','content/native.css']
for name in files:
 dest=repo/'apps/romdex'/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(out/'ROMDex'/name,dest)
shutil.copyfile(out/'Documentation/Project/MX04-Completion-Report.md',repo/'docs/project/MX04-Completion-Report.md')
proof=json.loads((root/'work/mx04/mapdex-ui-proof.json').read_text());proof.update(focusedChecks=33,npcdexInline=True,productionChanged=False,nativeAcceptance='LP03')
for p in [out/'Documentation/Project/MX04-Verification.json',repo/'docs/project/MX04-Verification.json']:p.write_text(json.dumps(proof,indent=2)+'\n')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=out/name;s=p.read_text();s=s.replace('**MX04 — Shared MAPDex and NPCDex Workflow Layout** — Sol / High.','**MX04 — Shared MAPDex and NPCDex Workflow Layout** — Sol / High. Source-complete October 21; see MX04 completion report.').replace('- [ ] **MX04','- [x] **MX04')
 start=s.find('- [x] **MX04');end=s.find('- [ ] **LP02',start)
 if start>=0 and end>start:s=s[:start]+s[start:end].replace('  - [ ]','  - [x]')+s[end:]
 s=s.replace('MX04 is active','MX04 is source-complete and LP02 is active').replace('Active: **MX04 — Shared MAPDex and NPCDex Workflow Layout**','Active: **LP02 — Automatic Portable Location Thumbnails**')
 p.write_text(s,encoding='utf-8');(repo/'docs/project'/name).write_text(s.replace('Documentation/Project/',''),encoding='utf-8')
print('MX04 source-complete; LP02 active; production unchanged')

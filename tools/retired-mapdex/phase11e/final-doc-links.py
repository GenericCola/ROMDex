from pathlib import Path
import shutil
root=Path.cwd();repo=root/'work/u13b/repository'
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=root/'outputs'/name;s=p.read_text(encoding='utf-8-sig')
 s=s.replace('Include practical large-map save latency and preserved recovery copies.','Include practical large-map save latency, preserved recovery copies, and shell notices staying clear of modal actions.')
 s=s.replace('Include practical large-map checkpoint latency and preserved recovery copies.','Include practical large-map checkpoint latency, preserved recovery copies, and shell notices staying clear of modal actions.')
 p.write_text(s,encoding='utf-8');shutil.copy2(p,repo/'docs/project'/name)
for name in ['MX09-Completion-Report.md','Phase-11E-Completion-Report.md']:
 p=repo/'docs/project'/name;s=p.read_text(encoding='utf-8').replace('../../RDX-Reference/Phase-11E-Agent-Tools.zip','../../tools/phase11e/Phase-11E-Agent-Tools.zip').replace('../../ROMDex/rdx/','../../apps/romdex/rdx/');p.write_text(s,encoding='utf-8')

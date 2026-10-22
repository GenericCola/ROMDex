from pathlib import Path
root=Path('outputs/ROMDex')
for name in ['public/rom-import.html','public/rom-import.mjs','public/shared-ui/header.mjs','public/shell.mjs','desktop/lifecycle.mjs']:
 p=root/name;s=p.read_text(encoding='utf-8');s=s.replace('ROM Import','MAPDex').replace('ROM import','MAPDex')
 p.write_text(s,encoding='utf-8',newline='\n')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=Path('outputs')/name;s=p.read_text(encoding='utf-8');s=s.replace('RI03B — Implement the offline workspace','RI03B — Implement the offline MAPDex workspace');p.write_text(s,encoding='utf-8',newline='\n')
log=Path('outputs/Documentation/Project/NPCDex-ROMDex-Decision-Log.md')
with log.open('a',encoding='utf-8') as f:f.write('\n\n## October 20 — MAPDex Workspace Name\n\nDuring authorized RI03B implementation, the user named the ROM/map import-preparation workspace **MAPDex**. Use MAPDex in the workspace switcher, shared header and Windows tray menu. Internal module/storage identifiers may retain rom-import for compatibility; this is a display name correction, not a new provider or sync change.\n')
print('Named the workspace MAPDex.')

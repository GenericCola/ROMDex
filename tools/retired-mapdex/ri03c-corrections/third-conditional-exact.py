from pathlib import Path
p=Path('outputs/ROMDex/public/shared-ui/web-timeline.css');s=p.read_text(encoding='utf-8-sig');s+='\n/* Original Other Conditions control, shared by both workspaces. */\n#conditional{display:inline-flex;align-items:center;gap:6px}\n#conditional:disabled{opacity:1;color:var(--muted)}\n';p.write_text(s,encoding='utf-8',newline='\n')

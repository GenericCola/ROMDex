from pathlib import Path
p=Path('work/ri03c-corrections/verify-third-final.mjs');s=p.read_text(encoding='utf-8-sig').replace("npc.locator('.conditions-pane .condition').textContent()", "npc.locator('.conditions-pane .condition').first().textContent()");p.write_text(s,encoding='utf-8',newline='\n')

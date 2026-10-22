from pathlib import Path
s=Path('outputs/ROMDex/content/workspace-runtime.js').read_text(encoding='utf-8-sig');needle='No documented dialogue at this stage.';i=s.find(needle);print(s[i-250:i+150]);

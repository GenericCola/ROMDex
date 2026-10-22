from pathlib import Path
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig')
for token in ['.tile-picture','.tile-select','.placeholder']:
 i=s.find(token);print(s[i:i+450])

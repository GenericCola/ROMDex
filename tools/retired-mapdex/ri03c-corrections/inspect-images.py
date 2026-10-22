from pathlib import Path
s=Path('outputs/ROMDex/content/workspace-runtime.js').read_text(encoding='utf-8-sig');i=s.find('function tile(');print(s[i:i+1300])
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig')
for token in ['.tile-image','.tile img','.image-pane']:
 i=s.find(token);print(token,s[i:i+400])

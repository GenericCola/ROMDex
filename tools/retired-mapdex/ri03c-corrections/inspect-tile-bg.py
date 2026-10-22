from pathlib import Path
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig');i=s.find('.tile-picture{width:100%');print(s[i:i+700])

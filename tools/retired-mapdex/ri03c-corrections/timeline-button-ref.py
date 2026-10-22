from pathlib import Path
import re
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig')
for a,b in re.findall(r'([^{}]+)\{([^{}]*)\}',re.search(r'<style[^>]*>(.*?)</style>',s,re.S)[1]):
 if 'aria-pressed' in a or a.strip() in ['button,input,select,textarea','button:hover','button:disabled','button:focus-visible']:print(a[-250:]+'{'+b[:500]+'}')

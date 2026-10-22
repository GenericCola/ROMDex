from pathlib import Path
import re
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig');css=re.search(r'<style[^>]*>(.*?)</style>',s,re.S)[1]
for a,b in re.findall(r'([^{}]+)\{([^{}]*)\}',css):
 if a.strip() in ['button','button,input,select,textarea'] or '#conditional' in a:print(a[-200:]+'{'+b[:500]+'}')

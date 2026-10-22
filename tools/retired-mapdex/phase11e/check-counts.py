from pathlib import Path
from collections import Counter
import re
s=Path('work/mx09/final-regressions.log').read_text(encoding='utf-8-sig');ls=[l for l in s.splitlines() if l.startswith('✔')];print(len(ls));print([l for l in ls if not re.match(r'^✔ (.*?) \([0-9.]+ms\)',l)]);c=Counter(re.sub(r' \([0-9.]+ms\)$','',l) for l in ls);print([x for x,n in c.items() if n>1])

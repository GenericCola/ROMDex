import sys,json
from pathlib import Path
s=Path(sys.argv[1]).read_text(encoding="utf-8");a=int(sys.argv[2]);print(json.dumps(s[a:a+24000],ensure_ascii=True))

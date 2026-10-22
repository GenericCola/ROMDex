from pathlib import Path
p=Path('work/ri03c/verify-native.mjs');s=p.read_text(encoding='utf-8-sig').replace("'#stages [data-stage].active'", "'#stages [data-stage][aria-pressed=\"true\"]'");p.write_text(s,encoding='utf-8')

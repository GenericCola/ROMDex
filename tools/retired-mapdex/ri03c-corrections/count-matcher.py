from pathlib import Path
s=Path('work/ri03c-corrections/verify-third-final.mjs').read_text(encoding='utf-8-sig');a=s.index('const mother');b=s.index('assert(mother)',a);print('Backslashes in matcher:',s[a:b].count(chr(92)))

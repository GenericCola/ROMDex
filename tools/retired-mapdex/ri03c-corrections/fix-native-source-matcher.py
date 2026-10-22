from pathlib import Path
p=Path('work/ri03c-corrections/verify-third-final.mjs');s=p.read_text(encoding='utf-8-sig');assert r'/\\s+/' in s;s=s.replace(r'/\\s+/',r'/\s+/');s=s.replace("assert(mother);", "assert(mother);console.log('Selected source-mapped Mother '+mother.id);");p.write_text(s,encoding='utf-8',newline='\n')

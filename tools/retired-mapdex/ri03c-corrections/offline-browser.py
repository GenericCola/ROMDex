from pathlib import Path
p=Path('work/ri03c-corrections/browser.mjs');s=p.read_text(encoding='utf-8-sig').replace("import {createRequire}","import {createRequire}")
s=s.replace("args:['--no-sandbox']", "args:['--no-sandbox','--allow-file-access-from-files']")
s=s.replace("await page.goto('http://127.0.0.1:'+server.address().port+'/rom-import.html');", "await page.goto(new URL('file:///'+publicRoot.replaceAll('\\\\','/')+'/rom-import.html').href);")
p.write_text(s,encoding='utf-8')

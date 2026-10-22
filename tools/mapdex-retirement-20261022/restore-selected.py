from pathlib import Path
import sys,zipfile,json,hashlib
archive=Path(sys.argv[1]);base=Path(sys.argv[2]).resolve()
assert base.name=='thegobindsingh-PMON'
rows=json.loads(Path(__file__).with_name('restore-files.json').read_text(encoding='utf-8'))
with zipfile.ZipFile(archive) as z:
 for r in rows:
  p=(base/r['path']).resolve();assert p.is_relative_to(base)
  b=z.read('thegobindsingh-PMON/'+r['path']);assert hashlib.sha256(b).hexdigest()==r['sha256']
  p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
print(json.dumps({'restoredFiles':len(rows),'bytes':sum(r['bytes'] for r in rows)}))

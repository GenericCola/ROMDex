from pathlib import Path
import re,json
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig')
for m in re.finditer(r'[^{}]+\{[^{}]*\}',s):
 if any(x in m.group(0) for x in ['object-fit','tile-picture']): print(m.group(0)[:1200])
legacy=Path('outputs/ROMDex/public/addons/npcdex/workspace.js').read_text(encoding='utf-8-sig').splitlines()
for line in legacy:
 if line.startswith('const ORIGINAL='):
  d=json.loads(line[len('const ORIGINAL='):].rstrip(';'))
  for t in d['towns'][:2]:print(json.dumps({'town':t['name'],'locations':t['locations'],'areas':[{k:a.get(k) for k in ['id','name','code']} for a in t['areas']]},ensure_ascii=False))
  break
Path('work/ri03c-corrections/third-review.json').write_text(json.dumps({'phase':'RI03C','ownerAccepted':False,'productionChanged':False,'items':[{'id':i+1,'request':r,'status':'pending'} for i,r in enumerate(['Fill image frames, crop black/transparent margins','Building selectors containing room/floor selectors','Remove MAPDex Tray 3 and expand Tray 2','Restore exact web timeline UI and behavior with map-specific events'])]},indent=2),encoding='utf-8',newline='\n')

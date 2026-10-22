from pathlib import Path
import json,urllib.request,tarfile,io,tomllib,concurrent.futures
root=Path(__file__).resolve().parent;data=json.loads((root/'license-audit.json').read_text());
def get(url):
 request=urllib.request.Request(url,headers={'User-Agent':'ROMDex-LP01-license-audit/1'})
 with urllib.request.urlopen(request,timeout=15) as r:return r.read(16*1024*1024)
def audit(p):
 if p['status']!='notice-review-needed':return p
 folder=root/'dependency-licenses'/(p['name']+'-'+p['version']);manifest=tomllib.loads((folder/'Cargo.toml').read_text())['package'];repo=manifest.get('repository','').removesuffix('.git').removeprefix('https://github.com/').rstrip('/')
 archive=get('https://static.crates.io/crates/'+p['name']+'/'+p['name']+'-'+p['version']+'.crate')
 with tarfile.open(fileobj=io.BytesIO(archive),mode='r:gz') as tar:
  vcs=next((m for m in tar.getmembers() if m.name.endswith('/.cargo_vcs_info.json')),None);info=json.loads(tar.extractfile(vcs).read()) if vcs else {};revision=info.get('git',{}).get('sha1');
  for member in tar.getmembers():
   if member.isfile() and member.size<128*1024 and member.name.endswith(('/README.md','/src/lib.rs','/build.rs')):
    text=tar.extractfile(member).read().decode(errors='replace')
    if 'copyright' in text.lower() or 'license' in text.lower():target=folder/('source-notice-'+Path(member.name).name);target.write_text(text,encoding='utf-8');p['noticeFiles'].append(target.name)
 p['noticeSource']={'repository':repo,'revision':revision};found=False
 if revision:
  for name in ['LICENSE-MIT','LICENSE-APACHE','LICENSE','LICENSE.txt','LICENSE.md','COPYRIGHT','COPYING']:
   try:
    text=get('https://raw.githubusercontent.com/'+repo+'/'+revision+'/'+name)
    if len(text)>100:target=folder/name;target.write_bytes(text);p['noticeFiles'].append(name);found=True
   except Exception:pass
 if found:p['status']='notices-retained'
 else:p['status']='source-license-declaration-retained'
 (folder/'record.json').write_text(json.dumps(p,indent=2),encoding='utf-8');return p
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:data['packages']=list(pool.map(audit,data['packages']))
(root/'license-audit.json').write_text(json.dumps(data,indent=2),encoding='utf-8');print(json.dumps({'followup':[p for p in data['packages'] if p['status']!='notices-retained']}))

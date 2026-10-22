from pathlib import Path
import tomllib,urllib.request,tarfile,io,hashlib,json,concurrent.futures
root=Path(__file__).resolve().parent;packages=tomllib.loads((root/'reference/apicula-Cargo.lock').read_text())['package'];dest=root/'dependency-licenses';dest.mkdir(exist_ok=True)
def audit(p):
 name,version=p['name'],p['version'];source=p.get('source','')
 if not source.startswith('registry+'):return {'name':name,'version':version,'source':source,'status':'git-or-root-review'}
 folder=dest/(name+'-'+version);folder.mkdir(exist_ok=True);record=folder/'record.json'
 if record.exists():return json.loads(record.read_text())
 url='https://static.crates.io/crates/'+name+'/'+name+'-'+version+'.crate';req=urllib.request.Request(url,headers={'User-Agent':'ROMDex-LP01-license-audit/1'})
 with urllib.request.urlopen(req,timeout=45) as response:data=response.read(16*1024*1024+1)
 assert len(data)<=16*1024*1024 and hashlib.sha256(data).hexdigest()==p['checksum'],name+' archive checksum differs'
 files=[];license_expr=None
 with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
  for item in archive.getmembers():
   if not item.isfile() or item.size>256*1024:continue
   base=Path(item.name).name
   if base=='Cargo.toml' and len(Path(item.name).parts)==2:
    manifest=archive.extractfile(item).read().decode();package=tomllib.loads(manifest).get('package',{});license_expr=package.get('license');(folder/'Cargo.toml').write_text(manifest,encoding='utf-8')
   if base.upper().startswith(('LICENSE','LICENCE','COPYING','NOTICE','COPYRIGHT','UNLICENSE')):
    content=archive.extractfile(item).read();target=folder/('-'.join(Path(item.name).parts[1:]));target.write_bytes(content);files.append(target.name)
 result={'name':name,'version':version,'source':source,'sha256':p['checksum'],'license':license_expr,'noticeFiles':files,'status':'notices-retained' if files else 'notice-review-needed'};record.write_text(json.dumps(result,indent=2),encoding='utf-8');return result
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for future in concurrent.futures.as_completed([pool.submit(audit,p) for p in packages]):
  try:results.append(future.result())
  except Exception as e:results.append({'status':'download-error','error':str(e)})
  if len(results)%25==0:print('Audited',len(results),'of',len(packages),flush=True)
(root/'license-audit.json').write_text(json.dumps({'tool':'apicula','revision':'3d4e91e14045392a49c89e86dab8cb936225588c','packages':results},indent=2),encoding='utf-8');print(json.dumps({'packages':len(results),'followup':[p for p in results if p['status']!='notices-retained']}),flush=True)

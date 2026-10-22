from pathlib import Path
from datetime import datetime
from itertools import product
import hashlib,subprocess,json,sys
m=json.loads(Path(sys.argv[1]).read_text());git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';repo=Path('work/u13b/repository');raw=None
for za,zc,ending in product(['+0000','-0400'],['+0000','-0400'],['\n','']):
    text='tree '+m['tree']['sha']+'\n'+''.join('parent '+p['sha']+'\n' for p in m['parents'])
    for label,zone in [('author',za),('committer',zc)]:
        person=m[label];epoch=int(datetime.fromisoformat(person['date'].replace('Z','+00:00')).timestamp());text+=f"{label} {person['name']} <{person['email']}> {epoch} {zone}\n"
    b=(text+'\n'+m['message']+ending).encode()
    if hashlib.sha1(b'commit '+str(len(b)).encode()+b'\0'+b).hexdigest()==m['sha']:raw=b
assert raw is not None
assert subprocess.check_output([git,'-C',str(repo),'hash-object','-t','commit','-w','--stdin'],input=raw).decode().strip()==m['sha']
for ref in ['refs/heads/main','refs/remotes/origin/main']:subprocess.run([git,'-C',str(repo),'update-ref',ref,m['sha'],m['parents'][0]['sha']],check=True)
assert not subprocess.check_output([git,'-C',str(repo),'status','--porcelain']).strip()
print(json.dumps({'commit':m['sha'],'tree':m['tree']['sha'],'clean':True}))

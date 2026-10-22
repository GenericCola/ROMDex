from pathlib import Path
import hashlib,json,re,subprocess
root=Path.cwd();work=root/'work/ri02c';mirror=root/'work/u13b/repository'
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe'
def run(*args):
 return subprocess.run([git,'-C',str(mirror),*args],check=True,capture_output=True,encoding='utf-8').stdout.strip()
rows=json.loads((work/'publish-manifest.json').read_text());paths=[r['path'] for r in rows]
assert len(paths)==len(set(paths))==35
assert run('rev-parse','HEAD')=='42c7bb270492da0ac8051bc016ab4e78ac889b46'
for row in rows:
 p=mirror/row['path'];b=p.read_bytes();assert p.suffix in ['.md','.mjs','.cjs','.json'];assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==row['sha']
 assert not re.search(r'\b(?:github_pat_[A-Za-z0-9_]{30,}|ghp_[A-Za-z0-9]{30,}|perm:[A-Za-z0-9_-]{30,})',b.decode())
run('diff','--check');run('add','--',*paths);run('diff','--cached','--check')
staged=[p for p in run('diff','--cached','--name-only','-z').split('\0') if p];assert set(staged)==set(paths)
tree=run('write-tree');(work/'local-tree.json').write_text(json.dumps({'tree':tree,'files':len(paths),'privacyScanPassed':True},indent=2))
print(run('diff','--cached','--stat'));print(json.dumps({'tree':tree,'files':len(paths),'privacyScanPassed':True}))

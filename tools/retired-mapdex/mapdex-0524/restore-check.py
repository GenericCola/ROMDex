from pathlib import Path
import zipfile,json,hashlib,os,sys
archive=Path(sys.argv[1]);destination=Path(sys.argv[2]).resolve();assert not destination.exists();destination.mkdir(parents=True)
with zipfile.ZipFile(archive) as z:
    manifest=json.loads(z.read('_ARCHIVE_MANIFEST.json'))
    for r in manifest['files']:
        target=(destination/r['path']).resolve();assert target.is_relative_to(destination)
        if os.name=='nt':target=Path('\\\\?\\'+str(target))
        target.parent.mkdir(parents=True,exist_ok=True)
        with z.open(r['path']) as source,target.open('xb') as output:
            while chunk:=source.read(1024*1024):output.write(chunk)
        with target.open('rb') as f:assert hashlib.file_digest(f,'sha256').hexdigest()==r['sha256']
print(json.dumps({'status':'verified','files':len(manifest['files']),'liveDataChanged':False}))

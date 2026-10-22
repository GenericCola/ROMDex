from pathlib import Path
p=Path('outputs/ROMDex/rdx/document-cloud.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("lastSync:s.lastChecked||null", "lastSync:s.lastSynced||null,lastRemoteCheck:s.lastChecked||null")
old="s.transfer={milliseconds:Date.now()-started"
assert old in s;s=s.replace(old,"if(!s.intent&&!s.error&&!s.review&&s.publishedRevision===this.maps.store.row(key).head)s.lastSynced=Date.now();s.transfer={milliseconds:Date.now()-started")
p.write_bytes(s.encode('utf-8'))
print('Separate last successful sync from attempted checks')

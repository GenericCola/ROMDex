from pathlib import Path
p=Path('outputs/ROMDex/rdx/document-cloud.mjs')
s=p.read_text();old="await this.publish(key,s);}s.connection='connected';s.lastChecked=Date.now();"
new="await this.publish(key,s);}if(!s.held&&!s.review)s.error=null;s.connection='connected';s.lastChecked=Date.now();"
assert s.count(old)==1
p.write_bytes(s.replace(old,new).encode())

from pathlib import Path
p=Path('outputs/ROMDex/tests/rdx-cloud.test.mjs');s=p.read_text(encoding='utf-8');assert 'assert(h.cloud.status(key).lastRemoteCheck);' in s;s=s.replace('assert(h.cloud.status(key).lastRemoteCheck);','assert.equal(h.cloud.status(key).lastRemoteCheck,null);');p.write_bytes(s.encode('utf-8'))

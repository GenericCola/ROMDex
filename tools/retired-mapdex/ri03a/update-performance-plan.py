from pathlib import Path
root=Path.cwd()
description='Reduce cold-publication and later-sync request overhead for real map RDX documents. Preserve exact source/image bytes, stable identities and backend hierarchy, immutable history, changed/missing-file detection, cancellation/recovery and conflict review. Measure a real map with explicit progress and honest local/queued/remote states. Keep one logical map per working/exported RDX. Complete before RI03C; separate PASSKEY required.'
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=root/'outputs'/name;s=p.read_text();s=s.replace('RI03A → RI03B → RI03C → U28','RI03A → RI03B → RI03P → RI03C → U28')
 lines=s.splitlines();marker='- [ ] **RI03C — Coverage' if name.endswith('Checklist.md') else '| RI03C — Coverage'
 if 'RI03P — Map Cloud-Delivery Performance' not in s:
  at=next(i for i,line in enumerate(lines) if line.startswith(marker))
  row='- [ ] **RI03P — Map Cloud-Delivery Performance** — Sol / High. **Added by user decision October 20; after RI03B and before RI03C.** '+description if name.endswith('Checklist.md') else '| RI03P — Map Cloud-Delivery Performance | **Added by user decision October 20; after RI03B and before RI03C.** '+description+' | Sol / High |'
  lines.insert(at,row)
 p.write_bytes(('\n'.join(lines)+'\n').encode())
print('Added separately gated RI03P between RI03B and RI03C in checklist and overall plan.')

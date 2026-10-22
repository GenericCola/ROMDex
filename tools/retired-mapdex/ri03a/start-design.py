from pathlib import Path
root=Path.cwd();work=root/'work/ri03a';backup=work/'before';backup.mkdir(parents=True,exist_ok=True)
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=root/'outputs'/name;s=p.read_text();b=backup/name
 if not b.exists():b.write_bytes(p.read_bytes())
 if name.endswith('Checklist.md'):
  lines=s.splitlines();indices=[i for i,line in enumerate(lines) if line.startswith('**Current:**')];assert len(indices)==1
  lines[indices[0]]='**Current:** **RI03A — ROM Import Workspace Design, Sol / High is in progress** under the October 20 PASSKEY. Decisions are being reviewed with the user in the [design draft](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md). RI02C remains complete. No implementation, production replacement, installation or sync resumption is authorized by this design task.'
  s='\n'.join(lines)+'\n';s=s.replace('- [ ] **RI03A — Review ROM Import workspace design** — Sol / High.','- [ ] **RI03A — Review ROM Import workspace design** — Sol / High. **In progress; October 20 PASSKEY received; [design draft](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md).**',1)
 else:
  s=s.replace('**RI03A — Sol / High** is next under a new PASSKEY','**RI03A — Sol / High** design review is in progress under the October 20 PASSKEY',1)
  s=s.replace('| RI03A — Review ROM Import workspace design | Review','| RI03A — Review ROM Import workspace design | **In progress; October 20 PASSKEY received; [design draft](Documentation/Project/RI03A-ROM-Import-Workspace-Design.md).** Review',1)
 p.write_bytes(s.encode())
print('RI03A started in checklist/plan; draft decisions remain pending and task unchecked.')

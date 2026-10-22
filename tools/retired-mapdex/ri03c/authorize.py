from pathlib import Path
import shutil
root=Path.cwd()
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=root/'outputs'/name;s=p.read_text(encoding='utf-8-sig');s=s.replace('Stop before RI03C.','RI03C is now authorized and active under the October 21 PASSKEY; stop before U28.').replace('stop before RI03C.','RI03C is now authorized and active; stop before U28.')
 if 'Checklist' in name:s=s.replace('- [ ] **RI03C — Coverage and Integrated Feature Acceptance** — Sol / High.','- [ ] **RI03C — Coverage and Integrated Feature Acceptance** — Sol / High. Authorized and active October 21; final acceptance remains pending.')
 s+='\n\n### RI03C authorization — October 21, 2026\n\nThe owner authorized RI03C / Phase 11F. Reuse valid 11A–11E evidence and verify remaining integrated supported-ROM and owner acceptance boundaries in isolated profiles. Installed 0.5.26, production Data, credentials and NPCDex cloud pause remain preserved. Stop before U28.\n'
 p.write_text(s,encoding='utf-8');shutil.copy2(p,root/'work/u13b/repository/docs/project'/name)

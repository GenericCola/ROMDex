import fs from 'node:fs/promises';
const file='outputs/U20F-Action-Plan.md';let text=await fs.readFile(file,'utf8');
text=text.replace('- [ ] Verify isolated','- [x] Verify isolated').replace('- [ ] Build the next','- [x] Build the next');
const start=text.indexOf('## In-Progress Evidence'),end=text.indexOf('\nDo not mark',start);
text=text.slice(0,start)+`## Verified Acceptance Evidence

- Regression: **540 passed, 0 failed**; final focused rechecks: **10 passed, 0 failed**; packaged runtime: **5 passed**; syntax: **162 passed**.
- Native Electron review passed for Plan Changes, Flags/Notes, Documentation Correction and Planned Addition. Unfinished drafts retain exact trailing whitespace.
- Actual private YouTrack fixtures proved offline delivery, restart recovery after a lost upload response, shared-profile additions, explicit native-title adoption and rejection of a later stale review. All 15 run-only issues were removed; production remains 212 NPCD records and 299 PMON tickets, with zero PMON writes.
- Complete Data backup and isolated restoration matched all 120 files (152,608,737 bytes). All three remembered credentials restored without entry; task order, saved parent statuses and NPCDex revision 73 were retained.
- The 0.5.9 installer and packaged source were audited. Private publication and production upgrade are the remaining release gates.
`+text.slice(end);await fs.writeFile(file,text);
const vfile='outputs/U20F-Visual-Verification.json',visual=JSON.parse(await fs.readFile(vfile,'utf8'));visual.checks.push('Add Planned Character uses the padded, scrollable form and shared-profile appearance controls');await fs.writeFile(vfile,JSON.stringify(visual,null,2));

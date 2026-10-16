import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve('outputs'),windows=JSON.parse(await fs.readFile(path.join(root,'U10F-Windows-Verification.json'),'utf8'));if(windows.checks.length!==8||windows.errors.length)throw Error('Desktop acceptance incomplete');
const entry=`

## U10F — Completed October 15, 2026; File Drops and Web-Data Authority

The task-specific PASSKEY authorized desktop file drops. **0.5.0-preview.10f** highlights the pointed Work Pane row and attaches disk files through the isolated preload and existing native queue. The drop does not open Details, alter checkbox selection, or move tasks. Existing limits, paused/offline storage, cancellation, previews and duplicate-safe delivery remain in use. Unsupported/changed file batches add no partial attachments, and original source paths are not stored in outgoing ticket metadata.

Passed **245 tests, nine UI scenarios, eight service/restart scenarios, eight actual Electron checks, 73 syntax checks and 178 delivery hashes**. File bytes survive source removal and reload/process restart. Internal bulk moves and parent/descendant relationships passed. The old U10 desktop, protected source, 0.4.3 web release/ZIP and credential ciphertext remain unchanged; verification made no production YouTrack writes. [Report](U10F-Completion-Report.md), [Windows evidence](U10F-Windows-Verification.json), [preservation](U10F-Preservation-Verification.json).

The user explicitly confirms **the live web save is authoritative; the desktop baseline differs**. Preserve both. U12 must preview and migrate the latest web state, recovery records, queues/files and remembered connection; no packaged desktop baseline or QA fixture may replace it. No migration was performed in U10F. Continue using the live web release until that gate. Delivery: **outputs/ROMDex-Desktop-U10F/ROMDex.exe**; preview profile identity remains unchanged.

**Next: UX01 — Application Command Placement Review, Sol / Medium**, requiring a new PASSKEY before U11. U11/U12/installer/cloud gates remain unchanged. No UX01 work is included here.
`;
for(const name of ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Unified-App-Scope.md','NPCDex-ROMDex-Decision-Log.md']){
 const file=path.join(root,name);let s=await fs.readFile(file,'utf8');if(s.includes('## U10F — Completed October 15, 2026; File Drops and Web-Data Authority'))throw Error('Already recorded');
 if(name.includes('Action-Checklist'))s=s.replace('- [ ] **U10F — Desktop File Drop Attachments** — Sol / High.','- [x] **U10F — Desktop File Drop Attachments** — Sol / High. Completed October 15; [report](U10F-Completion-Report.md).');
 if(name.includes('Unified-App-Action-Plan')){s=s.replace('U10F and remaining work require separate PASSKEYs.','U10F is complete in 0.5.0-preview.10f. UX01 and remaining work require separate PASSKEYs.');s=s.replace('Next implementation boundary: **U10F — Desktop File Drop Attachments, Sol / High**, under a new PASSKEY.','Current desktop preview: [U10F / 0.5.0-preview.10f](U10F-Completion-Report.md). Next boundary: **UX01 — Application Command Placement Review, Sol / Medium**, under a new PASSKEY.');s=s.replace('| U10F | Add external file drops','| U10F | **Complete in 0.5.0-preview.10f:** added external file drops');}
 await fs.writeFile(file,s+entry);
}
const checklist=path.join(root,'U10F-Implementation-Checklist.md');let s=await fs.readFile(checklist,'utf8');await fs.writeFile(checklist,s.replaceAll('- [ ]','- [x]')+'\nCompleted after actual Electron acceptance; [report](U10F-Completion-Report.md). UX01 requires a separate PASSKEY.\n');
const manifestFile=path.join(root,'U10F-Desktop-Manifest.json'),manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));manifest.graphicalAcceptancePending=false;manifest.actualElectronChecks=8;manifest.acceptanceEvidence='U10F-Windows-Verification.json';await fs.writeFile(manifestFile,JSON.stringify(manifest,null,2));
const report=await fs.readFile(path.join(root,'U10F-Completion-Report.md'),'utf8');for(const m of report.matchAll(/\]\(([^)]+)\)/g))await fs.access(path.resolve(root,m[1]));console.log(JSON.stringify({U10FComplete:true,UX01Started:false,linksVerified:true}));

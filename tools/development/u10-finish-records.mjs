import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('outputs');
const verified=JSON.parse(await fs.readFile(path.join(root,'U10-Windows-Verification.json'),'utf8'));if(verified.checks.length!==11||verified.errors.length)throw Error('Desktop acceptance not complete');
const entry=`

## U10 — Completed October 15, 2026; Native Desktop Preview

The task-specific PASSKEY authorized U10. **ROMDex 0.5.0-preview.10** now includes the Windows x64 Electron 44.7.2 runtime, a sandboxed custom-protocol window, finite validated bridge, utility-owned native queue/clock and durable stores, native attachment selection and NPCDex export adapters. Retained first-party documents preserve the existing editing/context interfaces inside the native window; the [host contract](U10-Host-and-Bridge-Contract.md) records this container choice. The desktop does not open the browser HTTP listener.

The user launched the packaged preview normally. A custom-protocol registration on the wrong Electron session was corrected before successful graphical acceptance. Passed **240 tests under bundled Node 24.21.0, seven service/restart checks, nine desktop-facade checks, 14 browser regressions, eleven actual Electron checks, 70 syntax checks and 174 delivery hashes**. Automatic native fixture updates arrived through the utility clock while NPCDex was active. Native NPCDex export/reload, shared manual Save while Off, sandbox/bridge restrictions and the existing header correction passed. [Completion report](U10-Completion-Report.md), [Windows evidence](U10-Windows-Verification.json), [preservation](U10-Preservation-Verification.json).

Delivery: **outputs/ROMDex-Desktop-U10/ROMDex.exe**. This is an independent development preview; continue using **0.4.3** for the live project until U12. No browser saves, remembered credentials or original NPCDex files were migrated/overwritten. The 91-file old installation/checkpoint, ZIP and credential ciphertext are verified unchanged. The fixture-only verification session made no production YouTrack writes. Normal preview data lives outside program files, under ROMDexDesktopData/preview-u10.

U10 is complete; tray lifecycle, profile locking and supervised recovery remain U11, current-data handoff U12, installer U13A and NPCDex cloud U14–U19. **Next: U10F — Desktop File Drop Attachments, Sol / High**, requiring a new PASSKEY. UX01 command placement still precedes U11. No U10F work is included here.
`;
const names=['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Unified-App-Scope.md','NPCDex-ROMDex-Decision-Log.md'];
for(const name of names){const file=path.join(root,name);let s=await fs.readFile(file,'utf8');if(s.includes('## U10 — Completed October 15, 2026; Native Desktop Preview'))throw Error('Already recorded');
 if(name.includes('Action-Checklist'))s=s.replace('- [ ] **U10 — Native Desktop Window and Local Service** — Sol / High.','- [x] **U10 — Native Desktop Window and Local Service** — Sol / High. Completed October 15; [desktop preview report](U10-Completion-Report.md).');
 if(name.includes('Unified-App-Action-Plan')){
  s=s.replace('U10 and remaining work require separate PASSKEYs.','U10 is complete as a verified independent desktop preview. U10F and remaining work require separate PASSKEYs. The live browser build remains 0.4.3 until U12 migration.');
  s=s.replace('Next implementation boundary: **U10 — Native Desktop Window and Local Service, Sol / High**, under a new PASSKEY.','Desktop preview: [U10 / 0.5.0-preview.10](U10-Completion-Report.md). Next implementation boundary: **U10F — Desktop File Drop Attachments, Sol / High**, under a new PASSKEY.');
  s=s.replace('| U10 | Host the combined interface and service in approved Electron:','| U10 | **Complete as 0.5.0-preview.10:** hosted the combined interface and service in approved Electron:');
 }
 await fs.writeFile(file,s+entry);
}
const checklist=path.join(root,'U10-Implementation-Checklist.md');let s=await fs.readFile(checklist,'utf8');s=s.replaceAll('- [ ]','- [x]');s+='\nCompleted after actual Windows acceptance; see [report](U10-Completion-Report.md). U10F remains unapproved.\n';await fs.writeFile(checklist,s);
const manifestPath=path.join(root,'U10-Desktop-Manifest.json'),manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));manifest.graphicalAcceptancePending=false;manifest.testsPassed=240;manifest.actualElectronChecks=11;manifest.acceptanceEvidence='U10-Windows-Verification.json';await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2));
const report=await fs.readFile(path.join(root,'U10-Completion-Report.md'),'utf8');for(const match of report.matchAll(/\]\(([^)]+)\)/g))await fs.access(path.resolve(root,match[1]));
console.log(JSON.stringify({U10Complete:true,U10FStarted:false,planningRecordsUpdated:names.length,reportLinksVerified:true,desktopFiles:manifest.files.length}));

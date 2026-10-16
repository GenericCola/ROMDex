import {readFile,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('outputs');
const entry=`

## U09 — Completed October 15, 2026; Combined Build 0.4.3

U09 was individually authorized and is complete. Shared Save coordinates both providers, coalesces repeated attempts and retains independent failure results; manual Save while Off leaves Auto-Sync Off. The shell owns one native engine/queue/clock. The engine and coordinator have injectable storage/runtime boundaries, with Node disk/restart tests preparing U10. NPCDex accepted edits/notes gain local recovery checkpoints, including while Auto-Sync is Off; export races preserve newer edits and mismatched copies remain available for review. Unapplied modal forms are not silently committed.

Passed **237 automated tests, 14 focused browser checks, 63 syntax checks and 91 package integrity checks**. The user launched **outputs/ROMDex-v0.4.3/ROMDex**; live GET-only verification confirmed build/installation identity, 42 served assets, remembered connection, unchanged credential ciphertext and Auto-Sync. Protected baselines, prior installation/ZIPs and H01's header correction remain preserved. No production YouTrack writes were made by verification. [Completion report](U09-Completion-Report.md), [live evidence](U09-Live-Verification.json), [provider contract](U09-Engine-and-Provider-Contract.md).

**NPCDex remains local-only; cloud persistence is U14–U19.** U14 storage, U15 current-data import and U16–U17 durable two-way sync/conflicts precede U18–U19 metadata/shared cloud controls. Browser closure still stops the runtime; Electron and tray behavior remain U10/U11. U12 must migrate latest working data and recovery records, never replace them with an older embedded baseline.

Phase 1 is complete. **Next: U10 — Native Desktop Window and Local Service, Sol / High**, requiring a new PASSKEY. U10F file-drop attachments follows U10; UX01 command placement remains before U11. No U10 implementation has begun.
`;
const names=['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Unified-App-Scope.md','NPCDex-ROMDex-Decision-Log.md'];
for(const name of names){
 const file=path.join(root,name);let s=await readFile(file,'utf8');
 if(s.includes('## U09 — Completed October 15, 2026; Combined Build 0.4.3'))throw Error('Already recorded: '+name);
 if(name.includes('Action-Checklist')){
  const old='- [ ] **U09 — Shared Save and Auto-Sync Coordination** — Sol / High.';
  if(!s.includes(old))throw Error('Missing checklist entry');
  s=s.replace(old,'- [x] **U09 — Shared Save and Auto-Sync Coordination** — Sol / High. Completed October 15 in ROMDex 0.4.3; [report](U09-Completion-Report.md).');
 }
 if(name.includes('Unified-App-Action-Plan')){
  s=s.replace('the current combined browser build is ROMDex 0.4.2 + H01 (header correction). U09 and remaining work require separate PASSKEYs.','U09 is complete and the current combined browser build is ROMDex 0.4.3, including H01. U10 and remaining work require separate PASSKEYs.');
  s=s.replace('Current combined build: [U08 / ROMDex 0.4.2](U08-Completion-Report.md). Next implementation boundary: **U09 — Shared Save and Auto-Sync Coordination, Sol / High**, under a new PASSKEY.','Current combined build: [U09 / ROMDex 0.4.3](U09-Completion-Report.md). Phase 1 is complete. Next implementation boundary: **U10 — Native Desktop Window and Local Service, Sol / High**, under a new PASSKEY.');
  s=s.replace('| U09 | Introduce shared Save/Auto-Sync coordination,','| U09 | **Complete in 0.4.3:** introduced shared Save/Auto-Sync coordination,');
 }
 await writeFile(file,s+entry);
}
const report=await readFile(path.join(root,'U09-Completion-Report.md'),'utf8');
const links=[...report.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]);
for(const link of links)await access(path.resolve(root,link));
const checklist=await readFile(path.join(root,names[0]),'utf8');
if(!checklist.includes('- [x] **U09')||!checklist.includes('- [ ] **U10 —'))throw Error('Approval boundary incorrect');
console.log(JSON.stringify({updated:names,reportLinksVerified:links.length,U09Complete:true,U10Pending:true}));

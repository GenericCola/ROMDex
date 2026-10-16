import fs from 'node:fs/promises';
const record=`

## U12 — Completed October 15, 2026; Current Saves Adopted by Desktop

The user authorized U12 and reviewed/accepted the native migration preview. Desktop **0.5.0-preview.12** now owns the latest captured browser workspace: **299 tasks, 104 manual-order entries, no pending operations or queued files**, plus the complete preserved NPCDex **revision 72** document (4 towns, 44 plans, 145 history records). No browser NPCDex current/recovery/held record existed; the preview identified the preserved Downloads package as its source. The older packaged desktop baseline was not used as migration authority.

The stable Windows-account profile is outside build folders at **%LOCALAPPDATA%/ROMDexDesktopData/thegobindsingh-PMON**. Original browser/package files and protected backups remain intact. The importer stages, hashes, reviews and atomically publishes the profile; missing established saves refuse baseline fallback. The remembered connection was converted through Windows protection to Electron safeStorage and verified after restart without token entry. Saved parent statuses and operation journal match their originals exactly.

Passed **272 automated tests, 83 syntax checks, 194 delivered-file hashes**, genuine YouTrack reads matching all 299 task fields, exact whole-document NPCDex comparison, hidden automatic sync and a checkpointed relaunch from a separate build folder. ROMDex then returned to its normal delivery executable with verification endpoints closed. No synthetic production edits were made. [Report](U12-Completion-Report.md), [live/restart evidence](U12-Desktop-Verification.json), [preservation](U12-Preservation-Verification.json).

**Use the desktop for current work; the old browser service is stopped. NPCDex remains local-only until U14–U19.** Installer upgrade/uninstall behavior remains U13A; update delivery U13B. **Next: U13A — Windows Installer and Upgrade/Uninstall Preservation, Sol / Medium**, requiring a new PASSKEY. No U13A implementation has begun.
`;
for(const file of ['outputs/NPCDex-ROMDex-Action-Checklist.md','outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md','outputs/NPCDex-ROMDex-Decision-Log.md']){const text=await fs.readFile(file,'utf8');if(text.includes('## U12 — Completed October 15, 2026; Current Saves Adopted by Desktop'))throw Error('U12 Record Already Exists');await fs.appendFile(file,record);}
const file='outputs/U12-Desktop-Manifest.json',manifest=JSON.parse(await fs.readFile(file,'utf8'));manifest.graphicalAcceptancePending=false;manifest.verifiedAt=new Date().toISOString();manifest.liveMigrationVerified=true;manifest.buildFolderReplacementVerified=true;manifest.normalLaunchWithoutVerificationEndpoints=true;await fs.writeFile(file,JSON.stringify(manifest,null,2));
await fs.copyFile('work/u12/migrated-desktop.png','outputs/U12-Desktop-Preview.png');
console.log({U12:'Complete',next:'U13A',model:'Sol / Medium',awaiting:'New PASSKEY'});

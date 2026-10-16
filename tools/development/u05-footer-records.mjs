import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('outputs'),heading='## U05 Revision — Footer Workspace Menu, October 15, 2026';
const entry='\n\n'+heading+'\n\nThe user rejected Direct Switch and Compact Menu and specified a small unlabeled red circular button at the bottom-left of the window, in the red shell footer. It opens a pop-up listing **ROMDex** and **NPCDex**; selection or ESC closes it. Preserve each workspace\'s selections/settings/view/navigation/drafts while switching. The user explicitly clarified **between workspaces in this app**, not across computers. No header switcher should be implemented. The [revised proposal](U05-Shared-Header-and-Control-Layout-Proposal.md) and [footer verification](U05-Footer-Layout-Verification.json) record this direction; [open-menu image](U05-Footer-Switch-Open.png). U05 remains in final visual review; no application change or S01/U06 work has begun. Next gated implementation remains **S01, Sol / High**, then **U06, Sol / Medium**, each with its own PASSKEY.\n';
for(const name of ['NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Decision-Log.md','NPCDex-ROMDex-Unified-App-Scope.md']){
 const file=path.join(root,name);let s=await fs.readFile(file,'utf8');
 if(name.includes('Action-Plan'))s=s.replace('**Design review pending:** [Direct Switch / Compact Menu proposal]','**Revised design review pending:** [Footer Workspace Menu proposal]');
 if(!s.includes(heading))s+=entry;await fs.writeFile(file,s);
}
const file=path.join(root,'NPCDex-ROMDex-Action-Checklist.md');let s=await fs.readFile(file,'utf8');
s=s.replace('- [x] Produce [Direct Switch / Compact Menu proposal](U05-Shared-Header-and-Control-Layout-Proposal.md) and interactive comparison.','- [x] Produce initial comparison, then revise to the user-directed [Footer Workspace Menu](U05-Shared-Header-and-Control-Layout-Proposal.md); both header switchers are rejected.');
if(!s.includes('- [x] Confirm preserved view state means'))s=s.replace('- [ ] Obtain the user\'s layout selection/approval and mark U05 complete.','- [x] Confirm preserved view state means between workspaces in this app; verify footer menu dismissal, keyboard navigation and retained setting.\n- [ ] Obtain final visual approval of the revised layout and mark U05 complete.');
await fs.writeFile(file,s);
assert.match(s,/- \[ \] \*\*U05/);assert.match(s,/- \[ \] \*\*S01/);
let links=0;for(const name of ['U05-Shared-Header-and-Control-Layout-Proposal.md','U05-Review-Report.md','NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md','NPCDex-ROMDex-Decision-Log.md','NPCDex-ROMDex-Unified-App-Scope.md']){for(const m of (await fs.readFile(path.join(root,name),'utf8')).matchAll(/\]\(([^)]+)\)/g)){const t=m[1].split('#')[0];if(!t||/^(https?:|app:)/i.test(t))continue;await fs.access(path.isAbsolute(t)?t:path.resolve(root,t));links++;}}
const result={verifiedAt:new Date().toISOString(),userDirectedSwitcher:'Footer Workspace Menu',viewPreservation:'Between Workspaces in This App',U05FinalVisualApprovalPending:true,S01Started:false,U06Started:false,linksVerified:links,productionChanged:false};await fs.writeFile('work/u05-layout/footer-record-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));

const fs=require('fs');const file='outputs/npcdex-template.html';let html=fs.readFileSync(file,'utf8');
html=html.replace("key:'entry:'+b.id+':'+i,blockId:b.id", "key:i===0&&b.reviewKey?b.reviewKey:'entry:'+b.id+':'+i,blockId:b.id");
const helper=`function applyPackagedReconciliationPatches(updated,saved){
  for(const correction of (ORIGINAL.reconciliations||[]).filter(r=>(r.contentRevision||0)>(saved.contentRevision||0)&&r.patches?.length)){
    const trial=structuredClone(updated);let compatible=true;
    for(const patch of correction.patches){
      const current=readPath(trial,patch.path);
      if(sameState(current,patch.after))continue;
      if(sameState(current,patch.before)){writePath(trial,patch.path,patch.after);continue;}
      // Later feedback/decisions remain authoritative; never clear or overwrite them.
      if(patch.path.startsWith('/annotations/')||patch.path.startsWith('/changePlans/'))continue;
      compatible=false;break;
    }
    if(compatible)for(const root of ['towns','annotations','changePlans'])updated[root]=trial[root];
    else {updated.contentRevision=saved.contentRevision;updated.reconciliationConflicts=updated.reconciliationConflicts||[];updated.reconciliationConflicts.push({historyId:correction.historyId,message:'A later content edit differs from the tester correction baseline. Import the reconciled package JSON or review the conflicting edit before applying this correction.'});}
  }
}
`;
html=html.replace('function mergePackagedUpdate(saved){',helper+'function mergePackagedUpdate(saved){');
html=html.replace('updated.history=[...new Map([...(saved.history||[]),...(ORIGINAL.history||[])].map(h=>[h.id,h])).values()]','applyPackagedReconciliationPatches(updated,saved);updated.history=[...new Map([...(saved.history||[]),...(ORIGINAL.history||[])].map(h=>[h.id,h])).values()]');
fs.writeFileSync(file,html);
fs.writeFileSync('outputs/npcdex-reconciliation-report.md',`# NPCDex 2.34 · Tester-session reconciliation

Input: latest supplied export, interface 2.32, revision 50. No ROM changes have been implemented.

## Resolved indexing corrections

- Picture Sign (60-14-0): now displays “New Bark Town / Winds of a New Beginning,” source record NBT-DLG-060-U34 (text archive 542, message 34). Location and access condition identify the center-of-town Picture Sign. The mapping is tester-reported; the original script analysis remains intact and the engine linkage has not been independently rechecked.
- Unused Dialogue: the original U34 block is archived as a reclassified reference, linked to the live Picture Sign entry. It is no longer presented as a second unused dialogue passage. Original block text and IDs remain recoverable.
- Both resolved flags/notes are cleared, and affected prompts are Unreviewed for validation. The Picture Sign keeps its original prompt review key and FINAL plan ID. Its text now has a stable block ID for future receipts.

## Retained pending ROM work

Four UPDATE tickets remain unchanged: Lyra/Ethan → Tommy, Marill → Mr. Paint, Mom → Spouse, and the friend-house sign → Tommy’s House. Three Critical character flags remain active because those blocking changes are not implemented. Existing NPC names and dialogue are not replaced by proposed ROM content.

All session images, unrelated feedback, source baselines, script IDs, original history and pending request IDs are retained. Reconciliation appends before/after history and explicit source evidence. Save Changes exports the corrected dataset and full coding-agent receipt contract.

An older browser snapshot receives compatible correction patches while retaining later feedback and decisions. Conflicting content edits are preserved rather than overwritten; reconciliationConflicts records the reason. The included reconciled JSON is also available through Data → Import NPCDex JSON.
`);
const notes='outputs/npcdex-update-notes.md';fs.writeFileSync(notes,'# NPCDex 2.34 · Latest tester export reconciliation\n\nReclassified New Bark Town / Winds of a New Beginning under the Picture Sign using the tester’s notes. Archived the old unused reference, preserved source IDs and review identity, cleared two resolved annotations and reset affected validation. Retained all four unimplemented ROM tickets and their three Critical character flags. Includes 2.33 selector saturation reduction.\n\n'+fs.readFileSync(notes,'utf8'));

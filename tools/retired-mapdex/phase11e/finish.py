from pathlib import Path
import json,shutil,hashlib
root=Path.cwd();out=root/'outputs';docs=out/'Documentation/Project';repo=root/'work/u13b/repository';load=lambda x:json.loads((root/x).read_text(encoding='utf-8-sig'))
live=load('work/mx09/live-proof.json');native=load('work/mx09/native-proof.json');audit=load('work/phase11e/final-audit.json');smoke=load('work/mx09/toolkit-smoke-proof.json');kit=load('work/mx09/toolkit-manifest.json');tests=load('work/phase11e/test-counts.json')
for x in [live,native,audit,smoke]:assert x['status']=='passed'
assert len(live['cleanup'])==9 and all(c['status']=='verified-absent' for c in live['cleanup'])
native['visualObservation']='Native short-window screenshot reviewed. A transient isolated-profile startup notice overlays part of the footer in the capture; the modal scroll region and footer are separate. U29 should verify shell notices do not obscure modal actions. This is not counted as a clean unobscured-footer visual acceptance.'
(root/'work/mx09/native-proof.json').write_text(json.dumps(native,indent=2)+'\n',encoding='utf-8')
mx09='''# MX09 — Deterministic Agent Returns and Real ROM Proof

**Complete in source and isolated candidate 0.5.26-11e.1, October 21, 2026.** Installed ROMDex remains 0.5.26. Production saves, queues, remembered credentials and the NPCDex sync pause remain unchanged. No installer, release, production migration or external-agent dispatch occurred.

The agent now has a deterministic `fetch → template → build → validate → return` tool chain. It downloads the exact task-authorized package/context/assets, constructs a task-bound returned RDX from the actual input/output ROMs, and verifies source hashes, mappings, group outcomes and mandatory human testing. Typed changes must match the package exactly. Prose-only changes stay held for the owner's exact-difference approval. Unfinished groups cannot apply. Upload replay reuses the verified attachment; file-supplied approval grants no authority. The tool does not edit a ROM or interpret prose: the coding agent still implements the change with appropriate editing tools.

## Actual proof

Only an isolated copy of the supplied 0.6.3 ROM was edited. One actual New Bark Town outdoor NPC supplies two dialogue variants, so two separately authorized QA task packages were used. The typed package replaced “impressive” with “incredible” in the Pokégear line. The prose return replaced “I wish I had one!” with the owner-approved “I would like one!” at both shared-message sites. All 15 changed bytes are inside the two approved encoded-message spans. The original ROM is unchanged; the ROM decoder confirmed both output messages.

A separate normal Windows Node process downloaded actual pinned YouTrack binaries, built and validated both returned RDX files using the real ROM files, uploaded and read back exact bytes, and reused attachments on retry. Six source-derived content records plus their registry were published to fresh owner-private NPCD records. Typed reconciliation happened automatically; prose remained held until the owner approved the exact wording in this conversation. Prose application preserved the accepted typed change. A fresh remote reconstruction matched the managed RDX document and every asset. Replay created no new revision or readiness comment. Both synthetic tasks stayed open, showed Needs Testing in the isolated ROMDex metadata harness, and received one actual readiness comment each; NPCDex testing obligations stayed unreviewed. All nine exact temporary issues were then removed and confirmed absent.

## Verification and corrections

108 distinct focused cases passed for MX09, reusing MX08's 50 relevant cases rather than rerunning a full suite. Three standalone-tool smoke checks passed, including an unfinished local result. Four packaged-client checks passed: reopened RDX dialogue, pending testing indicators, delivery/review controls and Escape at a 620px window height, and normal save/quit (503 ms on this small isolated fixture). Five MX08 source-browser checks cover exact prose review/cancel/approval and body/footer separation. Final source/mirror/candidate audit compared 1,217 application files, 148 mirrored test files and 1,289 candidate files; 15 changed JavaScript syntax checks and Git whitespace checks passed. No runtime binaries changed; no ROM, credentials or live Data entered the candidate or tool ZIP.

The live run exposed asynchronous PNG metadata settling after upload. A timestamp-only change is now repinned only after exact byte/hash/size readback and stable metadata; missing, renamed, resized or changed-byte files stay blocked. Reviewed prose history now uses the accepted exact differences for reversal references. New condition/ancestry requirements survive stripped agent context; private preview capabilities are not falsely declared. The unfinished-builder path now validates without pretending it has a completed application receipt. Early encoding/schema and test-helper issues were corrected; checkpointed recovery reused existing uploads. A final helper assertion needed explicit manual sync while Auto-Sync was off; this was a harness call correction, not a change to the user's sync setting.

## Limits and next gate

This proves this agent's local Windows Node/file-transfer environment, not a separately dispatched coding agent or a comment-only MCP connector. Private authorization/acceptance metadata used an isolated trusted local-readback harness with existing private-provider contract evidence; this was not a new live GitHub metadata proof. Native restart used a cloned offline fixture with test acceptance evidence. The proof is one partial real NPC dataset, not full-map semantic acceptance or in-game validation. Human testing remains required. Actual two-build acceptance is deferred until a second supported ROM exists. Full 134-record save latency and pre-existing independent child-copy recovery remain U28/U29 items. The native screenshot's transient isolated-profile startup notice covers part of the action row; U29 must check shell notice placement before final UI acceptance.

**Next: RI03C / Phase 11F, requiring a new PASSKEY.** Final production packaging remains U30.

Tools: [Phase 11E Agent Tools](../../RDX-Reference/Phase-11E-Agent-Tools.zip). Source guide: [Bound Returns](../../ROMDex/rdx/authoring/BOUND-RETURNS.md). Evidence: [MX09 Verification](MX09-Verification.json).
'''
phase='''# Phase 11E — Completion Report

**MX08 and MX09 are complete in source and isolated candidate 0.5.26-11e.1.** Installed ROMDex remains 0.5.26; production Data, tokens, queues and paused NPCDex sync were preserved. No installer or release was run.

- **MX08:** typed changes keep exact automatic validation; prose results require private approval of the exact returned differences. Ordinary contextual planning remains, with no Draft/Ready gate. Hard validation and newer unrelated edits remain protected.
- **MX09:** a current deterministic agent tool kit builds task-bound returned RDX files from actual ROM evidence. The live proof applied the exact Pokégear edit automatically, then applied your approved prose wording while preserving it. Fresh NPCD reads reconstructed the exact managed RDX/assets; replay produced no duplicate application or readiness comment. Tasks stayed open and affected content required human testing. All nine temporary YouTrack records were confirmed removed.

Verification: **158 distinct targeted cases**, five source-browser checks, four packaged-client checks and three standalone-tool smoke checks passed. The native candidate reopened both changed messages and quit normally in 503 ms on the small test profile. Source/mirror/candidate, 15 changed-file syntax checks and whitespace checks passed. Broad regression runs and repeated map uploads were avoided.

The ROM proof used an isolated copy and one real NPC's two dialogue variants, covering three displayed text fields. The original ROM is unchanged. This is not in-game or full-map acceptance. Private metadata used an isolated trusted harness; an external coding agent was not dispatched. Large-map latency and actual second-ROM-build acceptance remain explicitly outstanding. A transient QA startup notice obscured part of the screenshot's footer; shell notice placement remains a U29 visual acceptance check.

The current agent tool ZIP includes no ROM, saves or credentials: [download tools](../../RDX-Reference/Phase-11E-Agent-Tools.zip). [Authoring guide](../../ROMDex/rdx/authoring/BOUND-RETURNS.md).

**Stop before RI03C / Phase 11F. A new PASSKEY is required.** Final production installer packaging remains U30.

Details: [MX08](MX08-Completion-Report.md), [MX09](MX09-Completion-Report.md), [combined evidence](Phase-11E-Verification.json).
'''
(docs/'MX09-Completion-Report.md').write_text(mx09,encoding='utf-8');(docs/'Phase-11E-Completion-Report.md').write_text(phase,encoding='utf-8')
mxEvidence={'task':'MX09','status':'complete-source-and-isolated-candidate','date':'2026-10-21','candidate':'0.5.26-11e.1','installedVersion':'0.5.26','focusedDistinctCasesPassed':108,'live':live,'native':native,'standaloneToolSmoke':smoke,'toolkit':{k:v for k,v in kit.items() if k!='sourceManifest'},'audit':audit,'productionChanged':False,'installerRun':False,'gameplayVerified':False}
(docs/'MX09-Verification.json').write_text(json.dumps(mxEvidence,indent=2)+'\n',encoding='utf-8')
combined={'phase':'11E','status':'complete-source-and-isolated-candidate','tasks':['MX08','MX09'],'tests':tests,'browserChecks':5,'nativeChecks':4,'standaloneToolSmokeChecks':3,'cleanupVerifiedAbsent':9,'candidate':'0.5.26-11e.1','audit':audit,'productionChanged':False,'installerCreated':False,'nextGate':'RI03C / Phase 11F; separate PASSKEY','limits':['one partial real NPC dataset; in-game testing outstanding','isolated private metadata harness; no new live GitHub proof','no external-agent dispatch','second actual ROM build unavailable','large-map checkpoint latency and former child-copy recovery remain U28/U29','transient QA notice overlaps captured modal action row; shell notice placement remains U29 visual acceptance']}
(docs/'Phase-11E-Verification.json').write_text(json.dumps(combined,indent=2)+'\n',encoding='utf-8')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=out/name;s=p.read_text(encoding='utf-8-sig')
 s=s.replace('MX08 is source-complete; MX09 is active.','MX08 and MX09 are complete in source and isolated candidate 0.5.26-11e.1; [Phase 11E report](Documentation/Project/Phase-11E-Completion-Report.md).')
 s=s.replace('MX08 is source-complete and MX09 is active.','MX08 and MX09 are complete in source and isolated candidate 0.5.26-11e.1.')
 s=s.replace('MX08 is complete in source; MX09 is active.','MX08 and MX09 are complete in source and isolated candidate 0.5.26-11e.1.')
 s=s.replace('The next stop is before MX08, which requires a new PASSKEY.','Phase 11E is also complete; stop before RI03C, which requires a new PASSKEY.')
 s=s.replace('That source/candidate work is complete; stop before MX08.','Phases 11D and 11E are complete in source/candidate; stop before RI03C.')
 s=s.replace('The authorized 11D work is complete; MX08 needs a new PASSKEY.','The authorized 11D and 11E work is complete in source/candidate; RI03C needs a new PASSKEY.')
 s=s.replace('**Next: MX08, requiring a new PASSKEY.**','Phase 11E subsequently completed under its own authorization; next is RI03C, requiring a new PASSKEY.')
 s=s.replace('Include large 134-record checkpoint latency/native concurrency and review recovery/retirement when another instance already holds a former independent child copy.','Include large 134-record checkpoint latency/native concurrency and review recovery/retirement when another instance already holds a former independent child copy. U29 must check shell notices do not obscure modal action rows; the Phase 11E transient QA notice overlapped its screenshot footer.')
 if 'Checklist' in name:
  start=s.index('- [ ] **MX09 —');end=s.index('### 11F',start);s=s[:start]+s[start:end].replace('- [ ]','- [x]').replace('— Sol / High.','— Sol / High. Complete October 21 in source/candidate; [report](Documentation/Project/MX09-Completion-Report.md).',1)+s[end:]
  s+='\n\n### Phase 11E completion — October 21, 2026\n\nMX08 → MX09 completed in order, including the owner-approved exact prose result. [Completion report](Documentation/Project/Phase-11E-Completion-Report.md). Source/candidate only; installed 0.5.26 unchanged. Stop before RI03C; it needs its own PASSKEY.\n'
 else:
  s=s.replace('Corrective phases 11A–11F are proposed for review, with **MX01 next** and all new tasks unstarted.','Corrective phases 11A–11E are complete in source/candidate; **RI03C / 11F is next and unstarted**.')
  s+='\n\n### Phase 11E completion — October 21, 2026\n\nMX08 → MX09 completed in order; [report](Documentation/Project/Phase-11E-Completion-Report.md). Typed automatic returns and owner-reviewed exact prose returns passed the isolated real-ROM/task-file proof. This does not replace RI03C feature acceptance, human in-game testing, U28/U29 review or U30 production packaging. Stop before RI03C.\n'
 p.write_text(s,encoding='utf-8');shutil.copy2(p,repo/'docs/project'/name)
for stem in ['MX09-Completion-Report.md','MX09-Verification.json','Phase-11E-Completion-Report.md','Phase-11E-Verification.json']:shutil.copy2(docs/stem,repo/'docs/project'/stem)
# Keep the small portable tool release and its current guide organized together.
toolDest=repo/'tools/phase11e';toolDest.mkdir(exist_ok=True);shutil.copy2(out/'RDX-Reference/Phase-11E-Agent-Tools.zip',toolDest/'Phase-11E-Agent-Tools.zip');shutil.copy2(out/'ROMDex/rdx/authoring/BOUND-RETURNS.md',toolDest/'README.md')
print('MX09 and Phase 11E marked complete; stop before RI03C. Reports and toolkit mirrored locally; no commit or push.')

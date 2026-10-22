from pathlib import Path
import json,shutil,hashlib
root=Path.cwd();out=root/'outputs';docs=out/'Documentation/Project';repo=root/'work/u13b/repository'
report='''# MX08 — Typed Plans and Reviewed Prose Results

Complete October 21, 2026 in source under the Phase 11E PASSKEY. Installed ROMDex 0.5.26, production Data, protected connections and paused NPCDex sync remain unchanged. MX09 is authorized next; no installer/release occurred.

Package previews now distinguish typed changes from written instructions and context. Existing CHANGE/REMOVE/FINAL and contextual planning remain; no Draft/Ready gate was added. Typed results retain exact patch validation. Prose results are discovered but remain held until the owner reviews and accepts the exact complete-group differences through the existing three-way review.

The new fail-closed RDXReviewedScope/1 decision pins the original return bytes, package/task, preview, current read revisions and exact differences. It is private metadata authority, not a portable approval flag. Typed fields cannot drift in a mixed group; prose cannot write other records or escape a selected point/passage. Wrong identity, shared/cross-map writes, corrupt assets, incomplete groups, invalid structure, superseded authorization and other hard failures remain blocked. Existing reviewed overwrites retain their previous field semantics. Accepted work remains Needs Human Testing and leaves its task open; newer unrelated content, drafts and history survive.

Testing exposed a queue deadlock introduced at the MX07 boundary: return processing held the local queue while cloud publication requested that queue. Network processing now runs outside that queue, reserves the cloud channel against competing remote review/cycles, and enters the local queue only for a pinned checkpoint. Slow authorization no longer prevents local saves.

Verification: 49 focused application/review/private-metadata cases passed, plus one targeted slow-network/local-checkpoint case (50 distinct cases). Five source UI checks passed in isolated Chromium with an in-memory task transport: held prose, three-way wording review, cancel, no footer overlap at 620px, and complete-group acceptance preserving Auto-Sync Off/open task/unreviewed testing. The screenshot was inspected. There were no live YouTrack writes in MX08; MX09 owns the real-ROM/task-file/native integration proof. Initial schema-keyword/native-schema-copy mismatches were corrected before these runs. Early test hangs exposed the queue defect above; the completed run passed without repetition of a broad suite.

Limits: bounded review is 20 records/40 visible changes per group/page; an oversized or hidden scope cannot be approved. Exact approval evidence is capped at 256 KiB. Old clients reject the new review format instead of accepting it without understanding it. Shared/cross-map identity changes and new native content identities still need supported separate workflows. This does not claim in-game verification or production deployment.

Next: MX09 — Deterministic Agent Return Tools and Real ROM Proof, already authorized by the same Phase 11E PASSKEY.
'''
(docs/'MX08-Completion-Report.md').write_text(report,encoding='utf-8')
evidence={'task':'MX08','status':'complete-source','date':'2026-10-21','focusedDistinctCasesPassed':50,'unresolvedFailures':0,'ui':json.loads((root/'work/mx08/ui-proof.json').read_text()),'productionChanged':False,'installedVersion':'0.5.26','installerRun':False,'liveProof':'MX09 next; no live writes in MX08','compatibility':'RDXReviewedScope/1 is explicit private exact-difference approval; old readers fail closed'}
(docs/'MX08-Verification.json').write_text(json.dumps(evidence,indent=2)+'\n',encoding='utf-8')
guide=out/'ROMDex/rdx/RETURN-REVIEW.md';s=guide.read_text(encoding='utf-8-sig');s=s.replace('and instructions-only requests remain blocked','remain blocked');s+='''

## MX08 — Exact review of written instructions

Written requests remain ordinary contextual plans. They require no Draft/Ready transition. Their valid returned RDX stays held until Review Returned File → Review This Group → Apply Reviewed Changes approves the exact displayed differences. Cancel, Defer and Reject preserve current content. A fresh current baseline is pinned at confirmation; later local changes hold application again.

Typed requested values remain exact. Prose is limited to its existing target record and selected point/passages; invalid identity, mapping, asset, dependency or structure cannot be overridden. Existing shared/cross-map writes stay blocked. The private RDXReviewedScope/1 history contains the exact differences (at most 40, 256 KiB), current read set and preview digest. The original returned bytes and private acceptance reference that exact decision. An uploaded file cannot grant this authority. Older readers reject the new format; upgrade all participating clients before using it. Current content remains Unreviewed for human testing and the task remains open after application.
''';guide.write_text(s,encoding='utf-8')
p=out/'ROMDex/rdx/RESULT-APPLICATION.md';s=p.read_text(encoding='utf-8-sig').replace('and instructions-only requests remain available for [U26 review](RETURN-REVIEW.md)','remain available for [review](RETURN-REVIEW.md)').replace('Every written current-content value must equal the concrete patches in the authorized JSON package.','Typed current-content values must equal the concrete patches in the authorized JSON package. A prose-only request instead requires a private MX08 exact-difference approval for the complete group, pinned to the actual return bytes and current read revisions.');p.write_text(s,encoding='utf-8')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=out/name;s=p.read_text(encoding='utf-8-sig')
 if 'Checklist' in name:
  start=s.index('- [ ] **MX08 —');end=s.index('- [ ] **MX09 —',start)
  block=s[start:end].replace('- [ ]','- [x]').replace('— Sol / High.','— Sol / High. Complete in source October 21; [report](Documentation/Project/MX08-Completion-Report.md).',1);s=s[:start]+block+s[end:]
  s=s.replace('Stop before MX08; it requires a new PASSKEY.','Phase 11E is now authorized through MX08 → MX09. MX08 is source-complete; MX09 is active. Stop before RI03C.',1)
  s=s.replace('Stop before MX08; a new PASSKEY is required.','Phase 11E is authorized in order; MX08 is source-complete and MX09 is active. Stop before RI03C.',1)
 else:
  s=s.replace('Stop before MX08; a new PASSKEY is required.','The owner authorized Phase 11E through MX08 → MX09; MX08 is source-complete and MX09 is active. Stop before RI03C.',1)
  anchor='### 11E — Complete planning and coding-agent return compatibility\n';s=s.replace(anchor,anchor+'\n**Authorized October 21 through MX08 → MX09. MX08 is complete in source; MX09 is active.** [MX08 report](Documentation/Project/MX08-Completion-Report.md). Stop before RI03C.\n')
 p.write_text(s,encoding='utf-8');shutil.copy2(p,repo/'docs/project'/name)
for p in docs.glob('MX08-*'):shutil.copy2(p,repo/'docs/project'/p.name)
files=['rdx/result-scope.mjs','rdx/result-validation.mjs','content/rdx-implementation.mjs','content/contracts.schema.json','rdx/contracts.schema.json','rdx/return-review-contract.mjs','rdx/return-review.mjs','rdx/map-package.mjs','content/map-packages.js','rdx/result-application.mjs','tests/result-application-fixture.mjs','tests/prose-return.test.mjs','rdx/RETURN-REVIEW.md','rdx/RESULT-APPLICATION.md']
manifest=[]
for rel in files:
 p=out/'ROMDex'/rel;target=repo/'apps/romdex'/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);manifest.append({'path':rel,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(root/'work/mx08/source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('MX08 marked complete; MX09 active. Source and documentation mirrored locally.')

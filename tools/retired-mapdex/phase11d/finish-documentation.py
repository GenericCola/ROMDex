from pathlib import Path
import json, shutil

root=Path.cwd()
project=root/'outputs/Documentation/Project'
def read(p): return json.loads((root/p).read_text(encoding='utf-8-sig'))
def write(p,text): p.write_text(text,encoding='utf-8',newline='\n')
def save(p,value): write(p,json.dumps(value,indent=2,ensure_ascii=False)+'\n')

audit=read('work/phase11d/final-audit.json')
assert audit['status']=='passed'
outcomes=read('work/mx07/case-outcomes.json')
assert outcomes['passed']==131 and not outcomes['failed']
native=read('work/mx07/native-proof.json')
live=read('work/mx07/live-proof.json')
query=read('work/mx07/query-proof.json')
comparison=read('work/mx07/unchanged-comparison.json')
large=read('work/mx07/large-map-save.json')
warm=read('work/mx07/warm-save.json')
mx07={
 'task':'MX07','status':'complete-source-and-isolated-candidate','date':'2026-10-21',
 'candidateVersion':'0.5.26-11d.1','productionChanged':False,'installerRun':False,
 'focusedCasesAcrossPhase11D':{'distinctPassed':131,'unresolvedFailures':0,'fullSuiteRun':False},
 'native':native,'liveSmallMap':live,'finalQueryOptimization':query,
 'sameInputAdapterComparison':comparison,'largeLegacyMapPreservation':large,'warmLargeMapCheckpoints':warm,
 'finalAudit':audit,
 'knownLimitations':[
  'Full 134-record legacy-map first upgrade/checkpoint measured 25132 ms; later complete local checkpoints measured 10037 and 10694 ms. This remains a performance acceptance item for U28/U29.',
  'The final capability fast path was not rebenchmarked. Small-map WAN metrics and same-input in-memory adapter metrics are different workloads and must not be presented as one full-map WAN speed comparison.',
  'Older adopted catalogs retain their existing publication owner. Automatic retirement of pre-existing independent child copies in other profiles is not claimed.',
  'Actual two-ROM-build acceptance remains deferred because only one supported real ROM was supplied.'
 ]
}
save(project/'MX07-Verification.json',mx07)
write(project/'MX07-Completion-Report.md','''# MX07 — Routine Sync, Local Responsiveness and Storage

Completed October 21, 2026 in source and isolated candidate **0.5.26-11d.1**, under the Phase 11D PASSKEY. Installed ROMDex **0.5.26**, production saves, queues, protected connections and the NPCDex cloud-sync pause are unchanged. No installer or release was produced.

## Changes

Cloud reads and delivery no longer occupy the local editor/checkpoint queue. Publication keeps its frozen revision while newer local edits remain pending. Review cancellation aborts its network work; Quit stops that work before closing local storage. Progress separates checking from durable advancement and identifies the recorded verified revision, rather than presenting a pending check as an up-to-date save.

Routine checks reuse verified local publication data instead of reconstructing unchanged binary content. Native metadata is freshly batched before shared-record inventories. Supported correction files are discovered through a paginated filename-filtered YouTrack query and still require exact ownership, marker, baseline and content verification. Complete inventories, conflict checks and final readback remain mandatory.

Large legacy documents preserve their original bytes and revisions while factoring sealed record bodies through the existing history-artifact mechanism. Bounded, hash-verified validation/compression/container caches avoid repeated work; untrusted or changed bytes still take the complete validation route. Parser limits were not raised. Proposal baselines, current heads, assets and historical records remain reachable.

Content Tools → Storage Usage inspects managed files, pending work, retained versions and the default 2 GiB budget. Disposable decoder/renderer caches use a separate 512 MiB budget and 384 MiB target. Idle workers clean only complete verified cache products. Working files, unsent edits, package baselines, backups, credentials and history are protected. Production folders were inspected read-only; no production cleanup occurred.

## Measured results

The same original 1,001,582-byte, 134-record Violet City RDX used for RI03P was replayed against the in-memory adapter. Unchanged checks fell from **396 to 187 adapter calls**, and binary reads from **2,926,272 to zero bytes**; observed replay time fell from 7.296 to 1.260 seconds. These are adapter measurements, not HTTP or WAN measurements. RI03P's recorded full-map WAN results remain valid historical evidence: 9.3 seconds/109 requests unchanged, 34.8 seconds/209 requests outgoing and 58.4 seconds/276 requests incoming. They were not redundantly rerun.

The live proof used a separate **nine-record synthetic map**. Counts include each listed cycle, excluding deliberate setup/cleanup. These rows were measured before the final query/cache-order optimization; they are not a same-size comparison with RI03P.

| Operation | Time | HTTP requests | Writes | Upload bytes | Download bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Initial publication | 37.101 s | 103 | 34 | 76,225 | 208,154 |
| Unchanged | 2.631 s | 16 | 0 | 0 | 27,110 |
| One-field outgoing | 8.044 s | 30 | 3 | 17,991 | 93,821 |
| Incoming second profile | 10.051 s | 41 | 0 | 0 | 102,508 |

A final one-record live query check reduced the same metadata/inventory boundary from three requests to two while retaining fresh metadata and the full attachment inventory. It found the exact owner correction file. All 11 exact issues used by MX07's two proofs were confirmed absent afterward.

The native candidate saved a synthetic note in **517 ms**, quit normally in **499 ms**, and a fresh file read retained the exact note. Its Storage Usage view and mapping inspector worked at 620px height. Slow/offline queue and review-cancellation cases passed.

**Large-map limitation:** the full legacy map's first supported upgrade/checkpoint took **25.132 seconds**. Subsequent complete local checkpoints improved from about 17.4 seconds to **10.037 and 10.694 seconds**, but remain slow. The final capability fast path was not rebenchmarked. U28/U29 must evaluate this latency and native concurrency; this task does not claim instant large-map saves or a full-map WAN SLA.

## Verification and limits

Across Phase 11D, **131 distinct targeted cases passed**, with no unresolved case failures. An additional final four-case character-organization recheck passed; those cases are already included in the distinct count. Resource-heavy attempts were rerun sequentially after memory exhaustion. Two preservation assertions were corrected to allow the newly retained original-document history asset; two proposal-baseline failures were fixed by retaining the original before current-head compaction. A native harness assertion was corrected to inspect native review records rather than the empty legacy annotation projection. Relevant focused cases then passed. No full regression suite was repeated.

The final audit compared **1,214 application source files**, **146 mirrored test files** and **1,286 candidate files**: source/mirror/candidate match, candidate package metadata excepted; **38 changed JavaScript syntax checks** passed. Runtime binaries matched Phase 11C, and the candidate contained no forbidden ROM, protected-credential, database or key files. Git whitespace validation passed with established CRLF endings preserved. See [verification](MX07-Verification.json).

Older adopted catalogs retain their original sync owner. Automatic cleanup/retirement of pre-existing child copies on another instance remains an integrated review case. Actual two-build acceptance still awaits another supported ROM. No source commit or GitHub publication is claimed.

Phase 11D is complete in source and the isolated candidate. Stop before MX08; production packaging remains U30.
''')

phase={
 'phase':'11D','tasks':['MX05','MX06','MX07'],'status':'complete-source-and-isolated-candidate',
 'date':'2026-10-21','candidateVersion':'0.5.26-11d.1','installedVersion':'0.5.26',
 'productionChanged':False,'installerRun':False,'gitCommitted':False,'gitPushed':False,
 'distinctTargetedCasesPassed':131,'unresolvedCaseFailures':0,'fullRegressionSuiteRun':False,
 'nativeChecksPassed':12,'browserChecksPassed':6,'exactTemporaryIssuesConfirmedAbsent':38,
 'tasksEvidence':{k:read(f'outputs/Documentation/Project/{k}-Verification.json') for k in ['MX05','MX06','MX07']},
 'audit':audit,'nextTask':'MX08','nextTaskRequiresNewPasskey':True,
 'acceptanceFollowups':['Large-map local checkpoint latency and full native concurrency','Review recovery/retirement when another instance already has the former independent child copy','Actual two-build acceptance when another ROM build becomes available']
}
save(project/'Phase-11D-Verification.json',phase)
write(project/'Phase-11D-Completion-Report.md','''# Phase 11D — Completion Report

**MX05 → MX06 → MX07 are complete in source and isolated candidate 0.5.26-11d.1.** Installed ROMDex remains 0.5.26. Production saves, queues, remembered connections and the NPCDex cloud-sync pause were preserved. No installer, release, production migration, ROM change or agent dispatch occurred.

- **MX05:** reviewed placement reassignment/detachment, shared-character scope and independently prepared/published map grouping. Original identities, nested descendants, dialogue, mappings, images, notes, proposals and history remain intact. MAPDex/NPCDex changes coordinate through durable checkpoints.
- **MX06:** an inspectable native content tree, exact record/issue links and revisions, safe automatic native name updates, and reviewed supported text/parent corrections. Accepted corrections update NPCDex and its RDX. Comments remain discussion; unsupported structural/script changes are held.
- **MX07:** local checkpoints separated from WAN work, cheaper unchanged checks, cancellable review, accurate progress, inspected storage and bounded disposable-cache cleanup. Protected data/history is not pruned.

Verification passed: **131 distinct targeted cases, six browser checks, 12 packaged native checks**, and isolated live grouping/native-edit/sync/recovery proofs. All **38 exact temporary YouTrack issues** were confirmed absent afterward. Final source/mirror/candidate audit and 38 changed-file syntax checks passed. No full regression suite or repeated full-map upload was required.

The main remaining limitation is large-map save latency: the full 134-record legacy fixture took 25.1 seconds for its first upgrade/checkpoint and about **10–11 seconds** for subsequent complete saves. Small-fixture native save/quit measured 517/499 ms; these are different workloads. U28/U29 retain large-map latency/native concurrency and pre-existing child-copy recovery/retirement review. Actual two-ROM-build acceptance remains deferred until another supported build exists.

These are source/candidate results, not owner acceptance of an installed upgrade. Final production packaging is U30. **Stop before MX08 / Phase 11E; it needs a new PASSKEY.**

Details: [MX05](MX05-Completion-Report.md), [MX06](MX06-Completion-Report.md), [MX07 and performance](MX07-Completion-Report.md), [combined evidence](Phase-11D-Verification.json).
''')

check=root/'outputs/NPCDex-ROMDex-Action-Checklist.md'
text=check.read_text(encoding='utf-8-sig')
text=text.replace('MX05 is complete; MX06 is complete; MX07 is active; stop before MX08.','**Phase 11D is complete in source and isolated candidate 0.5.26-11d.1**; [report](Documentation/Project/Phase-11D-Completion-Report.md). Stop before MX08; it requires a new PASSKEY.')
text=text.replace('The current PASSKEY authorizes all of Phase 11C, one task at a time; stop before MX08 after MX05 → MX06 → MX07 under the latest PASSKEY.','The latest PASSKEY authorized all of Phase 11D; MX05 → MX06 → MX07 are now complete in source/candidate. Stop before MX08; a new PASSKEY is required.')
start=text.index('- [ ] **MX07 —')
end=text.index('### 11E',start)
block=text[start:end].replace('- [ ]','- [x]')
block=block.replace('— Sol / High.','— Sol / High. Complete October 21 in source/candidate; [report](Documentation/Project/MX07-Completion-Report.md).',1)
block+='**11D verification:** 131 distinct targeted cases, 12 native checks and six browser checks passed; all 38 exact temporary issues were confirmed absent. Large-map local saves still measured 10–11 seconds after a 25.1-second first upgrade; retain this limitation for U28/U29. No production installation or history deletion occurred.\n\n'
text=text[:start]+block+text[end:]
text=text.replace('MX05 is complete; MX06 is complete; MX07 is active and the next stop is before MX08.','all three tasks are complete in source and the isolated candidate. The next stop is before MX08, which requires a new PASSKEY.')
text=text.replace('Reuse valid targeted evidence; no redundant full-suite/full-map reruns.','Include large 134-record checkpoint latency/native concurrency and review recovery/retirement when another instance already holds a former independent child copy. Reuse valid targeted evidence; no redundant full-suite/full-map reruns.',1)
text=text.replace('No repeat migration or stale restoration.','Include practical large-map save latency and preserved recovery copies. No repeat migration or stale restoration.',1)
text=text.replace('- [ ] Complete MX01’s concrete condition/UI contract review before implementing the scoped overhaul. Retain the installed spacing corrections and all existing data.','- [x] Complete MX01’s concrete condition/UI contract review before implementing the scoped overhaul. Owner approval recorded October 21; retain installed spacing corrections and all existing data.')
text+='\n\n## Phase 11D — Completed October 21, 2026 in Source/Candidate\n\nMX05, MX06 and MX07 completed in order under the Phase 11D PASSKEY. [Completion report](Documentation/Project/Phase-11D-Completion-Report.md). Installed 0.5.26 and production data/connections remain unchanged. Large-map latency remains an explicit U28/U29 acceptance item. **Next: MX08, requiring a new PASSKEY.**\n'
write(check,text)

plan=root/'outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md'
text=plan.read_text(encoding='utf-8-sig')
text=text.replace('Saves, preparations and remembered connections remain preserved.','**Phase 11D (MX05–MX07) is complete in source and isolated candidate 0.5.26-11d.1**; [report](Documentation/Project/Phase-11D-Completion-Report.md). Saves, preparations and remembered connections remain preserved.',1)
text=text.replace('**Active: MX05 — Character and Published Map Organization**, followed by MX06 and MX07 under the owner’s Phase 11D PASSKEY. Stop before MX08.','**Phase 11D complete: MX05 → MX06 → MX07**, under the owner’s Phase 11D PASSKEY. Stop before MX08; a new PASSKEY is required.')
text=text.replace('The current PASSKEY authorizes Phase 11C in order: LP01 → MX04 → LP02 → LP03. Phase 11D is now authorized in order; stop before MX08.','The latest PASSKEY authorized Phase 11D in order. That source/candidate work is complete; stop before MX08.')
anchor='### 11D — Identity, backend mapping and responsive synchronization\n'
text=text.replace(anchor,anchor+'\n**Complete October 21 in source and isolated candidate 0.5.26-11d.1.** [Combined report](Documentation/Project/Phase-11D-Completion-Report.md). 131 distinct targeted cases, 12 native checks and six browser checks passed; 38 exact temporary issues were confirmed absent. Installed 0.5.26 is unchanged. Large-map saves remain about 10–11 seconds after the first upgrade; this is an explicit U28/U29 limitation, not a solved latency guarantee.\n')
text=text.replace('One task at a time; each requires its own PASSKEY under the working agreement.','One task at a time; an explicit phase-wide PASSKEY may cover its ordered tasks. The authorized 11D work is complete; MX08 needs a new PASSKEY.')
text=text.replace('Useful content semantics are checked separately from transport.','Useful content semantics are checked separately from transport. Include full 134-record checkpoint latency/native concurrency and recovery/retirement review when another instance already holds the former independent child copy.',1)
text=text.replace('No repeated migration, hidden warning-only acceptance or stale restoration.','Include practical large-map checkpoint latency and preserved recovery copies. No repeated migration, hidden warning-only acceptance or stale restoration.',1)
write(plan,text)

repo=root/'work/u13b/repository/docs/project'
for file in project.glob('MX0[567]-*'):
 if file.is_file(): shutil.copy2(file,repo/file.name)
for file in project.glob('Phase-11D-*'):
 if file.is_file(): shutil.copy2(file,repo/file.name)
for file in [check,plan]: shutil.copy2(file,repo/file.name)
print(json.dumps({'reportsWritten':4,'overallDocumentsUpdated':2,'documentationMirrored':True,'productionChanged':False}))

from pathlib import Path
import json
root=Path.cwd();work=root/'work/ri03p';out=root/'outputs';app=out/'ROMDex';history=out/'Documentation/History/RI03P';evidence=history/'RI03P-Evidence';evidence.mkdir(parents=True,exist_ok=True)
live=json.loads((work/'live-proof.json').read_text());assert live['status']=='passed' and live['cleanup']['status']=='passed'
ui=json.loads((work/'progress-ui.json').read_text());assert ui['passed']
layout=json.loads((work/'layout.json').read_text());model=json.loads((work/'real-model-proof.json').read_text());runtime=json.loads((work/'package-check.json').read_text());assert model['passed'] and runtime['passed']
def write(p,s):p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(s.encode('utf-8'))
def js(p,v):write(p,json.dumps(v,indent=2)+'\n')
js(evidence/'delivery-layout.json',layout);js(evidence/'real-model-proof.json',model);js(evidence/'runtime.json',runtime)
js(evidence/'publication-ui.json',ui)

js(evidence/'live-performance.json',{'task':'RI03P','status':live['status'],'startedAt':live['startedAt'],'finishedAt':live['finishedAt'],'measurements':live['measurements'],'records':len(live['records']),'checks':live['checks'],'cleanup':live['cleanup'],'initialAttempt':live.get('initialAttempt'),'productionChanged':False})
js(evidence/'targeted-checks.json',{'distinctPassed':60,'baseline':{'tests':42,'failed':0,'files':['rdx-cloud.test.mjs','rom-workspace.test.mjs']},'final':{'tests':37,'initialPassed':36,'incorrectTestExpectationCorrected':True,'correctedTargetedRecheckPassed':1,'files':['cloud-delivery.test.mjs','rdx-cloud.test.mjs']},'explanation':'The 25 existing cloud tests overlap. 18 MAPDex checks plus 30 cloud checks plus 8 pack/transport checks plus 4 progress checks = 60 distinct checks. A final bounded prefetch/reference-cache guard and loading bar were added after the full-map helper started, then targeted checks, five UI behaviors and the bundled runtime were rechecked. The initially running full-map reader hit its serial metadata time limit after every object was uploaded. A controlled isolated-reader restart resumed those verified uploads with bounded parallel prefetch; the same full map then supplied final-code warm-save measurements. No repeated full-map upload or second dataset was needed. A checkpoint correctly had no successful remote-check time; only that expectation was corrected and rechecked. No broad regression rerun.','syntaxChecks':10})
names={'verifiedUploadResume':'Resume verified initial upload','localNoteDelta':'One local note/flag update','unchangedSync':'Unchanged synchronization','reviewedNativeDelta':'Reviewed native title update','secondProfileRecovery':'Second-profile recovery'}
table='| Operation | Wall time | HTTP requests | Writes | Uploaded bytes | Downloaded bytes |\n| --- | ---: | ---: | ---: | ---: | ---: |\n'
for k,label in names.items():
 m=live['measurements'][k];table+=f"| {label} | {m['milliseconds']/1000:.1f} s | {m['requests']} | {m['writes']} | {m['uploadedBytes']:,} | {m['downloadedBytes']:,} |\n"
report=f'''# RI03P — Map Cloud-Delivery Performance

Completed in source on October 20, 2026, under the user's PASSKEY. MAPDex retains its approved name. No installer was built or installed; the installed application, production Data/queue, saved connections and explicit NPCDex cloud pause are unchanged.

## Result

The already verified ROM-only Violet City RDX is 1,001,582 bytes and contains 134 native content records. The old layout requires 600 object attachments and 8,347,287 payload bytes before its commit. The new layout requires 209 object attachments and 2,926,272 payload bytes: about 65% fewer files and bytes. This is a deterministic same-input layout comparison, not a repeated legacy live upload or a claimed wall-time speedup against an unmeasured old run. The earlier RI02C figure of 604 chunks included additional local editing/history; this comparison uses the unedited compiled map consistently.

Two compressed immutable registry packs replace hundreds of small deliveries. Native record/mapping artifacts retain their ticket attachments, identities and hierarchy. Prior immutable objects are reused, not repacked; no maps are combined. The complete new commit remains within its 512 KiB bound (305,820 bytes in the local full-map model proof).

Record discovery reuses a dataset search within each cycle. Fresh batched native metadata snapshots replace per-ticket reads where possible, with validated ownership, shared-record fallback, full comment evidence and a fresh final comparison. No write/read/decode/cycle bound is raised.

## Measured full-map proof

The initially running reader hit the cycle time limit during serial metadata verification, after all 595 objects were delivered. Its frozen intent/files were retained; only that identified isolated process was stopped, and the existing host resumed with the final bounded parallel implementation. No object reupload was needed. The Windows-launched helper used the saved protected credential and an isolated profile. It created uniquely marked private records, exercised the actual YouTrack adapter, then verified all {live['cleanup']['verifiedAbsent']} exact test IDs absent. Production maps, tasks and queue were not used as test targets.

{table}
Times include local validation/checkpointing and backend latency for this run; they are not service guarantees. Metrics exclude initial preview/authorization requests, the helper's single intentional native title write, and ownership-verified cleanup. Each listed delivery measurement includes all of its bounded cycles. The unchanged check uploads nothing. Live request counts and byte totals are in the evidence alongside model/layout checks.

## Routine synchronization and visible progress

The table measures the final parallel implementation on the complete 134-record map. The first row is recovery from an already verified upload, not a clean cold-publication benchmark. The initial attempt plus diagnosis/restart reached its verified checkpoint after {live['initialAttempt']['observedTotalMilliseconds']/1000:.1f} seconds measured from the original helper launch; this includes the interrupted serial verification and manual restart wait. Initial-run HTTP totals were not persisted before that restart and are not invented. Layout/file/byte comparisons remain deterministic on the exact same input. Warm local/native/unchanged and second-instance measurements are uninterrupted final-code measurements.

Attachment metadata prefetch uses at most eight requests concurrently and prefetches at most 256 inventories; further required inventories retain the original lazy route. Fresh validated native snapshots supply the same-cycle issue metadata cache. Each referenced attachment still requires current identity/ownership/size/update checks. No request/read bound is increased.

The user clarified that initial publication may take longer if it has a loading bar, while routine synchronization should be agile. MAPDex now displays a counted publication bar, explicit queued/manual/paused/review states and a separate final verified-commit step. Polling updates only publication status instead of rebuilding fields or stealing focus. Five source-UI checks passed at normal and short window sizes; screenshots were inspected locally and excluded from Git. Native installed-window acceptance remains U28–U30.

## Preservation and recovery

- Exact source sections, original image bytes, stable identities, parent links and immutable history reconstruct after publication and in an independent profile. A local note/critical flag and a reviewed YouTrack title update survive; human testing remains required.
- New intents use cloud commit version 2; existing version-1 commits remain readable and frozen version-1 intents finish unchanged. Old clients must be upgraded before using a version-2 cloud head. Portable RDX formats remain unchanged.
- Packs are bounded to 512 KiB encoded and 4 MiB decoded. Encoded/decoded/object hashes, lengths, offsets, attachment author/identity/update metadata and trailing-byte checks remain mandatory. Missing/changed files block acceptance even after the cache is warm.
- Lost commit responses, legacy intent upgrade, concurrent branches, stale reviews, cancellation, no-progress holds and local-only staging remain covered. Durably verified slots resume; uncertainty is not blindly resent.
- Shared status shows record/object delivery progress. Pending work stays queued until the commit's final readback/reconstruction passes. Last successful sync is separate from a completed remote check; an interrupted checkpoint does not claim success.

## Verification and limits

60 distinct focused checks passed: 18 MAPDex, 30 cloud, 8 delivery/transport and 4 progress checks. An initial status test incorrectly expected a successful remote-check timestamp after an interrupted checkpoint; its expectation was corrected and that check alone rerun successfully. Ten changed source/test modules passed syntax checks. A final reference-consistency guard passed two focused cache checks and the bundled-runtime recheck. The full real-map model reconstructed every original byte; the curated source payload's cloud modules and pack decoder passed with bundled Electron 44.7.2 / Node 24.21.0. No broad suite, repeated ROM decoding, old-layout live upload, installer or native-window visual review was repeated.

The current extractor remains the supplied build/Violet City proof. RI03C owns contrasting-area/build/identity acceptance. U28–U30 retain integrated/native installed acceptance and release. NPCDex's production sync pause remains in force.

Next: **RI03C — Coverage and Integrated Feature Acceptance, Sol / High**, requiring a separate PASSKEY.
'''
write(history/'RI03P-Completion-Report.md',report)
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=out/name;s=p.read_text(encoding='utf-8')
 s=s.replace('RI03A design is user-approved and RI03B/MAPDex is complete in source. Remaining: RI03P → RI03C → U28 → U29 → U30.','RI03A design is user-approved and RI03B/MAPDex plus RI03P are complete in source. Remaining: RI03C → U28 → U29 → U30.')
 s=s.replace('**Added by user decision October 20; after RI03B and before RI03C.** Reduce cold-publication','**Complete in source October 20; [report](Documentation/History/RI03P/RI03P-Completion-Report.md).** Compressed immutable delivery and fresh batched metadata reduce the real map\'s object attachments/payload by about 65%; cold/delta/unchanged/recovery timings are measured. Production stays paused. Reduce cold-publication')
 s=s.replace('- [ ] **RI03P —','- [x] **RI03P —')
 if name.endswith('Checklist.md'):
  a=s.index('**Current:**');b=s.index('\n',a);s=s[:a]+'**Current:** **RI03P — Map Cloud-Delivery Performance is complete in source, October 20, 2026.** [Completion report](Documentation/History/RI03P/RI03P-Completion-Report.md). Real Violet City publication, local/native updates, unchanged sync and separate-profile recovery passed; owned QA records are removed. Installed production and its NPCDex pause/queue are unchanged. **Next: RI03C — Coverage and Integrated Feature Acceptance, Sol / High, awaiting a separate PASSKEY**, then U28–U30.'+s[b:]
 else:
  s=s.replace('**next: RI03P — Sol / High, awaiting a new PASSKEY**, then RI03C;', '**RI03P is complete in source** ([report](Documentation/History/RI03P/RI03P-Completion-Report.md)); **next: RI03C — Sol / High, awaiting a new PASSKEY**;')
 write(p,s)
p=app/'README.md';s=p.read_text(encoding='utf-8').replace('Next: RI03P cloud-delivery performance, then RI03C and U28–U30 acceptance/release.','[RI03P cloud delivery](rdx/CLOUD-DELIVERY.md) is source-complete with measured real-map publication/update/recovery and fewer requests/files. Next: RI03C and U28–U30 acceptance/release.');write(p,s)
p=app/'CHANGELOG.md';s=p.read_text(encoding='utf-8');write(p,'## Unreleased — RI03P Map Cloud Delivery\n\n- Pack new immutable registry objects with bounded lossless compression; preserve record tickets, prior files, exact source/assets/history and one logical map per RDX.\n- Reuse per-cycle dataset discovery, freshly batch native metadata checks and retain shared-record/comment fallbacks.\n- Report verified delivery progress and separate successful synchronization from attempted checks.\n- Preserve legacy frozen intents, commit-last recovery, cancellation/conflict review and the production sync pause. Source-only; live isolated performance proof completed.\n\n'+s)
p=app/'rdx/CLOUD-SYNC.md';s=p.read_text(encoding='utf-8');s=s.replace('RD07 is implemented in source and has passed the real, isolated YouTrack proof. It is not installed in ROMDex 0.5.14. Existing production maps remain in their accepted native provider. RD08 handles Windows integration; RD10 separately adopts current maps after a fresh backup and accepted preview.','RD07 introduced this binding adapter; RD10 subsequently adopted the existing maps. [RI03P delivery performance](CLOUD-DELIVERY.md) is now complete in source, with real Violet City publication/update/recovery measurements. Installed production remains 0.5.15 plus its existing repairs, with NPCDex cloud sync explicitly paused; this source task does not change that pause or install an update. Historical RD07-specific limits below describe its original acceptance, not a fresh migration requirement.');s=s.replace('RDX binding of current production maps is still RD10. That task must preserve their existing NPCD issue identities through an explicitly reviewed adoption adapter; the new-map creation route is not a migration shortcut.','Existing production maps were adopted through RD10 with their NPCD identities preserved. The new-map creation route remains unsuitable as a migration shortcut.');write(p,s)
p=out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md';s=p.read_text(encoding='utf-8');write(p,s+'\n\n## October 20 — RI03P Cloud Delivery Complete in Source\n\nUnder the next PASSKEY, reduce immutable registry delivery files with bounded lossless packs and fresh batched native metadata checks. Preserve native record artifacts/parents, exact source/assets/history, legacy frozen intents and all conflict/recovery checks. The same unedited real Violet City input requires 600 old-layout object files versus 209 new-layout files, about 65% fewer payload bytes. Live cold/delta/unchanged/native/recovery measurements and ownership-verified QA cleanup passed; no old-layout reupload or ROM extraction rerun. Source-only: installed production, credentials, queue and explicit NPCDex pause unchanged. Next RI03C — Sol / High, separate PASSKEY. [Report](../History/RI03P/RI03P-Completion-Report.md).\n')
js(work/'checkpoint.json',{'task':'RI03P','status':'complete_in_source_pending_private_backup','authorized':'PASSKEY','workspaceName':'MAPDex','productionChanged':False,'npcdexSyncPauseChanged':False,'distinctFocusedTests':60,'syntaxChecks':10,'runtime':runtime,'cleanup':live['cleanup'],'sourceUIBehaviors':5,'nextTask':'RI03C','nextModelEffort':'Sol / High','nextRequiresPASSKEY':True})
print('Completion report, evidence and overall roadmap/checklist updated')

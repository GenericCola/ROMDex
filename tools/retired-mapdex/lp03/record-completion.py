from pathlib import Path
import json, shutil, re

root=Path(__file__).resolve().parents[2]
work=root/'work/lp03'
proof=json.loads((work/'native-proof.json').read_text())
audit=json.loads((work/'source-audit.json').read_text())
export=json.loads((work/'export-proof.json').read_text())
assert all(v['status']=='passed' for v in [proof,audit,export])
assert len(proof['checks'])==12
assert json.loads((work/'host-state.json').read_text())['phase']=='Stopped normally'
project=root/'outputs/Documentation/Project'
verification={'status':'complete-in-source-and-packaged-candidate','date':'2026-10-21','native':proof,'sourceAudit':audit,'portableExportAndBackendArtifacts':export,'visualReview':{'mapdexMart':'passed; 620px window with expanded detail tray','npcdexNestedFloor':'passed; exact floor, source markers and independent scrolling','defaultMapdex':'scrolling retained; Tab expands the detail tray'},'proofBoundaries':{'freshLiveYouTrackWrite':False,'backendRecovery':'isolated object store; exact packaged modules; all document/blob bytes retained','unsupportedUI':'synthetic missing-resource display; renderer hard-failure cases covered by LP01 focused tests','productionInstaller':'U30','actualSecondROMBuild':'pending a second supplied supported build'},'nextTask':'MX05; separate PASSKEY required'}
(project/'LP03-Verification.json').write_bytes((json.dumps(verification,indent=2)+'\n').encode())
verification['postNativeFormatting']={'whitespaceOnly':True,'documentationBlankLineRemoved':True,'files':len(json.loads((work/'post-native-text-normalization.json').read_text())['files']),'finalSourceAudit':'passed; no behavioral code changes or repeated native tests'}
(project/'LP03-Verification.json').write_bytes((json.dumps(verification,indent=2)+'\n').encode())
report='''# Phase 11C — Suite Layout and Automatic Location Images

**Complete in source and an isolated packaged desktop candidate, October 21, 2026.** LP01 → MX04 → LP02 → LP03 are checked off. Installed ROMDex **0.5.26 remains unchanged**. The final production installer and upgrade belong to U30. Stop before MX05 until separately authorized.

## Delivered behavior

MAPDex has a map selector, an entity browser, contextual dialogue/location details and a map-specific Condition Inspector. Map setup stays in the map cog; Prepare, Assign and Update remain contextual. Export RDX and Send to NPCDex have equal placement. Identity/image tools stay beside the selected source text. Existing NPCDex status controls, notes/flags, Add Character placement and shared header geometry are preserved.

Preparing a supported map now generates recognizable location images from the ROM's own terrain, building and texture resources. Violet City outdoors, the mart and three distinct Sprout Tower floors were exercised. Parent/group tiles and exact-floor views carry their own images. Verified source markers open the associated entity/dialogue; ambiguous coordinates remain warnings. Camera/crop choices and owner PNG overrides are portable and survive re-preparation/source-update checks.

Image bytes, source hashes, dependencies, renderer settings and record associations travel in the one-map RDX and its backend artifacts. Another profile can display them without the source ROM. Verified caches avoid rebuilding unchanged images.

## LP03 evidence

- **12 native candidate checks passed**, including portable floor images without a ROM, hover cogs inside tiles, inline tools, form Tab, one Escape, short windows, explicit NPCDex handoff with sync paused, nested-floor navigation, marker-to-dialogue links, RDX export and normal quit.
- The packaged reader and bundled pinned decoder prepared a fresh mart directly from the supplied ROM, with a visible progress bar and verified render dependencies.
- A warm prepared-map status request took **114 ms**. This is a local status measurement, not a WAN-sync or universal startup benchmark.
- A fresh process using the exact packaged modules opened the native export without a ROM: **seven location targets**, including the nested group, retained their images. Splitting and reconstructing its **533 backend objects** preserved the exact document and every blob. This used an isolated in-memory object store; it is not a new live YouTrack proof.
- **1,274 packaged files** passed the manifest audit; **1,202 application files** match the source and repository mirror. Only candidate version/description metadata differs. The candidate is `0.5.26-11c.1` and contains no ROM, live Data or credentials.

Two harness corrections were necessary: removing an unsupported Playwright frame API and hovering before clicking a hover-only cog. Completed native handoff/export/quit checks were retained when resuming the remaining renderer check. LP03 changed no behavioral product code. Final line-ending and documentation whitespace normalization aligned source, candidate and repository text; the complete file audit passed afterward. The helper and both isolated candidate profiles exited normally.

Machine-readable evidence: [LP03 verification](LP03-Verification.json). Earlier focused/data proofs remain in [LP01](LP01-Completion-Report.md), [MX04](MX04-Completion-Report.md) and [LP02](LP02-Completion-Report.md). Private native screenshots, test RDX and render intermediates remain in local `work/lp03`; ROM-derived assets are excluded from the development repository and releases.

## Limits and next boundary

This is a static preview, not game emulation: actors, animation, time of day and live game flags are not simulated. Unsupported geometry/resource bindings and uncertain heights are reported rather than guessed. Current proof covers the supplied supported HGSS layout; arbitrary Pokémon ROM compatibility is not claimed. Fixed cameras and saved crops are delivered; interactive 3D/pan/zoom is not part of the approved 11C acceptance checklist.

Production saves, remembered connections, queues, NPCDex cloud pause and YouTrack records were not modified. No production installer was run. Actual two-build acceptance remains pending another supported ROM build. Broader backend editing/identity organization, sync performance and the real coding-agent return loop remain MX05–MX09 and RI03C.

**Next: MX05 — Character and Published Map Organization**, requiring a separate PASSKEY.
'''
(project/'LP03-Completion-Report.md').write_bytes(report.encode())

p=root/'outputs/NPCDex-ROMDex-Action-Checklist.md';s=p.read_text(encoding='utf-8')
s=s.replace('LP01, MX04 and LP02 are complete in source. LP03 native acceptance is active in an isolated packaged candidate.','**Phase 11C is complete in source and an isolated packaged candidate**: LP01, MX04, LP02 and LP03; [report](Documentation/Project/LP03-Completion-Report.md). Stop before MX05; its separate PASSKEY is next.')
s=s.replace('- [ ] **LP03 — Location and UI Native Acceptance** — Sol / High.','- [x] **LP03 — Location and UI Native Acceptance** — Sol / High. Complete October 21 in isolated candidate 0.5.26-11c.1; 12 native checks, exact source/mirror audit and native-export/backend-artifact reconstruction passed. [Report](Documentation/Project/LP03-Completion-Report.md), [evidence](Documentation/Project/LP03-Verification.json).')
s=s.replace('LP01, MX04 and LP02 are complete in source; LP03 native acceptance is active under the same authorization.','All four tasks are complete in source and an isolated packaged candidate. MX05 is next and requires its own PASSKEY.')
p.write_bytes(s.encode())

p=root/'outputs/NPCDex-ROMDex-Unified-App-Action-Plan.md';s=p.read_text(encoding='utf-8')
s=s.replace('LP01, MX04 and LP02 are complete in source; LP03 native acceptance is active in an isolated packaged candidate.','**Phase 11C (LP01, MX04, LP02 and LP03) is complete in source and isolated packaged candidate 0.5.26-11c.1**; [report](Documentation/Project/LP03-Completion-Report.md).')
s=s.replace('Active: **LP03 — Location and UI Native Acceptance**, Sol / High.','Phase 11C native acceptance is complete. **Next: MX05 — Character and Published Map Organization**, Sol / High, awaiting its separate PASSKEY.')
s=s.replace('No new implementation has begun.','MX02/MX03 and Phase 11C are implemented in source; LP03 passed isolated native acceptance. Production remains 0.5.26 pending the final U30 delivery gate.')
p.write_bytes(s.encode())

p=project/'MAPDex-Location-Preview-Scope.md';s=p.read_text(encoding='utf-8')
s=s.replace('Status: scoped alongside parent/child grouping; rendering implementation needs a later task-specific PASSKEY.','Status: LP01, LP02 and LP03 complete under the October 21 Phase 11C PASSKEY, with MX04 layout integration. [Completion and proof boundaries](LP03-Completion-Report.md). Installed 0.5.26 remains unchanged; U30 owns final production delivery.')
s=s.replace('This is an unimplemented rendering and image-association pipeline, not an inherent game-engine restriction.','The supported-ROM rendering and image-association pipeline is now implemented and verified in the isolated desktop candidate.')
s=s.replace('no renderer implementation is authorized by this documentation update.','the subsequent Phase 11C PASSKEY authorized this implementation.')
s=s.replace('It does not yet provide the terrain/building/model/texture rendering pipeline.','The completed static renderer adds the terrain/building/model/texture pipeline for the validated source layouts.')
s=s.replace('these references establish feasibility to investigate, not completion of ROMDex’s renderer.','the LP01 and LP03 evidence now establishes the implemented renderer’s tested boundaries.')
s=s.replace('selection in the item list highlights the marker.','selecting the entity opens its source text in the contextual detail pane.')
s=s.replace('Allow zoom/pan with exact source area selection.','Provide fixed angled/top-down camera choices and saved crop overrides with exact source area selection; interactive 3D/pan/zoom is not implemented in this first version.')
s=s.replace('Each implementation stage needs its own PASSKEY.','All three implementation stages are now complete under the owner’s combined Phase 11C authorization; the next task, MX05, needs a separate PASSKEY.')
p.write_bytes(s.encode())

repo=root/'work/u13b/repository/docs/project'
for name in ['LP03-Completion-Report.md','LP03-Verification.json','MAPDex-Location-Preview-Scope.md']:
 shutil.copyfile(project/name,repo/name)
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 s=(root/'outputs'/name).read_text(encoding='utf-8').replace('Documentation/Project/','').replace('Documentation/History/','../history/').replace('Documentation/Features/','../features/')
 (repo/name).write_bytes(s.encode())
print(json.dumps({'phase':'11C complete','nativeChecks':12,'next':'MX05; separate PASSKEY','productionChanged':False}))

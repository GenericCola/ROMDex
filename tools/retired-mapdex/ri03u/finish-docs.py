from pathlib import Path
import json,re
w=Path('work/ri03u');out=Path('outputs');history=out/'Documentation/History/RI03U';project=out/'Documentation/Project'
read=lambda name:json.loads((w/name).read_text(encoding='utf-8-sig'))
installed=read('installed-proof.json');installation=read('installation-result.json');assert installed['status']=='passed' and installation['status']=='installed'
live=read('live-proof.json');native=read('native-proof.json');popup=read('connection-native-proof.json');build=read('build.json');tests=read('tests-evidence.json');assert live['status']=='passed' and live['cleanup']['status']=='passed' and native['status']=='passed' and popup['status']=='passed'
report={'task':'RI03U','status':'implementation-installed-verified','version':'0.5.23','clientDate':'2026-10-20','verification':{'focusedCases':tests['uniqueCases']+18,'suites':tests['suites']+[{'file':'outputs/ROMDex/tests/sync-control.test.mjs','cases':18,'status':'passed'}],'actualROM':read('source-ready.json')['realROM'],'actualTwoBuildAcceptance':'deferred-no-second-actual-ROM-build','sourceUI':read('ui-proof.json'),'connectionUI':read('connection-ui-proof.json'),'liveYouTrack':live,'native':native,'connectionNative':popup,'windowsInstaller':read('msi-check.json')},'installer':build['installer'],'backup':installation,'installed':installed,'productionNPCDexSync':'enabled-as-before-local-saves-enabled','newPrivateUpdaterReleasePublished':False,'latestPrivateUpdaterRelease':'0.5.15'}
# Profiles are test paths, not portable inputs or source-backup contents.
report['verification']['sourceUI'].pop('profile',None)
(history/'RI03U-Verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
text=f'''# RI03U — Update Existing Maps Across ROM Builds

Status: implementation complete, installed and verified in ROMDex **0.5.23**, October 20, 2026. The separate acceptance test with two actual ROM builds remains deferred because only 0.6.3 is available.

## What changed

MAPDex now explicitly links builds to a ROM project. A map tile's hover settings menu offers **Update Existing Map**. This creates a separate candidate for comparison; NPCDex stays unchanged until the whole map is reviewed and applied. Confirm uncertain areas/entities and rewritten dialogue side by side. Unique unchanged passages keep their annotations. Missing items default to retention; explicit archival preserves history. Nested relationships, user names/images, notes, flags, planning, fixed task packages and source evidence are retained.

The accepted update stays in the same managed map RDX and uses the same NPCD record identities. Reviewed relocations update parent links with a resumable journal. New local edits invalidate an old preview. Opening an older build does not roll back content automatically. An exact structured request can be confirmed as Appears Implemented, but human testing remains required and tasks stay open. Imported portable testing claims never establish a trusted test pass.

Use **ROM Project → Link ROM Build**, then the selected map's cog → **Update Existing Map → Prepare Update**, resolve the review, and **Apply Reviewed Map Update**. Save Review retains unfinished choices. Use this update route for later ROM revisions; ordinary Prepare Map maintains separate staging and does not silently overwrite an older preparation. Export the current accepted working map from NPCDex.

## Connection Details correction

Background connection/setup retries previously emitted the same modal-opening event on each retry. They now report a setup-needed status without reopening Connection Details. Explicit connection actions and manual Save still provide setup access. Closing with × or Escape survives later automatic retries. The installed check found the already-approved Needs Testing state missing from PMON. With no pending task edits, the existing setup command added that standard state and verified the connection again; existing task values and credentials were preserved.

## Evidence

- {tests['uniqueCases']+18} focused cases across 15 relevant suites; unchanged unrelated suites were not rerun.
- Actual 0.6.3 ROM: complete 540-area catalog; two independent extractions of the same New Bark Town source preserve 95 records, eight areas and 404 prompt/passage comparisons with no unresolved matches. This is not a two-build proof.
- Controlled cross-build cases cover identity/passage ambiguity, additions, omissions, moves, nested groups, overrides/plans, stale review, rollback and testing/recovery rules.
- Live private YouTrack proof: a fictional 15-record nested map updates through the same registry/issues, relocates an entity, preserves its exact note and confirmed plan, then recovers in another profile. All 16 exact test IDs were removed and verified absent. Production maps/tasks were untouched by this proof.
- Six packaged desktop checks plus three focused desktop connection-dialog checks passed, alongside normal/620-pixel review and Windows Installer validation.
- Complete Data backup and isolated restoration verified {installation['restoration']['files']} files; all three saved credentials decrypted successfully in the protected Windows helper. Data matched exactly after installation and before reopening. All {installation['applicationFilesVerified']} application files match the final package.
- Reopened production retains {installed['application']['tasks']} tasks, {installed['application']['npcdexDocuments']} NPCDex maps, MAPDex context and remembered connections. NPCDex cloud sync remains enabled for the clean RDX test, exactly as recorded in the pre-upgrade backup; local saves remain enabled. Connection Details is closed.

## Remaining limits

No second real ROM exists yet. Actual cross-build acceptance remains unchecked. Changed fingerprints are supported only when ROM-derived code/layout compatibility validates; arbitrary Pokémon ROMs, changed reader layouts/table sizes and parallel current branches are outside this delivery. Independently prepared/published map merging and coordinated shared-definition migration retain their existing review gates. The user's broader production import/edit/YouTrack round trip and location rendering remain separate acceptance work.

[Operator guide](../../../ROMDex/rom/UPDATING-MAPS.md) · [Design](../../Project/RI03U-Cross-ROM-Update-Design.md) · [Verification](RI03U-Verification.json) · [Installer](../../../ROMDex-Installer-0.5.23/ROMDex-0.5.23-x64.msi)

Protected recovery: `outputs/Protected/Before-MAPDex-0.5.23/Data.zip` and `Previous-Application-Source.zip`. Keep these. Installed evaluation is 0.5.23; the private updater release remains 0.5.15. This task does not publish a new release.
'''
(history/'RI03U-Completion-Report.md').write_text(text,encoding='utf-8')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=out/name;s=p.read_text(encoding='utf-8');a=s.index('## Required Follow-up — RI03U:');b=s.index('\n## ',a+5);section=s[a:b]
 section='\n'.join(line.replace('- [ ]','- [x]',1) if line.startswith('- [ ]') and '**Deferred real-build acceptance:**' not in line else line for line in section.split('\n'))
 section=re.sub(r'- \[x\] Deliver documentation.*', '- [x] Deliver documentation and verified installed 0.5.23 under the existing October 20 RI03U PASSKEY, including the requested repeated Connection Details correction. [Completion report](Documentation/History/RI03U/RI03U-Completion-Report.md). Broader compatibility and the production round trip remain separate acceptance items.',section)
 s=s[:a]+section+s[b:]
 key='**Current:**' if 'Checklist' in name else '**Status:**';s=re.sub(re.escape(key)+r'[^\n]*',key+' RI03U implementation is complete in installed ROMDex 0.5.23. Reviewed cross-ROM map updates and the repeated Connection Details correction passed isolated/backend/native checks; current Data and all connections are preserved. Two actual ROM builds remain deferred. [Report](Documentation/History/RI03U/RI03U-Completion-Report.md).',s,count=1)
 if 'Unified' in name:s=re.sub(r'\*\*Execution tracking:\*\*[^\n]*','**Execution tracking:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md). Phase 6 and the core U21–U27/RI02–RI03P implementations are included in the installed evaluation. MAPDex grouping/readable source previews and RI03U are delivered in 0.5.23. RI03C broader compatibility and the user’s production RDX round trip remain open, followed by U28–U30. RI03U’s two-actual-build acceptance is explicitly deferred until another supported build exists; LP01–LP03 location rendering remains separately scoped. Stop at the next task-specific PASSKEY.',s,count=1)
 s=s.replace('RI03U remains the required next scope before repeated cross-ROM update acceptance.','RI03U implementation is delivered in 0.5.23; its actual two-build acceptance remains deferred.')
 p.write_text(s,encoding='utf-8')
p=project/'RI03U-Cross-ROM-Update-Design.md';s=p.read_text(encoding='utf-8');s=re.sub(r'Status:[^\n]*','Status: design approved and implementation delivered in verified installed ROMDex 0.5.23, October 20, 2026. Actual two-build acceptance remains deferred; see [completion report](../History/RI03U/RI03U-Completion-Report.md).',s,count=1);p.write_text(s,encoding='utf-8')
p=project/'NPCDex-ROMDex-Decision-Log.md';s=p.read_text(encoding='utf-8');s+='''\n\n## October 20 — RI03U Cross-ROM Update Decisions and Delivery

Approved: explicitly link builds to a persistent ROM project; use Update Existing Map in the standard hover cog; compare uncertain entity/passage identity side by side; review the whole map before applying; preserve unmatched annotations/history and current planning; confirm exact structured fulfillment with human testing still required; one current map per project with reviewed rollback. No new ROM exists yet, so controlled cases and actual 0.6.3 extraction support implementation delivery while actual two-build acceptance stays unchecked. Portable project/update metadata preserves lineage, while trusted testing evidence stays private. Verified 0.5.23 preserves the complete Data folder and three remembered credentials. The added background connection-dialog correction prevents retry-driven reopening. [Report](../History/RI03U/RI03U-Completion-Report.md).
''';p.write_text(s,encoding='utf-8')
p=out/'README.md';s=p.read_text(encoding='utf-8').replace('Current installed evaluation build: **0.5.22**','Current installed evaluation build: **0.5.23**').replace('ROMDex-Installer-0.5.22','ROMDex-Installer-0.5.23').replace('ROMDex-0.5.22-x64.msi','ROMDex-0.5.23-x64.msi').replace('Protected/Before-MAPDex-0.5.22','Protected/Before-MAPDex-0.5.23');s=s.replace('- [MAPDex 0.5.22 Hover', '- [RI03U Cross-ROM Updates and Connection Dialog Correction](Documentation/History/RI03U/RI03U-Completion-Report.md)\n- [MAPDex 0.5.22 Hover',1);s=s.replace('with parent/child map grouping, contextual preparation, visible source dialogue and matched controls.','with reviewed cross-ROM map updates, parent/child grouping and readable source previews. Connection Details stays closed during background retries. Two-actual-build acceptance remains deferred.');p.write_text(s,encoding='utf-8')
print(json.dumps({'status':'completed','report':str(history/'RI03U-Completion-Report.md')}))

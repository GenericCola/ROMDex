from pathlib import Path
import json,shutil,hashlib,subprocess
root=Path.cwd();app=root/'outputs/ROMDex';repo=root/'work/u13b/repository';out=root/'outputs';history=out/'Documentation/History/RI02A'
check=out/'NPCDex-ROMDex-Action-Checklist.md';plan=out/'NPCDex-ROMDex-Unified-App-Action-Plan.md'
for p in [check,plan]:
    s=p.read_text(encoding='utf-8');s=s.replace('**Next: RI02A → RI02B → RI02T → RI02C → RI03A → RI03B → RI03C → U28 → U29 → U30.**','**RI02A is complete in source. Remaining: RI02B → RI02T → RI02C → RI03A → RI03B → RI03C → U28 → U29 → U30.**')
    if p==check:
        a=s.index('**Current:**');b=s.index('\n',a);s=s[:a]+'**Current:** **RI02A — ROM Reader and Source Mapping is complete in source**; [report](Documentation/History/RI02A/RI02A-Completion-Report.md). Next: **RI02B — Dialogue, Events and Appearance Extraction, Sol / High**, awaiting a new PASSKEY. RI01 remains approved. Installed production stays 0.5.15 with NPCDex cloud sync paused, local saves enabled and 133 queued entries preserved. No production reset is authorized.'+s[b:]
        a=s.index('- [ ] **RI02A ');b=s.index('\n',a);s=s[:a]+'- [x] **RI02A — ROM Reader and Source Mapping** — Sol / High. Completed in source: bounded read-only supplied-build reader, actual 540-header/event/warp catalog, relocated sprite metadata, portable/scoped identities and native source locators. Seventeen focused tests and eight real-ROM proof checks passed; 617 locators resolved, separate-process identities preserved, input unchanged. Known duplicate IDs/unresolved warps remain explicit. No RDX/cloud/installer claim. [Report](Documentation/History/RI02A/RI02A-Completion-Report.md).'+s[b:]
    else:
        s=s.replace('RI02A is next under a new PASSKEY.','RI02A is complete in source; RI02B is next under a new PASSKEY.').replace('**RI02A — Sol / High** is next under a new PASSKEY;','**RI02A is complete in source** ([report](Documentation/History/RI02A/RI02A-Completion-Report.md)); **RI02B — Sol / High** is next under a new PASSKEY;').replace('RI01 is complete and approved; RI02A is next, followed by the remaining approved extraction/timeline/workspace tasks','RI01 is complete and approved; RI02A is complete in source and RI02B is next, followed by the remaining approved extraction/timeline/workspace tasks')
        lines=s.splitlines()
        for i,line in enumerate(lines):
            if line.startswith('| RI02A '):lines[i]=line.replace('| Bounded read-only reader,','| **Complete in source:** Bounded read-only reader,',1)
        s='\n'.join(lines)+'\n'
    p.write_bytes(s.encode())
readme=app/'README.md';s=readme.read_text();a=s.index('\n\n',s.index('Installed production'))+2;s=s[:a]+'**RI02A adds the source-only [ROM reader and source-mapping foundation](rom/README.md)** for the exact supplied HeartGold build. It reads the ROM itself; dialogue/sprite extraction, per-map timeline support and the real RDX/cloud proof remain separately gated. No installed feature or cloud policy is changed.\n\n'+s[a:];readme.write_bytes(s.encode())
changelog=app/'CHANGELOG.md';s=changelog.read_text();s='''## Unreleased — RI02A ROM Reader and Source Mapping

- Add a bounded, read-only supplied-build ROM/filesystem/NARC reader with explicit unsupported-build/relocation diagnostics and actual map/event/warp inventory.
- Add portable map-scoped source identities, pinned native locators and a batch mapping session that preserves identity and avoids repeated whole-catalog validation.
- Pass 17 focused tests and eight real-ROM proof checks, including 617 independently resolved locators and separate-process identity preservation. Source-only; no RDX compilation, cloud publication or installed change.

'''+s;changelog.write_bytes(s.encode())
author=app/'rdx/authoring/MAP-AUTHORING.md';s=author.read_text();needle='No verified extractor for the real ROM has been supplied by RD09.';s=s.replace(needle,needle+' RI02A now provides a [ROM-only reader and source inventory/mapping foundation](../../rom/README.md) for the exact inspected build; it does not yet extract complete dialogue/images or compile a real map RDX. Those remain RI02B/RI02T/RI02C.');author.write_bytes(s.encode())
log=out/'Documentation/Project/NPCDex-ROMDex-Decision-Log.md';s=log.read_text()+'''\n\n## RI02A — Source Reader and Mappings Complete

Completed under its own PASSKEY. The reader inventories the supplied .nds directly without editable project/agent-prepared content. All 540 physical map headers and their event resources are validated; New Bark's scoped identities and native source mappings preserve exact bytes and reopen unchanged in another process. Known ambiguous object IDs/unresolved warp references remain explicit rather than being repaired or silently trusted. Seventeen focused tests and eight real-ROM proof checks pass. No production or runtime deployment changed. Next separately gated task: RI02B — Dialogue, Events and Appearance Extraction, Sol / High. Per-map Roman-numeral timelines remain RI02T, and the decisive actual RDX/native round trip remains RI02C.\n''';log.write_bytes(s.encode())
proof=json.loads((root/'work/ri02a/final-proof/real-rom-proof.json').read_text());assert proof['status']=='passed' and len(proof['checks'])==8 and proof['externalRequests']==0
(history/'RI02A-Real-ROM-Proof.json').write_bytes(json.dumps(proof,indent=2).encode())
modules=['rom/reader.mjs','rom/profiles.mjs','rom/locators.mjs','rom/hgss.mjs','rom/identities.mjs','rom/native-mapping.mjs','rom/cli.mjs','tests/rom-reader-fixture.mjs','tests/rom-reader.test.mjs','tests/rom-identities.test.mjs'];node='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
for f in modules:subprocess.run([node,'--check',str(app/f)],check=True,capture_output=True)
verification={'task':'RI02A','status':'passed','focusedTests':17,'overlappingFinalIdentityRecheck':6,'syntaxFiles':modules,'actualSourceProof':'RI02A-Real-ROM-Proof.json','fullApplicationSuiteRerun':False,'installedOrLiveCloudCheck':False}
(history/'RI02A-Verification.json').write_bytes(json.dumps(verification,indent=2).encode())
files=modules+['rom/README.md','README.md','CHANGELOG.md','rdx/authoring/MAP-AUTHORING.md'];pairs=[(app/f,'apps/romdex/'+f) for f in files]
pairs.extend([(check,'docs/project/'+check.name),(plan,'docs/project/'+plan.name),(log,'docs/project/'+log.name)])
pairs.extend((p,'docs/project/'+p.name if p.suffix=='.md' else 'docs/project/RI02A-Evidence/'+p.name) for p in history.iterdir() if p.is_file() and p.name!='RI02A-Source-Backup.json')
script=root/'work/ri02a/verify-real-rom.mjs';target=repo/'tools/ri02a/verify-real-rom.mjs';target.parent.mkdir(parents=True,exist_ok=True);data=script.read_text().replace('../../outputs/ROMDex/','../../apps/romdex/').replace("path.resolve('outputs/ROMDex/rom/cli.mjs')","path.resolve('apps/romdex/rom/cli.mjs')").encode();target.write_bytes(data)
qa=root/'work/ri02a/QA-README.md';qa.write_bytes('''# RI02A source-reader verification

Use Node 24 from the repository root. Create work/ri02a/tmp and set ROMDEX_TEST_SCRATCH to its absolute path for node --test apps/romdex/tests/rom-reader.test.mjs apps/romdex/tests/rom-identities.test.mjs. The fixtures are synthetic and need no ROM.

For the optional actual-source proof, supply the reviewed 0.6.3 ROM locally, then run node apps/romdex/rom/cli.mjs inventory INPUT.nds work/ri02a/source-inventory.json. Set ROMDEX_PROOF_OUTPUT to a new directory and run node tools/ri02a/verify-real-rom.mjs INPUT.nds. It uses no network/credentials or live Data. Output identity/structure files stay local; do not commit ROMs, full inventories, identity bindings or decoded content. Existing output names are intentionally refused. Archived evidence contains only hashes/counts and outcomes.

The full real proof was rerun only to repair a native-schema evidence field and remove demonstrated repeated validation. Final evidence: 17 distinct tests, six overlapping identity rechecks, eight real source proof checks and ten syntax checks. No unrelated application suite, browser/Electron process or live cloud proof was run. RI02B/RI02T/RI02C remain separate.
'''.encode());pairs.append((qa,'tools/ri02a/README.md'))
manifest=[]
for src,dest in pairs:
    data=src.read_bytes().replace(b'\r\n',b'\n');src.write_bytes(data);p=repo/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);manifest.append({'path':dest,'bytes':len(data),'sha':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()})
manifest.append({'path':'tools/ri02a/verify-real-rom.mjs','bytes':len(target.read_bytes()),'sha':hashlib.sha1(b'blob '+str(len(target.read_bytes())).encode()+b'\0'+target.read_bytes()).hexdigest()})
(root/'work/ri02a/manifest.json').write_bytes(json.dumps(manifest,indent=2).encode());git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';subprocess.run([git,'-C',str(repo),'add','--',*[e['path'] for e in manifest]],check=True);subprocess.run([git,'-C',str(repo),'diff','--cached','--check'],check=True);print(json.dumps({'files':len(manifest),'tree':subprocess.check_output([git,'-C',str(repo),'write-tree'],text=True).strip(),'syntaxChecks':len(modules),'next':'RI02B / Sol High'}))

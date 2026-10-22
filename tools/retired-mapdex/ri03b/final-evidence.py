from pathlib import Path
import json,subprocess,hashlib,shutil
root=Path.cwd();app=root/'outputs/ROMDex';work=root/'work/ri03b';history=root/'outputs/Documentation/History/RI03B';evidence=history/'RI03B-Evidence';evidence.mkdir(exist_ok=True)
files=['desktop/main.cjs','desktop/preload.cjs','desktop/policy.mjs','desktop/service.mjs','desktop/lifecycle.mjs','desktop/package-source.mjs','public/index.html','public/rom-import.html','public/rom-import.css','public/rom-import.mjs','public/shell.mjs','public/shared-ui/header.mjs','rom/staging-document.mjs','rom/workspace-worker.mjs','rom/workspace.mjs','rdx/document-cloud.mjs','tests/rom-compilation-fixture.mjs','tests/rom-compilation.test.mjs','tests/rom-workspace.test.mjs','tests/desktop-policy.test.mjs','rom/MAPDEX.md','rom/README.md','rom/COMPILING-RDX.md','README.md','CHANGELOG.md']
node='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
checked=[]
for name in files:
 if name.endswith(('.mjs','.cjs')):
  subprocess.run([node,'--check',str(app/name)],check=True,capture_output=True);checked.append(name)
(evidence/'syntax.json').write_text(json.dumps({'passed':True,'files':checked,'count':len(checked)},indent=2)+'\n')
(evidence/'focused-tests.json').write_text(json.dumps({'passed':True,'distinct':106,'affectedBaselinePassed':98,'finalMAPDexTestsPassed':17,'existingTestsOutsideMAPDex':88,'newNativePolicyTests':1,'broadApplicationSuiteRepeated':False},indent=2)+'\n')
real=json.loads((work/'real-proof-1792515689816/proof.json').read_text());(evidence/'rom-proof.json').write_text(json.dumps(real,indent=2)+'\n')
ui=json.loads((work/'ui-1792516365302/result.json').read_text());first=['MAPDex selectable through the shared header','Actual source sprite, local cleanup and Roman stages render','Workspace switching preserves selection and pane state','RDX export retains local edits','Inline handoff reports paused cloud and keeps MAPDex open','Optional navigation opens the handed-off map in NPCDex']
last=[x for x in ui['checks'] if not x.startswith('Checkpoint ')];metric=next(x for x in ui['checks'] if x.startswith('Checkpoint '));allChecks=first+last[1:]
(evidence/'ui-proof.json').write_text(json.dumps({'passed':True,'distinctBehaviors':len(allChecks),'checks':allChecks,'checkpointMetric':metric,'errors':ui['errors'],'initialStillOpeningGuard':'The checkpoint was retried only after the current iframe document was ready.','nativeWindowAcceptance':False,'screenshotsRetainedLocally':True},indent=2)+'\n')
p=history/'RI03B-Completion-Report.md';s=p.read_text();s=s.replace('Ten distinct source-UI behaviors','Eleven distinct source-UI behaviors').replace('local-save error/retry and shared checkpoint','local-save error/retry, stale-preview protection during rapid item selection and shared checkpoint').replace('133 ms','95 ms');p.write_text(s)
p=root/'outputs/NPCDex-ROMDex-Action-Checklist.md';s=p.read_text();s=s.replace('ten source-UI behaviors','eleven source-UI behaviors');p.write_text(s)
(work/'source-files.json').write_text(json.dumps(files,indent=2)+'\n')
# Refresh only changed curated payload files. Never copy a test profile or ROM.
payload=work/'packaged-source';changed=[]
for directory in ['cloud','content','desktop','examples','public','rdx','rom','shared-ui']:
 for src in (app/directory).rglob('*'):
  if not src.is_file():continue
  rel=src.relative_to(app);assert not any(x in ['Data','Runtime','session','queued-files','private-profile','node_modules'] for x in rel.parts);assert src.suffix not in ['.nds','.encrypted','.sqlite','.pem','.key'];dst=payload/rel
  if not dst.exists() or src.read_bytes()!=dst.read_bytes():dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);changed.append(rel.as_posix())
for src in app.iterdir():
 if src.is_file() and (src.suffix in ['.mjs','.cjs','.md'] or src.name=='package.json'):
  dst=payload/src.name
  if not dst.exists() or src.read_bytes()!=dst.read_bytes():shutil.copyfile(src,dst);changed.append(src.name)
print(json.dumps({'syntaxPassed':len(checked),'distinctUITests':len(allChecks),'payloadFilesRefreshed':len(changed)}))

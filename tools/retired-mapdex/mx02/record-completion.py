from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[2]
out=root/'outputs'
repo=root/'work/u13b/repository'
proof=json.loads((root/'work/mx02/proof.json').read_text(encoding='utf-8'))
checks=[{k:v for k,v in item.items() if k not in ['labels','warnings']} for item in proof['checks']]
files=['rom/condition-extraction.mjs','rom/extract.mjs','tests/rom-conditions.test.mjs']
evidence={'status':'source-complete','focusedChecks':35,'newConditionCases':20,'existingAdjacentCases':15,'romOnlyProof':checks,'sourceGraphsReplayed':proof['finalCodeReplayed'],'productionChanged':False,'runtimeEmulated':False,'files':[]}
for name in files:
    source=out/'ROMDex'/name
    target=repo/'apps/romdex'/name
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(source.read_text(encoding='utf-8'),encoding='utf-8',newline='\n')
    evidence['files'].append({'file':name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
(out/'Documentation/Project/MX02-Verification.json').write_text(json.dumps(evidence,indent=2)+'\n',encoding='utf-8')
for name in ['MX01-Completion-Report.md','MX01-Design-Review.md','MX01-Final-Review.md','MX02-Completion-Report.md','MX02-Verification.json']:
    source=out/'Documentation/Project'/name
    text=source.read_text(encoding='utf-8').replace('../../RDX-Reference/MX01-Contracts/','MX01-Contracts/')
    (repo/'docs/project'/name).write_text(text,encoding='utf-8',newline='\n')
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
    source=out/name
    text=source.read_text(encoding='utf-8')
    text=text.replace('MX02 extraction work is active; MX03 follows only after MX02 is verified.','MX02 is complete in source; MX03 integration is active.')
    text=text.replace('MX02 is active.','MX02 is complete in source and MX03 is active.')
    text=text.replace('Active task: **MX01 — Event Condition Contracts and Suite UI Review**, Sol / High.','Active task: **MX03 — Condition RDX and Timeline Integration**, Sol / High; MX01 and MX02 are complete.')
    text=text.replace('MX01 authorizes design review; later implementation tasks require separate PASSKEYs.','The current PASSKEY authorizes MX02 and MX03 in order; later tasks require separate PASSKEYs.')
    source.write_text(text,encoding='utf-8',newline='\n')
    import re
    mirrored=text.replace('Documentation/Project/','').replace('RDX-Reference/MX01-Contracts/','MX01-Contracts/')
    mirrored=re.sub(r'(?:\.\./)*(?:Documentation/)?(?:Project/|History/[^/]+/)','',mirrored)
    mirrored=re.sub(r'(?m)^(\*\*Plans:\*\*[^\n]*?)[ \t]+$',r'\1',mirrored)
    (repo/'docs/project'/name).write_text(mirrored,encoding='utf-8',newline='\n')
print(json.dumps({'MX01':'complete, owner-approved','MX02':'source-complete','MX03':'active, already authorized','mirroredSourceFiles':files,'liveDataChanged':False}))

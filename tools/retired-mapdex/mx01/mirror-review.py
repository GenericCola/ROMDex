from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parents[2]
out=root/'outputs'
repo=root/'work/u13b/repository/docs/project'
target=repo/'MX01-Contracts'
target.mkdir(exist_ok=True)
copied=[]
for source in (out/'RDX-Reference/MX01-Contracts').iterdir():
    text=source.read_text(encoding='utf-8')
    if source.suffix=='.md':
        text=text.replace('../../Documentation/Project/MX01-Design-Review.md','../MX01-Design-Review.md')
    destination=target/source.name
    destination.write_text(text,encoding='utf-8',newline='\n')
    copied.append(str(destination.relative_to(repo)))
for name in ['MX01-Design-Review.md','MX01-Final-Review.md']:
    text=(out/'Documentation/Project'/name).read_text(encoding='utf-8').replace('../../RDX-Reference/MX01-Contracts/','MX01-Contracts/')
    (repo/name).write_text(text,encoding='utf-8',newline='\n')
    copied.append(name)
check=repo/'NPCDex-ROMDex-Action-Checklist.md'
check.write_text(check.read_text(encoding='utf-8').replace('RDX-Reference/MX01-Contracts/','MX01-Contracts/'),encoding='utf-8',newline='\n')
for name in ['MX01-Design-Review.md','MX01-Final-Review.md','MX01-Contracts/README.md']:
    file=repo/name
    for ref in re.findall(r'\]\(([^)]+)\)',file.read_text(encoding='utf-8')):
        assert (file.parent/ref).resolve().exists(),(name,ref)
result={'scope':'MX01 local design documentation only','mirrored':copied,'localLinksVerified':True,'remotePublication':'Not performed','finalOwnerAcceptance':'Pending','applicationDataBackendChanged':False}
(root/'work/mx01/package-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))

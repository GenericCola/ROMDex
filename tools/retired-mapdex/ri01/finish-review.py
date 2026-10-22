from pathlib import Path
from datetime import datetime
import hashlib,subprocess,json
git='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';repo=Path('work/u13b/repository');sha='ced96783e598e610c28f7cab1d3050f3f1174abe';parent='21de5f3eb87687b84b7f659825ad3a2fcccbf01f';tree='a9c3d095198d4bc44c327c2127eff7ae743e0045';epoch=int(datetime.fromisoformat('2026-10-20T03:27:31+00:00').timestamp());raw=None
for zone in ['+0000','-0400']:
    for ending in ['\n','']:
        candidate=(f'tree {tree}\nparent {parent}\nauthor GenericCola <32021766+GenericCola@users.noreply.github.com> {epoch} {zone}\ncommitter GenericCola <32021766+GenericCola@users.noreply.github.com> {epoch} {zone}\n\nRI01: inspect supplied ROM and propose ROM-only extraction scope'+ending).encode()
        if hashlib.sha1(b'commit '+str(len(candidate)).encode()+b'\0'+candidate).hexdigest()==sha:raw=candidate
assert raw is not None
assert subprocess.check_output([git,'-C',str(repo),'hash-object','-t','commit','-w','--stdin'],input=raw).decode().strip()==sha
for ref in ['refs/heads/main','refs/remotes/origin/main']:subprocess.run([git,'-C',str(repo),'update-ref',ref,sha,parent],check=True)
assert not subprocess.check_output([git,'-C',str(repo),'status','--porcelain']).strip()
Path('outputs/Documentation/History/RI01/RI01-Source-Backup.json').write_bytes(json.dumps({'commit':sha,'tree':tree,'files':9,'localRemoteMatched':True,'status':'scope-approval-pending','romOrDialogueUploaded':False,'productionChanged':False},indent=2).encode())
Path('work/ri01/CHECKPOINT.md').write_bytes(('''# RI01 inspection complete; scope gate pending

User PASSKEY authorized RI01. User specifically requires ROM alone: no editable project/prepared agent exports, open-source DSPRE etc allowed. Read-only ROM inventory and bounded New Bark probe passed. Eight areas / 24 placements / 230 messages / 52 local entries, no unknown character/width codes in bounded local walks. Header table candidate ARM9 0xF6BE0 has 19 pointer literals; sprite table relocated to overlay131 via overlay1 pointer. Dynamic sprite101 and shared/native semantics are future work. Detailed decoded probe stays local, not Git. No RDX/YouTrack proof or app change yet; production pause133 untouched.

Scope proposal outputs/Documentation/Project/RI01-ROM-Only-Extraction-Scope.md is prepared/open queued. Async scope-approval question pending. Do not mark RI01 complete or start RI02A until acceptance/new task PASSKEY. Proposed RI02A/B/C and RI03A/B/C are not yet written as approved checklist tasks. On acceptance update checklist/plan/report/evidence and decision log, check RI01, next RI02A SolHigh separately PASSKEY. Back up docs; no source/prod modifications.

Private main/local clean at '''+sha+''', 9 reviewed files. ROM input .nds supplied path in scope; exact SHA cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd verified unchanged. Public references pinned in scope. No agents; avoid redundant testing/browsing.\n''').encode())
print('RI01 review backup verified; local checkout clean; approval pending.')

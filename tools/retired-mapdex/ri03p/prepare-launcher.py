from pathlib import Path
import json,hashlib,base64
root=Path.cwd();work=root/'work/ri03p';history=root/'outputs/Documentation/History/RI03P';history.mkdir(parents=True,exist_ok=True)
host=(root/'work/ri02c/host.mjs').read_text(encoding='utf-8').replace('work/ri02c','work/ri03p').replace('RI02C','RI03P').replace('ri02c','ri03p')
(work/'host.mjs').write_bytes(host.encode('utf-8'))
job={'id':'ri03p-live-1','task':'RI03P','at':__import__('time').time_ns()//1000000,'file':str(work/'verify-live.cjs'),'sha256':hashlib.sha256((work/'verify-live.cjs').read_bytes()).hexdigest()}
(work/'job.json').write_text(json.dumps(job),encoding='utf-8')
command=f"Set-Location -LiteralPath '{root.as_posix()}'; & 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' '{(work/'host.mjs').as_posix()}' *> '{(work/'launcher.log').as_posix()}'"
encoded=base64.b64encode(command.encode('utf-16le')).decode('ascii')
(history/'Launch-RI03P-Verification.cmd').write_bytes(('@echo off\r\npowershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand '+encoded+'\r\n').encode('ascii'))
print(str(history/'Launch-RI03P-Verification.cmd'))

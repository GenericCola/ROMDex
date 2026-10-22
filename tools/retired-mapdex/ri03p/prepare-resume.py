from pathlib import Path
import json,hashlib,time,base64
root=Path.cwd();work=root/'work/ri03p';history=root/'outputs/Documentation/History/RI03P';checkpoint=json.loads((work/'live-checkpoint.json').read_text());assert checkpoint['phase']=='coldPublication' and checkpoint['progress']['objectsComplete']==checkpoint['progress']['objectsTotal']==595
prior={'initialHelperStartedAt':'2026-10-20T17:55:32.033Z','checkpoint':{k:checkpoint[k] for k in ['phase','cycle','progress','error','held']},'reason':'Final attachment metadata verification was serial in the already-running helper; resume verified uploads with bounded parallel prefetch.'};(work/'resume-proof.json').write_text(json.dumps(prior,indent=2),encoding='utf-8')
source=(work/'verify-live.cjs').read_text(encoding='utf-8');source=source.replace("await deliver('coldPublication');", "await deliver('verifiedUploadResume');report.initialAttempt=JSON.parse(await fs.readFile(path.join(work,'resume-proof.json')));report.initialAttempt.observedTotalMilliseconds=Date.now()-Date.parse(report.initialAttempt.initialHelperStartedAt);")
(work/'verify-resume.cjs').write_bytes(source.encode('utf-8'));p=work/'verify-resume.cjs';job={'task':'RI03P','id':'ri03p-resume-final','at':time.time_ns()//1000000,'file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()};(work/'job.json').write_text(json.dumps(job),encoding='utf-8')
command=f"""$ErrorActionPreference='Stop'
Set-Location -LiteralPath '{root.as_posix()}'
$checkpoint=Get-Content -LiteralPath '{(work/'live-checkpoint.json').as_posix()}' -Raw | ConvertFrom-Json
if($checkpoint.phase -ne 'coldPublication' -or $checkpoint.progress.objectsComplete -ne 595){{throw 'The proof checkpoint changed. No process was stopped.'}}
$targets=@(Get-CimInstance Win32_Process -Filter 'ParentProcessId = 9880' | Where-Object {{ $_.ExecutablePath -eq '{(root/'work/u10/runtime/electron/electron.exe').as_posix()}' -and $_.CommandLine.Contains('{(work/'verify-live.cjs').as_posix()}') }})
if($targets.Count -gt 1){{throw 'Ambiguous proof process; nothing was stopped.'}}
foreach($target in $targets){{Stop-Process -Id $target.ProcessId -Force}}
'Stopped only the isolated old RI03P reader; existing host will resume its saved checkpoint.' | Set-Content -LiteralPath '{(work/'resume-launcher.log').as_posix()}'
"""
# Windows reports native paths using backslashes; normalize before comparing.
command=command.replace("$_.ExecutablePath -eq '","$_.ExecutablePath.Replace('\\','/') -eq '").replace("$_.CommandLine.Contains('","$_.CommandLine.Replace('\\','/').Contains('")
encoded=base64.b64encode(command.encode('utf-16le')).decode('ascii');(history/'Resume-RI03P-Verification.cmd').write_bytes(('@echo off\r\npowershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand '+encoded+'\r\n').encode('ascii'));print('Checkpoint retained; only the exact isolated stale reader is eligible to stop')

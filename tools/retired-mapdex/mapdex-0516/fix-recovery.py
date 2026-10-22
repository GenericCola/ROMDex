from pathlib import Path
import base64
w=Path('work/mapdex-0516');p=w/'finish-verification.ps1';s=p.read_text()
a=" $observed=@()"
b=""" $jobPath=Join-Path $taskWork 'job.json'
 $job=Get-Content -LiteralPath $jobPath -Raw | ConvertFrom-Json
 $finish=Join-Path $taskWork 'run-finish-verify.mjs'
 if([IO.Path]::GetFullPath($job.file) -ne [IO.Path]::GetFullPath($finish) -or (Get-FileHash -LiteralPath $finish -Algorithm SHA256).Hash.ToLower() -ne $job.sha256){throw 'The reviewed continuation differs.'}
 $job.at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
 $job | ConvertTo-Json -Compress | Set-Content -LiteralPath $jobPath -Encoding ASCII
 $observed=@()"""
s=s.replace(a,b)
start=s.index(" $jobPath=Join-Path $taskWork 'job.json'",s.index('foreach($child in $children)'))
end=s.index(" 'The isolated test",start)
s=s[:start]+""" $liveHost=Get-CimInstance Win32_Process -Filter "ProcessId=$($hostState.pid)"
 if($liveHost -and $liveHost.CommandLine -notmatch '[\\/]mapdex-0516[\\/]host\\.mjs'){throw 'The helper identity changed.'}
 if(!$liveHost){
  Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList 'work/mapdex-0516/host.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskWork 'recovery-host-output.log') -RedirectStandardError (Join-Path $taskWork 'recovery-host-error.log')
 }
"""+s[end:]
p.write_text(s)
Path('outputs/Finish-MAPDex-Verification.cmd').write_text('@echo off\npowershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand '+base64.b64encode(s.encode('utf-16le')).decode()+'\n')
p=w/'host.mjs';s=p.read_text().replace('Date.now()-job.at>3600000','Date.now()-job.at>8*3600000');p.write_text(s)
print('Recovery refreshes the reviewed job before releasing the old test and restarts an exited helper.')

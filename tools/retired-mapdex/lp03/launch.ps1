$ErrorActionPreference='Stop'
$taskRoot='C:/Users/mrgen/Documents/Codex/2026-10-13/can'
$taskWork=Join-Path $taskRoot 'work/lp03'
try {
 $job=Get-Content -LiteralPath (Join-Path $taskWork 'job.json') -Raw | ConvertFrom-Json
 $checkFile=Join-Path $taskWork 'run-native.mjs'
 if([IO.Path]::GetFullPath($job.file) -ne [IO.Path]::GetFullPath($checkFile)){throw 'Unexpected verification file.'}
 if((Get-FileHash -LiteralPath $checkFile -Algorithm SHA256).Hash.ToLower() -ne $job.sha256){throw 'Verification file changed; helper not started.'}
 Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList 'work/lp03/host.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskWork 'launcher-output.log') -RedirectStandardError (Join-Path $taskWork 'launcher-error.log')
 'Isolated native helper launched; regular ROMDex is unchanged.' | Set-Content -LiteralPath (Join-Path $taskWork 'launcher-state.txt')
} catch { $_.Exception.Message | Set-Content -LiteralPath (Join-Path $taskWork 'launcher-state.txt') }

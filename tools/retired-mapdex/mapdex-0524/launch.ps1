$ErrorActionPreference='Stop'
$taskRoot='C:/Users/mrgen/Documents/Codex/2026-10-13/can'
$taskWork=Join-Path $taskRoot 'work/mapdex-0524'
try {
 $jobPath=Join-Path $taskWork 'job.json'
 $job=Get-Content -LiteralPath $jobPath -Raw | ConvertFrom-Json
 $expectedBuild=Join-Path $taskWork 'package.mjs'
 if([IO.Path]::GetFullPath($job.file) -eq [IO.Path]::GetFullPath($expectedBuild)){
  if((Get-FileHash -LiteralPath $expectedBuild -Algorithm SHA256).Hash.ToLower() -ne $job.sha256){throw 'The reviewed build script changed; no helper was started.'}
  $job.at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $job | ConvertTo-Json -Compress | Set-Content -LiteralPath $jobPath -Encoding ASCII
 }
 Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList 'work/mapdex-0524/host.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskWork 'launcher-output.log') -RedirectStandardError (Join-Path $taskWork 'launcher-error.log')
 'Build helper launched. Your installed ROMDex can stay open.' | Set-Content -LiteralPath (Join-Path $taskWork 'launcher-state.txt')
} catch { $_.Exception.Message | Set-Content -LiteralPath (Join-Path $taskWork 'launcher-state.txt') }

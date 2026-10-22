$ErrorActionPreference='Stop'
$taskRoot='C:/Users/mrgen/Documents/Codex/2026-10-13/can'
$taskWork=Join-Path $taskRoot 'work/phase11e'
try {
 $running=$false
 if(Test-Path -LiteralPath (Join-Path $taskWork 'host-state.json')){
  $state=Get-Content -LiteralPath (Join-Path $taskWork 'host-state.json') -Raw | ConvertFrom-Json
  $process=Get-CimInstance Win32_Process -Filter "ProcessId=$($state.pid)" -ErrorAction SilentlyContinue
  $running=$process -and $process.CommandLine -like '*work/phase11e/host.mjs*'
 }
 if(-not $running){Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList 'work/phase11e/host.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskWork 'launcher-output.log') -RedirectStandardError (Join-Path $taskWork 'launcher-error.log')}
 'Phase 11E verification helper available. No installation or production changes.' | Set-Content -LiteralPath (Join-Path $taskWork 'launcher-state.txt')
} catch { $_.Exception.Message | Set-Content -LiteralPath (Join-Path $taskWork 'launcher-state.txt') }


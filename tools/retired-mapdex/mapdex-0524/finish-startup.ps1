$ErrorActionPreference='Stop'
$taskRoot='C:/Users/mrgen/Documents/Codex/2026-10-13/can'
$taskWork=Join-Path $taskRoot 'work/mapdex-0524'
try {
 $taskProcesses=Get-CimInstance Win32_Process
 $taskHost=$taskProcesses | Where-Object {$_.ProcessId -eq 12300 -and $_.Name -eq 'node.exe' -and $_.CommandLine -match 'work[\\/]mapdex-0524[\\/]host\.mjs'}
 if($taskHost){
  $taskChildren=$taskProcesses | Where-Object {$_.ParentProcessId -eq 12300 -and $_.Name -eq 'node.exe' -and $_.CommandLine -match 'mapdex-0524[\\/]run-verify\.mjs'}
  foreach($taskChild in $taskChildren){Stop-Process -Id $taskChild.ProcessId -Force}
  Stop-Process -Id 12300 -Force
 }
 $taskOwnerPath=Join-Path $taskWork 'cold-qa-profile/desktop-owner.json'
 if(Test-Path -LiteralPath $taskOwnerPath){
  $taskOwner=Get-Content -LiteralPath $taskOwnerPath -Raw | ConvertFrom-Json
  $taskApp=$taskProcesses | Where-Object {$_.ProcessId -eq $taskOwner.pid -and $_.Name -eq 'ROMDex.exe' -and $_.ExecutablePath -eq (Join-Path $taskWork 'package/ROMDex.exe')}
  if($taskApp){
   $taskProof=Get-Content -LiteralPath (Join-Path $taskWork 'cold-startup-proof.json') -Raw | ConvertFrom-Json
   if($taskProof.preparedRecords -ne 95 -or $taskProof.checks.Count -ne 3){throw 'The isolated checkpoint proof needs review; nothing further stopped.'}
   $taskUtility=$taskProcesses | Where-Object {$_.ProcessId -eq $taskOwner.utilityPid -and $_.ParentProcessId -eq $taskOwner.pid -and $_.Name -eq 'ROMDex.exe'}
   Stop-Process -Id $taskApp.ProcessId -Force
   if($taskUtility){Stop-Process -Id $taskUtility.ProcessId -Force -ErrorAction SilentlyContinue}
  }
 }
 $taskJobPath=Join-Path $taskWork 'job.json'
 $taskJob=Get-Content -LiteralPath $taskJobPath -Raw | ConvertFrom-Json
 if((Get-FileHash -LiteralPath $taskJob.file -Algorithm SHA256).Hash.ToLower() -ne $taskJob.sha256){throw 'The reviewed restart check changed.'}
 $taskJob.at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
 $taskJob | ConvertTo-Json -Compress | Set-Content -LiteralPath $taskJobPath -Encoding ASCII
 Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList 'work/mapdex-0524/host.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskWork 'recovery-output.log') -RedirectStandardError (Join-Path $taskWork 'recovery-error.log')
 'Recovery helper launched; no production saves or app changed.' | Set-Content -LiteralPath (Join-Path $taskWork 'recovery-state.txt')
} catch { $_.Exception.Message | Set-Content -LiteralPath (Join-Path $taskWork 'recovery-state.txt') }

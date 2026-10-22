$ErrorActionPreference='Stop'
$taskRoot='C:/Users/mrgen/Documents/Codex/2026-10-13/can'
$taskWork=Join-Path $taskRoot 'work/mapdex-0516'
try {
 $proof=Get-Content -LiteralPath (Join-Path $taskWork 'native-proof.json') -Raw | ConvertFrom-Json
 if($proof.checks.Count -ne 9){throw 'The completed verification checkpoint differs; no process was stopped.'}
 $ready=Get-Content -LiteralPath (Join-Path $taskWork 'qa-startup.json') -Raw | ConvertFrom-Json
 $profile=[IO.Path]::GetFullPath((Join-Path $taskWork 'qa-profile'))
 if([IO.Path]::GetFullPath($ready.profile) -ne $profile -or !$ready.fixture){throw 'The isolated verification profile differs.'}
 $expected=[IO.Path]::GetFullPath((Join-Path $taskWork 'package/ROMDex.exe'))
 $jobPath=Join-Path $taskWork 'job.json'
 $job=Get-Content -LiteralPath $jobPath -Raw | ConvertFrom-Json
 $finish=Join-Path $taskWork 'run-finish-verify.mjs'
 if([IO.Path]::GetFullPath($job.file) -ne [IO.Path]::GetFullPath($finish) -or (Get-FileHash -LiteralPath $finish -Algorithm SHA256).Hash.ToLower() -ne $job.sha256){throw 'The reviewed continuation differs.'}
 $job.at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
 $job | ConvertTo-Json -Compress | Set-Content -LiteralPath $jobPath -Encoding ASCII
 $observed=@()
 foreach($targetId in @($ready.pid,$ready.utilityPid)){
  $target=Get-CimInstance Win32_Process -Filter "ProcessId=$targetId"
  if($target){if([IO.Path]::GetFullPath($target.ExecutablePath) -ne $expected){throw 'A test process identity changed; nothing was stopped.'};$observed+=@{pid=$target.ProcessId;path=$target.ExecutablePath}}
 }
 $observed | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskWork 'test-recovery-identities.json') -Encoding UTF8
 foreach($target in $observed){Stop-Process -Id $target.pid -Force -ErrorAction SilentlyContinue}
 Start-Sleep -Seconds 3
 $hostState=Get-Content -LiteralPath (Join-Path $taskWork 'host-state.json') -Raw | ConvertFrom-Json
 $children=Get-CimInstance Win32_Process -Filter "ParentProcessId=$($hostState.pid)"
 foreach($child in $children){if($child.CommandLine -match '[\\/]mapdex-0516[\\/]run-verify\.mjs') {Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue}}
 $liveHost=Get-CimInstance Win32_Process -Filter "ProcessId=$($hostState.pid)"
 if($liveHost -and $liveHost.CommandLine -notmatch '[\\/]mapdex-0516[\\/]host\.mjs'){throw 'The helper identity changed.'}
 if(!$liveHost){
  Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList 'work/mapdex-0516/host.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskWork 'recovery-host-output.log') -RedirectStandardError (Join-Path $taskWork 'recovery-host-error.log')
 }
 'The isolated test was checkpointed before recovery. The existing helper will perform restart verification; production was untouched.' | Set-Content -LiteralPath (Join-Path $taskWork 'test-recovery-state.txt')
} catch { $_.Exception.Message | Set-Content -LiteralPath (Join-Path $taskWork 'test-recovery-state.txt') }

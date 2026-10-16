$ErrorActionPreference = 'Stop'
$u14Root = [IO.Path]::GetFullPath($env:ROMDEX_U14_ROOT)
$u14Script = (Resolve-Path -LiteralPath (Join-Path $u14Root 'work/u14-cloud-setup.cjs')).Path
$u14Electron = (Resolve-Path -LiteralPath (Join-Path $u14Root 'work/u10/runtime/electron/electron.exe')).Path
$u14Status = Get-Content -LiteralPath (Join-Path $u14Root 'work/u14/cloud-setup.json') -Raw | ConvertFrom-Json
if ($u14Status.status -ne 'awaiting-input') { throw 'Cloud Setup Is Not Waiting for Input; Review Before Restarting It.' }
$u14Processes = Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $u14Electron -and $_.CommandLine -and $_.CommandLine.IndexOf($u14Script, [StringComparison]::OrdinalIgnoreCase) -ge 0 }
foreach ($u14Process in $u14Processes) { Stop-Process -Id $u14Process.ProcessId -ErrorAction Stop }

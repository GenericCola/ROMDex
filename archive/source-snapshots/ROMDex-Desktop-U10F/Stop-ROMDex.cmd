@echo off
setlocal
powershell.exe -NoProfile -Command "try { Invoke-RestMethod -Uri 'http://127.0.0.1:4322/api/stop' -Method Post -Headers @{Origin='http://127.0.0.1:4322'} -ContentType 'application/json' -Body '{}' -TimeoutSec 5 | Out-Null; Write-Host 'ROMDex stopped. Pending edits stay saved locally.' } catch { Write-Host 'ROMDex is already stopped, or close the old command window if it is still running.' }"

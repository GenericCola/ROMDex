@echo off
setlocal
set "ROMDEX_U18_ROOT=%~dp0.."
set "ROMDEX_U18_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_U18_NODE -ArgumentList 'work/u18-host.mjs' -WorkingDirectory $env:ROMDEX_U18_ROOT -WindowStyle Hidden"
exit /b

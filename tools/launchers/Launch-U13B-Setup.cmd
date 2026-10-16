@echo off
setlocal
set "ROMDEX_SETUP_ROOT=%~dp0.."
set "ROMDEX_SETUP_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_SETUP_NODE -ArgumentList 'work/u13b-setup-host.mjs' -WorkingDirectory $env:ROMDEX_SETUP_ROOT -WindowStyle Hidden"
exit /b

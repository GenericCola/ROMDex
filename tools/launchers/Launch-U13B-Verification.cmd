@echo off
setlocal
set "ROMDEX_VERIFY_ROOT=%~dp0.."
set "ROMDEX_VERIFY_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_VERIFY_NODE -ArgumentList 'work/u13b-host-session.mjs' -WorkingDirectory $env:ROMDEX_VERIFY_ROOT -WindowStyle Hidden"
exit /b

@echo off
setlocal
set "ROMDEX_FIX_ROOT=%~dp0.."
set "ROMDEX_FIX_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_FIX_NODE -ArgumentList 'work/u13a-credential-fix.mjs' -WorkingDirectory $env:ROMDEX_FIX_ROOT -WindowStyle Hidden"
exit /b

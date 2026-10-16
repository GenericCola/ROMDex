@echo off
setlocal
set "ROMDEX_U15_ROOT=%~dp0.."
set "ROMDEX_U15_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_U15_NODE -ArgumentList 'work/u15-finish-window.mjs' -WorkingDirectory $env:ROMDEX_U15_ROOT -WindowStyle Hidden"
exit /b

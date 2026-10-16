@echo off
setlocal
set "ROMDEX_U14_ROOT=%~dp0.."
set "ROMDEX_U14_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_U14_NODE -ArgumentList 'work/u14-show-setup.mjs' -WorkingDirectory $env:ROMDEX_U14_ROOT -WindowStyle Hidden"
exit /b

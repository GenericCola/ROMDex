@echo off
setlocal
set "ROMDEX_U19_ROOT=%~dp0.."
set "ROMDEX_U19_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_U19_NODE -ArgumentList 'work/u19-host.mjs' -WorkingDirectory $env:ROMDEX_U19_ROOT -WindowStyle Hidden"
exit /b

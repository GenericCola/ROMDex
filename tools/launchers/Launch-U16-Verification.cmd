@echo off
setlocal
set "ROMDEX_U16_ROOT=%~dp0.."
set "ROMDEX_U16_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_U16_NODE -ArgumentList 'work/u16-host.mjs' -WorkingDirectory $env:ROMDEX_U16_ROOT -WindowStyle Hidden"
exit /b

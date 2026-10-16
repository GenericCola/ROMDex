@echo off
setlocal
set "ROMDEX_U17_ROOT=%~dp0.."
set "ROMDEX_U17_NODE=C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command "Start-Process -FilePath $env:ROMDEX_U17_NODE -ArgumentList 'work/u17-resume-host.mjs' -WorkingDirectory $env:ROMDEX_U17_ROOT -WindowStyle Hidden"
exit /b

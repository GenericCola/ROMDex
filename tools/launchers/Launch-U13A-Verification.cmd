@echo off
setlocal
set "ROMDEX_U13A_ROOT=%~dp0.."
powershell.exe -NoProfile -NonInteractive -Command "Start-Process -WindowStyle Hidden -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList @('C:/Users/mrgen/Documents/Codex/2026-10-13/can/work/u13a-windows-verifier.mjs') -WorkingDirectory $env:ROMDEX_U13A_ROOT"
exit /b

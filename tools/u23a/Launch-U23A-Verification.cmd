@echo off
setlocal
cd /d "%~dp0..\..\..\.."
powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -ArgumentList 'work/u23a/host.mjs' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden"
endlocal

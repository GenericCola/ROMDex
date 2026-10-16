@echo off
setlocal
cd /d "%~dp0"
set "ROMDEX_LAUNCHER=%~dp0Launch-ROMDex.ps1"
powershell.exe -NoProfile -Command "& ([scriptblock]::Create([IO.File]::ReadAllText($env:ROMDEX_LAUNCHER)))"
if errorlevel 1 pause

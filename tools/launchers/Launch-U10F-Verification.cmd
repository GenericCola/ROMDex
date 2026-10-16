@echo off
setlocal
set "ROMDEX_QA=1"
set "ROMDEX_DESKTOP_FIXTURE=1"
set "ROMDEX_DESKTOP_PROFILE=%~dp0..\work\u10f\windows-qa"
set "ROMDEX_QA_REPORT=%~dp0..\work\u10f\windows-startup.json"
start "" "%~dp0ROMDex-Desktop-U10F\ROMDex.exe" --remote-debugging-address=127.0.0.1 --remote-debugging-port=9240
exit /b

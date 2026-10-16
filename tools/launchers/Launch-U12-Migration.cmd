@echo off
setlocal
set "ROMDEX_QA="
set "ROMDEX_DESKTOP_FIXTURE="
set "ROMDEX_DESKTOP_PROFILE="
set "ROMDEX_VERIFY=1"
set "ROMDEX_QA_REPORT=%~dp0..\work\u12\live-startup.json"
start "" "%~dp0ROMDex-Desktop-U12\ROMDex.exe" --inspect=127.0.0.1:9244 --remote-debugging-address=127.0.0.1 --remote-debugging-port=9243
exit /b

@echo off
setlocal
set "ROMDEX_QA="
set "ROMDEX_DESKTOP_FIXTURE="
set "ROMDEX_DESKTOP_PROFILE="
set "ELECTRON_RUN_AS_NODE="
set "ROMDEX_VERIFY=1"
set "ROMDEX_QA_REPORT=%~dp0..\work\u13a\current-startup.json"
start "" "%LOCALAPPDATA%\ROMDexDesktop\ROMDex.exe" --inspect=127.0.0.1:9248 --remote-debugging-address=127.0.0.1 --remote-debugging-port=9247
exit /b

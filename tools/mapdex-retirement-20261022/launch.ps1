$ErrorActionPreference='Stop'
$rollbackRoot='C:/Users/mrgen/Documents/Codex/2026-10-13/can'
$rollbackWork=Join-Path $rollbackRoot 'work/mapdex-retirement-20261022'
$rollbackScript=Join-Path $rollbackWork 'run-rollback.mjs'
$rollbackGate=Get-Content -LiteralPath (Join-Path $rollbackWork 'authorization.json') -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath $rollbackScript -Algorithm SHA256).Hash.ToLower() -ne $rollbackGate.helperSHA256){throw 'The reviewed restoration helper changed; nothing started.'}
Start-Process -FilePath 'C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' -ArgumentList @((Join-Path $rollbackWork 'host.mjs')) -WorkingDirectory $rollbackRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $rollbackWork 'launcher-output.log') -RedirectStandardError (Join-Path $rollbackWork 'launcher-error.log')

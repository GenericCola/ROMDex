$ErrorActionPreference = 'Stop'
$romdexRoot = Split-Path -Parent $env:ROMDEX_LAUNCHER
$romdexUrl = 'http://127.0.0.1:4322'
$romdexRunning = $false
try {
    $romdexStatus = Invoke-RestMethod -Uri "$romdexUrl/api/status" -TimeoutSec 2
    $romdexRunning = ($romdexStatus.app -eq 'ROMDex' -or $romdexStatus.origin -eq $romdexUrl)
} catch {}
if (-not $romdexRunning) {
    $romdexNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
    if (-not (Test-Path -LiteralPath $romdexNode)) {
        $romdexCommand = Get-Command node -ErrorAction SilentlyContinue
        if (-not $romdexCommand) { throw 'ROMDex needs Node.js 22 or newer. Install it from https://nodejs.org.' }
        $romdexNode = $romdexCommand.Source
    }
    $romdexData = Join-Path $romdexRoot '.romdex'
    New-Item -ItemType Directory -Path $romdexData -Force | Out-Null
    $env:ROMDEX_PORT = '4322'
    $romdexServer = Join-Path $romdexRoot 'server.mjs'
    $romdexProcess = Start-Process -FilePath $romdexNode -ArgumentList ('"' + $romdexServer + '"') -WorkingDirectory $romdexRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $romdexData 'service.log') -RedirectStandardError (Join-Path $romdexData 'service-error.log') -PassThru
    for ($romdexAttempt = 0; $romdexAttempt -lt 30; $romdexAttempt++) {
        if ($romdexProcess.HasExited) { throw 'ROMDex could not start. See .romdex/service-error.log in this folder.' }
        try {
            $romdexStatus = Invoke-RestMethod -Uri "$romdexUrl/api/status" -TimeoutSec 1
            if ($romdexStatus.app -eq 'ROMDex') { $romdexRunning = $true; break }
        } catch {}
        Start-Sleep -Milliseconds 200
    }
    if (-not $romdexRunning) { throw 'ROMDex started but could not be reached. See .romdex/service-error.log.' }
}
Start-Process $romdexUrl -WindowStyle Hidden

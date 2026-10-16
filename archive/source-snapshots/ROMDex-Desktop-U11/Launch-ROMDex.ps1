param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$romdexRoot = Split-Path -Parent $env:ROMDEX_LAUNCHER
$romdexUrl = 'http://127.0.0.1:4322'
$romdexNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
if (-not (Test-Path -LiteralPath $romdexNode)) {
    $romdexCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $romdexCommand) { throw 'ROMDex needs Node.js 22 or newer. Install it from https://nodejs.org.' }
    $romdexNode = $romdexCommand.Source
}
$romdexProfileTool = Join-Path $romdexRoot 'runtime-profile.mjs'
$romdexIdentityText = & $romdexNode $romdexProfileTool --identity
if ($LASTEXITCODE -ne 0) { throw 'ROMDex could not identify this build.' }
$romdexIdentity = $romdexIdentityText | ConvertFrom-Json
# Check destination permissions before stopping a working build.
if ($romdexIdentity.shared -and (Test-Path -LiteralPath $romdexIdentity.dataDir)) {
    $romdexMarkerPath = Join-Path $romdexIdentity.dataDir 'profile.json'
    if (-not (Test-Path -LiteralPath $romdexMarkerPath)) { throw 'The existing ROMDex profile needs review. The running build was not stopped.' }
    $romdexMarker = [IO.File]::ReadAllText($romdexMarkerPath) | ConvertFrom-Json
    if ($romdexMarker.version -ne 1 -or $romdexMarker.profile -ne 'thegobindsingh-PMON') { throw 'The existing ROMDex profile needs review. The running build was not stopped.' }
}
$romdexProbeFolder = if (Test-Path -LiteralPath $romdexIdentity.dataDir) { $romdexIdentity.dataDir } else { Split-Path -Parent $romdexIdentity.dataDir }
New-Item -ItemType Directory -Path $romdexProbeFolder -Force | Out-Null
$romdexProbeFile = Join-Path $romdexProbeFolder ('profile-access-' + [Guid]::NewGuid().ToString() + '.tmp')
try { [IO.File]::WriteAllText($romdexProbeFile, 'ROMDex profile access check') }
finally { if (Test-Path -LiteralPath $romdexProbeFile) { Remove-Item -LiteralPath $romdexProbeFile } }
$romdexStatus = $null
try { $romdexStatus = Invoke-RestMethod -Uri "$romdexUrl/api/status" -TimeoutSec 3 } catch {}
if ($romdexStatus -and $romdexStatus.app -ne 'ROMDex') { throw 'Port 4322 is occupied by another application. ROMDex did not stop it.' }
$romdexRunning = $romdexStatus -and $romdexStatus.installationId -eq $romdexIdentity.installationId -and $romdexStatus.serviceBuild -eq $romdexIdentity.serviceBuild
if ($romdexStatus -and -not $romdexRunning) {
    $romdexStoredToken = (Test-Path -LiteralPath (Join-Path $romdexIdentity.dataDir 'connection.encrypted')) -or (Test-Path -LiteralPath (Join-Path $romdexIdentity.legacyDir 'connection.encrypted'))
    if ($romdexStatus.connected -and -not $romdexStoredToken) { throw 'The running ROMDex connection is only in memory. Open Connection there and remember it before switching builds, or launch the original build once to migrate its saved connection.' }
    Invoke-RestMethod -Uri "$romdexUrl/api/stop" -Method Post -Headers @{Origin=$romdexUrl} -ContentType 'application/json' -Body '{}' -TimeoutSec 180 | Out-Null
    $romdexStopWatch = [Diagnostics.Stopwatch]::StartNew()
    while ($romdexStopWatch.Elapsed.TotalSeconds -lt 10) {
        $romdexStillRunning = $false
        try { Invoke-RestMethod -Uri "$romdexUrl/api/status" -TimeoutSec 1 | Out-Null; $romdexStillRunning = $true } catch {}
        if (-not $romdexStillRunning) { break }
        Start-Sleep -Milliseconds 200
    }
    if ($romdexStillRunning) { throw 'The earlier ROMDex service has not stopped yet. Its data was not migrated.' }
}
if (-not $romdexRunning) {
    $romdexProfileText = & $romdexNode $romdexProfileTool --prepare
    if ($LASTEXITCODE -ne 0) { throw 'ROMDex could not prepare its saved profile. The original data is preserved.' }
    $romdexProfile = $romdexProfileText | ConvertFrom-Json
    $env:ROMDEX_PORT = '4322'
    $romdexServer = Join-Path $romdexRoot 'server.mjs'
    $romdexProcess = Start-Process -FilePath $romdexNode -ArgumentList ('"' + $romdexServer + '"') -WorkingDirectory $romdexRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $romdexProfile.dataDir 'service.log') -RedirectStandardError (Join-Path $romdexProfile.dataDir 'service-error.log') -PassThru
    $romdexStartWatch = [Diagnostics.Stopwatch]::StartNew()
    while ($romdexStartWatch.Elapsed.TotalSeconds -lt 60) {
        if ($romdexProcess.HasExited) { throw 'ROMDex could not start. See service-error.log in the private profile. The saved connection is preserved.' }
        try {
            $romdexStatus = Invoke-RestMethod -Uri "$romdexUrl/api/status" -TimeoutSec 1
            if ($romdexStatus.app -eq 'ROMDex' -and $romdexStatus.installationId -eq $romdexIdentity.installationId -and $romdexStatus.serviceBuild -eq $romdexIdentity.serviceBuild) { $romdexRunning = $true; break }
        } catch {}
        Start-Sleep -Milliseconds 200
    }
    if (-not $romdexRunning) { throw 'ROMDex started but this build could not be reached. The saved connection is preserved.' }
}
if (-not $NoBrowser) { Start-Process $romdexUrl -WindowStyle Hidden }

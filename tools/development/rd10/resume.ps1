$ErrorActionPreference = 'Stop'
$rd10Root = 'C:\Users\mrgen\Documents\Codex\2026-10-13\can'
$rd10Work = Join-Path $rd10Root 'work\rd10'
try {
    # Stop only this task's expired harness/helper, never installed ROMDex.
    $rd10Targets = @((Join-Path $rd10Work 'host.mjs'), (Join-Path $rd10Work 'verify-native.mjs'))
    $rd10OldHost = Get-Content -LiteralPath (Join-Path $rd10Work 'host-state.json') -Raw | ConvertFrom-Json
    foreach ($rd10Process in Get-CimInstance Win32_Process -Filter "Name = 'node.exe'") {
        $rd10RelativeHost = $rd10Process.ProcessId -eq $rd10OldHost.pid -and $rd10Process.CommandLine -and $rd10Process.CommandLine.Contains('work/rd10/host.mjs')
        if ($rd10RelativeHost -or ($rd10Targets | Where-Object { $rd10Process.CommandLine -and $rd10Process.CommandLine.Contains($_) })) {
            Stop-Process -Id $rd10Process.ProcessId -Force -ErrorAction Stop
        }
    }
    $rd10QA = Get-Content -LiteralPath (Join-Path $rd10Work 'native-ready.json') -Raw | ConvertFrom-Json
    $rd10OldApp = Get-CimInstance Win32_Process -Filter "ProcessId = $($rd10QA.pid)"
    if ($rd10OldApp -and $rd10OldApp.ExecutablePath -eq (Join-Path $rd10Work 'package-0.5.15-r2\ROMDex.exe')) {
        Stop-Process -Id $rd10OldApp.ProcessId -Force -ErrorAction Stop
    }
    $rd10File = Join-Path $rd10Work 'verify-finish-candidate.mjs'
    @{ task = 'RD10'; id = 'finish-candidate-' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); at = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); file = $rd10File; sha256 = (Get-FileHash -LiteralPath $rd10File -Algorithm SHA256).Hash.ToLower() } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $rd10Work 'job.json')
    Start-Process -FilePath 'C:\Users\mrgen\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -ArgumentList (Join-Path $rd10Work 'host.mjs') -WorkingDirectory $rd10Root -WindowStyle Hidden
    @{ status = 'started'; at = [DateTimeOffset]::UtcNow.ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $rd10Work 'resume-result.json')
} catch {
    @{ status = 'needs-review'; error = $_.Exception.Message } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $rd10Work 'resume-result.json')
}

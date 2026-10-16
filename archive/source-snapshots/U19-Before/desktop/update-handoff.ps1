$ErrorActionPreference = 'Stop'
$planFile = $env:ROMDEX_UPDATE_PLAN
$plan = $null
$lock = $null
$directory = $null
$parentClosed = $false
function Write-Status([string]$phase, [string]$message, $exitCode = $null) {
  $status = @{format='ROMDexInstallStatus/1';nonce=$plan.nonce;phase=$phase;message=$message;exitCode=$exitCode;fromVersion=$plan.fromVersion;toVersion=$plan.toVersion;helperPid=$PID;at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()}
  $file = Join-Path $directory 'install-status.json'
  $temp = $file + '.writing'
  [IO.File]::WriteAllText($temp, ($status | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
  if ([IO.File]::Exists($file)) { [IO.File]::Replace($temp,$file,[NullString]::Value) } else { [IO.File]::Move($temp,$file) }
}
function Alive($id) { if (-not $id) { return $false }; $observed=Get-Process -Id ([int]$id) -ErrorAction SilentlyContinue; if (-not $observed) { return $false }; try { return -not $observed.HasExited } finally { $observed.Dispose() } }
function Aborted { return [IO.File]::Exists((Join-Path $directory 'install-aborted.flag')) -or ((Get-Content -LiteralPath $planFile -Raw | ConvertFrom-Json).nonce -ne $plan.nonce) }
try {
  $plan = Get-Content -LiteralPath $planFile -Raw | ConvertFrom-Json
  if ($plan.format -ne 'ROMDexInstallPlan/1' -or $plan.nonce -notmatch '^[a-f0-9-]{36}$') { throw 'The Update Plan Is Invalid.' }
  $root = [IO.Path]::GetFullPath($plan.applicationRoot)
  $romdexProfile = Join-Path $root 'Data\thegobindsingh-PMON'
  $directory = Join-Path $romdexProfile 'updates'
  if ([IO.Path]::GetFullPath($plan.profile) -ne $romdexProfile -or [IO.Path]::GetFullPath($planFile) -ne (Join-Path $directory 'install-plan.json')) { throw 'The Update Save Path Is Invalid.' }
  $lockFile = Join-Path $directory 'handoff.lock'
  $lock = [IO.File]::Open($lockFile,[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
  $rsa = New-Object Security.Cryptography.RSACryptoServiceProvider
  $rsa.PersistKeyInCsp = $false
  try {
    $rsa.FromXmlString($plan.publicKeyXml)
    if ($rsa.KeySize -lt 3072 -or $plan.envelope.format -ne 'ROMDexRelease/1' -or -not $rsa.VerifyData([Text.Encoding]::UTF8.GetBytes($plan.envelope.payload),'SHA256',[Convert]::FromBase64String($plan.envelope.signature))) { throw 'The Release Signature Could Not Be Verified.' }
  } finally { $rsa.Dispose() }
  $release = $plan.envelope.payload | ConvertFrom-Json
  $now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  if ($release.application -ne 'ROMDex' -or $release.platform -ne 'win32' -or $release.arch -ne 'x64' -or $release.desktopSchema -ne 1 -or $release.npcdexSchema -ne 2 -or $release.version -ne $plan.toVersion -or $release.expiresAt -le $now -or $now - $plan.createdAt -gt 600000 -or $plan.createdAt -gt $now + 300000) { throw 'The Update Is Expired or Incompatible.' }
  if ($release.version -notmatch '^\d+\.\d+\.\d+$' -or [Version]$release.version -le [Version]$plan.fromVersion) { throw 'The Update Would Not Advance the Installed Version.' }
  $msi = Join-Path $directory ('ROMDex-' + $release.version + '-x64.msi')
  if ([IO.Path]::GetFullPath($plan.installer) -ne $msi -or $release.artifact.name -ne [IO.Path]::GetFileName($msi) -or (Get-Item -LiteralPath $msi).Length -ne $release.artifact.size -or (Get-FileHash -LiteralPath $msi -Algorithm SHA256).Hash.ToLowerInvariant() -ne $release.artifact.sha256) { throw 'The Installer Failed Its Final Verification.' }
  $info = Get-Content -LiteralPath (Join-Path $root '.installInfo.json') -Raw | ConvertFrom-Json
  $fixture = $env:ROMDEX_QA -eq '1' -and [IO.File]::Exists((Join-Path $romdexProfile 'desktop-preview.json'))
  if ($plan.shortName -ne 'ROMDexDesktop' -and -not ($fixture -and $plan.shortName -eq 'ROMDexDesktopFixture')) { throw 'The Application Identity Is Not Approved.' }
  if ($info.appName -ne $plan.shortName -or $info.installVersion -ne $plan.fromVersion) { throw 'The Installed Version Changed Before Updating.' }
  $wi = New-Object -ComObject WindowsInstaller.Installer
  $db = $wi.OpenDatabase($msi,0)
  foreach ($check in @(@('ProductName','ROMDex'),@('ProductVersion',($release.version+'.0')),@('UpgradeCode',('{'+$plan.upgradeCode+'}')))) {
    $view = $db.OpenView(('SELECT `Value` FROM `Property` WHERE `Property`='''+$check[0]+''''))
    $view.Execute(); $record = $view.Fetch()
    if (-not $record -or $record.StringData(1) -ne $check[1]) { throw 'The MSI Product Identity Does Not Match ROMDex.' }
    $view.Close()
  }
  Write-Status 'waiting' 'Waiting for ROMDex to Checkpoint and Close.'
  $deadline = [DateTime]::UtcNow.AddSeconds(120)
  while ((Alive $plan.parentPid) -or (Alive $plan.utilityPid)) {
    if ((Aborted) -or [DateTime]::UtcNow -gt $deadline) { throw 'Update Installation Was Canceled Before ROMDex Closed.' }
    Start-Sleep -Milliseconds 200
  }
  if ((Aborted) -or [IO.File]::Exists((Join-Path $romdexProfile 'desktop-owner.json'))) { throw 'ROMDex Has Not Released Its Saves for Installation.' }
  $parentClosed = $true
  if ((Get-Item -LiteralPath $msi).Length -ne $release.artifact.size -or (Get-FileHash -LiteralPath $msi -Algorithm SHA256).Hash.ToLowerInvariant() -ne $release.artifact.sha256) { throw 'The Installer Changed After Preflight. Installation Was Stopped.' }
  Write-Status 'installing' 'Windows Is Updating ROMDex.'
  $log = Join-Path $directory ('install-'+$plan.nonce+'.log')
  $arguments = '/i "'+$msi+'" APPLICATIONROOTDIRECTORY="'+$root+'" /passive /norestart /L*v "'+$log+'"'
  if ($fixture -and $env:ROMDEX_QA_MSI_EXIT_CODE -in @('1602','1603')) { $installer = @{ExitCode=[int]$env:ROMDEX_QA_MSI_EXIT_CODE} } else { $installer = Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\msiexec.exe') -ArgumentList $arguments -Wait -PassThru -WindowStyle Hidden }
  if ($installer.ExitCode -notin @(0,3010)) { Write-Status 'failed' 'Windows Did Not Complete the Update. Your Data Is Retained.' $installer.ExitCode } else {
    $updated = Get-Content -LiteralPath (Join-Path $root '.installInfo.json') -Raw | ConvertFrom-Json
    if ($updated.installVersion -ne $release.version) { throw 'Windows Returned Without Installing the Expected ROMDex Version.' }
    Write-Status 'installed' 'ROMDex Updated Successfully.' $installer.ExitCode
  }
  $launcher = Join-Path $root 'ROMDex.exe'
  if ([IO.File]::Exists($launcher)) {
    foreach ($name in @('ROMDEX_UPDATE_PLAN','ROMDEX_UPDATE_HELPER','ROMDEX_UPDATE_STATUS','ROMDEX_UPDATE_NONCE')) { [Environment]::SetEnvironmentVariable($name,$null,'Process') }
    if ($env:ROMDEX_QA -eq '1') { Start-Process -FilePath $launcher -WorkingDirectory $root -ArgumentList '--inspect=127.0.0.1:9256 --remote-debugging-address=127.0.0.1 --remote-debugging-port=9255' -WindowStyle Normal } else {
      foreach ($name in @('ROMDEX_VERIFY','ROMDEX_QA_REPORT','ROMDEX_QA','ROMDEX_DESKTOP_FIXTURE','ROMDEX_DESKTOP_PROFILE','ELECTRON_RUN_AS_NODE')) { [Environment]::SetEnvironmentVariable($name,$null,'Process') }
      Start-Process -FilePath $launcher -WorkingDirectory $root -WindowStyle Normal
    }
  }
} catch {
  if ($plan -and $directory) { try { Write-Status 'failed' $_.Exception.Message } catch {} }
  if ($parentClosed -and [IO.File]::Exists((Join-Path $root 'ROMDex.exe'))) { Start-Process -FilePath (Join-Path $root 'ROMDex.exe') -WorkingDirectory $root -WindowStyle Normal }
} finally {
  if ($lock) { $lock.Dispose(); Remove-Item -LiteralPath $lockFile -ErrorAction SilentlyContinue }
}

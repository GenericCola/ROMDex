$ErrorActionPreference='Stop'
$schemaPath=Join-Path (Get-Location) 'outputs/U20A-Contracts/npcdex-contracts.schema.json'
$files=@(Get-ChildItem -LiteralPath 'work/u20b/downloaded-contracts' -Filter '*.json' -File)
if($files.Count -ne 5){throw 'Expected five independently downloaded contract artifacts'}
foreach($file in $files){if(-not (Test-Json -Json (Get-Content -Raw -LiteralPath $file.FullName) -SchemaFile $schemaPath)){throw "Invalid downloaded artifact: $($file.Name)"}}
$result=@{task='U20B';status='passed';validator='PowerShell Test-Json';artifacts=$files.Count;scope='Actual YouTrack-downloaded bytes, schema only'}
$result | ConvertTo-Json | Set-Content -LiteralPath 'work/u20b/downloaded-schema-check.json' -Encoding utf8
$result | ConvertTo-Json

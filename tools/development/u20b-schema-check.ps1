$ErrorActionPreference = 'Stop'
$schemaPath = Join-Path (Get-Location) 'outputs/U20A-Contracts/npcdex-contracts.schema.json'
$package = Get-Content -Raw -LiteralPath 'outputs/U20A-Contracts/examples/map-package.json' | ConvertFrom-Json -Depth 100 -DateKind String
$artifacts = @($package) + @($package.recordSnapshots) + @($package.plans) + @($package.mappings) + @($package.observations | ForEach-Object { $_.review })
foreach ($fixtureName in @('dialogue-result','dependent-removal-result','newer-draft','documentation-correction','task-binding','group-publication')) {
  $artifacts += Get-Content -Raw -LiteralPath "outputs/U20A-Contracts/examples/$fixtureName.json" | ConvertFrom-Json -Depth 100 -DateKind String
}
$positiveCount = 0
foreach ($artifact in $artifacts) {
  $valid = Test-Json -Json ($artifact | ConvertTo-Json -Depth 100 -Compress) -SchemaFile $schemaPath
  if (-not $valid) { throw "Accepted artifact failed the independent validator: $($artifact.schema)" }
  $positiveCount++
}
$negativeCount = 0
foreach ($case in @('missing-schema','wrong-workspace-type','unknown-property','wrong-kind-payload')) {
  $changed = $package.recordSnapshots[0] | ConvertTo-Json -Depth 100 | ConvertFrom-Json -Depth 100 -DateKind String
  switch ($case) {
    'missing-schema' { $changed.PSObject.Properties.Remove('schema') }
    'wrong-workspace-type' { $changed.workspaceId = 123 }
    'unknown-property' { $changed | Add-Member -NotePropertyName unsupported -NotePropertyValue $true }
    'wrong-kind-payload' { $changed.current.payload = @{name='Missing Region Key'} }
  }
  $invalid = Test-Json -Json ($changed | ConvertTo-Json -Depth 100 -Compress) -SchemaFile $schemaPath -ErrorAction SilentlyContinue
  if ($invalid) { throw "Invalid artifact unexpectedly passed: $case" }
  $negativeCount++
}
$result = [ordered]@{ task='U20B'; scope='Independent PowerShell Test-Json schema evaluation of U20A synthetic artifacts'; powershell=$PSVersionTable.PSVersion.ToString(); positiveArtifacts=$positiveCount; rejectedInvalidArtifacts=$negativeCount; status='passed'; doesNotProve='Hardened production parsing, live server behavior, actual actor grants or ROM extraction' }
$result | ConvertTo-Json | Set-Content -LiteralPath 'work/u20b/independent-schema-check.json' -Encoding utf8
$result | ConvertTo-Json


param(
    [ValidateSet('patch','minor','major')]
    [string]$Type = 'patch'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $projectRoot 'VERSION'
$frontendVersionFile = Join-Path $projectRoot 'public/version.json'
$frontendIndexFile = Join-Path $projectRoot 'public/index.html'
$changelogFile = Join-Path $projectRoot 'CHANGELOG.md'

$currentVersionRaw = (Get-Content -Path $versionFile -Raw).Trim()
$currentVersion = $currentVersionRaw -replace '^V', ''
$parts = $currentVersion.Split('.')

if ($parts.Count -ne 3) {
    throw "Versión inválida en VERSION: $currentVersionRaw"
}

[int]$major = $parts[0]
[int]$minor = $parts[1]
[int]$patch = $parts[2]

switch ($Type) {
    'major' { $major++; $minor = 0; $patch = 0 }
    'minor' { $minor++; $patch = 0 }
    default { $patch++ }
}

$newVersion = "V$major.$minor.$patch"
Set-Content -Path $versionFile -Value "$newVersion`n" -Encoding UTF8

$versionJson = @{
    version = $newVersion
} | ConvertTo-Json
Set-Content -Path $frontendVersionFile -Value "$versionJson`n" -Encoding UTF8

$indexHtml = Get-Content -Path $frontendIndexFile -Raw
$indexHtml = [regex]::Replace($indexHtml, '>V\d+\.\d+\.\d+<', ">$newVersion<")
Set-Content -Path $frontendIndexFile -Value $indexHtml -Encoding UTF8

$today = Get-Date -Format 'yyyy-MM-dd'
$entry = "`n## $newVersion - $today`n`n- Actualización de versión automática ($Type).`n"
Add-Content -Path $changelogFile -Value $entry -Encoding UTF8

Write-Host "Versión actualizada a $newVersion"

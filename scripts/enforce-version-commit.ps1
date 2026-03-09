$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "[version-guard] $Message" -ForegroundColor Red
    Write-Host ""
    exit 1
}

function ConvertTo-PlainVersion([string]$Raw) {
    $trimmed = $Raw.Trim()
    if ($trimmed -notmatch '^V(\d+)\.(\d+)\.(\d+)$') {
        Fail "VERSION debe tener formato Vx.x.x. Valor actual: $trimmed"
    }
    return "$($Matches[1]).$($Matches[2]).$($Matches[3])"
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

try {
    $stagedRaw = git diff --cached --name-only
    $staged = @($stagedRaw | Where-Object { $_ -and $_.Trim() -ne '' } | ForEach-Object { $_.Trim() })

    if ($staged.Count -eq 0) {
        exit 0
    }

    $required = @('VERSION', 'package.json', 'public/version.json', 'CHANGELOG.md')
    foreach ($file in $required) {
        if (-not ($staged -contains $file)) {
            Fail "Debes incluir $file en el commit."
        }
    }

    $versionRaw = Get-Content -Path 'VERSION' -Raw
    $versionPlain = ConvertTo-PlainVersion $versionRaw

    $package = Get-Content -Path 'package.json' -Raw | ConvertFrom-Json
    if ($package.version -ne $versionPlain) {
        Fail "package.json version ($($package.version)) no coincide con VERSION ($versionPlain)."
    }

    $frontend = Get-Content -Path 'public/version.json' -Raw | ConvertFrom-Json
    if ($frontend.version -ne "V$versionPlain") {
        Fail "public/version.json version ($($frontend.version)) no coincide con VERSION (V$versionPlain)."
    }

    $changelog = Get-Content -Path 'CHANGELOG.md' -Raw
    if (-not $changelog.Contains("## V$versionPlain")) {
        Fail "CHANGELOG.md debe incluir una sección para V$versionPlain."
    }

    $headVersionRaw = ''
    try {
        $headVersionRaw = git show HEAD:VERSION 2>$null
    } catch {
        $headVersionRaw = ''
    }

    if ($headVersionRaw) {
        $headVersion = ConvertTo-PlainVersion $headVersionRaw
        if ($headVersion -eq $versionPlain) {
            Fail "La versión no cambió respecto a HEAD ($headVersion). Incrementa versión antes de commit."
        }
    }

    Write-Host "[version-guard] OK - versión V$versionPlain validada." -ForegroundColor Green
}
finally {
    Pop-Location
}

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $projectRoot 'dist'
$iconName = 'social_media_social_network_logo_message_logotype_logos_chat_whatsapp_red_icon-icons.com_61223.ico'

if (Test-Path $distDir) {
    Remove-Item -Path $distDir -Recurse -Force
}
New-Item -Path $distDir -ItemType Directory | Out-Null

$itemsToCopy = @('public', 'api', 'src', 'index.php', 'README.md', 'LICENSE', 'VERSION', 'CHANGELOG.md')

foreach ($item in $itemsToCopy) {
    $src = Join-Path $projectRoot $item
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $distDir -Recurse -Force
    }
}

$iconSrc = Join-Path $projectRoot $iconName
if (-not (Test-Path $iconSrc)) {
    throw "No se encontró el ícono requerido: $iconName"
}

Copy-Item -Path $iconSrc -Destination (Join-Path $distDir $iconName) -Force
Write-Host 'Build completado en dist/ con favicon .ico incluido.'

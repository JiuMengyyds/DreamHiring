param(
    [string]$OutputRoot = (Join-Path $PSScriptRoot 'releases'),
    [switch]$SkipInstall,
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
$frontendRoot = Join-Path $projectRoot 'frontend'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$releaseRoot = Join-Path $OutputRoot "dreamhiring-$timestamp"

if (Test-Path -LiteralPath $releaseRoot) {
    throw "Release directory already exists: $releaseRoot"
}

New-Item -ItemType Directory -Path (Join-Path $releaseRoot 'frontend') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $releaseRoot 'deploy') -Force | Out-Null

if (-not $SkipInstall) {
    npm ci --prefix $frontendRoot
}

if (-not $SkipTests) {
    npm test --prefix $frontendRoot
}
npm run build --prefix $frontendRoot

$mavenArguments = @('package', '-f', (Join-Path $backendRoot 'pom.xml'))
if ($SkipTests) {
    $mavenArguments += '-DskipTests'
}
mvn @mavenArguments

$backendJar = Join-Path $backendRoot 'target\dream-hiring-backend-1.0.0-SNAPSHOT.jar'
if (-not (Test-Path -LiteralPath $backendJar)) {
    throw "Backend artifact was not produced: $backendJar"
}

Copy-Item -LiteralPath $backendJar -Destination (Join-Path $releaseRoot 'backend.jar')
Copy-Item -Path (Join-Path $frontendRoot 'dist\*') -Destination (Join-Path $releaseRoot 'frontend') -Recurse
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'nginx\dreamhiring.conf') -Destination (Join-Path $releaseRoot 'deploy\dreamhiring.conf')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'systemd\dreamhiring-backend.service') -Destination (Join-Path $releaseRoot 'deploy\dreamhiring-backend.service')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot '.env.production.example') -Destination (Join-Path $releaseRoot 'deploy\.env.production.example')

$commit = (git -C $projectRoot rev-parse --short HEAD).Trim()
$manifest = [ordered]@{
    name = 'DreamHiring'
    version = '1.0.0'
    commit = $commit
    builtAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    timezone = 'Asia/Shanghai'
    backendJar = 'backend.jar'
    frontendRoot = 'frontend'
}
$manifestPath = Join-Path $releaseRoot 'release-manifest.json'
[System.IO.File]::WriteAllText(
    $manifestPath,
    ($manifest | ConvertTo-Json),
    [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Release created: $releaseRoot"

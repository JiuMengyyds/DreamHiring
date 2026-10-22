param(
    [switch]$RequireNginx
)

$ErrorActionPreference = 'Stop'

$testDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$deployDir = Split-Path -Parent $testDir
$projectRoot = Split-Path -Parent $deployDir
$nginxRoot = 'E:\develop\tools\nginx\current'
$testRoot = Join-Path $nginxRoot "temp\dreamhiring-nginx-test-$PID"

try {
    foreach ($testFile in @('deployment.tests.mjs', 'repository-hygiene.tests.mjs')) {
        node (Join-Path $testDir $testFile)
        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }

    $nginxBinary = Join-Path $nginxRoot 'nginx.exe'
    if (-not (Test-Path -LiteralPath $nginxBinary)) {
        if ($RequireNginx) {
            throw "Nginx binary not found: $nginxBinary"
        }
        Write-Output 'Nginx syntax check skipped: nginx.exe was not found.'
        exit 0
    }

    foreach ($directory in @('logs', 'temp\client_body_temp', 'temp\proxy_temp', 'temp\fastcgi_temp', 'temp\uwsgi_temp', 'temp\scgi_temp')) {
        New-Item -ItemType Directory -Path (Join-Path $testRoot $directory) -Force | Out-Null
    }
    $mimeTypes = (Join-Path $nginxRoot 'conf\mime.types').Replace('\', '/')
    $siteConfig = (Join-Path $deployDir 'nginx\dreamhiring.conf').Replace('\', '/')
    $nginxConfigPath = Join-Path $testRoot 'nginx.conf'
    $nginxConfig = @"
worker_processes 1;
error_log logs/error.log notice;
pid logs/nginx.pid;

events {
    worker_connections 64;
}

http {
    include "$mimeTypes";
    include "$siteConfig";
}
"@
    [System.IO.File]::WriteAllText(
        $nginxConfigPath,
        $nginxConfig,
        [System.Text.UTF8Encoding]::new($false)
    )

    Push-Location $nginxRoot
    try {
        & $nginxBinary -t -p "$testRoot\" -c $nginxConfigPath
        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    $resolvedTempRoot = [System.IO.Path]::GetFullPath((Join-Path $nginxRoot 'temp'))
    $resolvedTestRoot = [System.IO.Path]::GetFullPath($testRoot)
    if ($resolvedTestRoot.StartsWith($resolvedTempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $resolvedTestRoot)) {
        Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
    }
}

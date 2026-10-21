$ErrorActionPreference = 'Stop'

$testDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$architectureRoot = Split-Path -Parent $testDir
Push-Location $architectureRoot
try {
    node --test .\tests\architecture-doc.tests.mjs
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}

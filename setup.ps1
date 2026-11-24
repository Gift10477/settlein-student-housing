# Local installation helper. Existing configuration and database records are preserved.
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 24 first.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'server/.env'))) {
  Copy-Item -LiteralPath (Join-Path $projectRoot 'server/.env.example') -Destination (Join-Path $projectRoot 'server/.env')
  Write-Host 'Created server/.env. Configure MySQL credentials and create settlein_se_db, then run this script again.'
  exit 0
}
Push-Location $projectRoot
try {
  & npm.cmd ci --prefix server
  if ($LASTEXITCODE -ne 0) { throw 'Backend dependency installation failed.' }
  & npm.cmd ci --prefix app
  if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
  Push-Location server
  try {
    & npm.cmd run db:prepare
    if ($LASTEXITCODE -ne 0) { throw 'Database preparation failed. Check server/.env and the MySQL service.' }
  } finally { Pop-Location }
  Write-Host 'Ready. Run npm.cmd start in server, and npm.cmd run dev in app.'
} finally { Pop-Location }

param(
    [string]$ReleaseType = "patch"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting SchemAI Extension Release process ($ReleaseType)..." -ForegroundColor Cyan

# Load .env file if present
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)\s*=\s*(.*)\s*$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value)
        }
    }
}

# 1. Update version number
Write-Host "📦 Updating version number..." -ForegroundColor Yellow
npm version $ReleaseType

# 2. Package VSIX
Write-Host "🛠️ Packaging extension VSIX..." -ForegroundColor Yellow
npx vsce package --allow-missing-repository

# 3. Publish to Open VSX
$ovsxPat = [System.Environment]::GetEnvironmentVariable("OVSX_PAT")
if ($ovsxPat) {
    Write-Host "🌐 Publishing to Open VSX..." -ForegroundColor Green
    npx ovsx publish -p $ovsxPat
} else {
    Write-Host "⚠️ OVSX_PAT not set. Skipping Open VSX publication." -ForegroundColor Red
}

# 4. Push to GitHub
Write-Host "⬆️ Pushing changes & tags to GitHub..." -ForegroundColor Cyan
git push origin main --tags

Write-Host "✅ Release completed successfully!" -ForegroundColor Green

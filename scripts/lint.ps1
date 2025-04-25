# Lint Script for Bitcoin Protozoa
# This script runs ESLint on the codebase with various options

param (
    [switch]$fix = $false,
    [switch]$strict = $false,
    [string]$path = "src"
)

# Set ESLint command
$eslintCmd = "npx eslint"

# Add fix option if specified
if ($fix) {
    $eslintCmd += " --fix"
}

# Add max-warnings option if strict mode is enabled
if ($strict) {
    $eslintCmd += " --max-warnings=0"
}

# Add path
$eslintCmd += " $path"

# Display command
Write-Host "Running: $eslintCmd" -ForegroundColor Cyan

# Execute command
Invoke-Expression $eslintCmd

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host "Linting completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Linting found issues. Exit code: $LASTEXITCODE" -ForegroundColor Yellow
    
    if ($fix) {
        Write-Host "Some issues were automatically fixed. Re-run without --fix to see remaining issues." -ForegroundColor Cyan
    } else {
        Write-Host "Run with --fix option to automatically fix some issues: ./scripts/lint.ps1 -fix" -ForegroundColor Cyan
    }
}

exit $LASTEXITCODE

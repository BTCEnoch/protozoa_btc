# Format Script for Bitcoin Protozoa
# This script runs Prettier on the codebase with various options

param (
    [switch]$check = $false,
    [string]$path = "src"
)

# Set Prettier command
$prettierCmd = "npx prettier"

# Add check option if specified, otherwise use write mode
if ($check) {
    $prettierCmd += " --check"
} else {
    $prettierCmd += " --write"
}

# Add path
$prettierCmd += " `"$path/**/*.{ts,tsx,js,jsx,json,css,scss,md}`""

# Display command
Write-Host "Running: $prettierCmd" -ForegroundColor Cyan

# Execute command
Invoke-Expression $prettierCmd

# Check exit code
if ($LASTEXITCODE -eq 0) {
    if ($check) {
        Write-Host "All files are formatted correctly!" -ForegroundColor Green
    } else {
        Write-Host "Formatting completed successfully!" -ForegroundColor Green
    }
} else {
    if ($check) {
        Write-Host "Some files need formatting. Run without --check to format them." -ForegroundColor Yellow
        Write-Host "Run: ./scripts/format.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "Formatting encountered issues. Exit code: $LASTEXITCODE" -ForegroundColor Yellow
    }
}

exit $LASTEXITCODE

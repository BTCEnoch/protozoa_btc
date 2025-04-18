# Example: Check for missing <xaiArtifact> content
Get-ChildItem -Path "docs/" -Recurse -Filter "*.md" | ForEach-Object {
    $content = Get-Content $_.FullName
    if ($content -match "<xaiArtifact.*Placeholder.*
    ") {
Write-Host "Warning: Placeholder found in $($_.FullName)"
}
}
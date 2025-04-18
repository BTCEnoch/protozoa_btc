# Example: Patch visualService.ts for instanced rendering
$file = "src/domains/visualization/services/visualService.ts"
$content = Get-Content $file
$content -replace "useStandardRendering()", "useInstancedRendering()" | Set-Content $file
Write-Host "Applied instanced rendering optimization."
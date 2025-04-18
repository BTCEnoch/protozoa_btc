$systems = @("rng", "creature", "shared")
foreach ($system in $systems) {
    New-Item -ItemType Directory -Path "src/domains/$system/services" -Force
    New-Item -ItemType Directory -Path "src/domains/$system/interfaces" -Force
}

# Create boilerplate files
Set-Content -Path "src/domains/rng/services/rngSystem.ts" -Value "class RNGSystem { /* Implementation */ }"
Set-Content -Path "src/domains/creature/services/particleService.ts" -Value "class ParticleService { /* Implementation */ }"
Set-Content -Path "src/shared/services/StorageService.ts" -Value "class StorageService { /* Implementation */ }"

# Create test files
Set-Content -Path "tests/unit/rngSystem.test.ts" -Value "describe('RNGSystem', () => { /* Tests */ })"
Set-Content -Path "tests/unit/particleService.test.ts" -Value "describe('ParticleService', () => { /* Tests */ })"
Set-Content -Path "tests/unit/StorageService.test.ts" -Value "describe('StorageService', () => { /* Tests */ })"
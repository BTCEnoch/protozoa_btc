$domains = @("rng", "creature", "traits", "mutation", "visualization", "input", "gameTheory")
foreach ($domain in $domains) {
    New-Item -ItemType Directory -Path "src/domains/$domain/services" -Force
    New-Item -ItemType Directory -Path "src/domains/$domain/interfaces" -Force
}

New-Item -ItemType Directory -Path "src/shared/services" -Force
New-Item -ItemType Directory -Path "src/shared/lib" -Force
New-Item -ItemType Directory -Path "src/shared/interfaces" -Force
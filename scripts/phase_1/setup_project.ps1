git init
git remote add origin https://github.com/BTCEnoch/protozoa_btc.git
Write-Output "node_modules\n/dist\n.env\nold_src" > .gitignore
git add .gitignore
git commit -m "Initial commit"

npm create vite@latest protozoa -- --template react-ts
set-location protozoa
npm install

$packageJson = Get-Content package.json | ConvertFrom-Json
$packageJson.scripts += @{ lint = "eslint src/**/*.{ts,tsx}"; format = "prettier --write src/**/*.{ts,tsx,md}"; test = "jest" }
$packageJson | ConvertTo-Json | Set-Content package.json
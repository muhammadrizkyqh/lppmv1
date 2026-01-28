# Script untuk mengukur baseline sebelum standalone build
# Untuk jurnal: Section 6.1 - Size Comparison (Before)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BASELINE MEASUREMENT - BEFORE STANDALONE BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ukur total project size
Write-Host "[1] Total Project Size:" -ForegroundColor Yellow
$totalSize = (Get-ChildItem -Path . -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green
Write-Host ""

# 2. Ukur node_modules
Write-Host "[2] node_modules Size:" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $nodeModulesSize = (Get-ChildItem -Path "node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   $([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "   Not found - run 'npm install' first" -ForegroundColor Red
}
Write-Host ""

# 3. Ukur source code
Write-Host "[3] Source Code Size (app/, components/, lib/):" -ForegroundColor Yellow
$sourceSize = 0
if (Test-Path "app") {
    $sourceSize += (Get-ChildItem -Path "app" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}
if (Test-Path "components") {
    $sourceSize += (Get-ChildItem -Path "components" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}
if (Test-Path "lib") {
    $sourceSize += (Get-ChildItem -Path "lib" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}
Write-Host "   $([math]::Round($sourceSize / 1MB, 2)) MB" -ForegroundColor Green
Write-Host ""

# 4. Ukur .next (jika ada)
Write-Host "[4] Current .next Build Size:" -ForegroundColor Yellow
if (Test-Path ".next") {
    $nextSize = (Get-ChildItem -Path ".next" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   $([math]::Round($nextSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "   Not found - will build next..." -ForegroundColor Yellow
}
Write-Host ""

# 5. Ukur prisma
Write-Host "[5] Prisma Files Size:" -ForegroundColor Yellow
if (Test-Path "prisma") {
    $prismaSize = (Get-ChildItem -Path "prisma" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   $([math]::Round($prismaSize, 2)) MB" -ForegroundColor Green
}
Write-Host ""

# 6. Estimasi traditional deployment
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRADITIONAL DEPLOYMENT ESTIMATE:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$traditionalTotal = $sourceSize/1MB + $nodeModulesSize + $nextSize
Write-Host "Source + node_modules + .next = $([math]::Round($traditionalTotal, 2)) MB" -ForegroundColor Magenta
Write-Host ""

Write-Host "Baseline measurement complete!" -ForegroundColor Green
Write-Host "Save these numbers for your journal!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run build' to ensure normal build works" -ForegroundColor White
Write-Host "2. Then we will configure standalone build" -ForegroundColor White

# Deploy Prisma Update Script (Windows PowerShell)
# Jalankan setelah perubahan Prisma schema

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying Prisma Schema Changes" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# 2. Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 3. Push schema changes
Write-Host ""
Write-Host "🗄️  Pushing schema to database..." -ForegroundColor Yellow
npx prisma db push

# 4. Build Next.js
Write-Host ""
Write-Host "🏗️  Building Next.js application..." -ForegroundColor Yellow
npm run build

# Jika menggunakan PM2 di Windows
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "🔄 Restarting PM2..." -ForegroundColor Yellow
    pm2 restart lppmv1
    
    Write-Host ""
    Write-Host "✅ Checking PM2 status..." -ForegroundColor Yellow
    pm2 list
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✨ Deployment completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Magenta
Write-Host "- Check logs: pm2 logs lppmv1"
Write-Host "- Manual restart: pm2 restart lppmv1"
Write-Host "- Check status: pm2 status"

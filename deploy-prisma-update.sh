#!/bin/bash

# Script untuk deploy setelah perubahan Prisma schema
# Jalankan di VPS setelah git pull

echo "=========================================="
echo "🚀 Deploying Prisma Schema Changes"
echo "=========================================="

# 1. Install dependencies jika ada yang baru
echo ""
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 3. Push schema changes ke database (untuk production)
echo ""
echo "🗄️  Pushing schema to database..."
npx prisma db push

# Alternatif: Jika menggunakan migrations (lebih aman untuk production)
# npx prisma migrate deploy

# 4. Build aplikasi Next.js
echo ""
echo "🏗️  Building Next.js application..."
npm run build

# 5. Restart PM2
echo ""
echo "🔄 Restarting PM2..."
pm2 restart lppmv1

# 6. Check status
echo ""
echo "✅ Checking PM2 status..."
pm2 list

echo ""
echo "=========================================="
echo "✨ Deployment completed!"
echo "=========================================="
echo ""
echo "💡 Tips:"
echo "- Jika masih error, cek logs: pm2 logs lppmv1"
echo "- Restart manual jika perlu: pm2 restart lppmv1"
echo "- Cek status: pm2 status"

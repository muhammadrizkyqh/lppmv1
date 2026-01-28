#!/bin/bash

set -e

echo "🚀 Preparing Next.js Standalone Deployment"
echo "=========================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build application
echo "🏗️  Building application..."
npm run build

# Prepare standalone directory
echo "📦 Preparing standalone package..."

# Copy static assets
echo "  ↳ Copying public files..."
cp -r public .next/standalone/ 2>/dev/null || echo "  ⚠️  No public folder found"

echo "  ↳ Copying .next/static..."
cp -r .next/static .next/standalone/.next/

# Copy Prisma files
echo "  ↳ Copying Prisma schema..."
cp -r prisma .next/standalone/

# Copy environment file
echo "  ↳ Copying environment file..."
cp .env.production .next/standalone/.env 2>/dev/null || cp .env .next/standalone/.env 2>/dev/null || echo "  ⚠️  No .env file found"

# Create uploads directory
echo "  ↳ Creating uploads directory..."
mkdir -p .next/standalone/public/uploads

# Calculate sizes
echo ""
echo "📊 Size Analysis:"
echo "  Standalone build size:"
du -sh .next/standalone/ | awk '{print "  " $1}'

echo ""
echo "✅ Standalone build ready!"
echo "📍 Location: .next/standalone/"
echo ""
echo "🎯 To test locally:"
echo "   cd .next/standalone"
echo "   node server.js"
echo ""
echo "🚀 To deploy:"
echo "   Upload .next/standalone/ folder to your server"
echo "   Run: node server.js"

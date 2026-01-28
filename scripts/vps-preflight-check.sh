#!/bin/bash

# Script untuk mengumpulkan informasi VPS sebelum migrasi ke standalone
# Jalankan di VPS: ssh deploy@your-vps 'bash -s' < vps-preflight-check.sh

echo "=========================================="
echo "🔍 VPS PRE-MIGRATION CHECKLIST"
echo "=========================================="
echo ""

# 1. Current deployment structure
echo "1️⃣ Current Deployment Structure:"
echo "-----------------------------------"
if [ -d "/home/deploy/lppmv1" ]; then
    echo "✅ lppmv1 folder exists"
    echo "   Location: /home/deploy/lppmv1"
    echo "   Size: $(du -sh /home/deploy/lppmv1 | cut -f1)"
    echo ""
    echo "   Contents:"
    ls -la /home/deploy/lppmv1/ | head -20
else
    echo "❌ lppmv1 folder NOT found!"
fi
echo ""

# 2. PM2 Status
echo "2️⃣ PM2 Current Status:"
echo "-----------------------------------"
if command -v pm2 &> /dev/null; then
    pm2 list
    echo ""
    echo "   PM2 Config:"
    pm2 show lppm 2>/dev/null || echo "   ⚠️ No PM2 process named 'lppm'"
else
    echo "❌ PM2 not installed!"
fi
echo ""

# 3. Node.js version
echo "3️⃣ Node.js Environment:"
echo "-----------------------------------"
if command -v node &> /dev/null; then
    echo "   Node version: $(node -v)"
    echo "   NPM version: $(npm -v)"
    echo "   Node path: $(which node)"
else
    echo "❌ Node.js not installed!"
fi
echo ""

# 4. Environment Variables
echo "4️⃣ Environment Configuration:"
echo "-----------------------------------"
if [ -f "/home/deploy/.env.production" ]; then
    echo "✅ .env.production exists"
    echo "   Location: /home/deploy/.env.production"
    echo "   Size: $(wc -c < /home/deploy/.env.production) bytes"
    echo ""
    echo "   Variables (keys only):"
    grep -v '^#' /home/deploy/.env.production | grep '=' | cut -d'=' -f1 | sed 's/^/   - /'
else
    echo "⚠️ No .env.production in /home/deploy/"
    if [ -f "/home/deploy/lppmv1/.env" ]; then
        echo "   Found .env in lppmv1 folder instead"
    fi
fi
echo ""

# 5. Database Status
echo "5️⃣ Database Connection:"
echo "-----------------------------------"
if [ -f "/home/deploy/lppmv1/prisma/schema.prisma" ]; then
    echo "✅ Prisma schema found"
    echo ""
    echo "   Database URL (masked):"
    grep -E "DATABASE_URL" /home/deploy/.env.production /home/deploy/lppmv1/.env 2>/dev/null | head -1 | sed 's/:[^:]*@/:***@/g'
else
    echo "⚠️ No Prisma schema found"
fi
echo ""

# 6. Package.json info
echo "6️⃣ Current Package Info:"
echo "-----------------------------------"
if [ -f "/home/deploy/lppmv1/package.json" ]; then
    echo "   Next.js version:"
    grep '"next"' /home/deploy/lppmv1/package.json || echo "   Not found in package.json"
    echo ""
    echo "   Scripts:"
    grep -A 10 '"scripts"' /home/deploy/lppmv1/package.json | grep ':' | head -5
else
    echo "⚠️ No package.json found"
fi
echo ""

# 7. Current .next folder structure
echo "7️⃣ Current Build Structure:"
echo "-----------------------------------"
if [ -d "/home/deploy/lppmv1/.next" ]; then
    echo "✅ .next folder exists"
    echo "   Size: $(du -sh /home/deploy/lppmv1/.next | cut -f1)"
    echo ""
    echo "   Contains standalone?"
    if [ -d "/home/deploy/lppmv1/.next/standalone" ]; then
        echo "   ✅ YES - Already using standalone!"
        echo "   Standalone size: $(du -sh /home/deploy/lppmv1/.next/standalone | cut -f1)"
    else
        echo "   ❌ NO - Using traditional build"
    fi
else
    echo "⚠️ No .next folder found"
fi
echo ""

# 8. Disk space
echo "8️⃣ Disk Space:"
echo "-----------------------------------"
df -h /home/deploy | grep -v Filesystem
echo ""
echo "   Available: $(df -h /home/deploy | awk 'NR==2 {print $4}')"
echo ""

# 9. Current PM2 ecosystem
echo "9️⃣ PM2 Ecosystem Config:"
echo "-----------------------------------"
if [ -f "/home/deploy/lppmv1/ecosystem.config.js" ]; then
    echo "✅ ecosystem.config.js exists"
    echo ""
    cat /home/deploy/lppmv1/ecosystem.config.js
else
    echo "⚠️ No ecosystem.config.js found"
    echo "   PM2 might be using manual start command"
fi
echo ""

# 10. Nginx/Apache config
echo "🔟 Web Server Configuration:"
echo "-----------------------------------"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    echo "   Config files in /etc/nginx/sites-enabled/:"
    ls /etc/nginx/sites-enabled/ 2>/dev/null || echo "   (permission denied)"
elif systemctl is-active --quiet apache2; then
    echo "✅ Apache is running"
else
    echo "⚠️ No web server detected (might be direct port access)"
fi
echo ""

# 11. Public uploads folder
echo "1️⃣1️⃣ Uploads Folder:"
echo "-----------------------------------"
if [ -d "/home/deploy/lppmv1/public/uploads" ]; then
    echo "✅ Uploads folder exists"
    echo "   Size: $(du -sh /home/deploy/lppmv1/public/uploads | cut -f1)"
    echo "   Files: $(find /home/deploy/lppmv1/public/uploads -type f | wc -l)"
    echo "   Permissions: $(ls -ld /home/deploy/lppmv1/public/uploads | awk '{print $1, $3, $4}')"
else
    echo "⚠️ No uploads folder found"
fi
echo ""

# Summary
echo "=========================================="
echo "📋 MIGRATION READINESS SUMMARY"
echo "=========================================="
echo ""

ISSUES=0

# Check critical items
if [ ! -d "/home/deploy/lppmv1" ]; then
    echo "❌ Application folder missing"
    ((ISSUES++))
fi

if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not installed"
    ((ISSUES++))
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed"
    ((ISSUES++))
fi

if [ ! -f "/home/deploy/.env.production" ] && [ ! -f "/home/deploy/lppmv1/.env" ]; then
    echo "⚠️ WARNING: No environment file found"
    ((ISSUES++))
fi

AVAIL_SPACE=$(df /home/deploy | awk 'NR==2 {print $4}')
if [ "$AVAIL_SPACE" -lt 1000000 ]; then
    echo "⚠️ WARNING: Low disk space (< 1GB available)"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ All checks passed! Safe to proceed with migration."
    echo ""
    echo "📝 RECOMMENDED ACTIONS:"
    echo "   1. Backup VPS before deployment (automatic in workflow)"
    echo "   2. Keep current .env.production file"
    echo "   3. Monitor first deployment closely"
else
    echo "⚠️ Found $ISSUES issue(s). Please review above."
    echo ""
    echo "📝 REQUIRED ACTIONS BEFORE MIGRATION:"
    echo "   1. Fix issues listed above"
    echo "   2. Re-run this check"
    echo "   3. Proceed only when all checks pass"
fi

echo ""
echo "=========================================="
echo "Generated: $(date)"
echo "=========================================="

# 🚀 Deployment Guide - Standalone Build

## ⚠️ PENTING: Perubahan Deployment

Project ini sekarang menggunakan **Next.js Standalone Build** untuk deployment yang lebih efisien.

### 📊 Perbedaan dengan Deployment Lama:

| Aspect | Traditional (OLD) | Standalone (NEW) |
|--------|------------------|------------------|
| **Package Size** | ~1.6 GB | **384 MB** (76% lebih kecil) |
| **Upload Time** | ~21 menit | **~5 menit** |
| **VPS Storage** | 1.6 GB | **384 MB** |
| **Dependencies** | npm install di VPS | **Pre-bundled** |
| **Cold Start** | 3-5 detik | **0.109 detik** |
| **Command** | `npm start` | **`node server.js`** |

---

## 🔄 GitHub Actions Workflow (Auto Deploy)

### **Sudah Di-Update untuk Standalone!**

Workflow di `.github/workflows/deploy.yml` sudah di-update dengan:

✅ Build standalone di GitHub Actions runner
✅ Copy `.next/standalone/` folder (bukan `.next/`)
✅ Bundle semua dependencies (tidak perlu `npm install` di VPS)
✅ Deploy server.js standalone
✅ PM2 ecosystem config untuk standalone
✅ Automatic backup sebelum deploy
✅ Verification checks

### **Proses Auto Deploy:**

```
1. Push ke branch master
   ↓
2. GitHub Actions trigger
   ↓
3. Build dengan standalone mode
   ↓
4. Prepare deployment package (~384 MB)
   ↓
5. Upload ke VPS via rsync
   ↓
6. Extract & replace di VPS
   ↓
7. Run Prisma migrations
   ↓
8. Restart PM2 dengan server.js
   ↓
9. Verify app responding
   ↓
10. ✅ Deployment complete!
```

---

## 🛡️ Safety Features

### **Backup Otomatis:**
- Setiap deploy, folder lama di-backup sebagai `lppmv1-backup-YYYYMMDD_HHMMSS.tar.gz`
- Menyimpan 3 backup terakhir
- Lokasi: `/home/deploy/`

### **Rollback Jika Ada Masalah:**

```bash
# SSH ke VPS
ssh deploy@your-vps-ip

# Stop app
pm2 stop lppm

# Restore dari backup terakhir
cd /home/deploy
tar -xzf lppmv1-backup-YYYYMMDD_HHMMSS.tar.gz

# Restart
cd lppmv1
pm2 start ecosystem.config.js

# Verify
pm2 logs lppm
```

### **Verification Checks:**
- ✅ Verify `server.js` exists
- ✅ Verify `.next` folder structure
- ✅ Verify Prisma schema
- ✅ Test app responding on localhost:3000

---

## 📋 Manual Deployment (Jika Diperlukan)

### **1. Build Lokal:**

```bash
# Di local machine
npm run build
npm run deploy:prepare

# Package akan dibuat di .next/standalone/
```

### **2. Upload ke VPS:**

```bash
# Compress standalone folder
cd .next/standalone
tar -czf standalone-deploy.tar.gz *

# Upload
scp standalone-deploy.tar.gz deploy@your-vps:/home/deploy/
```

### **3. Deploy di VPS:**

```bash
# SSH ke VPS
ssh deploy@your-vps-ip

# Backup current
cd /home/deploy
pm2 stop lppm
tar -czf lppmv1-backup-$(date +%Y%m%d_%H%M%S).tar.gz lppmv1

# Extract new build
rm -rf lppmv1
mkdir lppmv1
cd lppmv1
tar -xzf ../standalone-deploy.tar.gz

# Copy environment variables
cp /home/deploy/.env.production .env

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start server.js --name lppm

# Or use ecosystem config
pm2 start ecosystem.config.js

# Save config
pm2 save

# Check logs
pm2 logs lppm
```

---

## 🔧 Environment Variables di VPS

**File:** `/home/deploy/.env.production`

Pastikan ada:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lppm"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

---

## 📊 Monitoring

### **Check Application Status:**

```bash
# PM2 status
pm2 status lppm

# Live logs
pm2 logs lppm

# Last 100 lines
pm2 logs lppm --lines 100

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart lppm
```

### **Check Disk Usage:**

```bash
# Before standalone: ~1.6 GB
# After standalone: ~384 MB

du -sh /home/deploy/lppmv1
```

---

## ⚡ Performance Gains

### **Cold Start Time:**
```
Traditional: 3-5 seconds
Standalone:  0.109 seconds (109ms)
Improvement: 97% faster! 🚀
```

### **Deployment Time:**
```
Traditional: ~21 minutes (upload + npm install)
Standalone:  ~5 minutes (upload only, no npm install)
Improvement: 76% faster! ⚡
```

### **Storage on VPS:**
```
Traditional: 1,609 MB
Standalone:  384 MB
Savings:     1,225 MB (~1.2 GB)
```

---

## 🔍 Troubleshooting

### **Problem: App tidak start setelah deploy**

```bash
# Check PM2 logs
pm2 logs lppm --lines 50

# Check jika server.js ada
ls -la /home/deploy/lppmv1/server.js

# Check environment variables
cat /home/deploy/lppmv1/.env

# Manual start dengan verbose
cd /home/deploy/lppmv1
NODE_ENV=production node server.js
```

### **Problem: Database connection error**

```bash
# Check DATABASE_URL
grep DATABASE_URL /home/deploy/lppmv1/.env

# Test Prisma connection
cd /home/deploy/lppmv1
npx prisma db pull

# Regenerate Prisma Client (jika perlu)
npx prisma generate
```

### **Problem: File uploads tidak berfungsi**

```bash
# Check uploads folder permissions
ls -la /home/deploy/lppmv1/public/uploads
chmod 755 /home/deploy/lppmv1/public/uploads

# Create if missing
mkdir -p /home/deploy/lppmv1/public/uploads
```

---

## 📝 First Time Deployment ke VPS Baru

### **Setup VPS untuk Standalone:**

```bash
# 1. SSH ke VPS
ssh deploy@your-vps-ip

# 2. Install Node.js (jika belum)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24

# 3. Install PM2
npm install -g pm2

# 4. Setup PM2 startup
pm2 startup systemd

# 5. Install PostgreSQL (jika belum)
sudo apt update
sudo apt install postgresql postgresql-contrib

# 6. Create database
sudo -u postgres createdb lppm

# 7. Create .env.production
cd /home/deploy
nano .env.production
# Isi dengan DATABASE_URL, NEXTAUTH_SECRET, dll

# 8. Clone repo atau upload files
# (Gunakan GitHub Actions workflow)

# 9. Aplikasi akan auto-deploy setelah push ke master!
```

---

## ✅ Checklist Sebelum Deploy

**GitHub Actions Secrets:**
- [ ] `VPS_SSH_KEY` - SSH private key
- [ ] `VPS_HOST` - IP atau domain VPS
- [ ] `VPS_USER` - Username (misal: deploy)

**VPS Setup:**
- [ ] Node.js 24 installed
- [ ] PM2 installed
- [ ] PostgreSQL running
- [ ] Database created
- [ ] `.env.production` file ada
- [ ] Directory `/home/deploy/lppmv1` exists atau akan dibuat

**Code Ready:**
- [ ] `next.config.ts` ada `output: 'standalone'`
- [ ] `scripts/deploy-prepare.js` ada
- [ ] `.github/workflows/deploy.yml` sudah di-update
- [ ] `ecosystem.config.js` ada di root

---

## 🎉 Keuntungan Standalone Deployment

1. ✅ **76% lebih kecil** - Upload lebih cepat
2. ✅ **97% cold start lebih cepat** - 0.109s startup
3. ✅ **Tidak perlu npm install di VPS** - Dependencies sudah bundled
4. ✅ **Lebih aman** - Hanya runtime code, no source
5. ✅ **Lebih murah** - Hemat storage & bandwidth
6. ✅ **Lebih reliable** - Dependency version locked

---

## 📞 Need Help?

Jika ada masalah:
1. Check PM2 logs: `pm2 logs lppm`
2. Check GitHub Actions logs di GitHub repo
3. Verify `.env` variables
4. Check Prisma connection
5. Rollback ke backup jika perlu

---

**Last Updated:** January 2026
**Deployment Mode:** Standalone Build
**Status:** ✅ Production Ready

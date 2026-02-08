# 🧹 Cleanup & Maintenance Scripts

## 📋 Available Scripts

### 1. **Local Cleanup** (`npm run cleanup`)

Membersihkan file build lokal yang tidak diperlukan:
- `.next/` - Build output Next.js
- `tsconfig.tsbuildinfo` - TypeScript build cache
- `node_modules/.cache/` - Build cache

```bash
# Run cleanup
npm run cleanup
```

**Kapan digunakan:**
- Setelah testing build lokal
- Sebelum push ke git (pastikan folder build bersih)
- Ketika ingin free up disk space
- Sebelum rebuild untuk memastikan clean build

---

### 2. **VPS Cleanup** (`scripts/cleanup-vps.sh`)

Script comprehensive untuk membersihkan VPS dan mengoptimalkan performa.

#### 🚀 Cara Penggunaan:

**Option 1: Run langsung di VPS**
```bash
# SSH ke VPS
ssh deploy@your-vps-ip

# Go to project directory
cd lppmv1

# Make script executable
chmod +x scripts/cleanup-vps.sh

# Run cleanup
bash scripts/cleanup-vps.sh
```

**Option 2: Run dari local (remote execution)**
```bash
# From your local machine
ssh deploy@your-vps-ip 'bash -s' < scripts/cleanup-vps.sh
```

**Option 3: Add to PATH untuk akses mudah**
```bash
# Di VPS, tambahkan alias ke ~/.bashrc
echo "alias cleanup='bash ~/lppmv1/scripts/cleanup-vps.sh'" >> ~/.bashrc
source ~/.bashrc

# Sekarang bisa run dengan:
cleanup
```

#### 🎯 Apa yang Di-cleanup:

1. **Old Project Folders** ✅
   - Menghapus semua folder project kecuali `lppmv1` dan `uploads-persistent`
   - Interaktif - akan tanya konfirmasi dulu

2. **PM2 Processes** ✅
   - Menghapus PM2 processes lama (kecuali `lppm`)
   - Flush old logs
   - Save clean configuration

3. **Old Backups** ✅
   - Keep only last 3 backups
   - Remove older backup files
   - Show remaining backups

4. **Package Manager Caches** ✅
   - Clean npm cache
   - Clean yarn cache (if exists)
   - Free up space from cached packages

5. **Old Log Files** ✅
   - Remove PM2 logs older than 7 days
   - Clean system journal (if accessible)
   - Keep recent logs for debugging

6. **Temporary Files** ✅
   - Remove deployment tar files
   - Clean /tmp directory
   - Remove unused temp files

#### 📊 Output Example:

```
🧹 VPS Cleanup Script
============================================================
Starting cleanup process...

ℹ️  Initial disk usage: 2.1G

📁 Step 1: Cleaning old project folders
============================================================
Current project folders:
  old-project-1/
  old-project-2/
  test-app/

⚠️  This will remove ALL project folders except 'lppmv1' and 'uploads-persistent'
Do you want to remove old project folders? (y/n) y

✅ Removed old-project-1/
✅ Removed old-project-2/
✅ Removed test-app/

...

📊 Cleanup Summary
============================================================
✅ Initial usage: 2.1G
✅ Final usage: 1.3G

✨ Cleanup complete!
```

---

## 🔧 Maintenance Best Practices

### **Regular Cleanup Schedule:**

```bash
# Weekly cleanup (recommended)
0 2 * * 0 /home/deploy/lppmv1/scripts/cleanup-vps.sh > /dev/null 2>&1
```

Add to crontab:
```bash
crontab -e
# Add line above
```

### **Before Each Deployment:**

```bash
# 1. Clean local build
npm run cleanup

# 2. Build & prepare
npm run build
npm run deploy:prepare

# 3. Commit & push (triggers auto-deploy)
git add .
git commit -m "Deploy: your message"
git push
```

### **After Deployment Issues:**

```bash
# SSH to VPS
ssh deploy@your-vps-ip

# Check PM2 status
pm2 status lppm

# Check logs
pm2 logs lppm --lines 100

# Restart if needed
pm2 restart lppm

# Run cleanup if disk space low
bash lppmv1/scripts/cleanup-vps.sh
```

---

## 🐛 Troubleshooting

### **Issue: Upload files 404**

**Cause:** Symlink tidak terbuat dengan benar di VPS

**Solution:**
```bash
# SSH to VPS
cd /home/deploy/lppmv1

# Check symlink
ls -la public/uploads

# If not symlinked, create manually:
rm -rf public/uploads
ln -s /home/deploy/uploads-persistent public/uploads

# Verify
ls -la public/uploads
# Should show: public/uploads -> /home/deploy/uploads-persistent

# Restart app
pm2 restart lppm
```

### **Issue: Build folder error locally**

**Cause:** Old build conflicts

**Solution:**
```bash
# Run cleanup
npm run cleanup

# Rebuild
npm run build
```

### **Issue: Disk space full on VPS**

**Solution:**
```bash
# Check disk usage
df -h

# Run comprehensive cleanup
bash scripts/cleanup-vps.sh

# Check largest directories
du -sh /home/deploy/*/ | sort -hr | head -10

# If still full, check uploads
du -sh /home/deploy/uploads-persistent
```

---

## 📈 Monitoring

### **Check Disk Usage:**
```bash
# Overall
df -h

# Project folders
du -sh /home/deploy/*/

# Uploads folder
du -sh /home/deploy/uploads-persistent
```

### **Check Process Status:**
```bash
# PM2 status
pm2 status

# Resource usage
pm2 monit

# Logs
pm2 logs lppm
```

---

## 🎯 Quick Commands Reference

```bash
# Local
npm run cleanup              # Clean local build files
npm run build                # Build for production
npm run deploy:prepare       # Prepare standalone package

# VPS
pm2 status lppm             # Check app status
pm2 logs lppm               # View logs
pm2 restart lppm            # Restart app
pm2 monit                   # Monitor resources
bash scripts/cleanup-vps.sh # Run cleanup
df -h                       # Check disk space
du -sh /home/deploy/*/      # Check folder sizes
```

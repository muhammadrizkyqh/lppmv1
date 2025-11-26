# 🚀 Quick Deployment Commands

## Di VPS (Linux/Ubuntu)

### Setelah Perubahan Prisma Schema

```bash
# Cara 1: Gunakan script otomatis (RECOMMENDED)
./deploy-prisma-update.sh

# Cara 2: Gunakan npm script
npm run deploy:full

# Cara 3: Manual step-by-step
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart lppmv1
```

---

## Troubleshooting di VPS

### Jika Build Gagal

```bash
# Hapus cache dan build ulang
rm -rf .next
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Jika PM2 Error

```bash
# Stop dan delete
pm2 stop lppmv1
pm2 delete lppmv1

# Build ulang
npm run build

# Start fresh
pm2 start npm --name lppmv1 -- start
pm2 save
pm2 list
```

### Jika Database Error

```bash
# Cek koneksi database
npx prisma db pull

# Force push schema
npx prisma db push --force-reset  # HATI-HATI: ini akan reset data!

# Atau gunakan migration
npx prisma migrate deploy
```

---

## Cek Status & Logs

```bash
# Status PM2
pm2 status
pm2 list

# Lihat logs
pm2 logs lppmv1
pm2 logs lppmv1 --lines 100
pm2 logs lppmv1 --err  # error logs saja

# Monitor resources
pm2 monit

# Clear logs
pm2 flush
```

---

## Full Reset (Jika Semua Gagal)

```bash
# LANGKAH TERAKHIR - Full reset
pm2 delete lppmv1
rm -rf .next
rm -rf node_modules/.prisma
npm ci  # atau npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start npm --name lppmv1 -- start
pm2 save
```

---

## Commands Cepat

```bash
# Quick restart setelah code changes (tanpa schema changes)
npm run build && pm2 restart lppmv1

# Quick deploy setelah schema changes
npm run deploy:full

# Cek logs terakhir
pm2 logs lppmv1 --lines 50

# Reload tanpa downtime
pm2 reload lppmv1
```

---

## 📋 Flow Deployment Prisma

```
1. git pull origin master
   ↓
2. npm install (jika ada dependency baru)
   ↓
3. npx prisma generate ⚠️ WAJIB!
   ↓
4. npx prisma db push (update database)
   ↓
5. npm run build
   ↓
6. pm2 restart lppmv1
   ↓
7. pm2 logs lppmv1 (cek hasil)
```

---

## ⚡ Super Quick Reference

| Situasi | Command |
|---------|---------|
| Perubahan schema Prisma | `./deploy-prisma-update.sh` |
| Perubahan code saja | `npm run build && pm2 restart lppmv1` |
| Prisma generate saja | `npx prisma generate` |
| Lihat logs | `pm2 logs lppmv1` |
| Restart PM2 | `pm2 restart lppmv1` |
| Full reset | Lihat section "Full Reset" |

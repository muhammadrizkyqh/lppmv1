# 🚀 Deployment Guide - Prisma Schema Changes

## Masalah Umum Setelah Update Prisma

Ketika Anda melakukan perubahan pada `prisma/schema.prisma`, deployment di VPS memerlukan langkah-langkah khusus.

### ❌ Error yang Sering Muncul:
1. **Type errors** - Prisma Client belum di-generate ulang
2. **Build failed** - Schema tidak sync dengan database
3. **PM2 restart gagal** - Build error belum resolved

---

## ✅ Cara Deploy Setelah Perubahan Prisma

### Opsi 1: Menggunakan Script Otomatis (Recommended)

```bash
# Di VPS, setelah git pull
chmod +x deploy-prisma-update.sh
./deploy-prisma-update.sh
```

### Opsi 2: Manual Step-by-Step

```bash
# 1. Pull perubahan terbaru
git pull origin master

# 2. Install dependencies (jika ada perubahan package.json)
npm install

# 3. Generate Prisma Client (PENTING!)
npx prisma generate

# 4. Update database schema
# Pilih salah satu:
npx prisma db push           # Untuk development/quick updates
# ATAU
npx prisma migrate deploy    # Untuk production (lebih aman)

# 5. Build Next.js
npm run build

# 6. Restart PM2
pm2 restart lppmv1

# 7. Cek status
pm2 status
pm2 logs lppmv1 --lines 50
```

---

## 🔍 Troubleshooting

### Build Error: "Type error in ..."

**Penyebab:** Prisma Client belum di-generate atau tidak sync dengan schema.

**Solusi:**
```bash
# Hapus cache dan generate ulang
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Database Schema Tidak Sync

**Penyebab:** Schema berubah tapi database belum di-update.

**Solusi:**
```bash
# Cek status database
npx prisma db push --preview-feature

# Atau gunakan migration
npx prisma migrate deploy
```

### PM2 Restart Gagal

**Penyebab:** Build masih error atau ada proses yang tertahan.

**Solusi:**
```bash
# Stop semua instance
pm2 stop lppmv1
pm2 delete lppmv1

# Build ulang
npm run build

# Start ulang
pm2 start npm --name lppmv1 -- start
pm2 save
```

---

## 📋 Checklist Deployment

- [ ] Git pull terbaru
- [ ] `npm install` (jika ada dependency baru)
- [ ] `npx prisma generate` (WAJIB setelah perubahan schema)
- [ ] `npx prisma db push` atau `npx prisma migrate deploy`
- [ ] `npm run build` (pastikan sukses)
- [ ] `pm2 restart lppmv1`
- [ ] `pm2 logs lppmv1` (cek tidak ada error)
- [ ] Test aplikasi di browser

---

## 🎯 Best Practices

### 1. **Selalu Generate Prisma Client**
Setiap kali ada perubahan schema, jalankan:
```bash
npx prisma generate
```

### 2. **Gunakan Migrations untuk Production**
Untuk production, lebih baik gunakan migrations daripada `db push`:
```bash
# Di development
npx prisma migrate dev --name nama_perubahan

# Di production
npx prisma migrate deploy
```

### 3. **Test Build Sebelum Deploy**
Pastikan build sukses sebelum restart PM2:
```bash
npm run build
# Jika sukses, baru restart PM2
```

### 4. **Backup Database**
Sebelum perubahan schema besar:
```bash
# PostgreSQL
pg_dump -U username -d database_name > backup.sql

# MySQL
mysqldump -u username -p database_name > backup.sql
```

---

## 🔧 Setup PM2 dengan Ecosystem

Buat file `ecosystem.config.js` untuk konfigurasi PM2 yang lebih baik:

```javascript
module.exports = {
  apps: [{
    name: 'lppmv1',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/lppmv1',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
}
```

Start dengan:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 📝 Log Monitoring

```bash
# Lihat real-time logs
pm2 logs lppmv1

# Lihat 100 baris terakhir
pm2 logs lppmv1 --lines 100

# Clear logs
pm2 flush

# Monitor resource usage
pm2 monit
```

---

## 🆘 Quick Fix Commands

```bash
# Full reset (jika semua gagal)
pm2 delete lppmv1
rm -rf .next
rm -rf node_modules/.prisma
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start npm --name lppmv1 -- start
pm2 save

# Restart cepat (setelah code changes ringan)
npm run build && pm2 restart lppmv1
```

# 🚀 CI/CD Deployment dengan GitHub Actions

## Overview

Aplikasi ini menggunakan **GitHub Actions** untuk otomatis deploy ke VPS setiap kali ada push ke branch `master`.

---

## ✅ Yang Sudah Dikonfigurasi

### Workflow File: `.github/workflows/deploy.yml`

Workflow ini akan otomatis:
1. ✅ Pull latest code dari GitHub
2. ✅ Install dependencies (`npm install`)
3. ✅ Generate Prisma Client (`npx prisma generate`)
4. ✅ Update database schema (`npx prisma db push`)
5. ✅ Build Next.js (`npm run build`)
6. ✅ Restart PM2 (`pm2 restart lppmv1`)

---

## 🔐 Secrets yang Diperlukan

Pastikan GitHub repository Anda memiliki secrets berikut:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | IP address atau domain VPS | `192.168.1.100` atau `example.com` |
| `VPS_USER` | Username SSH | `deploy` atau `root` |
| `VPS_SSH_KEY` | Private SSH key | Content dari `~/.ssh/id_rsa` |

### Cara Set Secrets:
1. Buka repository di GitHub
2. Go to: **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets di atas

---

## 🎯 Cara Deploy

### Otomatis (Recommended)
```bash
# Di local machine
git add .
git commit -m "Update prisma schema"
git push origin master

# GitHub Actions akan otomatis:
# 1. Trigger workflow
# 2. Deploy ke VPS
# 3. Restart aplikasi
```

### Manual Trigger
1. Buka repository di GitHub
2. Go to: **Actions** → **Deploy to VPS**
3. Klik **Run workflow** → **Run workflow**

---

## 📊 Monitoring Deployment

### Di GitHub
1. Buka repository di GitHub
2. Go to: **Actions** tab
3. Lihat status workflow terbaru
4. Klik workflow untuk melihat logs detail

### Di VPS
```bash
# Cek status PM2
pm2 status
pm2 list

# Lihat logs
pm2 logs lppmv1

# Lihat logs terakhir
pm2 logs lppmv1 --lines 50
```

---

## 🐛 Troubleshooting

### Deployment Gagal di GitHub Actions

**1. Check Workflow Logs:**
- Buka **Actions** tab di GitHub
- Klik pada workflow yang failed
- Lihat step mana yang error

**2. Common Issues:**

#### SSH Connection Failed
```
❌ Error: ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection refused
```
**Solusi:**
- Pastikan VPS menyala
- Cek firewall VPS (port 22 harus terbuka)
- Verifikasi `VPS_HOST` secret benar

#### Permission Denied
```
❌ Error: Permission denied (publickey)
```
**Solusi:**
- Pastikan `VPS_SSH_KEY` secret berisi private key yang benar
- Cek public key sudah ada di VPS: `~/.ssh/authorized_keys`
- Generate SSH key baru jika perlu

#### Build Failed
```
❌ Error: Failed to compile
```
**Solusi:**
- Cek error message di logs
- Biasanya karena TypeScript error atau missing dependencies
- Fix error di local, test `npm run build`, lalu push lagi

#### Prisma Generate Failed
```
❌ Error: Cannot find module '@prisma/client'
```
**Solusi:**
- Workflow sudah include `npx prisma generate`
- Jika masih error, SSH ke VPS dan run manual:
```bash
cd /home/deploy/lppmv1
npx prisma generate
npm run build
pm2 restart lppmv1
```

---

## 🔄 Rollback Deployment

Jika deployment baru bermasalah:

```bash
# SSH ke VPS
ssh deploy@your-vps-ip

# Rollback git
cd /home/deploy/lppmv1
git log --oneline -5  # Lihat 5 commit terakhir
git reset --hard <commit-hash>  # Rollback ke commit tertentu

# Rebuild
npx prisma generate
npx prisma db push
npm run build
pm2 restart lppmv1
```

---

## 🎨 Dua Workflow Options

### Option 1: `deploy.yml` (Current)
- Menggunakan `prisma db push`
- Lebih cepat
- Cocok untuk development/staging

### Option 2: `deploy-with-migrations.yml`
- Menggunakan `prisma migrate deploy`
- Lebih aman untuk production
- Track migration history
- Fallback ke `db push` jika migration gagal

**Untuk aktifkan Option 2:**
```bash
# Rename atau disable deploy.yml
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# Rename deploy-with-migrations.yml
mv .github/workflows/deploy-with-migrations.yml .github/workflows/deploy.yml
```

---

## 📝 Best Practices

### 1. Test Before Push
```bash
# Selalu test di local sebelum push
npm run build

# Test Prisma
npx prisma generate
npx prisma validate
```

### 2. Semantic Commit Messages
```bash
git commit -m "feat: add new monitoring feature"
git commit -m "fix: resolve TypeScript error in monitoring page"
git commit -m "chore: update prisma schema"
```

### 3. Branch Protection
- Enable branch protection untuk `master`
- Require PR review sebelum merge
- Setup staging branch untuk testing

### 4. Environment Variables
Jangan commit `.env` file! Pastikan `.env` di `.gitignore`:
```
# .gitignore
.env
.env.local
.env.production
```

Set environment variables di VPS:
```bash
# Di VPS
cd /home/deploy/lppmv1
nano .env

# Atau set di PM2 ecosystem file
```

---

## 🚨 Deployment Checklist

Sebelum push ke master:

- [ ] Test build locally: `npm run build`
- [ ] No TypeScript errors
- [ ] Prisma schema valid: `npx prisma validate`
- [ ] Commit message jelas
- [ ] `.env` tidak ter-commit
- [ ] Secrets di GitHub sudah benar

Setelah push:

- [ ] Cek GitHub Actions status (hijau ✅)
- [ ] Cek aplikasi di browser
- [ ] Cek PM2 logs: `pm2 logs lppmv1`
- [ ] Test fitur yang diubah

---

## 📞 Quick Commands

```bash
# Trigger manual deployment (jika workflow_dispatch enabled)
gh workflow run deploy.yml

# View workflow runs
gh run list

# View latest workflow logs
gh run view

# SSH to VPS
ssh deploy@your-vps-ip

# Check PM2 on VPS
pm2 list
pm2 logs lppmv1
pm2 restart lppmv1
```

---

## 🔗 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

# ✅ Pre-Deployment Checklist

Sebelum push ke GitHub, pastikan:

## 🔍 Local Testing

- [ ] **Build sukses tanpa error**
  ```bash
  npm run build
  ```

- [ ] **Prisma generate sukses**
  ```bash
  npx prisma generate
  ```

- [ ] **TypeScript tidak ada error**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Prisma schema valid**
  ```bash
  npx prisma validate
  ```

## 🔐 GitHub Secrets

Cek di: Repository → Settings → Secrets and variables → Actions

- [ ] `VPS_HOST` sudah diset (IP atau domain VPS)
- [ ] `VPS_USER` sudah diset (username SSH, biasanya `deploy`)
- [ ] `VPS_SSH_KEY` sudah diset (private SSH key)

## 📁 VPS Configuration

- [ ] `.env` file ada di VPS (`/home/deploy/lppmv1/.env`)
- [ ] Database URL benar di `.env`
- [ ] PM2 sudah running dengan nama `lppmv1`
- [ ] Port 22 (SSH) terbuka di firewall

## 📝 Git

- [ ] Semua perubahan sudah di-commit
- [ ] Commit message jelas dan deskriptif
- [ ] File sensitif tidak ter-commit (`.env`, `.pem`, dll)
- [ ] Branch saat ini: `master`

## 🚀 Deploy

```bash
# 1. Final check
npm run build

# 2. Commit & Push
git add .
git commit -m "Your commit message"
git push origin master

# 3. Monitor di GitHub Actions
# https://github.com/muhammadrizkyqh/lppmv1/actions
```

## ✅ Post-Deployment

- [ ] Cek GitHub Actions status (hijau ✅)
- [ ] Buka aplikasi di browser
- [ ] Test login
- [ ] Test fitur yang diubah
- [ ] Cek logs jika perlu:
  ```bash
  ssh deploy@your-vps-ip
  pm2 logs lppmv1 --lines 50
  ```

---

## 🚨 Jika Ada Error

### Build Failed di GitHub Actions

1. Lihat error di Actions logs
2. Fix error di local
3. Test `npm run build` lagi
4. Push lagi

### PM2 Not Restarting

SSH ke VPS:
```bash
ssh deploy@your-vps-ip
cd /home/deploy/lppmv1
pm2 restart lppmv1
pm2 logs lppmv1
```

### Prisma Error

SSH ke VPS:
```bash
ssh deploy@your-vps-ip
cd /home/deploy/lppmv1
npx prisma generate
npx prisma db push
npm run build
pm2 restart lppmv1
```

---

## 📚 Need Help?

- **CI/CD issues:** Baca [CICD.md](./CICD.md)
- **Deployment issues:** Baca [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick commands:** Baca [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- **Overview:** Baca [SUMMARY.md](./SUMMARY.md)

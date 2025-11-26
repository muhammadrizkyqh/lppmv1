# 🔐 Update GitHub Actions Workflow (Manual)

## ⚠️ Kenapa Manual?

GitHub memblokir push yang mengubah workflow files (`.github/workflows/*.yml`) jika **Personal Access Token (PAT)** tidak punya scope `workflow`.

## 📝 Langkah-Langkah Update Workflow

### Cara 1: Via GitHub Web (Recommended)

1. **Buka GitHub Repository:**
   https://github.com/muhammadrizkyqh/lppmv1

2. **Navigate ke Workflow File:**
   - Klik folder `.github` → `workflows` → `deploy.yml`

3. **Edit File:**
   - Klik icon **pencil (✏️)** di kanan atas
   
4. **Update Script Section:**
   
   Ganti bagian `script:` dengan ini:
   
   ```yaml
   script: |
     set -e  # Exit on error
     export PATH=$PATH:/home/deploy/.nvm/versions/node/v24.11.1/bin

     echo "🚀 Starting deployment..."
     cd /home/deploy/lppmv1
     
     echo "📥 Pulling latest changes..."
     git pull origin master
     
     echo "📦 Installing dependencies..."
     npm install
     
     echo "🔧 Generating Prisma Client..."
     npx prisma generate
     
     echo "🗄️  Updating database schema..."
     npx prisma db push --skip-generate --accept-data-loss
     
     echo "🏗️  Building Next.js application..."
     npm run build
     
     echo "🔄 Restarting PM2..."
     pm2 restart lppmv1
     
     echo "✅ Deployment completed successfully!"
     pm2 list
   ```

5. **Commit Changes:**
   - Scroll ke bawah
   - Commit message: `feat: add prisma generate and db push to workflow`
   - Klik **Commit changes**

6. **✅ Done!** Workflow sudah terupdate.

---

### Cara 2: Update PAT (Alternatif untuk Future)

Jika Anda ingin bisa push workflow via git:

1. **Generate New PAT dengan Workflow Scope:**
   - Go to: https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - Pilih scopes:
     - ✅ `repo` (Full control)
     - ✅ `workflow` (Update workflows)
   - Generate dan copy token

2. **Update Git Credentials:**
   ```bash
   # Windows
   git config --global credential.helper manager
   
   # Next git push akan minta token baru
   git push origin master
   # Masukkan token baru dengan workflow scope
   ```

---

## 📋 Workflow Changes yang Diperlukan

### File: `.github/workflows/deploy.yml`

**Tambahan yang diperlukan:**

```yaml
# BEFORE (original):
script: |
  export PATH=$PATH:/home/deploy/.nvm/versions/node/v24.11.1/bin
  cd /home/deploy/lppmv1
  git pull origin master
  npm install
  npm run build
  pm2 restart lppmv1

# AFTER (new):
script: |
  set -e  # Exit on error
  export PATH=$PATH:/home/deploy/.nvm/versions/node/v24.11.1/bin

  echo "🚀 Starting deployment..."
  cd /home/deploy/lppmv1
  
  echo "📥 Pulling latest changes..."
  git pull origin master
  
  echo "📦 Installing dependencies..."
  npm install
  
  echo "🔧 Generating Prisma Client..."
  npx prisma generate  # ← TAMBAHAN INI
  
  echo "🗄️  Updating database schema..."
  npx prisma db push --skip-generate --accept-data-loss  # ← TAMBAHAN INI
  
  echo "🏗️  Building Next.js application..."
  npm run build
  
  echo "🔄 Restarting PM2..."
  pm2 restart lppmv1
  
  echo "✅ Deployment completed successfully!"
  pm2 list
```

**Yang berubah:**
- ✅ Ditambahkan `npx prisma generate`
- ✅ Ditambahkan `npx prisma db push`
- ✅ Added `set -e` untuk exit on error
- ✅ Added echo statements untuk logging

---

## 🎯 Setelah Update Workflow

Test dengan push perubahan kecil:

```bash
# Edit file apapun
echo "# test" >> README.md

# Commit & push
git add README.md
git commit -m "test: trigger workflow"
git push origin master

# Monitor di GitHub Actions
# https://github.com/muhammadrizkyqh/lppmv1/actions
```

Jika workflow berjalan tanpa error dan semua step hijau ✅, maka sukses!

---

## ✅ Checklist

- [ ] Workflow file di GitHub sudah diupdate
- [ ] `npx prisma generate` sudah ditambahkan
- [ ] `npx prisma db push` sudah ditambahkan
- [ ] Test push dan lihat GitHub Actions
- [ ] Semua step workflow hijau ✅
- [ ] Aplikasi berjalan normal di VPS

---

## 📚 Reference

Workflow file yang sudah jadi tersimpan di:
- Local: `.github/workflows/deploy.yml` (versi lama)
- Perlu update manual via GitHub web

Alternative workflow tersedia di:
- `deploy-with-migrations.yml` (optional, lebih aman untuk production)

# LPPM Management System

Sistem Manajemen Lembaga Penelitian dan Pengabdian Masyarakat (LPPM) untuk pengelolaan proposal penelitian dan monitoring.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Deployment

Aplikasi ini menggunakan **GitHub Actions** untuk automatic deployment ke VPS.

```bash
# Push ke master untuk deploy otomatis
git add .
git commit -m "Your commit message"
git push origin master

# GitHub Actions akan otomatis:
# 1. Pull latest code
# 2. Generate Prisma Client
# 3. Update database schema
# 4. Build Next.js
# 5. Restart PM2
```

📖 **Dokumentasi lengkap:** [CICD.md](./CICD.md)

## 📚 Documentation

- **[CICD.md](./CICD.md)** - CI/CD setup dengan GitHub Actions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Manual deployment guide
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick reference commands
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup guide
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Authentication system
- **[DATA_MASTER_COMPLETE.md](./DATA_MASTER_COMPLETE.md)** - Data master documentation

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **Authentication:** Custom session-based auth
- **Deployment:** PM2 on VPS with GitHub Actions
- **Language:** TypeScript

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Deployment
npm run deploy           # Generate + Push + Build
npm run pm2:restart      # Restart PM2
npm run deploy:full      # Full deploy (deploy + PM2 restart)
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lppmv1"
SESSION_SECRET="your-secret-key-here"
```

## 🏗️ Project Structure

```
lppmv1/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── dosen/             # Dosen (lecturer) dashboard
│   ├── reviewer/          # Reviewer dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
├── prisma/               # Prisma schema & migrations
└── .github/workflows/    # GitHub Actions workflows
```

## 👥 User Roles

- **Admin** - Full system access
- **Dosen** - Submit proposals, view monitoring
- **Reviewer** - Review and evaluate proposals

## 🚀 Deployment Flow

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Pull Code]
    C --> D[Install Dependencies]
    D --> E[Prisma Generate]
    E --> F[DB Push/Migrate]
    F --> G[Build Next.js]
    G --> H[Restart PM2]
    H --> I[✅ Live]
```

## 🐛 Troubleshooting

### Build Error after Prisma Changes

```bash
# SSH to VPS
cd /home/deploy/lppmv1
npx prisma generate
npm run build
pm2 restart lppmv1
```

### PM2 Not Starting

```bash
pm2 delete lppmv1
npm run build
pm2 start npm --name lppmv1 -- start
pm2 save
```

📖 More troubleshooting: [CICD.md](./CICD.md#-troubleshooting)

## 📝 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

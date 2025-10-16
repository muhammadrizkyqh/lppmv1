# Database Setup Guide - LPPM System

## Prerequisites
- MySQL 8.0 or higher installed
- Node.js 18+ installed
- Access to MySQL root account or create new database user

## 📋 Step-by-Step Setup

### 1. Create Database

Login ke MySQL:
```bash
mysql -u root -p
```

Create database:
```sql
CREATE DATABASE lppm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

(Optional) Create dedicated user:
```sql
CREATE USER 'lppm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON lppm_db.* TO 'lppm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Edit `.env` dan sesuaikan connection string:
```env
# Jika pakai root tanpa password:
DATABASE_URL="mysql://root:@localhost:3306/lppm_db"

# Jika pakai root dengan password:
DATABASE_URL="mysql://root:your_password@localhost:3306/lppm_db"

# Jika pakai dedicated user:
DATABASE_URL="mysql://lppm_user:your_password@localhost:3306/lppm_db"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

Atau gunakan migration (recommended):
```bash
npm run db:migrate
```

### 5. Seed Initial Data

```bash
npm run db:seed
```

## 🎯 Default Login Credentials

Setelah seed berhasil, gunakan kredensial berikut:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Admin | admin | password123 | admin@stai-ali.ac.id |
| Dosen 1 | dosen1 | password123 | ahmad.dosen@stai-ali.ac.id |
| Dosen 2 | dosen2 | password123 | siti.dosen@stai-ali.ac.id |
| Dosen 3 | dosen3 | password123 | muhammad.dosen@stai-ali.ac.id |
| Mahasiswa 1 | mhs1 | password123 | ali.mahasiswa@student.stai-ali.ac.id |
| Mahasiswa 2 | mhs2 | password123 | fatimah.mahasiswa@student.stai-ali.ac.id |
| Reviewer 1 | reviewer1 | password123 | reviewer1@stai-ali.ac.id |
| Reviewer 2 | reviewer2 | password123 | reviewer2@external.ac.id |

**⚠️ PENTING:** Ganti semua password di production!

## 📊 Initial Data Summary

Seed akan membuat:
- ✅ 3 Bidang Keahlian (PBA, Pendidikan Islam, Hukum Ekonomi Syariah)
- ✅ 4 Skema Penelitian (Dasar, Terapan, Pengembangan, Mandiri)
- ✅ 2 Periode (2024 - Selesai, 2025 - Aktif)
- ✅ 9 Users (1 Admin, 3 Dosen, 2 Mahasiswa, 2 Reviewer)
- ✅ 3 Sample Proposals (1 Disetujui, 1 Review, 1 Draft)

## 🛠️ Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema tanpa migration |
| `npm run db:migrate` | Create & run migration |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Open Prisma Studio (GUI) |
| `npm run db:reset` | Reset database & re-seed |

## 🔍 Prisma Studio

Untuk melihat & edit data dengan GUI:
```bash
npm run db:studio
```

Browser akan terbuka di: `http://localhost:5555`

## 🔄 Reset Database

Jika ingin reset database & start fresh:
```bash
npm run db:reset
```

⚠️ **WARNING:** Ini akan menghapus SEMUA data!

## 📝 Database Schema

### Core Tables
- `User` - Authentication & user management
- `Dosen` - Lecturer data
- `Mahasiswa` - Student data
- `Reviewer` - Reviewer data

### Master Data
- `BidangKeahlian` - Field of expertise
- `Skema` - Research scheme & funding
- `Periode` - Research period

### Proposal Management
- `Proposal` - Main proposal data
- `ProposalMember` - Team members
- `ProposalRevision` - Revision history

### Review System
- `Review` - Review & assessment

### Monitoring
- `Monitoring` - Progress & reports
- `Notification` - User notifications

## ❌ Troubleshooting

### Error: "Can't connect to MySQL server"
- Pastikan MySQL service running
- Check connection string di `.env`
- Verify MySQL port (default: 3306)

### Error: "Access denied for user"
- Check username & password di connection string
- Verify user has privileges pada database

### Error: "Database does not exist"
- Buat database dulu: `CREATE DATABASE lppm_db;`

### Error: "prisma command not found"
- Run: `npm install`
- Or: `npx prisma` instead of `npm run db:*`

## 🚀 Next Steps

Setelah database setup selesai:
1. ✅ Database schema created
2. ✅ Initial data seeded
3. 🔜 Create API routes
4. 🔜 Setup authentication
5. 🔜 Connect frontend to backend

## 📚 Documentation

- [Prisma Docs](https://www.prisma.io/docs/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

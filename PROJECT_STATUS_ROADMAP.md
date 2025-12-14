# 📊 STATUS PROJECT & ROADMAP LENGKAP
## Sistem LPPM STAI Ali - Update 30 November 2025

---

## 🎯 EXECUTIVE SUMMARY

### Progress Keseluruhan: **75%** Complete

```
Fase 1: Core System           ████████████████████ 100% ✅
Fase 2: Review & Approval     ████████████████████ 100% ✅
Fase 3: Monitoring            ████████████████░░░░  80% ⏳
Fase 4: Additional Features   ░░░░░░░░░░░░░░░░░░░░   0% 📋
```

### Timeline Aktual:
- **Mulai Development**: Oktober 2025
- **Target Completion**: Januari 2026
- **Current Sprint**: Fase 3 - Monitoring & Reporting

---

## ✅ YANG SUDAH SELESAI (COMPLETED)

### 1. FASE 1: CORE SYSTEM (100% Complete)

#### ✅ Modul 1: Authentication & User Management
**Status**: Production Ready

**Features**:
- ✅ Login/Logout dengan JWT + HTTP-only cookies
- ✅ Session management (2 jam timeout)
- ✅ Role-based access control (ADMIN, DOSEN, MAHASISWA, REVIEWER)
- ✅ Change password (wajib ganti di first login)
- ✅ Protected routes dengan middleware
- ✅ Auto redirect berdasarkan role

**Files**:
- `/app/api/auth/login/route.ts`
- `/app/api/auth/logout/route.ts`
- `/app/api/auth/me/route.ts`
- `/app/api/admin/change-password/route.ts`
- `/lib/auth.ts`
- `/middleware.ts`

**Default Credentials**:
- Admin: `admin` / `password123`
- Dosen: `dosen1` / `password123`
- Reviewer: `reviewer1` / `password123`

---

#### ✅ Modul 2: Data Master CRUD
**Status**: Production Ready

**Features**:
- ✅ **Dosen Management**: CRUD + Search + Status
- ✅ **Mahasiswa Management**: CRUD + Search + Prodi Filter
- ✅ **Reviewer Management**: CRUD + Search + Tipe Filter
- ✅ Auto user account creation (cascade)
- ✅ Delete validation (check dependencies)
- ✅ Smart forms dengan validation
- ✅ Real-time search
- ✅ Loading states & error handling
- ✅ Toast notifications

**API Routes** (15 endpoints):
```
/api/dosen          - GET, POST
/api/dosen/[id]     - GET, PATCH, DELETE
/api/mahasiswa      - GET, POST
/api/mahasiswa/[id] - GET, PATCH, DELETE
/api/reviewer       - GET, POST
/api/reviewer/[id]  - GET, PATCH, DELETE
```

**Pages**:
- `/app/admin/data-master/page.tsx` (Tabs: Dosen, Mahasiswa, Reviewer)

---

#### ✅ Modul 3: Setting Sistem
**Status**: Production Ready

**Features**:
- ✅ **Periode Management**: Tahun, Nama, Tanggal, Kuota, Status (AKTIF/NONAKTIF/SELESAI)
- ✅ **Skema Management**: Nama, Tipe (DASAR/TERAPAN/PENGEMBANGAN/MANDIRI), Dana
- ✅ **Bidang Keahlian**: Nama bidang untuk dosen & reviewer
- ✅ CRUD lengkap untuk ketiga master data
- ✅ Status toggle (AKTIF/NONAKTIF)

**API Routes** (9 endpoints):
```
/api/periode             - GET, POST
/api/periode/[id]        - GET, PATCH, DELETE
/api/skema               - GET, POST
/api/skema/[id]          - GET, PATCH, DELETE
/api/bidang-keahlian     - GET, POST
/api/bidang-keahlian/[id] - GET, PATCH, DELETE
```

**Pages**:
- `/app/admin/settings/page.tsx` (Tabs: Periode, Skema, Bidang Keahlian)

---

#### ✅ Modul 4: Pengajuan Proposal
**Status**: Production Ready

**Features**:
- ✅ **Create Proposal**: Judul, Abstrak, Periode, Skema, Bidang Keahlian
- ✅ **Upload File**: PDF, max 10MB
- ✅ **Team Members**: Add Dosen/Mahasiswa (max 4 total)
- ✅ **Draft/Submit**: Simpan draft atau langsung submit
- ✅ **Edit Proposal**: Hanya saat status DRAFT
- ✅ **Delete Proposal**: Hanya saat status DRAFT
- ✅ **View Proposal**: Detail lengkap + download file
- ✅ Validation: Periode aktif, file required, team max 4

**API Routes** (7 endpoints):
```
/api/proposals              - GET, POST
/api/proposals/[id]         - GET, PATCH, DELETE
/api/proposals/[id]/submit  - POST
/api/proposals/[id]/revisi  - POST
/api/upload                 - POST (file upload)
```

**Pages**:
- `/app/dosen/proposals/page.tsx` (List view)
- `/app/dosen/proposals/create/page.tsx` (Create form)
- `/app/dosen/proposals/[id]/page.tsx` (Detail view)
- `/app/dosen/proposals/[id]/edit/page.tsx` (Edit form)

**Business Rules**:
- ✅ Hanya dosen bisa jadi ketua
- ✅ Max 1 proposal sebagai ketua per periode
- ✅ Max 4 anggota total (termasuk ketua)
- ✅ File wajib PDF, max 10MB
- ✅ Edit/delete hanya saat DRAFT

---

### 2. FASE 2: REVIEW & APPROVAL (100% Complete)

#### ✅ Modul 5: Review & Penilaian
**Status**: Production Ready

**Features**:
- ✅ **Admin Assign Reviewer**: 2 reviewer per proposal
- ✅ **Reviewer Dashboard**: Lihat tugas (pending/completed)
- ✅ **Form Penilaian**: 4 kriteria @ 25% (total auto-calculated)
  - Kesesuaian judul & latar belakang
  - Kejelasan metode
  - Kelayakan timeline
  - Manfaat penelitian
- ✅ **Rekomendasi**: DITERIMA / REVISI / DITOLAK
- ✅ **Catatan**: Text area untuk feedback
- ✅ **Deadline**: 7 hari dari assignment
- ✅ **Status Tracking**: PENDING → SELESAI

**API Routes** (5 endpoints):
```
/api/proposals/[id]/assign-reviewers - POST
/api/reviews/my-assignments          - GET (reviewer dashboard)
/api/reviews/[assignmentId]          - GET, POST (submit review)
/api/proposals/[id]/reviews          - GET (admin lihat reviews)
```

**Pages**:
- `/app/admin/proposals/[id]/page.tsx` (Admin assign reviewers)
- `/app/reviewer/assignments/page.tsx` (Reviewer dashboard)
- `/app/reviewer/assignments/[id]/page.tsx` (Review form)

**Business Rules**:
- ✅ 2 reviewer wajib per proposal
- ✅ Review sekali saja (tidak bisa edit)
- ✅ Nilai 1-100 per kriteria
- ✅ Rekomendasi wajib

---

#### ✅ Modul 6: Keputusan Admin
**Status**: Production Ready

**Features**:
- ✅ **Admin View Reviews**: Lihat hasil 2 reviewer
- ✅ **Final Decision**: DITERIMA / REVISI / DITOLAK
- ✅ **Status Tracking**: DIAJUKAN → DIREVIEW → (decision)
- ✅ **Revisi Workflow**: 
  - Admin set REVISI → Dosen upload file baru
  - Review lama dihapus, ProposalReviewer reset ke PENDING
  - Reviewer review ulang proposal revisi
- ✅ **Proposal List**: Filter by status, periode, search
- ✅ **Average Score**: Auto calculate dari 2 reviewer

**API Routes**:
```
/api/proposals/[id]/decision - POST (admin final decision)
/api/proposals/[id]/revisi   - POST (dosen upload revisi)
```

**Pages**:
- `/app/admin/proposals/page.tsx` (List + decision)
- `/app/admin/reviews/page.tsx` (Review monitoring)

**Revisi Workflow** (Baru fixed Nov 26):
1. Admin set proposal → REVISI
2. Dosen click "Upload Revisi" button
3. Dialog buka: Upload PDF + catatan revisi
4. API `/revisi` endpoint:
   - Delete review lama
   - Reset ProposalReviewer status → PENDING
   - Update proposal: file baru, status → DIREVIEW
   - Increment revisiCount
5. Reviewer lihat di dashboard (status PENDING)
6. Reviewer review ulang

---

### 3. FASE 3: MONITORING & COMPLETION (80% Complete)

#### ✅ Modul 7: Monitoring & Laporan
**Status**: 80% Complete ⏳

**Features yang SUDAH jadi**:
- ✅ **Upload Laporan Kemajuan**: Text + PDF + Persentase progress
- ✅ **Upload Laporan Akhir**: Text + PDF
- ✅ **Admin Verification**: Approve/Reject dengan catatan
- ✅ **Verification Workflow**:
  - Kemajuan approved → Dosen bisa upload akhir
  - Akhir approved → Status SELESAI, Progress 100%
  - Rejected → Dosen bisa re-upload
- ✅ **Status Display**: Badge warna (green=approved, red=rejected, yellow=pending)
- ✅ **Progress Bar**: Show persentaseKemajuan
- ✅ **Download Reports**: Button download PDF laporan
- ✅ **Dosen List**: Lihat semua proposal yang perlu monitoring
- ✅ **Admin Dashboard**: Stats + filter (status, periode, search)

**API Routes** (6 endpoints):
```
/api/monitoring/[proposalId]                  - GET
/api/monitoring/[proposalId]/upload-kemajuan  - POST
/api/monitoring/[proposalId]/upload-akhir     - POST
/api/monitoring/[proposalId]/verify           - POST
/api/monitoring                               - GET (list)
/api/monitoring/[proposalId]/reset-verification - DELETE (dev tool)
```

**Pages**:
- `/app/dosen/monitoring/page.tsx` (List)
- `/app/dosen/monitoring/[proposalId]/page.tsx` (Upload forms)
- `/app/admin/monitoring/page.tsx` (Dashboard + stats)
- `/app/admin/monitoring/[proposalId]/page.tsx` (Verification)

**Database Schema** (Migration applied):
```prisma
model Monitoring {
  id                       String
  proposalId               String
  
  laporanKemajuan          String?
  fileKemajuan             String?
  persentaseKemajuan       Int?
  verifikasiKemajuanStatus String?  // APPROVED/REJECTED
  verifikasiKemajuanAt     DateTime?
  catatanKemajuan          String?
  
  laporanAkhir             String?
  fileAkhir                String?
  verifikasiAkhirStatus    String?  // APPROVED/REJECTED
  verifikasiAkhirAt        DateTime?
  catatanAkhir             String?
  
  status                   String   // BERJALAN/SELESAI
}
```

**Business Rules**:
- ✅ Laporan akhir disabled sampai kemajuan approved
- ✅ Form disabled jika approved (tidak bisa edit)
- ✅ Form enabled jika rejected (bisa re-upload)
- ✅ Progress 100% otomatis setelah akhir approved
- ✅ Status proposal → SELESAI setelah akhir approved

**Bug Fixes** (Nov 19-26):
- ✅ Fixed navigation menu (monitoring tidak ada di dosen sidebar)
- ✅ Fixed undefined property errors (optional chaining)
- ✅ Fixed file upload response path
- ✅ Fixed verification workflow (buttons hide after verify)
- ✅ Fixed re-upload mechanism (reset verification)
- ✅ Fixed progress calculation (100% hanya saat akhir approved)
- ✅ Fixed revisi upload workflow (reset reviewer assignments)

---

#### ⏳ Modul 8: Dashboard Enhanced (40% Complete)

**Yang SUDAH ada**:
- ✅ Admin Dashboard: Basic stats (hardcoded)
- ✅ Dosen Dashboard: Basic stats (hardcoded)
- ✅ Reviewer Dashboard: Assignment list (real data)
- ✅ Layout & navigation structure

**Yang BELUM (Need Implementation)**:
- ❌ **Admin Dashboard Real Data**:
  - Real-time stats dari database (total proposals, in review, approved, dll)
  - Monitoring statistics (menunggu verifikasi kemajuan/akhir)
  - Chart: Proposal by status (pie chart)
  - Chart: Progress timeline (line chart per bulan)
  - Recent activities widget
  - Urgent actions widget (deadline monitoring)
  
- ❌ **Dosen Dashboard Real Data**:
  - Real-time stats dari database
  - Active proposal cards dengan progress
  - Timeline: Upload history & deadlines
  - Notifications widget (verification results)
  - Upcoming deadlines reminder
  
- ❌ **Export & Reports**:
  - Export Excel: List proposals dengan filter
  - Export Excel: Monitoring data
  - Export PDF: Summary reports
  - Preview before download
  - Filter: periode, status, skema, date range

**Files yang perlu diupdate**:
- `/app/admin/dashboard/page.tsx` - Add API calls
- `/app/dosen/dashboard/page.tsx` - Add API calls
- `/app/dosen/reports/page.tsx` - Currently mock data only
- NEW: `/app/admin/reports/page.tsx` - Export functionality
- NEW: `/app/api/dashboard/admin/route.ts` - Stats API
- NEW: `/app/api/dashboard/dosen/route.ts` - Stats API
- NEW: `/app/api/reports/export/route.ts` - Export API

**Chart Libraries to use**:
- Recharts (sudah installed)
- React Charts
- Chart.js

---

## ❌ YANG BELUM DIKERJAKAN (TODO)

### 4. FASE 3 (Remaining 20%)

#### ❌ Dashboard & Reports Enhancement
**Priority**: HIGH 🔴
**Estimasi**: 3-4 hari

**Tasks**:
1. **Admin Dashboard Real Data** (1 hari):
   - Create `/app/api/dashboard/admin/route.ts`
   - Return: totalProposals, byStatus, byPeriode, recentActivities
   - Update `/app/admin/dashboard/page.tsx` dengan API call
   - Add charts: Recharts Pie Chart, Line Chart

2. **Dosen Dashboard Real Data** (1 hari):
   - Create `/app/api/dashboard/dosen/route.ts`
   - Return: myProposals, inProgress, deadlines, recentVerifications
   - Update `/app/dosen/dashboard/page.tsx` dengan API call
   - Add timeline component untuk upload history

3. **Export Reports System** (1-2 hari):
   - Create `/app/api/reports/export/route.ts`
   - Implement Excel export (library: `xlsx` atau `exceljs`)
   - Implement PDF export (library: `jspdf` atau `pdfmake`)
   - Create `/app/admin/reports/page.tsx` UI
   - Features: Filter, preview, download

**Dependencies**:
```bash
npm install xlsx jspdf jspdf-autotable
# atau
npm install exceljs pdfmake
```

**Expected Output**:
- Admin dashboard dengan real data & charts
- Dosen dashboard dengan timeline & reminders
- Export Excel: List proposals, monitoring data
- Export PDF: Summary reports dengan logo STAI Ali

---

### 5. FASE 4: ADDITIONAL FEATURES (0% Complete)

#### ❌ Modul 9: PKM (Pengabdian Masyarakat)
**Priority**: MEDIUM 🟡
**Estimasi**: 2-3 hari

**Concept**: Duplicate dari Penelitian dengan slight differences

**Tasks**:
1. **Database Schema** (0.5 hari):
   - Add `PKM` ke `ProposalStatus` enum
   - Add `mitraPKM` field ke Proposal model
   - Add PKM skema di Skema master
   - Migration: `npx prisma migrate dev`

2. **API Routes** (0.5 hari):
   - Copy proposal API routes
   - Add validation untuk PKM-specific fields
   - Update business rules (luaran lebih fleksibel)

3. **UI Pages** (1 hari):
   - Create `/app/dosen/pkm/` folder
   - Copy proposal pages, rename routes
   - Update form: Add "Mitra PKM" field
   - Update icons/colors untuk distinguish dari Penelitian

4. **Integration** (0.5 hari):
   - Add PKM menu to navigation
   - Update dashboard stats (split Penelitian vs PKM)
   - Update filtering (add type filter)

**Files to Create**:
```
/app/dosen/pkm/page.tsx
/app/dosen/pkm/create/page.tsx
/app/dosen/pkm/[id]/page.tsx
/app/dosen/pkm/[id]/edit/page.tsx
/app/admin/pkm/page.tsx
/app/admin/pkm/[id]/page.tsx
```

**Differences from Penelitian**:
- Icon: HandHeart (instead of FileText)
- Color: Green (instead of Blue)
- Field tambahan: Mitra PKM (nama organisasi partner)
- Luaran: Lebih fleksibel (bukan hanya jurnal)

---

#### ❌ Modul 10: Sistem Notifikasi
**Priority**: LOW 🟢
**Estimasi**: 3-4 hari

**Features**:
- In-app notifications (bell icon di navbar)
- Real-time updates (polling atau SSE)
- Email notifications (optional)
- Push notifications (optional, advanced)

**Tasks**:
1. **Database Schema** (0.5 hari):
   - Model `Notification` sudah ada di schema
   - Fields: userId, title, message, type, link, isRead
   - No migration needed

2. **Notification Service** (1 hari):
   - Create `/lib/notification-service.ts`
   - Functions:
     - `createNotification(userId, data)`
     - `markAsRead(notificationId)`
     - `getUserNotifications(userId)`
     - `getUnreadCount(userId)`

3. **API Routes** (0.5 hari):
   ```
   /api/notifications        - GET (list)
   /api/notifications/count  - GET (unread count)
   /api/notifications/[id]   - PATCH (mark read)
   /api/notifications/read-all - POST
   ```

4. **UI Components** (1 hari):
   - Bell icon di navbar dengan badge count
   - Dropdown notification list
   - Mark as read functionality
   - Click notification → navigate to link
   - Auto refresh (polling 30s)

5. **Integration** (1 hari):
   - Update semua API endpoints untuk create notifications:
     - Proposal submitted → notify admin
     - Reviewer assigned → notify reviewer
     - Review completed → notify dosen
     - Decision made → notify dosen
     - Monitoring uploaded → notify admin
     - Verification done → notify dosen
     - Deadline approaching → notify dosen

**Notification Types**:
- `INFO`: Informasi umum (blue)
- `SUCCESS`: Action berhasil (green)
- `WARNING`: Deadline approaching (yellow)
- `ERROR`: Action gagal atau urgent (red)

**Email Integration** (Optional):
- Library: `nodemailer`
- SMTP: Gmail atau service lain
- Template: HTML email templates
- Queue: Simple queue or library like `bull`

---

#### ❌ Modul 11: Luaran Penelitian (BELUM ADA)
**Priority**: MEDIUM 🟡
**Estimasi**: 2-3 hari

**Concept**: Dosen input & upload bukti luaran setelah penelitian selesai

**Features**:
1. **Input Luaran**:
   - Jenis: Jurnal / Buku / HAKI / Produk / Seminar / Media Massa
   - Judul luaran
   - Keterangan detail
   - Upload file bukti (PDF/image)
   - Tanggal publikasi/submit

2. **Admin Verification**:
   - Approve/reject luaran
   - Catatan jika reject
   - Track pencairan termin 3

3. **Business Rules**:
   - Wajib minimal 1 luaran dalam 6 bulan setelah selesai
   - Tidak ada luaran → penelitian dibatalkan, wajib kembalikan dana
   - Termin 3 (25%) cairkan setelah luaran diverifikasi

**Database Schema** (NEW):
```prisma
model Luaran {
  id              String   @id @default(cuid())
  proposalId      String
  jenis           String   // JURNAL, BUKU, HAKI, PRODUK, dll
  judul           String
  keterangan      String?  @db.Text
  fileBukti       String
  tanggalPublikasi DateTime?
  
  statusVerifikasi String  @default("PENDING") // PENDING, DIVERIFIKASI, DITOLAK
  catatanVerifikasi String? @db.Text
  verifikasiAt    DateTime?
  verifikasiBy    String?  // Admin user ID
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  proposal        Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  
  @@index([proposalId])
}
```

**Tasks**:
1. Add Luaran model to Prisma schema
2. Create migration
3. Create API routes (CRUD + verification)
4. Create dosen UI (input luaran)
5. Create admin UI (verification)
6. Integrate dengan monitoring (auto-check luaran requirement)
7. Link to pencairan termin 3

**Pages**:
```
/app/dosen/luaran/page.tsx (list by proposal)
/app/dosen/luaran/[proposalId]/create.tsx
/app/admin/luaran/page.tsx (verification dashboard)
```

---

#### ❌ Modul 12: Kontrak & SK (BELUM ADA)
**Priority**: MEDIUM 🟡
**Estimasi**: 2 hari

**Features**:
1. **Generate Kontrak**:
   - Template Word/PDF dengan placeholder
   - Auto-fill: Nama dosen, judul, dana, periode
   - Generate nomor kontrak auto (format: KTR/LPPM/2025/001)
   - Download kontrak untuk TTD manual

2. **Upload Kontrak TTD**:
   - Scan kontrak yang sudah TTD → upload PDF
   - Save to database & file storage

3. **Generate SK**:
   - Template SK penelitian
   - Auto-fill data proposal
   - Nomor SK auto (format: SK/LPPM/PENELITIAN/2025/001)
   - Download untuk TTD

**Database Schema Update**:
```prisma
model Proposal {
  // ... existing fields
  
  nomorKontrak    String?
  fileKontrak     String?  // Generated contract
  fileKontrakTTD  String?  // Signed contract scan
  nomorSK         String?
  fileSK          String?
  
  tanggalKontrak  DateTime?
  tanggalSK       DateTime?
}
```

**Tasks**:
1. Create template Word/PDF
2. Implement auto-fill logic (library: `docx` atau `pdf-lib`)
3. Create nomor generator (sequential per year)
4. Create upload UI untuk scan TTD
5. Store files in `/public/uploads/contracts/` & `/public/uploads/sk/`

**Dependencies**:
```bash
npm install docx pdf-lib
```

---

#### ❌ Modul 13: Pencairan Dana (BELUM ADA)
**Priority**: LOW 🟢
**Estimasi**: 2 hari

**Features**:
1. **Track Pencairan 3 Termin**:
   - Termin 1 (50%): Setelah kontrak TTD
   - Termin 2 (25%): Setelah monitoring 2 diverifikasi
   - Termin 3 (25%): Setelah luaran diverifikasi

2. **Pencairan Form**:
   - Tanggal pencairan
   - Jumlah (auto dari skema & termin)
   - Nomor rekening dosen
   - Upload bukti transfer

3. **Status Tracking**:
   - PENDING → DIPROSES → SELESAI per termin

**Database Schema** (NEW):
```prisma
model Pencairan {
  id            String   @id @default(cuid())
  proposalId    String
  termin        Int      // 1, 2, atau 3
  jumlah        Decimal  @db.Decimal(12, 2)
  tanggal       DateTime?
  buktiTransfer String?
  status        String   @default("PENDING") // PENDING, DIPROSES, SELESAI
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  proposal      Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  
  @@index([proposalId])
}
```

**Validation Rules**:
- Termin 1: Kontrak TTD sudah ada
- Termin 2: Monitoring 2 status DIVERIFIKASI
- Termin 3: Minimal 1 luaran status DIVERIFIKASI

**Pages**:
```
/app/admin/pencairan/page.tsx (dashboard)
/app/admin/pencairan/[proposalId].tsx (form)
/app/dosen/dana/page.tsx (tracking only, read-only)
```

---

## 🗂️ STRUKTUR FILE LENGKAP

### Database (Prisma)
```
prisma/
├── schema.prisma (14 models)
├── migrations/
│   ├── 20251119074724_add_monitoring_verification_fields/
│   ├── 20251126081623_add_catatan_revisi_to_proposal/
│   └── ... (20+ migrations total)
└── seed.ts (data awal: admin, dosen, reviewer, periode, skema)
```

### API Routes (50+ endpoints)
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
├── admin/
│   └── change-password/route.ts
├── dosen/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PATCH, DELETE)
├── mahasiswa/
│   ├── route.ts
│   └── [id]/route.ts
├── reviewer/
│   ├── route.ts
│   └── [id]/route.ts
├── periode/
│   ├── route.ts
│   └── [id]/route.ts
├── skema/
│   ├── route.ts
│   └── [id]/route.ts
├── bidang-keahlian/
│   ├── route.ts
│   └── [id]/route.ts
├── proposals/
│   ├── route.ts (GET, POST)
│   ├── [proposalId]/
│   │   ├── route.ts (GET, PATCH, DELETE)
│   │   ├── submit/route.ts
│   │   ├── revisi/route.ts
│   │   └── assign-reviewers/route.ts
├── reviews/
│   ├── my-assignments/route.ts
│   └── [assignmentId]/route.ts
├── monitoring/
│   ├── route.ts (GET - list)
│   ├── [proposalId]/
│   │   ├── route.ts (GET)
│   │   ├── upload-kemajuan/route.ts
│   │   ├── upload-akhir/route.ts
│   │   ├── verify/route.ts
│   │   └── reset-verification/route.ts
└── upload/route.ts (file upload handler)
```

### Frontend Pages (30+ pages)
```
app/
├── login/page.tsx
├── dashboard/page.tsx (redirect berdasarkan role)
├── admin/
│   ├── dashboard/page.tsx
│   ├── data-master/page.tsx (Tabs: Dosen, Mahasiswa, Reviewer)
│   ├── settings/page.tsx (Tabs: Periode, Skema, Bidang Keahlian)
│   ├── proposals/
│   │   ├── page.tsx (list + filters)
│   │   └── [id]/page.tsx (detail + assign reviewers + decision)
│   ├── reviews/page.tsx (monitoring reviews)
│   └── monitoring/
│       ├── page.tsx (dashboard + stats)
│       └── [proposalId]/page.tsx (verification)
├── dosen/
│   ├── dashboard/page.tsx
│   ├── proposals/
│   │   ├── page.tsx (list + filters + revisi upload)
│   │   ├── create/page.tsx (create form)
│   │   ├── [id]/page.tsx (detail view)
│   │   └── [id]/edit/page.tsx (edit form)
│   ├── monitoring/
│   │   ├── page.tsx (list)
│   │   └── [proposalId]/page.tsx (upload forms)
│   └── reports/page.tsx (mock data, need real data)
└── reviewer/
    ├── dashboard/page.tsx
    └── assignments/
        ├── page.tsx (list: pending vs completed)
        └── [id]/page.tsx (review form + submit)
```

### Components (20+ reusable)
```
components/
├── layout/
│   └── dashboard-layout.tsx (sidebar navigation by role)
├── ui/ (shadcn/ui components)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── tabs.tsx
│   ├── responsive-tabs.tsx
│   ├── search-filter.tsx
│   └── empty-states.tsx (NoProposalsFound, NoSearchResults, dll)
└── providers/
    └── theme-provider.tsx
```

### Libraries & Dependencies
```
lib/
├── auth.ts (JWT functions: requireAuth, requireRole)
├── prisma.ts (Prisma client singleton)
├── api-client.ts (Type definitions & API functions)
└── utils.ts (Helper functions)
```

---

## 📋 DETAILED ROADMAP

### 🔴 SPRINT 1: Dashboard Enhancement (3-4 hari)
**Target**: Desember Minggu 1

**Day 1-2: Admin Dashboard**
- [ ] Create `/app/api/dashboard/admin/route.ts`
  - Query: Count proposals by status
  - Query: Count monitoring pending verification
  - Query: Recent activities (latest 10 proposals/reviews)
  - Query: Deadline approaching (monitoring >25 hari)
  
- [ ] Update `/app/admin/dashboard/page.tsx`
  - Replace hardcoded stats dengan API call
  - Add Recharts pie chart (proposals by status)
  - Add line chart (proposals per month)
  - Add recent activities list
  - Add urgent actions widget
  
- [ ] Create reusable chart components
  - `/components/charts/pie-chart.tsx`
  - `/components/charts/line-chart.tsx`
  - `/components/charts/stat-card.tsx`

**Day 3: Dosen Dashboard**
- [ ] Create `/app/api/dashboard/dosen/route.ts`
  - Query: My proposals dengan status
  - Query: Monitoring deadlines
  - Query: Recent verifications
  - Query: Upcoming uploads
  
- [ ] Update `/app/dosen/dashboard/page.tsx`
  - Replace hardcoded stats
  - Add active proposal cards
  - Add timeline component (upload history)
  - Add deadline reminders
  - Add notification widget

**Day 4: Export & Reports**
- [ ] Install libraries: `npm install xlsx jspdf jspdf-autotable`
- [ ] Create `/app/api/reports/export/route.ts`
  - Excel export: Proposals list dengan filter
  - Excel export: Monitoring data
  - PDF export: Summary report
  
- [ ] Create `/app/admin/reports/page.tsx`
  - Filter UI (periode, status, skema, date range)
  - Preview data table
  - Download Excel button
  - Download PDF button
  
- [ ] Update `/app/dosen/reports/page.tsx`
  - Replace mock data dengan API call
  - Add export my proposals button

**Deliverables**:
- ✅ Real-time dashboard dengan charts
- ✅ Export functionality (Excel + PDF)
- ✅ Timeline & deadline widgets
- ✅ Monitoring statistics

---

### 🟡 SPRINT 2: Luaran & Kontrak (3-4 hari)
**Target**: Desember Minggu 2

**Day 1: Luaran Database & API**
- [ ] Add `Luaran` model to `prisma/schema.prisma`
- [ ] Run migration: `npx prisma migrate dev --name add_luaran_model`
- [ ] Create `/app/api/luaran/route.ts` (GET, POST)
- [ ] Create `/app/api/luaran/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] Create `/app/api/luaran/[id]/verify/route.ts` (POST)

**Day 2: Luaran UI - Dosen**
- [ ] Create `/app/dosen/luaran/page.tsx` (list by proposal)
- [ ] Create `/app/dosen/luaran/[proposalId]/create.tsx` (input form)
- [ ] Add validation: Jenis, judul, file wajib
- [ ] Upload file bukti (PDF/image)

**Day 3: Luaran UI - Admin**
- [ ] Create `/app/admin/luaran/page.tsx` (verification dashboard)
- [ ] Stats: Total, pending, verified, rejected
- [ ] Filter by status, proposal, periode
- [ ] Verification form: Approve/reject + catatan

**Day 4: Kontrak & SK**
- [ ] Add fields to Proposal model (nomorKontrak, fileKontrak, dll)
- [ ] Run migration
- [ ] Install: `npm install docx pdf-lib`
- [ ] Create template Word untuk kontrak
- [ ] Create auto-fill logic
- [ ] Create nomor generator (sequential)
- [ ] Create upload UI untuk kontrak TTD

**Deliverables**:
- ✅ Luaran input & verification system
- ✅ Kontrak auto-generation
- ✅ SK generation
- ✅ File management

---

### 🟢 SPRINT 3: PKM Module (2-3 hari)
**Target**: Desember Minggu 3

**Day 1: PKM Schema & API**
- [ ] Update Prisma schema:
  - Add `PKM` to ProposalStatus enum
  - Add `mitraPKM` field to Proposal
  - Add PKM skema to Skema master
- [ ] Run migration
- [ ] Duplicate proposal API routes untuk PKM
- [ ] Update validation rules (luaran fleksibel)

**Day 2: PKM UI - Dosen**
- [ ] Create `/app/dosen/pkm/` folder
- [ ] Copy proposal pages
- [ ] Update forms: Add Mitra PKM field
- [ ] Update icons & colors (HandHeart, green theme)

**Day 3: PKM UI - Admin & Integration**
- [ ] Create `/app/admin/pkm/` pages
- [ ] Add PKM menu to navigation
- [ ] Update dashboard (split Penelitian vs PKM stats)
- [ ] Add type filter to lists
- [ ] Testing end-to-end

**Deliverables**:
- ✅ Complete PKM workflow
- ✅ Separate PKM from Penelitian in UI
- ✅ Mitra PKM field
- ✅ Flexible luaran for PKM

---

### 🟢 SPRINT 4: Notification System (3-4 hari)
**Target**: Desember Minggu 4

**Day 1: Notification Service**
- [ ] Create `/lib/notification-service.ts`
- [ ] Functions:
  - `createNotification(userId, data)`
  - `markAsRead(notificationId)`
  - `getUserNotifications(userId)`
  - `getUnreadCount(userId)`

**Day 2: Notification API**
- [ ] Create `/app/api/notifications/route.ts` (GET)
- [ ] Create `/app/api/notifications/count/route.ts` (GET)
- [ ] Create `/app/api/notifications/[id]/route.ts` (PATCH)
- [ ] Create `/app/api/notifications/read-all/route.ts` (POST)

**Day 3: Notification UI**
- [ ] Create bell icon component in navbar
- [ ] Add badge count (unread)
- [ ] Create dropdown notification list
- [ ] Mark as read functionality
- [ ] Auto refresh (polling 30s)
- [ ] Click notification → navigate to link

**Day 4: Integration**
- [ ] Update all API endpoints to create notifications:
  - Proposal submitted → notify admin
  - Reviewer assigned → notify reviewer
  - Review completed → notify dosen
  - Decision made → notify dosen
  - Monitoring uploaded → notify admin
  - Verification done → notify dosen
  - Deadline approaching → notify dosen (cron job)

**Deliverables**:
- ✅ In-app notifications
- ✅ Real-time updates
- ✅ Notification for all major events
- ✅ Badge count in navbar

---

### 🟢 SPRINT 5: Pencairan Dana (2 hari)
**Target**: Januari Minggu 1

**Day 1: Pencairan Schema & API**
- [ ] Add `Pencairan` model to schema
- [ ] Run migration
- [ ] Create API routes (CRUD)
- [ ] Implement validation rules (termin requirements)

**Day 2: Pencairan UI**
- [ ] Create `/app/admin/pencairan/page.tsx` (dashboard)
- [ ] Create `/app/admin/pencairan/[proposalId].tsx` (form)
- [ ] Create `/app/dosen/dana/page.tsx` (tracking, read-only)
- [ ] Upload bukti transfer
- [ ] Status tracking

**Deliverables**:
- ✅ Complete dana tracking
- ✅ 3 termin management
- ✅ Validation per termin
- ✅ Bukti transfer storage

---

### 🔵 SPRINT 6: Polish & Testing (1 minggu)
**Target**: Januari Minggu 2

**Day 1-2: Code Review & Refactoring**
- [ ] Code cleanup
- [ ] Remove console.logs
- [ ] Add TypeScript strict types
- [ ] Add JSDoc comments
- [ ] Error handling review

**Day 3-4: Testing**
- [ ] Manual testing semua workflows
- [ ] Test all user roles
- [ ] Test edge cases
- [ ] Test error handling
- [ ] Browser compatibility testing
- [ ] Mobile responsive testing

**Day 5: Documentation**
- [ ] Update README.md
- [ ] Create USER_GUIDE.md (Bahasa Indonesia)
- [ ] Create ADMIN_GUIDE.md
- [ ] API documentation (Postman collection)
- [ ] Database schema documentation

**Day 6-7: Deployment Preparation**
- [ ] Production build testing
- [ ] Database backup strategy
- [ ] File storage setup
- [ ] Environment variables check
- [ ] Security audit
- [ ] Performance optimization

**Deliverables**:
- ✅ Clean, production-ready code
- ✅ Complete documentation
- ✅ All features tested
- ✅ Ready for deployment

---

## 🎯 PRIORITAS & REKOMENDASI

### Must Have (Selesaikan dulu):
1. ✅ Dashboard Enhancement (SPRINT 1) - Paling urgent
2. ✅ Luaran & Kontrak (SPRINT 2) - Critical untuk workflow
3. ✅ Testing & Polish (SPRINT 6) - Stabilitas

### Should Have:
4. ✅ PKM Module (SPRINT 3) - Nice to have, tapi bisa ditunda
5. ✅ Notification System (SPRINT 4) - UX improvement

### Could Have (Optional):
6. ✅ Pencairan Dana (SPRINT 5) - Manual process juga OK

---

## 📊 CURRENT TECHNICAL DEBT

### Issues to Fix:
1. **Prisma File Lock Error** (Minor):
   - Terjadi saat dev server running dan prisma generate
   - Solution: Stop server dulu sebelum generate
   - Or: Use `pm2` di production

2. **Hardcoded Stats in Dashboards** (High Priority):
   - Admin dashboard stats masih mock data
   - Dosen dashboard stats masih mock data
   - Need real API calls

3. **No Email Notifications** (Low Priority):
   - Saat ini hanya in-app
   - Future: Add email via nodemailer

4. **No Pagination UI** (Medium Priority):
   - Backend sudah support pagination
   - Frontend belum implement UI
   - All lists load semua data

5. **No Bulk Operations** (Low Priority):
   - Delete hanya 1-1
   - Future: Add bulk delete, bulk approve

6. **Limited File Types** (Low Priority):
   - Saat ini hanya PDF
   - Future: Support Word, Excel untuk templates

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] All tests passing
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Prisma schema valid: `npx prisma validate`
- [ ] Environment variables set
- [ ] Database backed up

### Production Setup:
- [ ] VPS configured (Ubuntu 20.04+)
- [ ] Node.js 18+ installed
- [ ] MySQL/PostgreSQL running
- [ ] Nginx/Apache configured
- [ ] SSL certificate installed
- [ ] PM2 installed & configured
- [ ] GitHub Actions secrets set

### Post-Deployment:
- [ ] Smoke testing (login, create proposal, review)
- [ ] Performance testing
- [ ] Security scan
- [ ] Backup strategy verified
- [ ] Monitoring setup (logs, uptime)
- [ ] User training completed

---

## 📈 SUCCESS METRICS

### Technical Metrics:
- ✅ Page load time < 2s
- ✅ API response time < 500ms
- ✅ Zero critical bugs
- ✅ 95%+ uptime
- ✅ Mobile responsive (all pages)

### Business Metrics:
- ✅ All LPPM workflows digital
- ✅ Reduce paperwork by 80%
- ✅ Proposal processing time: 7 days (from 14 days)
- ✅ Monitoring compliance: 90%+
- ✅ User satisfaction: 4/5 stars

### User Adoption:
- Week 1: Admin & 5 dosen (pilot testing)
- Week 2: All dosen & reviewers
- Week 3: All mahasiswa
- Month 1: Full adoption

---

## 💡 TIPS & BEST PRACTICES

### Development:
1. **Always test locally** before push
2. **Use branches** for features (feature/dashboard-enhancement)
3. **Commit messages** yang jelas (feat: Add dashboard charts)
4. **Code review** sebelum merge ke master
5. **Backup database** sebelum migration

### Database:
1. **Always backup** sebelum migration
2. **Test migration** di local dulu
3. **Use transactions** untuk operasi critical
4. **Add indexes** untuk query yang sering
5. **Cascade delete** dengan hati-hati

### Security:
1. **Never commit** .env file
2. **Validate input** di frontend & backend
3. **Use prepared statements** (Prisma auto)
4. **Rate limiting** untuk API
5. **HTTPS only** di production

### Performance:
1. **Lazy load** components yang berat
2. **Cache** API responses (saat production)
3. **Compress images** sebelum upload
4. **CDN** untuk static assets
5. **Database indexing** yang proper

---

## 🎓 LEARNING RESOURCES

### Next.js 15:
- [Official Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Prisma:
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### UI/UX:
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)

### Charts:
- [Recharts Docs](https://recharts.org)
- [Chart.js](https://www.chartjs.org)

---

## 📞 SUPPORT & MAINTENANCE

### Bug Reports:
- Create GitHub issue dengan label `bug`
- Include: Steps to reproduce, expected vs actual, screenshots
- Priority levels: Critical, High, Medium, Low

### Feature Requests:
- Create GitHub issue dengan label `enhancement`
- Include: User story, business value, mockups

### Maintenance Schedule:
- Database backup: Daily at 2 AM
- System updates: Monthly (last Sunday)
- Security patches: As needed
- Performance review: Quarterly

---

## ✅ FINAL CHECKLIST

### Before Closing Sprint 1:
- [ ] Dashboard admin real data
- [ ] Dashboard dosen real data
- [ ] Charts working (Pie, Line)
- [ ] Export Excel working
- [ ] Export PDF working
- [ ] All stats accurate
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Documentation updated

### Before Closing Sprint 2:
- [ ] Luaran CRUD working
- [ ] Admin verification working
- [ ] Kontrak generation working
- [ ] SK generation working
- [ ] File uploads working
- [ ] Validation rules enforced
- [ ] Mobile responsive
- [ ] Documentation updated

### Before Closing Sprint 3:
- [ ] PKM CRUD working
- [ ] Mitra PKM field working
- [ ] PKM separate from Penelitian
- [ ] Navigation updated
- [ ] Dashboard stats include PKM
- [ ] Mobile responsive
- [ ] Documentation updated

### Before Closing Sprint 4:
- [ ] Notifications displaying
- [ ] Badge count accurate
- [ ] Mark as read working
- [ ] Auto refresh working
- [ ] All events trigger notifications
- [ ] Navigation from notification working
- [ ] Mobile responsive
- [ ] Documentation updated

### Before Closing Sprint 5:
- [ ] Pencairan CRUD working
- [ ] Termin validation working
- [ ] Bukti transfer upload working
- [ ] Status tracking accurate
- [ ] Dosen can view (read-only)
- [ ] Mobile responsive
- [ ] Documentation updated

### Before Going Live:
- [ ] All sprints complete
- [ ] All tests passing
- [ ] Production build successful
- [ ] Database migrated
- [ ] Environment configured
- [ ] SSL certificate installed
- [ ] Backup strategy active
- [ ] User guide complete
- [ ] Training completed
- [ ] Stakeholder approval

---

**Document Version**: 1.0  
**Last Updated**: 30 November 2025  
**Next Review**: After Sprint 1 completion  
**Maintainer**: Development Team

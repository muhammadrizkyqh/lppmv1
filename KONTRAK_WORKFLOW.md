# Workflow Kontrak Penelitian - Quick Reference

## Status Flow (BENAR)

```
DRAFT (Dosen buat proposal)
  ↓
DIAJUKAN (Dosen submit)
  ↓
DIREVIEW (Admin assign 2 reviewers)
  ↓
[Reviewers submit reviews]
  ↓
DITERIMA (Admin approve)
  ↓
[AUTO: Kontrak & SK created - status DRAFT]
  ↓
[Admin upload signed kontrak & SK PDFs]
  ↓
Kontrak status: SIGNED
Proposal status: BERJALAN
  ↓
[Dosen can now upload monitoring]
  ↓
SELESAI
```

## API Endpoints

### Admin - Kontrak Management

**List Kontrak**
```
GET /api/kontrak
Query params: ?status=DRAFT&search=keyword
Returns: Array of kontrak with proposal details
```

**Create Kontrak (Manual - jarang dipakai)**
```
POST /api/kontrak
Body: { proposalId: string }
Returns: Created kontrak with auto-generated nomor
Note: Biasanya auto-created saat approve proposal
```

**Get Kontrak Detail**
```
GET /api/kontrak/:id
Returns: Full kontrak with proposal, team, creator, uploader info
```

**Update Kontrak Status**
```
PATCH /api/kontrak/:id
Body: { status: "DRAFT" | "SIGNED" | "AKTIF" | "SELESAI" }
```

**Upload Signed Kontrak & SK**
```
PATCH /api/kontrak/:id/upload-ttd
Body: FormData with fileKontrak (PDF) and fileSK (PDF)
Effect: 
  - Updates kontrak: add files, status → SIGNED
  - Updates proposal: status DITERIMA → BERJALAN (ATOMIC TRANSACTION)
```

### Dosen - View Kontrak

**My Proposals (includes kontrak if exists)**
```
GET /api/proposal/my-proposals
Returns: Array of proposals with kontrak relation
Filter in frontend: status in [DITERIMA, BERJALAN, SELESAI]
```

## UI Pages

### Admin
- `/admin/kontrak` - List all kontrak with filters
- `/admin/kontrak/:id` - Detail, upload TTD, manage status

### Dosen
- `/dosen/kontrak` - View my kontrak, download PDFs

## Auto-Generation Format

**Nomor Kontrak:**
```
KNT/LPPM/2025/001
KNT/LPPM/2025/002
...
(Resets each year)
```

**Nomor SK:**
```
SK/LPPM/PENELITIAN/2025/001
SK/LPPM/PENELITIAN/2025/002
...
(Resets each year)
```

## Database Schema

```prisma
model Kontrak {
  id              String   @id @default(cuid())
  proposalId      String   @unique
  nomorKontrak    String   @unique
  nomorSK         String   @unique
  tanggalKontrak  DateTime @default(now())
  status          String   // DRAFT | SIGNED | AKTIF | SELESAI
  
  // Files (uploaded after TTD)
  fileKontrak     String?  // PDF signed kontrak
  fileSK          String?  // PDF signed SK
  
  // Audit
  createdBy       String
  createdAt       DateTime @default(now())
  uploadedBy      String?
  uploadedAt      DateTime?
  
  // Relations
  proposal        Proposal @relation(fields: [proposalId], references: [id])
  creator         User     @relation("KontrakCreator", fields: [createdBy], references: [id])
  uploader        User?    @relation("KontrakUploader", fields: [uploadedBy], references: [id])
}
```

## Critical Workflow Points

### ✅ BENAR (After Fix)

1. **Approve Proposal**
   - Admin click "Setujui" di proposal
   - API: `PATCH /api/proposal/:id/approve`
   - Transaction:
     * Update proposal status → DITERIMA
     * Create Kontrak (DRAFT) with auto nomor
   - Proposal STAYS at DITERIMA (not BERJALAN yet!)

2. **Upload TTD**
   - Admin upload signed PDFs
   - API: `PATCH /api/kontrak/:id/upload-ttd`
   - Transaction:
     * Update kontrak: files + status SIGNED
     * Update proposal: status → BERJALAN
   - NOW dosen can upload monitoring

3. **Upload Monitoring**
   - Dosen submit laporan kemajuan
   - API: `PATCH /api/monitoring/:proposalId/upload-kemajuan`
   - Validation: Requires proposal status = BERJALAN
   - Error if DITERIMA: "Monitoring hanya untuk proposal yang sudah BERJALAN (kontrak sudah ditandatangani)"

### ❌ SALAH (Before Fix)

~~Upload monitoring auto-changed DITERIMA → BERJALAN~~ ← REMOVED!

## Fixes Implemented

### Anomaly #1: Missing Kontrak Workflow
**Before:** No kontrak system at all  
**After:** Complete kontrak module with auto-generation

### Anomaly #2: Workaround Status Change  
**Before:** `upload-kemajuan` had workaround: `if (DITERIMA) { change to BERJALAN }`  
**After:** Clean validation: only accept BERJALAN, proper error message

### Anomaly #3: Missing Kontrak Table
**Before:** No database table  
**After:** Full Kontrak model with relations, audit fields, file storage

## Testing Checklist

- [ ] Create proposal as Dosen → DRAFT
- [ ] Submit proposal → DIAJUKAN
- [ ] Admin assign 2 reviewers → DIREVIEW
- [ ] Both reviewers submit reviews
- [ ] Admin approve → DITERIMA + Kontrak created (DRAFT)
- [ ] Verify: Kontrak has auto-generated nomor (KNT/LPPM/2025/XXX)
- [ ] Verify: Kontrak has auto-generated SK (SK/LPPM/PENELITIAN/2025/XXX)
- [ ] Dosen try upload monitoring → SHOULD FAIL (not BERJALAN yet)
- [ ] Admin view kontrak list → Shows DRAFT status
- [ ] Admin view kontrak detail → All info correct
- [ ] Admin upload kontrak PDF + SK PDF → Success
- [ ] Verify: Kontrak status → SIGNED
- [ ] Verify: Proposal status → BERJALAN (AUTO)
- [ ] Dosen view kontrak page → See signed kontrak
- [ ] Dosen download kontrak PDF → Success
- [ ] Dosen download SK PDF → Success
- [ ] Dosen upload monitoring → NOW SUCCESS (status BERJALAN)

## Navigation Menu

**Admin Sidebar:**
```
Penelitian & PKM
  ├─ Semua Proposal
  ├─ Review & Approval
  ├─ Kontrak Penelitian  ← NEW
  └─ Monitoring
```

**Dosen Sidebar:**
```
Penelitian & PKM
  ├─ Proposal Saya
  ├─ Ajukan Proposal
  ├─ Kontrak Saya  ← NEW
  └─ Monitoring & Laporan
```

## File Structure

```
app/
├─ api/
│  ├─ kontrak/
│  │  ├─ route.ts              (GET list, POST create)
│  │  └─ [id]/
│  │     ├─ route.ts           (GET detail, PATCH status)
│  │     └─ upload-ttd/
│  │        └─ route.ts        (PATCH upload PDFs)
│  ├─ proposal/
│  │  └─ [id]/
│  │     └─ approve/
│  │        └─ route.ts        (MODIFIED: auto-create kontrak)
│  └─ monitoring/
│     └─ [proposalId]/
│        └─ upload-kemajuan/
│           └─ route.ts        (FIXED: removed workaround)
├─ admin/
│  └─ kontrak/
│     ├─ page.tsx              (List page)
│     └─ [id]/
│        └─ page.tsx           (Detail + upload page)
└─ dosen/
   └─ kontrak/
      └─ page.tsx              (View my kontrak)

lib/
└─ kontrak-generator.ts        (Auto-generate nomor)

prisma/
└─ schema.prisma               (Added Kontrak model)

components/
└─ layout/
   └─ dashboard-layout.tsx     (Updated navigation)
```

## Next Steps (Remaining Anomalies)

**Option B: Fix Review Scoring (Anomaly #4)**
- Update formula from (K1+K2+K3+K4)/4 to weighted or sum-based
- 3-4 hours

**Option C: Fix Validators (Anomalies #6, #7)**
- Fix ketua check (Dosen.id vs Reviewer.userId mismatch)
- Add anggota tim validation
- 2-3 hours

**Future Sprints:**
- Luaran Module (Anomaly #10)
- Pencairan Dana (Anomaly #9)
- Complete Monitoring Logic (Anomaly #11)
- Revisi Count Enforcement (Anomaly #8)

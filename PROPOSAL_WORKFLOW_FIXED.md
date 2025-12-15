# ✅ WORKFLOW PROPOSAL - SUDAH DIPERBAIKI

## 🔄 Alur Status Proposal yang BENAR

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOW PROPOSAL                              │
└─────────────────────────────────────────────────────────────────────────┘

1. DRAFT
   ↓ [Dosen buat proposal]
   ↓
2. DIAJUKAN ✅
   ↓ [Dosen submit proposal]
   ↓
3. [Admin Penilaian Administratif]
   │
   ├─→ LOLOS → tetap DIAJUKAN ✅
   │   ↓
   │   [Admin jadwalkan Seminar Proposal]
   │   ↓
   │   Seminar Proposal SELESAI
   │   ↓
   │   DIREVIEW ✅ (siap assign reviewer)
   │   ↓
   │   [Admin assign 2 reviewers]
   │   ↓
   │   [Reviewers submit review]
   │   ↓
   │   DITERIMA / DITOLAK
   │
   └─→ TIDAK LOLOS → REVISI
       ↓
       [Dosen upload file revisi]
       ↓
       DIAJUKAN (ulang dari step 2)
```

---

## 📊 Status Proposal & Artinya

| Status | Arti | Who Can Action | Next Step |
|--------|------|----------------|-----------|
| **DRAFT** | Proposal sedang dibuat | Dosen | Submit proposal |
| **DIAJUKAN** | Proposal sudah disubmit, menunggu penilaian admin | Admin | Penilaian administratif |
| **REVISI** | Proposal tidak lolos administratif, perlu revisi | Dosen | Upload file revisi |
| **DIREVIEW** | Proposal lolos seminar, siap di-review | Admin | Assign 2 reviewers |
| **DITERIMA** | Proposal diterima setelah review | Admin | Generate kontrak & SK |
| **DITOLAK** | Proposal ditolak | - | End |
| **BERJALAN** | Kontrak sudah signed, penelitian berjalan | Dosen | Upload monitoring |
| **SELESAI** | Penelitian selesai | - | End |

---

## 🚨 ANOMALI YANG SUDAH DIPERBAIKI

### ❌ SEBELUM (SALAH):
```typescript
// File: assign-reviewers/route.ts
if (proposal.status !== 'DIAJUKAN') {
  return error('Hanya DIAJUKAN yang bisa direview')
}
```

**Masalah:**
- Setelah penilaian administratif LOLOS → status jadi `LULUS_ADMINISTRATIF`
- Tapi kondisi assign reviewer cek `DIAJUKAN`
- **Akibat:** Proposal yang sudah ACC administratif TIDAK BISA di-assign reviewer! ❌

### ✅ SESUDAH (BENAR):
```typescript
// File: assign-reviewers/route.ts
if (proposal.status !== 'DIREVIEW') {
  return error('Hanya DIREVIEW yang bisa di-assign reviewer')
}
```

**Perbaikan:**
- Assign reviewer hanya bisa setelah status `DIREVIEW`
- Status `DIREVIEW` didapat setelah **Seminar Proposal SELESAI**
- Alur sekarang konsisten! ✅

---

## 🔧 FILE YANG SUDAH DIPERBAIKI

### 1. `/app/api/proposal/[id]/assign-reviewers/route.ts`
**Perubahan:**
- ❌ Cek status: `DIAJUKAN`
- ✅ Cek status: `DIREVIEW`
- ✅ Error message lebih jelas: menampilkan status saat ini

### 2. `/app/api/proposal/[id]/penilaian-administratif/route.ts`
**Perubahan:**
- ❌ LOLOS → status `LULUS_ADMINISTRATIF`
- ✅ LOLOS → status tetap `DIAJUKAN` (admin bisa jadwalkan seminar)
- ✅ Pesan response lebih jelas: "Silakan jadwalkan seminar proposal"

---

## 📝 CHECKLIST ADMIN

### Step 1: Penilaian Administratif
- [ ] Proposal dengan status `DIAJUKAN`
- [ ] Cek kelengkapan dokumen (14 checklist)
- [ ] Pilih: **LOLOS** atau **TIDAK LOLOS**
- [ ] Jika **LOLOS** → status tetap `DIAJUKAN`, lanjut jadwalkan seminar
- [ ] Jika **TIDAK LOLOS** → status jadi `REVISI`, dosen harus upload ulang

### Step 2: Jadwalkan Seminar Proposal
- [ ] Proposal dengan status `DIAJUKAN` + statusAdministrasi `LOLOS`
- [ ] Buat seminar dengan jenis `PROPOSAL`
- [ ] Set tanggal, waktu, tempat, moderator
- [ ] Undang peserta

### Step 3: Update Seminar Status SELESAI
- [ ] Setelah seminar selesai
- [ ] Update status seminar → `SELESAI`
- [ ] **OTOMATIS:** Proposal status jadi `DIREVIEW`
- [ ] Lanjut assign reviewer

### Step 4: Assign Reviewer
- [ ] Proposal dengan status `DIREVIEW`
- [ ] Pilih 2 reviewer (tidak boleh ketua/anggota tim)
- [ ] Set deadline (default 7 hari)
- [ ] **OTOMATIS:** Status tetap `DIREVIEW`

### Step 5: Tunggu Review Selesai
- [ ] 2 reviewer submit review
- [ ] Admin lihat perbandingan review
- [ ] Admin approve/reject proposal

### Step 6: Approve Proposal
- [ ] Proposal dengan status `DIREVIEW` + semua review selesai
- [ ] Admin approve → status jadi `DITERIMA`
- [ ] **OTOMATIS:** Generate kontrak & SK

---

## 🎯 TESTING CHECKLIST

### Test Case 1: Happy Path (Lolos Langsung)
```
1. ✅ Dosen buat proposal → DRAFT
2. ✅ Dosen submit → DIAJUKAN
3. ✅ Admin penilaian administratif → LOLOS → tetap DIAJUKAN
4. ✅ Admin jadwalkan seminar proposal
5. ✅ Admin update seminar SELESAI → DIREVIEW
6. ✅ Admin assign 2 reviewers → tetap DIREVIEW
7. ✅ 2 Reviewers submit review
8. ✅ Admin approve → DITERIMA
9. ✅ Kontrak & SK auto-generated
```

### Test Case 2: Ada Revisi Administratif
```
1. ✅ Dosen buat proposal → DRAFT
2. ✅ Dosen submit → DIAJUKAN
3. ✅ Admin penilaian administratif → TIDAK LOLOS → REVISI
4. ✅ Dosen upload file revisi → DIAJUKAN (ulang)
5. ✅ Admin penilaian administratif lagi → LOLOS → tetap DIAJUKAN
6. ✅ Lanjut seperti happy path (step 4-9)
```

### Test Case 3: Coba Assign Reviewer Sebelum Seminar (Harus Gagal)
```
1. ✅ Dosen submit → DIAJUKAN
2. ✅ Admin penilaian administratif → LOLOS → tetap DIAJUKAN
3. ❌ Admin coba assign reviewer → ERROR: "Hanya DIREVIEW yang bisa di-assign"
4. ✅ Admin jadwalkan seminar dulu
5. ✅ Admin update seminar SELESAI → DIREVIEW
6. ✅ Admin assign reviewer → SUKSES
```

---

## 📌 CATATAN PENTING

### Status `LULUS_ADMINISTRATIF` Tidak Digunakan
- Status `LULUS_ADMINISTRATIF` tetap ada di enum tapi **TIDAK DIGUNAKAN**
- Alasan: Tidak perlu status intermediate antara penilaian admin dan seminar
- Setelah LOLOS administratif, status tetap `DIAJUKAN` sampai seminar selesai

### Field `statusAdministrasi` untuk Tracking
- Field terpisah untuk tracking hasil penilaian administratif
- Value: `BELUM_DICEK`, `LOLOS`, `TIDAK_LOLOS`
- Berguna untuk filter proposal mana yang sudah/belum dicek admin
- Berguna untuk filter proposal mana yang bisa dijadwalkan seminar (status `DIAJUKAN` + statusAdministrasi `LOLOS`)

### Seminar Proposal adalah Gatekeeper
- **Seminar Proposal WAJIB** sebelum bisa assign reviewer
- Ini sesuai aturan akademik: proposal harus dipresentasikan dulu
- Setelah seminar selesai, baru bisa masuk tahap peer review

---

## 🔍 Query untuk Cek Status

```sql
-- Proposal yang sudah submit, belum dicek admin
SELECT * FROM proposal 
WHERE status = 'DIAJUKAN' 
AND statusAdministrasi = 'BELUM_DICEK';

-- Proposal yang lolos admin, siap dijadwalkan seminar
SELECT * FROM proposal 
WHERE status = 'DIAJUKAN' 
AND statusAdministrasi = 'LOLOS'
AND id NOT IN (SELECT proposalId FROM seminar WHERE jenis = 'PROPOSAL');

-- Proposal yang siap di-assign reviewer (seminar sudah selesai)
SELECT * FROM proposal 
WHERE status = 'DIREVIEW';

-- Proposal yang sedang direview
SELECT p.*, COUNT(pr.id) as reviewer_count
FROM proposal p
LEFT JOIN proposal_reviewer pr ON p.id = pr.proposalId
WHERE p.status = 'DIREVIEW'
GROUP BY p.id;

-- Proposal yang review sudah lengkap
SELECT p.*, 
  COUNT(pr.id) as total_reviewers,
  COUNT(r.id) as completed_reviews
FROM proposal p
LEFT JOIN proposal_reviewer pr ON p.id = pr.proposalId
LEFT JOIN review r ON pr.id = r.proposalReviewerId
WHERE p.status = 'DIREVIEW'
GROUP BY p.id
HAVING total_reviewers = 2 AND completed_reviews = 2;
```

---

## ✅ SUMMARY

### Yang Sudah Diperbaiki:
1. ✅ Kondisi assign reviewer: `DIAJUKAN` → `DIREVIEW`
2. ✅ Status setelah lolos administratif: `LULUS_ADMINISTRATIF` → tetap `DIAJUKAN`
3. ✅ Error message lebih informatif
4. ✅ Response message lebih jelas

### Alur Sekarang:
```
DRAFT → DIAJUKAN → [Admin Check] → DIAJUKAN (if LOLOS) → 
[Seminar Proposal] → DIREVIEW → [Assign Reviewer] → 
[Review] → DITERIMA → BERJALAN → SELESAI
```

### Alur Revisi:
```
DIAJUKAN → [Admin Check] → REVISI (if TIDAK LOLOS) → 
[Upload Revisi] → DIAJUKAN (ulang cek admin)
```

---

## 🐛 ANOMALI SEMINAR (FIXED)

### Masalah:
Frontend form mengirim data seminar tapi backend validasi gagal dengan error "Semua field wajib diisi" padahal semua sudah diisi.

### Root Cause:
1. **Backend meminta field `judul`** sebagai required, tapi **frontend tidak mengirim field ini**
   - `judul` seharusnya otomatis dari `proposal.judul`
   
2. **Backend meminta field `tempat`** sebagai required, tapi **frontend membuat field ini optional**
   - `tempat` seharusnya boleh kosong

3. **Frontend mengirim `linkOnline` dan `keterangan`** tapi **schema database tidak punya field ini**

### Perbaikan:
1. ✅ Backend: Hapus validasi `judul` dan `tempat` dari required fields
2. ✅ Backend: Terima field `linkOnline` dan `keterangan` dari frontend
3. ✅ Schema: Tambah field `linkOnline` dan `keterangan` di model seminar
4. ✅ Database: Push schema changes

### File yang Diperbaiki:
- `/app/api/seminar/route.ts` - Validasi dan data creation
- `/prisma/schema.prisma` - Tambah field linkOnline & keterangan

---

**Last Updated:** 2025-12-16
**Status:** ✅ Fixed & Tested

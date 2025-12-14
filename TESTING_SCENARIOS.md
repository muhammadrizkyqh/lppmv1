# 📋 TESTING SCENARIOS - SISTEM LPPM
## Panduan Testing Lengkap & Kemungkinan Bug

---

## 🔧 PERSIAPAN TESTING

### 1. Setup Awal
- [ ] Restart TypeScript Server (`Ctrl+Shift+P` → "TypeScript: Restart TS Server")
- [ ] Pastikan tidak ada error TypeScript
- [ ] Check database connection (`npx prisma db pull`)
- [ ] Clear browser cache & cookies
- [ ] Prepare test files:
  - PDF proposal (max 10MB)
  - PDF kontrak dummy
  - PDF laporan monitoring
  - PDF laporan akhir
  - PDF/image bukti luaran
  - PDF bukti transfer

### 2. User Accounts yang Dibutuhkan
- **Admin:** username/password dari database
- **Dosen 1:** Ketua penelitian utama
- **Dosen 2:** Anggota penelitian
- **Mahasiswa:** Anggota penelitian

---

## 📝 SKENARIO TESTING LENGKAP

---

## MODUL 1: AUTHENTICATION & USER MANAGEMENT

### Test Case 1.1: Login
**Steps:**
1. Akses `/login`
2. Login dengan kredensial admin
3. Check redirect ke dashboard admin

**Expected Result:**
- ✅ Login berhasil
- ✅ Redirect ke `/admin/dashboard`
- ✅ Session tersimpan (tidak logout saat refresh)

**Kemungkinan Bug:**
- ❌ Session expired terlalu cepat
- ❌ Redirect loop ke login
- ❌ Cookie tidak tersimpan (SameSite issue)

### Test Case 1.2: Role-Based Access
**Steps:**
1. Login sebagai Dosen
2. Coba akses `/admin/proposals` (admin only)
3. Check error 403/redirect

**Expected Result:**
- ✅ Dosen tidak bisa akses admin pages
- ✅ Redirect atau error message muncul

**Kemungkinan Bug:**
- ❌ Bisa akses halaman admin tanpa authorization
- ❌ API endpoint tidak check role

---

## MODUL 2: DATA MASTER

### Test Case 2.1: Periode
**Steps:**
1. Login Admin → `/admin/periode`
2. Create periode baru (status AKTIF)
3. Edit periode
4. Check hanya 1 periode bisa AKTIF

**Expected Result:**
- ✅ Hanya 1 periode AKTIF
- ✅ Edit berhasil
- ✅ Validation tanggal tutup > tanggal buka

**Kemungkinan Bug:**
- ❌ Bisa set multiple periode AKTIF
- ❌ Tanggal tutup < tanggal buka accepted
- ❌ Periode AKTIF tapi sudah lewat tanggal tutup

### Test Case 2.2: Skema
**Steps:**
1. `/admin/skema`
2. Create skema dengan dana 5000000
3. Edit nominal dana
4. Set status NONAKTIF

**Expected Result:**
- ✅ Skema tersimpan dengan benar
- ✅ Dana dalam format decimal (15,2)
- ✅ Skema NONAKTIF tidak muncul di form proposal

**Kemungkinan Bug:**
- ❌ Dana hilang decimal pointnya
- ❌ Skema NONAKTIF masih bisa dipilih
- ❌ Validation minimal dana tidak jalan

### Test Case 2.3: Dosen
**Steps:**
1. `/admin/dosen`
2. Create dosen baru dengan NIDN
3. Check auto-create user account
4. Login dengan akun dosen baru (password default)

**Expected Result:**
- ✅ User account auto-created
- ✅ Must change password on first login
- ✅ NIDN unique validation

**Kemungkinan Bug:**
- ❌ Duplicate NIDN accepted
- ❌ User account tidak auto-created
- ❌ Password tidak encrypted

---

## MODUL 3: PROPOSAL WORKFLOW

### Test Case 3.1: Submit Proposal (Dosen)
**Steps:**
1. Login Dosen → `/dosen/proposals`
2. Create proposal baru
3. Pilih periode AKTIF, skema, judul, abstrak
4. Upload file PDF proposal
5. Submit

**Expected Result:**
- ✅ Proposal saved dengan status DIAJUKAN
- ✅ File uploaded ke `/public/uploads/proposals`
- ✅ Ketua auto-assigned (dosen yang login)
- ✅ Email/notifikasi ke admin (jika ada)

**Kemungkinan Bug:**
- ❌ File upload gagal (permission denied di /public)
- ❌ File > 10MB accepted
- ❌ Non-PDF file accepted
- ❌ Bisa submit tanpa file
- ❌ Bisa submit di periode NONAKTIF
- ❌ Bisa submit multiple proposal sebagai ketua di periode yang sama
- ❌ File path salah (tidak bisa di-download)

### Test Case 3.2: Add Team Members
**Steps:**
1. Buka proposal yang baru dibuat
2. Add anggota dosen
3. Add anggota mahasiswa
4. Check maksimal 4 orang total

**Expected Result:**
- ✅ Anggota bertambah
- ✅ Max 4 orang (including ketua)
- ✅ Tidak bisa add dosen/mahasiswa yang sama 2x

**Kemungkinan Bug:**
- ❌ Bisa add > 4 anggota
- ❌ Duplicate member accepted
- ❌ Bisa add diri sendiri sebagai anggota

### Test Case 3.3: Review & Assign Reviewer (Admin)
**Steps:**
1. Login Admin → `/admin/reviews`
2. Assign 2 reviewer untuk proposal
3. Set deadline 7 hari

**Expected Result:**
- ✅ Status proposal jadi DIREVIEW
- ✅ Reviewer dapat notifikasi
- ✅ Deadline calculated correctly

**Kemungkinan Bug:**
- ❌ Bisa assign < 2 atau > 2 reviewer
- ❌ Bisa assign reviewer yang sama 2x
- ❌ Deadline tidak tersimpan

### Test Case 3.4: Submit Review (Reviewer)
**Steps:**
1. Login Reviewer
2. Akses proposal yang di-assign
3. Isi 4 kriteria penilaian (1-100)
4. Pilih rekomendasi (DITERIMA/REVISI/DITOLAK)
5. Submit review

**Expected Result:**
- ✅ Nilai total auto-calculated (avg 4 kriteria)
- ✅ Review tersimpan
- ✅ Status reviewer jadi SELESAI

**Kemungkinan Bug:**
- ❌ Nilai di luar range 1-100 accepted
- ❌ Nilai total salah calculate
- ❌ Bisa submit tanpa catatan untuk REVISI/DITOLAK
- ❌ Bisa submit review 2x (overwrite)

### Test Case 3.5: Keputusan Proposal (Admin)
**Steps:**
1. Wait sampai 2 reviewer submit
2. Admin buka proposal
3. Lihat hasil review
4. Approve proposal (status → DITERIMA)

**Expected Result:**
- ✅ Hanya bisa approve jika 2 review selesai
- ✅ Status berubah ke DITERIMA
- ✅ Dosen dapat notifikasi

**Kemungkinan Bug:**
- ❌ Bisa approve dengan < 2 review
- ❌ Status tidak update
- ❌ Nilai review tidak muncul

### Test Case 3.6: Revisi Proposal (Dosen)
**Steps:**
1. Proposal direject → revisi required
2. Dosen upload file revisi
3. Submit ulang
4. Admin approve

**Expected Result:**
- ✅ Revisi count bertambah
- ✅ Max 2x revisi
- ✅ File revisi tersimpan terpisah
- ✅ Status kembali DIREVIEW

**Kemungkinan Bug:**
- ❌ Bisa revisi > 2x
- ❌ File revisi overwrite file asli
- ❌ Revisi count tidak update

---

## MODUL 4: KONTRAK & SK

### Test Case 4.1: Generate Kontrak (Admin)
**Steps:**
1. Proposal status DITERIMA
2. Admin → `/admin/kontrak`
3. Create kontrak untuk proposal
4. Check nomor kontrak & SK auto-generated

**Expected Result:**
- ✅ Nomor unique: `KNT/LPPM/2025/001`
- ✅ SK unique: `SK/LPPM/PENELITIAN/2025/001`
- ✅ Counter increment otomatis
- ✅ Status DRAFT

**Kemungkinan Bug:**
- ❌ Nomor duplicate
- ❌ Counter tidak increment
- ❌ Format nomor salah
- ❌ Bisa create multiple kontrak untuk 1 proposal

### Test Case 4.2: Upload TTD Kontrak (Admin)
**Steps:**
1. Upload file kontrak yang sudah TTD (PDF)
2. Upload file SK yang sudah TTD (PDF)
3. Submit

**Expected Result:**
- ✅ Status kontrak → SIGNED
- ✅ Status proposal → BERJALAN
- ✅ **Auto-create Termin 1 (50%) dengan status PENDING**
- ✅ Dosen bisa download kontrak & SK

**Kemungkinan Bug:**
- ❌ Non-PDF accepted
- ❌ File > 10MB accepted
- ❌ **Termin 1 tidak auto-created** (CRITICAL!)
- ❌ **Nominal Termin 1 salah (bukan 50% dari skema.dana)**
- ❌ Status proposal tidak update ke BERJALAN

---

## MODUL 5: PENCAIRAN DANA (CRITICAL!)

### Test Case 5.1: Termin 1 Auto-Created
**Steps:**
1. After upload TTD kontrak
2. Check `/admin/pencairan`
3. Verify Termin 1 exists

**Expected Result:**
- ✅ Termin 1 auto-created
- ✅ Nominal = 50% dari skema.dana
- ✅ Status PENDING
- ✅ createdBy = admin yang upload kontrak

**Kemungkinan Bug:**
- ❌ **Termin 1 tidak muncul** (check migration)
- ❌ **Nominal = 0 atau salah**
- ❌ **Duplicate Termin 1 jika upload TTD 2x**

### Test Case 5.2: Upload Bukti Transfer & Cairkan (Admin)
**Steps:**
1. Admin pilih Termin 1 PENDING
2. Upload bukti transfer (PDF/image)
3. Update status → DICAIRKAN
4. Set tanggal pencairan
5. Isi keterangan (optional)

**Expected Result:**
- ✅ File uploaded ke `/public/uploads/pencairan`
- ✅ Status → DICAIRKAN
- ✅ Tanggal pencairan tersimpan
- ✅ Dosen bisa lihat di proposal detail

**Kemungkinan Bug:**
- ❌ File upload gagal
- ❌ Tanggal pencairan tidak required
- ❌ Bisa update status tanpa upload bukti
- ❌ Bisa update dari DICAIRKAN ke PENDING (should be locked)

### Test Case 5.3: Create Termin 2 (Admin)
**Steps:**
1. **Prerequisite:** 2 monitoring APPROVED + Termin 1 DICAIRKAN
2. Admin create Termin 2
3. Check validation

**Expected Result:**
- ✅ **Reject jika < 2 monitoring verified**
- ✅ **Reject jika Termin 1 belum DICAIRKAN**
- ✅ Nominal = 25% dari skema.dana
- ✅ Status PENDING

**Kemungkinan Bug:**
- ❌ **Bisa create tanpa 2 monitoring verified** (CRITICAL!)
- ❌ **Bisa create tanpa Termin 1 dicairkan**
- ❌ Nominal salah (bukan 25%)
- ❌ Bisa create duplicate Termin 2

### Test Case 5.4: Create Termin 3 (Admin)
**Steps:**
1. **Prerequisite:** Termin 2 DICAIRKAN + min 1 luaran DIVERIFIKASI
2. Admin create Termin 3
3. Check validation

**Expected Result:**
- ✅ **Reject jika Termin 2 belum DICAIRKAN**
- ✅ **Reject jika belum ada luaran DIVERIFIKASI** (NEW!)
- ✅ Nominal = 25%
- ✅ Status PENDING

**Kemungkinan Bug:**
- ❌ **Bisa create tanpa luaran verified** (CRITICAL!)
- ❌ **Bisa create tanpa Termin 2 dicairkan**
- ❌ Nominal salah
- ❌ Bisa create duplicate Termin 3

### Test Case 5.5: Filter & Stats
**Steps:**
1. `/admin/pencairan`
2. Filter by status, termin, periode
3. Search by judul proposal
4. Check stats cards

**Expected Result:**
- ✅ Filter working
- ✅ Stats accurate (total, pending, dicairkan, ditolak)
- ✅ Total nominal correct

**Kemungkinan Bug:**
- ❌ Filter tidak bekerja
- ❌ Stats calculation salah
- ❌ Search tidak case-insensitive

---

## MODUL 6: MONITORING & LAPORAN

### Test Case 6.1: Upload Laporan Kemajuan (Dosen)
**Steps:**
1. Dosen buka proposal BERJALAN
2. Upload laporan kemajuan 1 (PDF)
3. Isi progress % dan kendala
4. Submit

**Expected Result:**
- ✅ File uploaded
- ✅ Status monitoring created/updated
- ✅ Admin dapat notifikasi

**Kemungkinan Bug:**
- ❌ File upload gagal
- ❌ Progress % di luar 0-100 accepted
- ❌ Bisa upload > 2x laporan kemajuan

### Test Case 6.2: Verifikasi Monitoring (Admin)
**Steps:**
1. Admin → `/admin/monitoring`
2. Pilih monitoring PENDING
3. Verify atau Reject
4. Isi catatan

**Expected Result:**
- ✅ Status → APPROVED/REJECTED
- ✅ verifiedAt timestamp saved
- ✅ Catatan tersimpan
- ✅ Dosen dapat notifikasi

**Kemungkinan Bug:**
- ❌ Bisa verify tanpa catatan untuk REJECTED
- ❌ verifiedAt tidak tersimpan
- ❌ Bisa verify 2x (overwrite)

### Test Case 6.3: Upload Laporan Akhir (Dosen)
**Steps:**
1. After 2 monitoring APPROVED
2. Upload laporan akhir (PDF)
3. Submit

**Expected Result:**
- ✅ File uploaded
- ✅ verifikasiAkhirStatus = NULL (waiting admin)

**Kemungkinan Bug:**
- ❌ Bisa upload tanpa 2 monitoring approved
- ❌ File upload gagal

### Test Case 6.4: Verifikasi Laporan Akhir (Admin)
**Steps:**
1. Admin verify laporan akhir
2. Check status

**Expected Result:**
- ✅ verifikasiAkhirStatus = APPROVED
- ✅ **Dosen sekarang bisa upload luaran** (NEW!)

**Kemungkinan Bug:**
- ❌ Status tidak update
- ❌ Dosen tidak bisa upload luaran setelah verify

---

## MODUL 7: LUARAN PENELITIAN (NEW!)

### Test Case 7.1: Submit Luaran (Dosen)
**Steps:**
1. **Prerequisite:** Laporan akhir APPROVED
2. Dosen buka proposal detail
3. Click "Tambah Luaran"
4. Isi:
   - Jenis: JURNAL
   - Judul: "Judul Jurnal Test"
   - Penerbit: "IEEE"
   - Tahun: 2025
   - URL: https://example.com
   - Keterangan: optional
5. Submit

**Expected Result:**
- ✅ **Reject jika laporan akhir belum APPROVED** (CRITICAL!)
- ✅ **Hanya ketua proposal yang bisa submit**
- ✅ Luaran created dengan status PENDING
- ✅ Stats updated

**Kemungkinan Bug:**
- ❌ **Bisa submit tanpa laporan akhir approved**
- ❌ **Anggota bisa submit (bukan ketua)**
- ❌ Validation judul tidak jalan (required)
- ❌ Tahun bisa negatif atau > current year

### Test Case 7.2: Upload Bukti Luaran (Dosen)
**Steps:**
1. After submit luaran
2. Click "Upload Bukti"
3. Upload PDF/image bukti
4. Submit

**Expected Result:**
- ✅ File uploaded ke `/public/uploads/luaran`
- ✅ File type validation (PDF/JPG/PNG only)
- ✅ File size max 10MB
- ✅ fileBukti URL saved

**Kemungkinan Bug:**
- ❌ **Upload gagal (permission/directory issue)**
- ❌ Non-PDF/image accepted
- ❌ File > 10MB accepted
- ❌ File path salah (404 saat download)

### Test Case 7.3: Verifikasi Luaran (Admin)
**Steps:**
1. Admin → `/admin/luaran`
2. Pilih luaran PENDING
3. Click "Verifikasi"
4. Set status DIVERIFIKASI
5. Isi catatan verifikasi (optional)
6. Submit

**Expected Result:**
- ✅ Status → DIVERIFIKASI
- ✅ verifiedBy = admin ID
- ✅ verifiedAt = current timestamp
- ✅ Catatan tersimpan
- ✅ **Sekarang bisa create Termin 3!**

**Kemungkinan Bug:**
- ❌ verifiedBy atau verifiedAt tidak tersimpan
- ❌ **Bisa verify tanpa admin role**
- ❌ Bisa verify 2x (overwrite)

### Test Case 7.4: Reject Luaran (Admin)
**Steps:**
1. Set status DITOLAK
2. Isi catatan (alasan penolakan)
3. Submit

**Expected Result:**
- ✅ Status → DITOLAK
- ✅ Catatan tersimpan
- ✅ Dosen bisa update luaran dan resubmit

**Kemungkinan Bug:**
- ❌ **Catatan tidak required untuk DITOLAK**
- ❌ Dosen tidak bisa update setelah ditolak

### Test Case 7.5: Update Luaran (Dosen)
**Steps:**
1. Luaran dengan status PENDING atau DITOLAK
2. Edit judul, penerbit, dll
3. Submit

**Expected Result:**
- ✅ **Tidak bisa edit jika sudah DIVERIFIKASI** (CRITICAL!)
- ✅ Bisa edit jika PENDING/DITOLAK
- ✅ Update tersimpan

**Kemungkinan Bug:**
- ❌ **Bisa edit luaran yang sudah DIVERIFIKASI**
- ❌ Update tidak tersimpan

### Test Case 7.6: Multiple Luaran
**Steps:**
1. Submit 3 luaran berbeda:
   - JURNAL
   - BUKU
   - HAKI
2. Verify 1 luaran (JURNAL)
3. Try create Termin 3

**Expected Result:**
- ✅ **Termin 3 bisa dibuat (min 1 verified)**
- ✅ Stats correct (3 total, 1 verified, 2 pending)
- ✅ Filter by jenis working

**Kemungkinan Bug:**
- ❌ Stats salah
- ❌ Filter tidak bekerja
- ❌ Duplicate jenis allowed (should allow)

### Test Case 7.7: Luaran List di Proposal Detail (Dosen)
**Steps:**
1. Dosen buka proposal detail
2. Scroll ke section "Luaran Penelitian"
3. Check stats dan list

**Expected Result:**
- ✅ **Section hanya muncul jika status BERJALAN/SELESAI**
- ✅ Stats accurate
- ✅ Info box muncul dengan petunjuk
- ✅ Bisa lihat status verifikasi & catatan admin

**Kemungkinan Bug:**
- ❌ **Section muncul untuk status DRAFT/DIAJUKAN**
- ❌ Stats tidak update real-time
- ❌ Response structure mismatch (data.data vs data)

---

## MODUL 8: INTEGRATION TESTING

### Test Case 8.1: Complete Workflow (End-to-End)
**Steps:**
1. Create proposal → Assign reviewer → Review → Approve
2. Create kontrak → Upload TTD
3. **Check Termin 1 auto-created**
4. Upload bukti Termin 1 → Cairkan
5. Upload 2x monitoring → Verify
6. Create Termin 2 → Cairkan
7. Upload laporan akhir → Verify
8. **Submit luaran → Upload bukti → Verify**
9. **Create Termin 3 (should work now!)**
10. Cairkan Termin 3
11. Check proposal status → SELESAI

**Expected Result:**
- ✅ All steps berhasil tanpa error
- ✅ Data konsisten di semua table
- ✅ File uploads semua tersimpan
- ✅ Status transitions correct

**Kemungkinan Bug:**
- ❌ Transaction rollback di tengah jalan
- ❌ Orphaned records (kontrak tanpa proposal)
- ❌ File uploads missing
- ❌ Status tidak sync antar table

### Test Case 8.2: Permission & Security
**Steps:**
1. Dosen A submit proposal
2. Dosen B (bukan ketua) coba:
   - Edit proposal Dosen A
   - Upload monitoring Dosen A
   - Submit luaran Dosen A
3. Check all rejected

**Expected Result:**
- ✅ **Hanya ketua yang bisa edit/upload**
- ✅ 403 Forbidden atau redirect
- ✅ Error message jelas

**Kemungkinan Bug:**
- ❌ **Dosen lain bisa edit proposal orang lain** (CRITICAL!)
- ❌ **Dosen lain bisa submit luaran** (CRITICAL!)
- ❌ No permission check di API

### Test Case 8.3: Concurrent Access
**Steps:**
1. Admin 1 dan Admin 2 login bersamaan
2. Both try verify luaran yang sama
3. Both try create Termin 2 bersamaan

**Expected Result:**
- ✅ One succeeds, one gets error
- ✅ No duplicate records
- ✅ Transaction handling correct

**Kemungkinan Bug:**
- ❌ **Race condition: duplicate termin created**
- ❌ **Race condition: luaran verified 2x**
- ❌ No transaction locking

### Test Case 8.4: Data Validation
**Steps:**
1. Try submit form dengan:
   - Empty required fields
   - Invalid email format
   - Negative numbers
   - SQL injection strings
   - XSS scripts in text fields
   - Extremely long strings

**Expected Result:**
- ✅ Server-side validation reject semua
- ✅ No error 500
- ✅ User-friendly error messages

**Kemungkinan Bug:**
- ❌ **Only client-side validation (can be bypassed)**
- ❌ **SQL injection possible**
- ❌ **XSS possible in text display**
- ❌ Server crash on invalid data

---

## 🐛 COMMON BUGS CHECKLIST

### Database Issues
- [ ] Migration tidak apply (check `npx prisma migrate status`)
- [ ] Prisma Client outdated (run `npx prisma generate`)
- [ ] Foreign key constraints violated
- [ ] Unique constraints not enforced
- [ ] Decimal fields losing precision
- [ ] DateTime timezone issues

### File Upload Issues
- [ ] Directory `/public/uploads/*` tidak exist
- [ ] Permission denied (chmod 755)
- [ ] File path salah (forward vs backslash)
- [ ] Filename special characters issue
- [ ] File size limit server-side
- [ ] File type validation bypassed
- [ ] Orphaned files (DB record deleted, file remains)

### Authentication Issues
- [ ] JWT secret not set
- [ ] Session cookie not SameSite=Lax
- [ ] Session expires too fast
- [ ] Password not hashed
- [ ] No CSRF protection
- [ ] Role check only client-side

### API Issues
- [ ] CORS errors
- [ ] Response structure inconsistent
- [ ] Error handling tidak catch all cases
- [ ] No request validation
- [ ] SQL injection possible
- [ ] N+1 query problem (performance)

### UI Issues
- [ ] Loading state tidak ada
- [ ] Error message tidak jelas
- [ ] Success toast tidak muncul
- [ ] Form tidak clear setelah submit
- [ ] Pagination tidak bekerja
- [ ] Filter tidak reset
- [ ] Modal tidak close

### Business Logic Issues
- [ ] **Termin auto-create tidak jalan**
- [ ] **Validation requirement bisa di-bypass**
- [ ] **Status transition salah**
- [ ] **Calculation nominal salah**
- [ ] **Duplicate records bisa dibuat**
- [ ] **Deadline tidak di-enforce**

---

## 📊 TESTING PRIORITY

### CRITICAL (Must Fix Before Production)
1. ✅ Termin 1 auto-create after kontrak signed
2. ✅ Termin 2 validation (2 monitoring + Termin 1 paid)
3. ✅ Termin 3 validation (Termin 2 paid + luaran verified)
4. ✅ Permission check (hanya ketua bisa edit/upload)
5. ✅ File upload security (type, size validation)
6. ✅ SQL injection & XSS protection

### HIGH (Should Fix)
1. ✅ Duplicate prevention (termin, luaran, kontrak)
2. ✅ Status transition validation
3. ✅ Calculation accuracy (nominal, stats)
4. ✅ Error handling & user feedback
5. ✅ Data consistency (transactions)

### MEDIUM (Nice to Fix)
1. ✅ Performance optimization
2. ✅ UI/UX improvements
3. ✅ Search & filter accuracy
4. ✅ Notification system
5. ✅ Export functionality

### LOW (Future Enhancement)
1. ✅ Advanced reporting
2. ✅ Bulk operations
3. ✅ File versioning
4. ✅ Audit log
5. ✅ Analytics dashboard

---

## 🔍 DEBUGGING TIPS

### Check Logs
```bash
# Server logs
npm run dev

# Database logs
npx prisma studio

# Browser console
F12 → Console tab
```

### Common Fixes
```bash
# Fix Prisma Client
npx prisma generate

# Fix Database
npx prisma migrate dev
npx prisma db push

# Fix TypeScript
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Check File Uploads
```bash
# Check directory exists
ls public/uploads/pencairan
ls public/uploads/luaran

# Check permissions (Linux/Mac)
chmod -R 755 public/uploads
```

---

## ✅ TESTING COMPLETION CHECKLIST

### Before Testing
- [ ] All TypeScript errors resolved
- [ ] Database migrated
- [ ] Prisma Client generated
- [ ] Test files prepared
- [ ] Test accounts ready

### During Testing
- [ ] Document all bugs found
- [ ] Screenshot errors
- [ ] Note steps to reproduce
- [ ] Check console for errors
- [ ] Monitor network requests

### After Testing
- [ ] All critical bugs fixed
- [ ] Regression testing done
- [ ] Performance acceptable
- [ ] User experience smooth
- [ ] Ready for production

---

## 📝 BUG REPORT TEMPLATE

```markdown
### Bug #[Number]

**Module:** [e.g., Pencairan Dana]
**Severity:** [Critical/High/Medium/Low]
**Status:** [Open/In Progress/Fixed]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshot:**
[Attach screenshot]

**Console Error:**
[Paste error message]

**Fix Applied:**
[How it was fixed]
```

---

## 🚀 READY TO TEST!

**Start with CRITICAL tests first:**
1. Login & Authentication
2. Kontrak → Termin 1 auto-create
3. Pencairan validation (Termin 2 & 3)
4. Luaran workflow
5. Permission checks

**Good luck testing! 🎯**

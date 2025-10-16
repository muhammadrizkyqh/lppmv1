# DOKUMEN SPESIFIKASI APLIKASI LPPM - VERSI SIMPLIFIED
## Sistem Informasi Penelitian dan Pengabdian Masyarakat

---

## 1. AKTOR & ROLE (SAMA)

| No | Aktor | Deskripsi | Hak Akses |
|---|---|---|---|
| 1 | **Admin LPPM** | Pengelola utama sistem | Full access semua data |
| 2 | **Dosen** | Pengusul penelitian/PKM | Ajukan proposal, upload dokumen, lihat status |
| 3 | **Mahasiswa** | Anggota tim | Lihat penelitian yang diikuti (read-only) |
| 4 | **Reviewer** | Penilai proposal | Review proposal yang ditugaskan |

---

## 2. URUTAN PENGERJAAN MODUL (REVISED)

### Fase 1: Core System (Minggu 1-4)
1. **Modul User & Authentication**
2. **Modul Data Master** (Dosen, Mahasiswa, Reviewer)
3. **Modul Setting Sistem** (Periode, Skema, Bidang Keahlian)
4. **Modul Pengajuan Proposal** (Simplified)

### Fase 2: Review & Approval (Minggu 5-6)
5. **Modul Review & Penilaian**
6. **Modul Keputusan & Tracking**

### Fase 3: Monitoring & Completion (Minggu 7-8)
7. **Modul Monitoring & Laporan**
8. **Modul Dashboard & Laporan**

### Fase 4: Additional Features (Minggu 9-10)
9. **Modul PKM** (copy dari penelitian)
10. **Modul Notifikasi**

---

## 3. SPESIFIKASI FITUR PER MODUL (SIMPLIFIED)

---

## FASE 1: CORE SYSTEM

### Modul 1: User & Authentication

#### Fitur:
- **Login/Logout** dengan username/email + password
- **Profile Management** (edit profile, ganti password)
- **User Management** (Admin buat/kelola user)

#### Simplified:
- Default password: "password123" (wajib ganti pertama login)
- Session timeout: 2 jam

---

### Modul 2: Data Master

#### Data Dosen:
- NIDN, Nama, Email, No HP, Bidang Keahlian, Status
- Import dari Excel/CSV

#### Data Mahasiswa:
- NIM, Nama, Email, Prodi, Angkatan
- Import dari Excel/CSV

#### Data Reviewer:
- Nama, Email, Institusi, Bidang Keahlian, Tipe (Internal/Eksternal)

#### Business Rules:
- NIDN/NIM harus unique
- 1 dosen = 1 user account otomatis

---

### Modul 3: Setting Sistem

#### Setting Periode:
- Tahun, Nama Periode, Tanggal Buka/Tutup, Kuota, Status

#### Master Skema Penelitian:
- Dasar: Rp 5.000.000
- Terapan: Rp 5.000.000  
- Pengembangan: Rp 7.000.000
- Mandiri: Rp 0

#### Master Bidang Keahlian:
- PBA, Pendidikan Islam, Hukum Ekonomi Syariah, dll

---

### Modul 4: Pengajuan Proposal (SANGAT DISEDERHANAKAN)

#### Form Pengajuan (oleh Dosen):
- **Data Basic:**
  - Pilih Periode (dropdown)
  - Pilih Skema (Dasar/Terapan/Pengembangan/Mandiri)
  - Judul Penelitian
  - Bidang Keahlian (auto dari ketua, bisa ubah)
  - Abstrak (max 500 karakter)
  - Upload File Proposal (PDF, max 10MB)

- **Anggota Tim:**
  - Ketua: otomatis (dosen yang login)
  - Tambah anggota (pilih dari dosen/mahasiswa)
  - Maksimal 4 orang (termasuk ketua)

- **Submit:**
  - Simpan sebagai Draft atau Submit langsung

#### Business Rules:
- Hanya periode aktif yang bisa diajukan
- Ketua harus dosen ber-NIDN STAI Ali
- Maksimal 1 proposal sebagai ketua per periode
- File wajib PDF, max 10MB

---

## FASE 2: REVIEW & APPROVAL

### Modul 5: Review & Penilaian

#### Proses Review:
1. **Admin** terima proposal → **Assign 2 Reviewer**
2. **Reviewer** isi form penilaian:
   - Kriteria sederhana:
     - Kesesuaian judul & latar belakang (25%)
     - Kejelasan metode (25%)  
     - Kelayakan timeline (25%)
     - Manfaat penelitian (25%)
   - Nilai: 1-100 per kriteria
   - Total nilai otomatis
   - Rekomendasi: Diterima / Revisi / Ditolak
   - Catatan revisi (jika perlu)

3. **Admin** lihat hasil review → **Putuskan:**
   - Diterima → lanjut kontrak
   - Revisi → dosen upload revisi
   - Ditolak → selesai

#### Simplified Rules:
- Deadline review: 7 hari
- Maksimal 2x revisi
- Jika revisi >2x, admin bisa tolak

---

### Modul 6: Keputusan & Tracking

#### Generate Dokumen (Admin):
- **Kontrak Penelitian** (template Word dengan placeholder)
- **SK Penelitian** (format: SK/LPPM/PENELITIAN/2025/001)
- Upload scan yang sudah TTD

#### Tracking Status:
- Draft → Diajukan → Review → Diterima/Ditolak
- Diterima → Kontrak → Berjalan → Selesai

---

## FASE 3: MONITORING & COMPLETION

### Modul 7: Monitoring & Laporan

#### Monitoring (Dosen):
- **Upload Laporan Monitoring** (2x: bulan ke-3 & ke-5)
  - Progress (%)
  - Kendala
  - Upload file laporan (PDF)
- **Upload Laporan Akhir** (setelah selesai)
  - Ringkasan hasil
  - Upload file laporan akhir (PDF)

#### Pencairan Dana (Admin):
- Termin 1 (50%): setelah kontrak
- Termin 2 (25%): setelah monitoring 2  
- Termin 3 (25%): setelah luaran

#### Luaran (Dosen):
- Input luaran: Jurnal/Buku/HAKI/Produk
- Upload bukti
- Admin verifikasi

---

### Modul 8: Dashboard & Laporan

#### Dashboard Admin:
- Statistik: Total penelitian, status, progress
- Grafik: Penelitian per skema, per bidang
- Notifikasi: Deadline, tugas pending

#### Dashboard Dosen:
- List penelitian saya + status
- Notifikasi: Hasil review, reminder

#### Laporan (Admin):
- Export Excel: Daftar penelitian, luaran, dana
- Filter by periode, skema, status

---

## FASE 4: ADDITIONAL FEATURES

### Modul 9: PKM (Pengabdian Masyarakat)
- **Sama persis dengan alur penelitian**
- Perbedaan: 
  - Tambahan field "Mitra PKM"
  - Skema PKM terpisah
  - Luaran lebih fleksibel

### Modul 10: Notifikasi
- **In-app notification** untuk:
  - Hasil review
  - Reminder deadline  
  - Tugas baru
- **Email notification** (opsional)

---

## 4. BUSINESS RULES PENTING

### Aturan Proposal:
- ✅ Hanya dosen NIDN STAI Ali yang bisa jadi ketua
- ✅ Maksimal 4 anggota (termasuk ketua)
- ✅ 1 dosen maksimal 1 proposal sebagai ketua per periode
- ✅ File proposal: PDF, max 10MB

### Aturan Review:
- ✅ 2 reviewer per proposal
- ✅ Deadline review: 7 hari
- ✅ Maksimal 2x revisi

### Aturan Dana:
- ✅ Pencairan 3 termin (50%-25%-25%)
- ✅ Termin 3 setelah luaran selesai
- ✅ Luaran wajib dalam 6 bulan setelah laporan

### Aturan Keterlambatan:
- ⚠️ Monitoring terlambat >30 hari: penelitian bisa dibatalkan
- ⚠️ Tidak ada luaran dalam 6 bulan: wajib kembalikan dana

---

## 5. STRUKTUR DATABASE CORE

### Tabel Utama:
- **users** (id, username, email, password, role)
- **dosen** (id, user_id, nidn, nama, email, bidang_keahlian_id)
- **mahasiswa** (id, user_id, nim, nama, email, prodi)
- **reviewer** (id, user_id, nama, email, bidang_keahlian_id)
- **periode** (id, nama, tahun, tgl_buka, tgl_tutup, status)
- **skema** (id, nama, dana_hibah)
- **proposal** (id, periode_id, skema_id, ketua_id, judul, abstrak, file_proposal, status)
- **proposal_anggota** (id, proposal_id, dosen_id/mahasiswa_id)
- **review** (id, proposal_id, reviewer_id, nilai, rekomendasi, catatan)
- **kontrak** (id, proposal_id, nomor_kontrak, file_kontrak)
- **monitoring** (id, proposal_id, progress, file_laporan)
- **luaran** (id, proposal_id, jenis, file_bukti)

---

## 6. FLOW SISTEM YANG REALISTIS

### Flow Pengajuan Proposal:
```
1. Dosen login → Ajukan Proposal
2. Pilih periode & skema
3. Isi: Judul, Bidang, Abstrak
4. Tambah anggota (max 3 tambahan)
5. Upload file proposal PDF
6. Submit
```

### Flow Review & Approval:
```
1. Admin terima proposal → Assign 2 reviewer
2. Reviewer review (7 hari) → Beri nilai & rekomendasi
3. Admin putuskan: 
   - Diterima → Buat kontrak & SK
   - Revisi → Dosen upload revisi → Review ulang
   - Ditolak → Selesai
```

### Flow Penyelesaian:
```
1. Dosen upload monitoring 1 & 2
2. Dosen upload laporan akhir
3. Dosen input luaran + bukti
4. Admin verifikasi luaran
5. Pencairan termin 3
6. Penelitian selesai
```

---

## 7. PRIORITAS FITUR (MVP)

### MUST HAVE (Fase 1-2):
✅ Login & user management  
✅ Data master (dosen, mahasiswa, reviewer)  
✅ Setting periode & skema  
✅ Pengajuan proposal (form sederhana)  
✅ Review & penilaian  
✅ Keputusan admin  
✅ Kontrak & SK (basic)

### SHOULD HAVE (Fase 3):
✅ Monitoring & laporan  
✅ Luaran penelitian  
✅ Dashboard sederhana  
✅ Export laporan Excel

### COULD HAVE (Fase 4):
✅ PKM module  
✅ Notifikasi  
✅ Template dokumen otomatis

---

## 8. ESTIMASI WAKTU REALISTIS

### Fase 1: Core System (3 minggu)
- Authentication & user management: 1 minggu
- Data master & setting: 1 minggu  
- Pengajuan proposal: 1 minggu

### Fase 2: Review & Approval (2 minggu)
- Review system: 1.5 minggu
- Keputusan & tracking: 0.5 minggu

### Fase 3: Monitoring & Reporting (2 minggu)
- Monitoring & laporan: 1 minggu
- Dashboard & export: 1 minggu

### Fase 4: Additional (1 minggu)
- PKM & notifikasi: 1 minggu

**Total: 8 minggu (2 bulan)**

---

## 9. TEKNOLOGI & IMPLEMENTASI

### Tech Stack:
- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Next.js API Routes  
- **Database:** MySQL
- **ORM:** Prisma
- **Auth:** NextAuth.js

### Deployment:
- VPS atau shared hosting
- Domain: lppm.staiali.ac.id (subdomain)
- Auto backup database

---

## 10. KEUNTUNGAN SISTEM INI

### Untuk LPPM:
✅ Tracking semua penelitian real-time  
✅ Monitoring progress otomatis  
✅ Laporan akreditasi mudah  
✅ Kurangi paperwork

### Untuk Dosen:
✅ Ajukan proposal online (tidak perlu print)  
✅ Tracking status transparan  
✅ Upload dokumen sekali saja  
✅ Notifikasi otomatis

### Untuk Reviewer:
✅ Review online kapan saja  
✅ Form penilaian terstruktur  
✅ History review tersimpan

---

## 11. PANDUAN PENGGUNAAN SINGKAT

### Untuk Admin:
1. Setup periode & skema
2. Import data dosen/mahasiswa
3. Assign reviewer untuk proposal
4. Generate kontrak & SK
5. Monitoring progress & pencairan dana

### Untuk Dosen:
1. Login → Ajukan Proposal
2. Isi form sederhana + upload PDF
3. Tambah anggota (jika ada)
4. Submit → Tunggu review
5. Upload monitoring & laporan ketika diminta

### Untuk Reviewer:
1. Login → Lihat tugas review
2. Download proposal → Beri nilai
3. Submit review → Selesai

---

## 12. NEXT STEPS

### Immediate (Minggu 1):
- [ ] Setup development environment
- [ ] Buat database schema
- [ ] Implementasi login & user management

### Short-term (Minggu 2-4):
- [ ] Modul data master
- [ ] Modul pengajuan proposal
- [ ] Modul review & penilaian

### Medium-term (Minggu 5-8):
- [ ] Modul monitoring & laporan
- [ ] Dashboard & reporting
- [ ] Testing & deployment

---

**Dokumen ini sudah disederhanakan untuk:**
- Development yang lebih cepat (8 minggu vs 12 minggu)
- Form pengajuan yang tidak membebani dosen
- Proses yang tetap mengcover semua kebutuhan LPPM
- Implementasi yang realistis dengan resource terbatas

**Siap untuk mulai development! 🚀**

**Versi:** 2.0 - Simplified  
**Tanggal:** 15 Oktober 2025  
**Status:** Ready for Development

---

## 13. DETAIL DATABASE SCHEMA

### 13.1 Tabel Users & Authentication

#### users
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
username: VARCHAR(50) UNIQUE NOT NULL
email: VARCHAR(100) UNIQUE NOT NULL
password: VARCHAR(255) NOT NULL (hashed)
role: ENUM('admin', 'dosen', 'mahasiswa', 'reviewer') NOT NULL
status: ENUM('aktif', 'nonaktif', 'suspend') DEFAULT 'aktif'
first_login: BOOLEAN DEFAULT TRUE
last_login_at: DATETIME
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at: TIMESTAMP NULL (soft delete)
```

#### sessions
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER NOT NULL (FK: users.id)
token: VARCHAR(255) UNIQUE NOT NULL
ip_address: VARCHAR(45)
user_agent: TEXT
expires_at: DATETIME NOT NULL
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 13.2 Tabel Master Data

#### bidang_keahlian
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
kode: VARCHAR(20) UNIQUE NOT NULL
nama: VARCHAR(100) NOT NULL
deskripsi: TEXT
status: ENUM('aktif', 'nonaktif') DEFAULT 'aktif'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Data Default:**
- PBA (Pendidikan Bahasa Arab)
- PAI (Pendidikan Agama Islam)
- HES (Hukum Ekonomi Syariah)
- MPI (Manajemen Pendidikan Islam)
- PIAUD (Pendidikan Islam Anak Usia Dini)

#### dosen
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER UNIQUE NOT NULL (FK: users.id)
nidn: VARCHAR(20) UNIQUE NOT NULL
nama: VARCHAR(100) NOT NULL
email: VARCHAR(100) UNIQUE NOT NULL
no_hp: VARCHAR(20)
bidang_keahlian_id: INTEGER (FK: bidang_keahlian.id)
jenis_dosen: ENUM('tetap', 'tidak_tetap') DEFAULT 'tetap'
status: ENUM('aktif', 'nonaktif', 'pensiun') DEFAULT 'aktif'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at: TIMESTAMP NULL
```

#### mahasiswa
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER UNIQUE (FK: users.id)
nim: VARCHAR(20) UNIQUE NOT NULL
nama: VARCHAR(100) NOT NULL
email: VARCHAR(100) UNIQUE NOT NULL
prodi: VARCHAR(50) NOT NULL
angkatan: YEAR NOT NULL
status: ENUM('aktif', 'cuti', 'lulus', 'keluar') DEFAULT 'aktif'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at: TIMESTAMP NULL
```

#### reviewer
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER UNIQUE (FK: users.id)
nama: VARCHAR(100) NOT NULL
email: VARCHAR(100) UNIQUE NOT NULL
institusi: VARCHAR(100)
bidang_keahlian_id: INTEGER (FK: bidang_keahlian.id)
tipe: ENUM('internal', 'eksternal') DEFAULT 'internal'
status: ENUM('aktif', 'nonaktif') DEFAULT 'aktif'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at: TIMESTAMP NULL
```

### 13.3 Tabel Setting Sistem

#### periode
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
nama: VARCHAR(100) NOT NULL (e.g., "Periode 1 Tahun 2025")
tahun: YEAR NOT NULL
tgl_buka: DATE NOT NULL
tgl_tutup: DATE NOT NULL
kuota: INTEGER DEFAULT 0 (0 = unlimited)
status: ENUM('draft', 'aktif', 'selesai') DEFAULT 'draft'
keterangan: TEXT
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### skema
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
kode: VARCHAR(20) UNIQUE NOT NULL
nama: VARCHAR(100) NOT NULL
jenis: ENUM('penelitian', 'pkm') NOT NULL
dana_hibah: DECIMAL(15,2) NOT NULL
deskripsi: TEXT
status: ENUM('aktif', 'nonaktif') DEFAULT 'aktif'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Data Default Penelitian:**
- Dasar: Rp 5.000.000
- Terapan: Rp 5.000.000  
- Pengembangan: Rp 7.000.000
- Mandiri: Rp 0

**Data Default PKM:**
- PKM Biasa: Rp 3.000.000
- PKM Unggulan: Rp 5.000.000

### 13.4 Tabel Proposal & Penelitian

#### proposal
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
kode_proposal: VARCHAR(50) UNIQUE NOT NULL (auto: P/2025/001)
periode_id: INTEGER NOT NULL (FK: periode.id)
skema_id: INTEGER NOT NULL (FK: skema.id)
ketua_id: INTEGER NOT NULL (FK: dosen.id)
bidang_keahlian_id: INTEGER (FK: bidang_keahlian.id)
judul: VARCHAR(500) NOT NULL
abstrak: TEXT (max 500 char)
biaya_diajukan: DECIMAL(15,2)
tanggal_pengajuan: DATETIME
tanggal_mulai: DATE
tanggal_selesai: DATE
file_proposal: VARCHAR(255) (path to file)
file_proposal_revisi: VARCHAR(255) (path to revised file)
status: ENUM('draft', 'diajukan', 'review', 'revisi_1', 'revisi_2', 'diterima', 'ditolak', 'dibatalkan', 'berjalan', 'selesai') DEFAULT 'draft'
revisi_ke: INTEGER DEFAULT 0
alasan_penolakan: TEXT
catatan_admin: TEXT
created_by: INTEGER (FK: users.id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at: TIMESTAMP NULL
```

#### proposal_anggota
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
jenis: ENUM('dosen', 'mahasiswa') NOT NULL
dosen_id: INTEGER NULL (FK: dosen.id)
mahasiswa_id: INTEGER NULL (FK: mahasiswa.id)
peran: ENUM('ketua', 'anggota') DEFAULT 'anggota'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### proposal_mitra (untuk PKM)
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
nama_mitra: VARCHAR(200) NOT NULL
alamat: TEXT
contact_person: VARCHAR(100)
no_telp: VARCHAR(20)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 13.5 Tabel Review & Penilaian

#### proposal_reviewer
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
reviewer_id: INTEGER NOT NULL (FK: reviewer.id)
status: ENUM('pending', 'sedang_review', 'selesai') DEFAULT 'pending'
assigned_at: DATETIME
reviewed_at: DATETIME
reminder_sent: INTEGER DEFAULT 0
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### review
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_reviewer_id: INTEGER NOT NULL (FK: proposal_reviewer.id)
proposal_id: INTEGER NOT NULL (FK: proposal.id)
reviewer_id: INTEGER NOT NULL (FK: reviewer.id)

-- Kriteria Penilaian (1-100)
nilai_judul_latar_belakang: DECIMAL(5,2) (bobot 25%)
nilai_metode: DECIMAL(5,2) (bobot 25%)
nilai_timeline: DECIMAL(5,2) (bobot 25%)
nilai_manfaat: DECIMAL(5,2) (bobot 25%)
total_nilai: DECIMAL(5,2) (auto calculated)

rekomendasi: ENUM('diterima', 'revisi', 'ditolak') NOT NULL
catatan: TEXT
catatan_revisi: TEXT

created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 13.6 Tabel Kontrak & Dokumen

#### kontrak
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER UNIQUE NOT NULL (FK: proposal.id)
nomor_kontrak: VARCHAR(100) UNIQUE NOT NULL
nomor_sk: VARCHAR(100) UNIQUE
tanggal_kontrak: DATE
file_kontrak: VARCHAR(255) (template)
file_kontrak_ttd: VARCHAR(255) (scan TTD)
file_sk: VARCHAR(255)
status: ENUM('draft', 'aktif', 'selesai', 'dibatalkan') DEFAULT 'draft'
created_by: INTEGER (FK: users.id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 13.7 Tabel Monitoring & Laporan

#### monitoring
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
jenis_monitoring: ENUM('monitoring_1', 'monitoring_2', 'laporan_akhir') NOT NULL
progress_persen: INTEGER (0-100)
kendala: TEXT
solusi: TEXT
file_laporan: VARCHAR(255)
tanggal_upload: DATETIME
tanggal_deadline: DATE
status_verifikasi: ENUM('pending', 'diverifikasi', 'ditolak') DEFAULT 'pending'
catatan_verifikasi: TEXT
verified_by: INTEGER (FK: users.id)
verified_at: DATETIME
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 13.8 Tabel Luaran

#### luaran
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
jenis: ENUM('jurnal', 'buku', 'haki', 'produk', 'media_massa', 'lainnya') NOT NULL
judul: VARCHAR(500) NOT NULL
penerbit: VARCHAR(200)
tahun_terbit: YEAR
url: VARCHAR(500)
file_bukti: VARCHAR(255)
keterangan: TEXT
tanggal_upload: DATETIME
status_verifikasi: ENUM('pending', 'diverifikasi', 'ditolak') DEFAULT 'pending'
catatan_verifikasi: TEXT
verified_by: INTEGER (FK: users.id)
verified_at: DATETIME
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 13.9 Tabel Pencairan Dana

#### pencairan_dana
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
termin: ENUM('termin_1', 'termin_2', 'termin_3') NOT NULL
nominal: DECIMAL(15,2) NOT NULL
persentase: DECIMAL(5,2) (50%, 25%, 25%)
tanggal_pencairan: DATE
status: ENUM('pending', 'dicairkan', 'ditolak') DEFAULT 'pending'
keterangan: TEXT
file_bukti: VARCHAR(255)
created_by: INTEGER (FK: users.id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 13.10 Tabel Revisi

#### revisi_proposal
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
proposal_id: INTEGER NOT NULL (FK: proposal.id)
revisi_ke: INTEGER NOT NULL
file_revisi: VARCHAR(255) NOT NULL
catatan_dosen: TEXT
tanggal_upload: DATETIME
status: ENUM('pending', 'diterima', 'ditolak') DEFAULT 'pending'
catatan_admin: TEXT
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 13.11 Tabel Notifikasi

#### notifikasi
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER NOT NULL (FK: users.id)
judul: VARCHAR(200) NOT NULL
pesan: TEXT NOT NULL
tipe: ENUM('info', 'warning', 'success', 'error') DEFAULT 'info'
kategori: ENUM('proposal', 'review', 'monitoring', 'pencairan', 'sistem') NOT NULL
link: VARCHAR(255) (redirect URL)
is_read: BOOLEAN DEFAULT FALSE
read_at: DATETIME
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 13.12 Tabel Audit Log

#### audit_log
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER (FK: users.id)
action: VARCHAR(100) NOT NULL (create, update, delete, login, logout)
table_name: VARCHAR(50)
record_id: INTEGER
old_values: JSON
new_values: JSON
ip_address: VARCHAR(45)
user_agent: TEXT
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 13.13 Tabel File Upload

#### file_uploads
```sql
id: INTEGER PRIMARY KEY AUTO_INCREMENT
user_id: INTEGER NOT NULL (FK: users.id)
original_name: VARCHAR(255) NOT NULL
stored_name: VARCHAR(255) NOT NULL
file_path: VARCHAR(500) NOT NULL
file_size: BIGINT (bytes)
mime_type: VARCHAR(100)
file_type: ENUM('proposal', 'revisi', 'kontrak', 'sk', 'monitoring', 'luaran', 'lainnya')
reference_id: INTEGER (proposal_id, monitoring_id, etc)
reference_type: VARCHAR(50)
is_scanned: BOOLEAN DEFAULT FALSE (virus scan)
scan_result: VARCHAR(100)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
deleted_at: TIMESTAMP NULL
```

---

## 14. API ENDPOINTS SPECIFICATION

### 14.1 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request reset password | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

**Example Request/Response:**
```json
// POST /api/auth/login
Request:
{
  "email": "dosen@staiali.ac.id",
  "password": "password123"
}

Response (Success):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "dosen001",
      "email": "dosen@staiali.ac.id",
      "role": "dosen",
      "first_login": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Response (Error):
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau password salah"
  }
}
```

### 14.2 User Management (Admin Only)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| POST | `/api/users` | Create new user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user (soft) | Admin |
| PUT | `/api/users/:id/status` | Change user status | Admin |

### 14.3 Dosen

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/dosen` | Get all dosen | Admin |
| GET | `/api/dosen/:id` | Get dosen by ID | Admin, Dosen |
| POST | `/api/dosen` | Create dosen | Admin |
| PUT | `/api/dosen/:id` | Update dosen | Admin |
| DELETE | `/api/dosen/:id` | Delete dosen | Admin |
| POST | `/api/dosen/import` | Import from Excel/CSV | Admin |
| GET | `/api/dosen/export` | Export to Excel | Admin |

### 14.4 Mahasiswa

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/mahasiswa` | Get all mahasiswa | Admin |
| GET | `/api/mahasiswa/:id` | Get mahasiswa by ID | Admin |
| POST | `/api/mahasiswa` | Create mahasiswa | Admin |
| PUT | `/api/mahasiswa/:id` | Update mahasiswa | Admin |
| DELETE | `/api/mahasiswa/:id` | Delete mahasiswa | Admin |
| POST | `/api/mahasiswa/import` | Import from Excel/CSV | Admin |

### 14.5 Reviewer

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/reviewer` | Get all reviewer | Admin |
| GET | `/api/reviewer/:id` | Get reviewer by ID | Admin |
| POST | `/api/reviewer` | Create reviewer | Admin |
| PUT | `/api/reviewer/:id` | Update reviewer | Admin |
| DELETE | `/api/reviewer/:id` | Delete reviewer | Admin |

### 14.6 Periode

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/periode` | Get all periode | All |
| GET | `/api/periode/aktif` | Get active periode | All |
| GET | `/api/periode/:id` | Get periode by ID | Admin |
| POST | `/api/periode` | Create periode | Admin |
| PUT | `/api/periode/:id` | Update periode | Admin |
| DELETE | `/api/periode/:id` | Delete periode | Admin |
| PUT | `/api/periode/:id/activate` | Activate periode | Admin |

### 14.7 Skema

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/skema` | Get all skema | All |
| GET | `/api/skema/:id` | Get skema by ID | All |
| POST | `/api/skema` | Create skema | Admin |
| PUT | `/api/skema/:id` | Update skema | Admin |
| DELETE | `/api/skema/:id` | Delete skema | Admin |

### 14.8 Bidang Keahlian

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/bidang-keahlian` | Get all bidang | All |
| POST | `/api/bidang-keahlian` | Create bidang | Admin |
| PUT | `/api/bidang-keahlian/:id` | Update bidang | Admin |
| DELETE | `/api/bidang-keahlian/:id` | Delete bidang | Admin |

### 14.9 Proposal

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/proposal` | Get all proposals | Admin, Dosen |
| GET | `/api/proposal/my` | Get my proposals | Dosen |
| GET | `/api/proposal/:id` | Get proposal by ID | Admin, Dosen, Reviewer |
| POST | `/api/proposal` | Create proposal | Dosen |
| PUT | `/api/proposal/:id` | Update proposal | Dosen |
| DELETE | `/api/proposal/:id` | Delete proposal | Dosen, Admin |
| POST | `/api/proposal/:id/submit` | Submit proposal | Dosen |
| POST | `/api/proposal/:id/cancel` | Cancel proposal | Admin |
| PUT | `/api/proposal/:id/status` | Update status | Admin |

### 14.10 Proposal Anggota

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/proposal/:id/anggota` | Get proposal members | Dosen, Admin |
| POST | `/api/proposal/:id/anggota` | Add member | Dosen |
| DELETE | `/api/proposal/:id/anggota/:anggotaId` | Remove member | Dosen |

### 14.11 Review & Penilaian

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/review` | Get all reviews | Admin |
| GET | `/api/review/my` | Get my review tasks | Reviewer |
| POST | `/api/proposal/:id/assign-reviewer` | Assign reviewers | Admin |
| POST | `/api/review/:id` | Submit review | Reviewer |
| PUT | `/api/review/:id` | Update review | Reviewer |
| GET | `/api/proposal/:id/reviews` | Get proposal reviews | Admin |

### 14.12 Kontrak & SK

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/kontrak` | Create kontrak | Admin |
| PUT | `/api/kontrak/:id` | Update kontrak | Admin |
| POST | `/api/kontrak/:id/upload-ttd` | Upload signed doc | Admin |
| GET | `/api/kontrak/:id/download` | Download kontrak | Admin, Dosen |

### 14.13 Monitoring

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/monitoring/proposal/:id` | Get monitoring list | Admin, Dosen |
| POST | `/api/monitoring` | Submit monitoring | Dosen |
| PUT | `/api/monitoring/:id` | Update monitoring | Dosen |
| POST | `/api/monitoring/:id/verify` | Verify monitoring | Admin |

### 14.14 Luaran

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/luaran/proposal/:id` | Get luaran list | Admin, Dosen |
| POST | `/api/luaran` | Submit luaran | Dosen |
| PUT | `/api/luaran/:id` | Update luaran | Dosen |
| POST | `/api/luaran/:id/verify` | Verify luaran | Admin |

### 14.15 Pencairan Dana

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/pencairan/proposal/:id` | Get pencairan list | Admin, Dosen |
| POST | `/api/pencairan` | Create pencairan | Admin |
| PUT | `/api/pencairan/:id/cairkan` | Approve pencairan | Admin |

### 14.16 Dashboard

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/dashboard/admin` | Admin dashboard stats | Admin |
| GET | `/api/dashboard/dosen` | Dosen dashboard stats | Dosen |
| GET | `/api/dashboard/reviewer` | Reviewer dashboard stats | Reviewer |

### 14.17 Laporan & Export

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/laporan/proposal` | Export proposal list | Admin |
| GET | `/api/laporan/luaran` | Export luaran list | Admin |
| GET | `/api/laporan/dana` | Export dana report | Admin |
| GET | `/api/laporan/rekap-periode` | Rekap per periode | Admin |

### 14.18 File Upload

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload file | All (authenticated) |
| GET | `/api/file/:id` | Get/Download file | All (authorized) |
| DELETE | `/api/file/:id` | Delete file | Owner, Admin |

### 14.19 Notifikasi

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/notifikasi` | Get my notifications | All |
| GET | `/api/notifikasi/unread-count` | Get unread count | All |
| PUT | `/api/notifikasi/:id/read` | Mark as read | All |
| PUT | `/api/notifikasi/read-all` | Mark all as read | All |

---

## 15. STATUS & ENUM VALUES

### 15.1 User Status
```typescript
enum UserStatus {
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif',
  SUSPEND = 'suspend'
}
```

### 15.2 User Role
```typescript
enum UserRole {
  ADMIN = 'admin',
  DOSEN = 'dosen',
  MAHASISWA = 'mahasiswa',
  REVIEWER = 'reviewer'
}
```

### 15.3 Periode Status
```typescript
enum PeriodeStatus {
  DRAFT = 'draft',
  AKTIF = 'aktif',
  SELESAI = 'selesai'
}
```

### 15.4 Proposal Status
```typescript
enum ProposalStatus {
  DRAFT = 'draft',
  DIAJUKAN = 'diajukan',
  REVIEW = 'review',
  REVISI_1 = 'revisi_1',
  REVISI_2 = 'revisi_2',
  DITERIMA = 'diterima',
  DITOLAK = 'ditolak',
  DIBATALKAN = 'dibatalkan',
  BERJALAN = 'berjalan',
  SELESAI = 'selesai'
}
```

**Status Flow:**
```
DRAFT → DIAJUKAN → REVIEW → [DITERIMA | REVISI_1 | DITOLAK]
                           → REVISI_1 → REVIEW → [DITERIMA | REVISI_2 | DITOLAK]
                                              → REVISI_2 → REVIEW → [DITERIMA | DITOLAK]
DITERIMA → BERJALAN → SELESAI
```

### 15.5 Review Rekomendasi
```typescript
enum ReviewRekomendasi {
  DITERIMA = 'diterima',
  REVISI = 'revisi',
  DITOLAK = 'ditolak'
}
```

### 15.6 Monitoring Jenis
```typescript
enum MonitoringJenis {
  MONITORING_1 = 'monitoring_1',
  MONITORING_2 = 'monitoring_2',
  LAPORAN_AKHIR = 'laporan_akhir'
}
```

### 15.7 Status Verifikasi
```typescript
enum StatusVerifikasi {
  PENDING = 'pending',
  DIVERIFIKASI = 'diverifikasi',
  DITOLAK = 'ditolak'
}
```

### 15.8 Luaran Jenis
```typescript
enum LuaranJenis {
  JURNAL = 'jurnal',
  BUKU = 'buku',
  HAKI = 'haki',
  PRODUK = 'produk',
  MEDIA_MASSA = 'media_massa',
  LAINNYA = 'lainnya'
}
```

### 15.9 Pencairan Termin
```typescript
enum PencairanTermin {
  TERMIN_1 = 'termin_1', // 50%
  TERMIN_2 = 'termin_2', // 25%
  TERMIN_3 = 'termin_3'  // 25%
}
```

### 15.10 Notifikasi Tipe
```typescript
enum NotifikasiTipe {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error'
}
```

### 15.11 Notifikasi Kategori
```typescript
enum NotifikasiKategori {
  PROPOSAL = 'proposal',
  REVIEW = 'review',
  MONITORING = 'monitoring',
  PENCAIRAN = 'pencairan',
  SISTEM = 'sistem'
}
```

---

## 16. PERMISSION MATRIX (RBAC)

### 16.1 Modul User Management

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View All Users | ✅ | ❌ | ❌ | ❌ |
| Create User | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ |
| Change Own Password | ✅ | ✅ | ✅ | ✅ |

### 16.2 Modul Data Master

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View Dosen | ✅ | ✅ (partial) | ✅ (partial) | ✅ (partial) |
| Create/Edit Dosen | ✅ | ❌ | ❌ | ❌ |
| Import Dosen | ✅ | ❌ | ❌ | ❌ |
| View Mahasiswa | ✅ | ✅ (partial) | ✅ (partial) | ❌ |
| Create/Edit Mahasiswa | ✅ | ❌ | ❌ | ❌ |
| View Reviewer | ✅ | ❌ | ❌ | ❌ |
| Create/Edit Reviewer | ✅ | ❌ | ❌ | ❌ |

### 16.3 Modul Setting Sistem

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View Periode | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Periode | ✅ | ❌ | ❌ | ❌ |
| Activate Periode | ✅ | ❌ | ❌ | ❌ |
| View Skema | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Skema | ✅ | ❌ | ❌ | ❌ |
| View Bidang Keahlian | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Bidang | ✅ | ❌ | ❌ | ❌ |

### 16.4 Modul Proposal

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View All Proposals | ✅ | ❌ | ❌ | ❌ |
| View Own Proposals | ✅ | ✅ | ✅ (as member) | ❌ |
| Create Proposal | ❌ | ✅ | ❌ | ❌ |
| Edit Proposal (Draft) | ❌ | ✅ (own) | ❌ | ❌ |
| Delete Proposal | ✅ | ✅ (draft only) | ❌ | ❌ |
| Submit Proposal | ❌ | ✅ (own) | ❌ | ❌ |
| Cancel Proposal | ✅ | ❌ | ❌ | ❌ |
| Add/Remove Anggota | ❌ | ✅ (own) | ❌ | ❌ |
| Upload File Proposal | ❌ | ✅ (own) | ❌ | ❌ |

### 16.5 Modul Review

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View All Reviews | ✅ | ❌ | ❌ | ❌ |
| Assign Reviewer | ✅ | ❌ | ❌ | ❌ |
| View Assigned Reviews | ❌ | ❌ | ❌ | ✅ |
| Submit Review | ❌ | ❌ | ❌ | ✅ |
| Edit Review | ❌ | ❌ | ❌ | ✅ (before deadline) |
| View Review Result | ✅ | ✅ (own proposal) | ❌ | ❌ |

### 16.6 Modul Keputusan

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| Approve/Reject Proposal | ✅ | ❌ | ❌ | ❌ |
| Request Revision | ✅ | ❌ | ❌ | ❌ |
| Generate Kontrak | ✅ | ❌ | ❌ | ❌ |
| Generate SK | ✅ | ❌ | ❌ | ❌ |
| Upload Signed Docs | ✅ | ❌ | ❌ | ❌ |
| View Kontrak/SK | ✅ | ✅ (own) | ❌ | ❌ |

### 16.7 Modul Monitoring

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View All Monitoring | ✅ | ❌ | ❌ | ❌ |
| View Own Monitoring | ✅ | ✅ | ✅ (as member) | ❌ |
| Submit Monitoring | ❌ | ✅ (ketua) | ❌ | ❌ |
| Edit Monitoring | ❌ | ✅ (before deadline) | ❌ | ❌ |
| Verify Monitoring | ✅ | ❌ | ❌ | ❌ |

### 16.8 Modul Luaran

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View All Luaran | ✅ | ❌ | ❌ | ❌ |
| View Own Luaran | ✅ | ✅ | ✅ (as member) | ❌ |
| Submit Luaran | ❌ | ✅ (ketua) | ❌ | ❌ |
| Edit Luaran | ❌ | ✅ (before verify) | ❌ | ❌ |
| Verify Luaran | ✅ | ❌ | ❌ | ❌ |

### 16.9 Modul Pencairan Dana

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View All Pencairan | ✅ | ❌ | ❌ | ❌ |
| View Own Pencairan | ✅ | ✅ | ❌ | ❌ |
| Create Pencairan | ✅ | ❌ | ❌ | ❌ |
| Approve Pencairan | ✅ | ❌ | ❌ | ❌ |

### 16.10 Modul Dashboard & Laporan

| Fitur | Admin | Dosen | Mahasiswa | Reviewer |
|-------|-------|-------|-----------|----------|
| View Admin Dashboard | ✅ | ❌ | ❌ | ❌ |
| View Dosen Dashboard | ❌ | ✅ | ❌ | ❌ |
| View Reviewer Dashboard | ❌ | ❌ | ❌ | ✅ |
| Export Laporan | ✅ | ❌ | ❌ | ❌ |
| View Statistics | ✅ | ✅ (limited) | ❌ | ✅ (limited) |

---

## 17. FILE STORAGE STRATEGY

### 17.1 Struktur Folder
```
/uploads/
  /proposal/
    /{tahun}/
      /{proposal_id}/
        /original/
          proposal_P-2025-001.pdf
        /revisi/
          proposal_P-2025-001_rev1.pdf
          proposal_P-2025-001_rev2.pdf
  /monitoring/
    /{proposal_id}/
      monitoring_1_P-2025-001.pdf
      monitoring_2_P-2025-001.pdf
      laporan_akhir_P-2025-001.pdf
  /luaran/
    /{proposal_id}/
      luaran_1_jurnal.pdf
      luaran_2_buku.pdf
  /kontrak/
    /{tahun}/
      kontrak_P-2025-001.pdf
      kontrak_P-2025-001_ttd.pdf
      sk_P-2025-001.pdf
  /temp/
    (temporary uploads, cleaned daily)
```

### 17.2 Naming Convention
```
Format: {jenis}_{kode_proposal}_{suffix}.{ext}

Contoh:
- proposal_P-2025-001.pdf
- proposal_P-2025-001_rev1.pdf
- monitoring_1_P-2025-001.pdf
- kontrak_P-2025-001_ttd.pdf
- luaran_1_P-2025-001.pdf
```

### 17.3 File Validation

#### Allowed File Types:
- **Dokumen:** PDF only
- **Max Size:** 10 MB per file
- **Naming:** Alphanumeric + underscore + dash only

#### Security:
- ✅ Virus scan setiap upload (ClamAV)
- ✅ Validate MIME type (tidak hanya extension)
- ✅ Rename file untuk prevent path traversal
- ✅ Store outside public root
- ✅ Serve via authenticated endpoint

### 17.4 File Access Control

```typescript
// Middleware untuk check file access
function checkFileAccess(user, file) {
  switch(file.type) {
    case 'proposal':
      // Admin or ketua or anggota proposal
      return user.role === 'admin' || 
             isProposalMember(user.id, file.reference_id);
    
    case 'kontrak':
      // Admin or ketua proposal
      return user.role === 'admin' || 
             isProposalKetua(user.id, file.reference_id);
    
    case 'monitoring':
    case 'luaran':
      // Admin or proposal members
      return user.role === 'admin' || 
             isProposalMember(user.id, file.reference_id);
    
    default:
      return user.role === 'admin';
  }
}
```

### 17.5 Backup Strategy
- **Daily backup:** Database + uploaded files
- **Retention:** 30 days
- **Storage:** External storage (Google Drive / S3)
- **Automation:** Cron job setiap 02:00 WIB

---

## 18. TESTING & QA PLAN

### 18.1 Unit Testing

#### Tools:
- **Jest** untuk testing
- **React Testing Library** untuk component testing
- **Coverage target:** minimum 70%

#### Test Cases per Module:
```typescript
// Example: Proposal Module
describe('Proposal Module', () => {
  describe('Create Proposal', () => {
    it('should create proposal with valid data')
    it('should reject if periode not active')
    it('should reject if dosen already has proposal in periode')
    it('should reject if file > 10MB')
    it('should reject if anggota > 4')
  })
  
  describe('Submit Proposal', () => {
    it('should change status from draft to diajukan')
    it('should reject if required fields empty')
    it('should send notification to admin')
  })
})
```

### 18.2 Integration Testing

#### Test Scenarios:
1. **Full Proposal Flow:**
   - Dosen create → submit → admin assign reviewer → reviewer review → admin approve → generate kontrak

2. **Revision Flow:**
   - Proposal rejected → dosen upload revision → reviewer review again → approved

3. **Monitoring Flow:**
   - Upload monitoring 1 → verify → upload monitoring 2 → verify → upload laporan akhir

4. **Pencairan Flow:**
   - Kontrak → termin 1 → monitoring 2 → termin 2 → luaran → termin 3

### 18.3 API Testing

#### Tools:
- **Postman** collections untuk manual testing
- **Newman** untuk automated API testing
- **Response time target:** < 500ms

#### Test Coverage:
- ✅ Authentication & authorization
- ✅ CRUD operations semua entity
- ✅ File upload/download
- ✅ Error handling (400, 401, 403, 404, 500)
- ✅ Pagination & filtering
- ✅ Rate limiting

### 18.4 E2E Testing

#### Tools:
- **Playwright** atau **Cypress**

#### Critical User Flows:
1. Admin login → create periode → import dosen
2. Dosen login → create proposal → submit
3. Admin assign reviewer → reviewer review → admin approve
4. Dosen upload monitoring → admin verify
5. Dosen submit luaran → admin verify → approve pencairan

### 18.5 Performance Testing

#### Tools:
- **Apache JMeter** atau **k6**

#### Scenarios:
- 100 concurrent users
- 1000 proposals dalam database
- Response time < 500ms untuk 95% requests
- Server CPU < 70%, Memory < 80%

### 18.6 Security Testing

#### Checklist:
- ✅ SQL Injection prevention (prepared statements)
- ✅ XSS prevention (sanitize input)
- ✅ CSRF protection
- ✅ File upload validation
- ✅ Authentication bypass testing
- ✅ Authorization testing (role-based)
- ✅ Password security (bcrypt, min length)
- ✅ Session management

### 18.7 UAT (User Acceptance Testing)

#### Participants:
- 2 Admin LPPM
- 5 Dosen
- 2 Reviewer
- 2 Mahasiswa

#### Duration: 2 minggu

#### Success Criteria:
- ✅ 90% user tasks completed successfully
- ✅ User satisfaction score > 4/5
- ✅ Critical bugs: 0
- ✅ Major bugs: < 5

---

## 19. DEPLOYMENT CHECKLIST

### 19.1 Pre-Deployment

#### Development Environment:
- [ ] All features completed & tested
- [ ] Code review completed
- [ ] Unit tests passed (coverage > 70%)
- [ ] Integration tests passed
- [ ] No critical/major bugs
- [ ] Documentation updated

#### Database:
- [ ] Migration scripts ready
- [ ] Seed data prepared (master data)
- [ ] Database backup strategy configured
- [ ] Database credentials secured (environment variables)

#### Environment Variables:
```env
# Database
DATABASE_URL="mysql://user:pass@host:3306/lppm"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://lppm.staiali.ac.id"

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH="/var/www/uploads"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="lppm@staiali.ac.id"
SMTP_PASS="your-password"

# App
NODE_ENV="production"
APP_URL="https://lppm.staiali.ac.id"
```

### 19.2 Server Requirements

#### Minimum Specs:
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 50 GB SSD
- **Bandwidth:** 1 TB/month
- **OS:** Ubuntu 22.04 LTS

#### Software Requirements:
- Node.js 18+
- MySQL 8.0+
- Nginx atau Apache
- PM2 (process manager)
- Let's Encrypt (SSL)

### 19.3 Deployment Steps

#### 1. Server Setup:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

#### 2. Application Setup:
```bash
# Clone repository
git clone https://github.com/yourusername/lppm.git
cd lppm

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env

# Run migrations
npx prisma migrate deploy

# Seed master data
npx prisma db seed

# Build application
npm run build

# Start with PM2
pm2 start npm --name "lppm" -- start
pm2 save
pm2 startup
```

#### 3. Nginx Configuration:
```nginx
server {
    listen 80;
    server_name lppm.staiali.ac.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lppm.staiali.ac.id;

    ssl_certificate /etc/letsencrypt/live/lppm.staiali.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lppm.staiali.ac.id/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

#### 4. SSL Setup:
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d lppm.staiali.ac.id

# Auto-renewal
sudo certbot renew --dry-run
```

### 19.4 Post-Deployment

#### Verification:
- [ ] Website accessible via HTTPS
- [ ] Login functionality works
- [ ] File upload works
- [ ] Database connection stable
- [ ] Email notification works (if enabled)
- [ ] All API endpoints responding
- [ ] Performance acceptable (< 2s page load)

#### Monitoring Setup:
```bash
# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Check logs
pm2 logs lppm
```

#### Database Backup:
```bash
# Create backup script
nano /root/backup-db.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p lppm > /backup/lppm_$DATE.sql
find /backup -name "lppm_*.sql" -mtime +30 -delete

# Make executable
chmod +x /root/backup-db.sh

# Setup cron (daily at 2 AM)
crontab -e
0 2 * * * /root/backup-db.sh
```

### 19.5 Initial Data Setup

#### 1. Create Default Admin:
```sql
INSERT INTO users (username, email, password, role, status) 
VALUES ('admin', 'admin@staiali.ac.id', '$2a$10$hashedpassword', 'admin', 'aktif');
```

#### 2. Import Master Data:
- [ ] Bidang Keahlian
- [ ] Dosen (dari Excel)
- [ ] Mahasiswa (dari Excel)
- [ ] Skema Penelitian & PKM

#### 3. Create First Periode:
- [ ] Periode 1 Tahun 2025
- [ ] Set tanggal buka & tutup
- [ ] Activate periode

### 19.6 Training & Handover

#### Training Sessions:
1. **Admin Training (4 jam):**
   - User management
   - Data master management
   - Periode & skema setup
   - Review assignment
   - Monitoring & approval
   - Laporan & export

2. **Dosen Training (2 jam):**
   - Login & profile
   - Pengajuan proposal
   - Upload monitoring & laporan
   - Submit luaran

3. **Reviewer Training (1 jam):**
   - Login & review assignment
   - Form penilaian
   - Submit review

#### Documentation:
- [ ] User Manual (PDF)
- [ ] Admin Guide (PDF)
- [ ] Video Tutorial (YouTube)
- [ ] FAQ Document

### 19.7 Go-Live Checklist

#### Final Checks:
- [ ] All training completed
- [ ] All users created & verified
- [ ] Master data imported
- [ ] Backup system tested
- [ ] Monitoring tools active
- [ ] Support channel ready (WhatsApp/Email)
- [ ] Rollback plan prepared

#### Launch:
- [ ] Announce go-live date (1 week notice)
- [ ] Schedule downtime (if migration needed)
- [ ] Execute deployment
- [ ] Verify all systems
- [ ] Monitor first 24 hours closely
- [ ] Collect user feedback

---

## 20. MAINTENANCE & SUPPORT

### 20.1 Regular Maintenance Tasks

#### Daily:
- ✅ Check application logs
- ✅ Monitor server resources
- ✅ Check database backup success

#### Weekly:
- ✅ Review user feedback
- ✅ Check system performance
- ✅ Update dependencies (security patches)

#### Monthly:
- ✅ Database optimization
- ✅ Cleanup old logs
- ✅ Review audit logs
- ✅ Performance report

### 20.2 Support Channels

#### Level 1 Support (User Issues):
- **WhatsApp Group:** LPPM Support
- **Email:** support-lppm@staiali.ac.id
- **Response Time:** < 24 hours

#### Level 2 Support (Technical Issues):
- **Developer Contact:** developer@staiali.ac.id
- **Response Time:** < 48 hours

### 20.3 Update & Enhancement

#### Version Control:
- **Major version:** Breaking changes (e.g., 1.0 → 2.0)
- **Minor version:** New features (e.g., 1.0 → 1.1)
- **Patch version:** Bug fixes (e.g., 1.0.1 → 1.0.2)

#### Release Schedule:
- **Patch releases:** As needed (critical bugs)
- **Minor releases:** Quarterly
- **Major releases:** Yearly

---

## 21. BUSINESS RULES DETAIL (EXPANDED)

### 21.1 Pengajuan Proposal

#### Validasi Ketua:
```typescript
function validateKetua(dosen: Dosen, periode: Periode): ValidationResult {
  // Rule 1: Harus dosen tetap dengan NIDN STAI Ali
  if (!dosen.nidn.startsWith('21')) {
    return { valid: false, message: 'Hanya dosen NIDN STAI Ali yang bisa jadi ketua' }
  }
  
  // Rule 2: Status dosen harus aktif
  if (dosen.status !== 'aktif') {
    return { valid: false, message: 'Dosen tidak aktif' }
  }
  
  // Rule 3: Maksimal 1 proposal sebagai ketua per periode
  const existingProposal = await Proposal.findOne({
    where: { ketua_id: dosen.id, periode_id: periode.id }
  })
  if (existingProposal) {
    return { valid: false, message: 'Anda sudah mengajukan proposal di periode ini' }
  }
  
  return { valid: true }
}
```

#### Validasi Anggota:
```typescript
function validateAnggota(anggota: Array): ValidationResult {
  // Rule 1: Maksimal 4 orang (termasuk ketua)
  if (anggota.length > 3) {
    return { valid: false, message: 'Maksimal 3 anggota tambahan (total 4 termasuk ketua)' }
  }
  
  // Rule 2: Tidak boleh duplikat
  const uniqueIds = new Set(anggota.map(a => a.id))
  if (uniqueIds.size !== anggota.length) {
    return { valid: false, message: 'Anggota tidak boleh duplikat' }
  }
  
  return { valid: true }
}
```

### 21.2 Review Process

#### Auto-assign Reviewer:
```typescript
function autoAssignReviewer(proposal: Proposal): Reviewer[] {
  // Cari reviewer dengan bidang keahlian yang sama
  const reviewers = await Reviewer.findAll({
    where: {
      bidang_keahlian_id: proposal.bidang_keahlian_id,
      status: 'aktif'
    },
    order: [
      ['last_review_count', 'ASC'] // Load balancing
    ],
    limit: 2
  })
  
  return reviewers
}
```

#### Review Deadline Check:
```typescript
function checkReviewDeadline() {
  // Jalankan setiap hari via cron
  const overdueReviews = await ProposalReviewer.findAll({
    where: {
      status: 'pending',
      assigned_at: { [Op.lt]: moment().subtract(7, 'days') }
    }
  })
  
  overdueReviews.forEach(async (review) => {
    // Send reminder
    await sendNotification(review.reviewer_id, {
      title: 'Reminder: Review Deadline',
      message: `Review untuk proposal ${review.proposal.judul} sudah melewati deadline`
    })
    
    // Auto-escalate to admin if > 10 days
    if (moment().diff(review.assigned_at, 'days') > 10) {
      await sendNotification(adminUsers, {
        title: 'Reviewer Tidak Responsif',
        message: `Reviewer ${review.reviewer.nama} belum review ${review.proposal.judul}`
      })
    }
  })
}
```

### 21.3 Monitoring & Laporan

#### Deadline Monitoring:
```typescript
function calculateMonitoringDeadline(proposal: Proposal): Dates {
  const startDate = proposal.tanggal_mulai
  
  return {
    monitoring_1: moment(startDate).add(3, 'months'),
    monitoring_2: moment(startDate).add(5, 'months'),
    laporan_akhir: moment(startDate).add(6, 'months')
  }
}
```

#### Late Monitoring Check:
```typescript
function checkLateMonitoring() {
  const lateProposals = await Proposal.findAll({
    where: {
      status: 'berjalan',
      // Belum upload monitoring 1 & sudah > 30 hari dari deadline
    }
  })
  
  lateProposals.forEach(async (proposal) => {
    // Warning notification
    await sendNotification(proposal.ketua_id, {
      type: 'warning',
      title: 'Monitoring Terlambat',
      message: 'Monitoring Anda sudah terlambat > 30 hari. Penelitian dapat dibatalkan.'
    })
    
    // If > 60 days, auto-cancel
    if (daysDiff > 60) {
      await cancelProposal(proposal.id, 'Monitoring terlambat > 60 hari')
    }
  })
}
```

### 21.4 Pencairan Dana

#### Validation Pencairan:
```typescript
function validatePencairan(proposal: Proposal, termin: string): ValidationResult {
  switch(termin) {
    case 'termin_1':
      // Syarat: Kontrak sudah ditandatangani
      if (!proposal.kontrak || !proposal.kontrak.file_kontrak_ttd) {
        return { valid: false, message: 'Kontrak belum ditandatangani' }
      }
      break
      
    case 'termin_2':
      // Syarat: Monitoring 2 sudah diverifikasi
      const monitoring2 = await Monitoring.findOne({
        where: { 
          proposal_id: proposal.id, 
          jenis_monitoring: 'monitoring_2',
          status_verifikasi: 'diverifikasi'
        }
      })
      if (!monitoring2) {
        return { valid: false, message: 'Monitoring 2 belum diverifikasi' }
      }
      break
      
    case 'termin_3':
      // Syarat: Minimal 1 luaran sudah diverifikasi
      const luaran = await Luaran.findOne({
        where: {
          proposal_id: proposal.id,
          status_verifikasi: 'diverifikasi'
        }
      })
      if (!luaran) {
        return { valid: false, message: 'Belum ada luaran yang diverifikasi' }
      }
      break
  }
  
  return { valid: true }
}
```

---

## 22. ERROR CODES & MESSAGES

### 22.1 Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {} // Optional additional info
  }
}
```

### 22.2 Error Code List

#### Authentication (AUTH_*)
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Unauthorized access
- `AUTH_004`: Account suspended
- `AUTH_005`: First login, password change required

#### Validation (VAL_*)
- `VAL_001`: Missing required field
- `VAL_002`: Invalid format
- `VAL_003`: Duplicate entry
- `VAL_004`: Value out of range
- `VAL_005`: File size exceeded

#### Business Logic (BIZ_*)
- `BIZ_001`: Periode not active
- `BIZ_002`: Proposal limit exceeded
- `BIZ_003`: Invalid proposal status
- `BIZ_004`: Review deadline passed
- `BIZ_005`: Insufficient permission

#### Database (DB_*)
- `DB_001`: Connection failed
- `DB_002`: Query failed
- `DB_003`: Transaction failed
- `DB_004`: Record not found

#### File Upload (FILE_*)
- `FILE_001`: Invalid file type
- `FILE_002`: File too large
- `FILE_003`: Upload failed
- `FILE_004`: Virus detected
- `FILE_005`: File not found

---

**DOKUMEN LENGKAP & SIAP DEVELOPMENT! 🚀**
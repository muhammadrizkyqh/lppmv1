# Data Master API Documentation

## 📚 Overview

API untuk mengelola data master sistem LPPM:
- Dosen
- Mahasiswa
- Reviewer
- Bidang Keahlian
- Skema Penelitian
- Periode

---

## 🔐 Authentication

Semua endpoint memerlukan authentication. Pastikan sudah login dan memiliki session cookie.

**Required Headers:**
```
Cookie: session=<jwt_token>
```

---

## 👨‍🏫 Dosen API

### GET `/api/dosen`

Get all dosen with pagination and filters.

**Query Parameters:**
- `search` (string) - Search by nama, NIDN, or email
- `status` (string) - Filter by status (AKTIF/NONAKTIF)
- `bidangKeahlianId` (string) - Filter by bidang keahlian
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "userId": "clx...",
      "nidn": "0101018901",
      "nama": "Dr. Ahmad Fauzi, M.Pd.I",
      "email": "ahmad.dosen@stai-ali.ac.id",
      "noHp": "081234567890",
      "bidangKeahlianId": "clx...",
      "status": "AKTIF",
      "bidangKeahlian": {
        "id": "clx...",
        "nama": "Pendidikan Bahasa Arab"
      },
      "user": {
        "id": "clx...",
        "username": "dosen1",
        "email": "ahmad.dosen@stai-ali.ac.id",
        "status": "AKTIF",
        "lastLogin": "2025-10-16T10:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

### POST `/api/dosen`

Create new dosen (Admin only).

**Request Body:**
```json
{
  "nidn": "0404049404",
  "nama": "Dr. Budi Santoso, M.Pd",
  "email": "budi@stai-ali.ac.id",
  "noHp": "08123456789",
  "bidangKeahlianId": "clx...",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* dosen object */ },
  "message": "Dosen berhasil ditambahkan"
}
```

### GET `/api/dosen/[id]`

Get single dosen detail with proposals.

**Response:**
```json
{
  "success": true,
  "data": {
    /* dosen object with proposals */
  }
}
```

### PUT `/api/dosen/[id]`

Update dosen (Admin only).

**Request Body:**
```json
{
  "nama": "Dr. Ahmad Fauzi Updated",
  "email": "ahmad.updated@stai-ali.ac.id",
  "noHp": "08199999999",
  "bidangKeahlianId": "clx...",
  "status": "AKTIF"
}
```

### DELETE `/api/dosen/[id]`

Delete dosen (Admin only). Cannot delete if dosen has proposals.

---

## 👨‍🎓 Mahasiswa API

### GET `/api/mahasiswa`

Get all mahasiswa with pagination and filters.

**Query Parameters:**
- `search` (string) - Search by nama, NIM, or email
- `prodi` (string) - Filter by prodi
- `angkatan` (string) - Filter by angkatan
- `status` (string) - Filter by status
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "userId": "clx...",
      "nim": "2021010001",
      "nama": "Ali Akbar",
      "email": "ali.mahasiswa@student.stai-ali.ac.id",
      "prodi": "Pendidikan Bahasa Arab",
      "angkatan": "2021",
      "status": "AKTIF",
      "user": { /* user object */ }
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### POST `/api/mahasiswa`

Create new mahasiswa (Admin only).

**Request Body:**
```json
{
  "nim": "2022010001",
  "nama": "Siti Nur Aisyah",
  "email": "siti@student.stai-ali.ac.id",
  "prodi": "Pendidikan Islam",
  "angkatan": "2022",
  "password": "password123"
}
```

---

## 🔍 Reviewer API

### GET `/api/reviewer`

Get all reviewers with pagination and filters.

**Query Parameters:**
- `search` (string) - Search by nama, email, or institusi
- `tipe` (string) - Filter by tipe (INTERNAL/EKSTERNAL)
- `bidangKeahlianId` (string) - Filter by bidang keahlian
- `status` (string) - Filter by status
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "userId": "clx...",
      "nama": "Prof. Dr. Abdul Rahman",
      "email": "reviewer1@stai-ali.ac.id",
      "institusi": "STAI Ali",
      "bidangKeahlianId": "clx...",
      "tipe": "INTERNAL",
      "status": "AKTIF",
      "bidangKeahlian": { /* bidang keahlian object */ },
      "user": { /* user object */ },
      "reviews": [
        { "id": "clx...", "status": "COMPLETED" }
      ]
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### POST `/api/reviewer`

Create new reviewer (Admin only).

**Request Body:**
```json
{
  "nama": "Dr. Hasan Basri",
  "email": "hasan@external.ac.id",
  "institusi": "UIN Jakarta",
  "bidangKeahlianId": "clx...",
  "tipe": "EKSTERNAL",
  "password": "password123"
}
```

---

## 📚 Bidang Keahlian API

### GET `/api/bidang-keahlian`

Get all active bidang keahlian.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "nama": "Pendidikan Bahasa Arab",
      "deskripsi": "Bidang keahlian pendidikan bahasa Arab",
      "status": "AKTIF",
      "_count": {
        "dosens": 2,
        "reviewers": 1,
        "proposals": 5
      }
    }
  ]
}
```

### POST `/api/bidang-keahlian`

Create new bidang keahlian (Admin only).

**Request Body:**
```json
{
  "nama": "Pendidikan Agama Islam",
  "deskripsi": "Bidang keahlian pendidikan agama Islam"
}
```

---

## 💰 Skema API

### GET `/api/skema`

Get all active skema penelitian.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "nama": "Penelitian Dasar",
      "tipe": "DASAR",
      "dana": "5000000.00",
      "deskripsi": "Penelitian dasar dengan dana Rp 5.000.000",
      "status": "AKTIF",
      "_count": {
        "proposals": 10
      }
    }
  ]
}
```

### POST `/api/skema`

Create new skema (Admin only).

**Request Body:**
```json
{
  "nama": "Penelitian Kolaborasi",
  "tipe": "TERAPAN",
  "dana": 10000000,
  "deskripsi": "Penelitian kolaborasi antar institusi"
}
```

---

## 📅 Periode API

### GET `/api/periode`

Get all periode.

**Query Parameters:**
- `status` (string) - Filter by status (AKTIF/NONAKTIF/SELESAI)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "tahun": "2025",
      "nama": "Periode Penelitian 2025",
      "tanggalBuka": "2025-01-01T00:00:00.000Z",
      "tanggalTutup": "2025-03-31T00:00:00.000Z",
      "kuota": 50,
      "status": "AKTIF",
      "_count": {
        "proposals": 12
      }
    }
  ]
}
```

### POST `/api/periode`

Create new periode (Admin only).

**Request Body:**
```json
{
  "tahun": "2026",
  "nama": "Periode Penelitian 2026",
  "tanggalBuka": "2026-01-01",
  "tanggalTutup": "2026-03-31",
  "kuota": 60,
  "status": "NONAKTIF"
}
```

---

## 🔒 Authorization

### Required Roles

| Endpoint | Method | Required Role |
|----------|--------|---------------|
| `/api/dosen` | GET | Any authenticated user |
| `/api/dosen` | POST | ADMIN |
| `/api/dosen/[id]` | GET | Any authenticated user |
| `/api/dosen/[id]` | PUT | ADMIN |
| `/api/dosen/[id]` | DELETE | ADMIN |
| `/api/mahasiswa` | GET | Any authenticated user |
| `/api/mahasiswa` | POST | ADMIN |
| `/api/reviewer` | GET | Any authenticated user |
| `/api/reviewer` | POST | ADMIN |
| `/api/bidang-keahlian` | GET | Any authenticated user |
| `/api/bidang-keahlian` | POST | ADMIN |
| `/api/skema` | GET | Any authenticated user |
| `/api/skema` | POST | ADMIN |
| `/api/periode` | GET | Any authenticated user |
| `/api/periode` | POST | ADMIN |

---

## 🧪 Testing with cURL

### Test Get Dosen (after login)
```bash
curl http://localhost:3000/api/dosen \
  -H "Cookie: session=YOUR_SESSION_TOKEN"
```

### Test Create Dosen (Admin only)
```bash
curl -X POST http://localhost:3000/api/dosen \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_ADMIN_SESSION_TOKEN" \
  -d '{
    "nidn": "0505059505",
    "nama": "Dr. Test Dosen",
    "email": "test@stai-ali.ac.id",
    "noHp": "08123456789",
    "bidangKeahlianId": "BIDANG_KEAHLIAN_ID"
  }'
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Terjadi kesalahan server"
}
```

---

## 📝 Notes

1. All endpoints require authentication
2. Only ADMIN can create, update, delete data
3. All GET endpoints are accessible by authenticated users
4. Passwords default to `password123` if not provided
5. Search is case-insensitive
6. Pagination defaults: page=1, limit=10

---

**Next:** Proposal Management API 🚀

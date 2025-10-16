# Authentication System Documentation

## 🔐 Authentication System Overview

System authentication menggunakan **JWT (JSON Web Token)** dengan **HTTP-only cookies** untuk keamanan maksimal.

---

## 📋 Features

### ✅ Implemented Features

1. **Login System**
   - Username/Email based login
   - Password hashing dengan bcryptjs (10 rounds)
   - JWT token generation
   - Session duration: 2 hours
   - HTTP-only cookies (tidak bisa diakses JavaScript)

2. **Session Management**
   - Auto session refresh
   - Session expiration handling
   - Secure cookie configuration

3. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes via middleware
   - Auto redirect jika tidak authorized

4. **User Management**
   - Change password functionality
   - Password validation (min 6 characters)
   - Must change password on first login

---

## 🧪 Testing Guide

### 1. Start Development Server

```bash
npm run dev
```

Server akan running di: `http://localhost:3000`

### 2. Test Login

**Default Credentials:**

| Role | Username | Password | Email |
|------|----------|----------|-------|
| **Admin** | `admin` | `password123` | admin@stai-ali.ac.id |
| **Dosen 1** | `dosen1` | `password123` | ahmad.dosen@stai-ali.ac.id |
| **Dosen 2** | `dosen2` | `password123` | siti.dosen@stai-ali.ac.id |
| **Dosen 3** | `dosen3` | `password123` | muhammad.dosen@stai-ali.ac.id |
| **Mahasiswa 1** | `mhs1` | `password123` | ali.mahasiswa@student.stai-ali.ac.id |
| **Mahasiswa 2** | `mhs2` | `password123` | fatimah.mahasiswa@student.stai-ali.ac.id |
| **Reviewer 1** | `reviewer1` | `password123` | reviewer1@stai-ali.ac.id |
| **Reviewer 2** | `reviewer2` | `password123` | reviewer2@external.ac.id |

### 3. Test Scenarios

#### ✅ Scenario 1: Successful Login
1. Buka `http://localhost:3000`
2. Auto redirect ke `/login`
3. Input username: `admin`
4. Input password: `password123`
5. Click "Masuk ke Sistem"
6. Expected: Toast "Login berhasil" → Redirect ke `/dashboard`

#### ✅ Scenario 2: Invalid Credentials
1. Input username: `admin`
2. Input password: `wrongpassword`
3. Click login
4. Expected: Toast error "Password salah"

#### ✅ Scenario 3: User Not Found
1. Input username: `notexist`
2. Input password: `password123`
3. Click login
4. Expected: Toast error "Username atau email tidak ditemukan"

#### ✅ Scenario 4: Protected Route
1. Logout dari system
2. Manually navigate ke `http://localhost:3000/dashboard`
3. Expected: Auto redirect ke `/login?redirect=/dashboard`
4. After login → redirect kembali ke `/dashboard`

#### ✅ Scenario 5: Logout
1. Login as any user
2. Go to dashboard
3. Click user avatar di sidebar
4. Click "Logout"
5. Expected: Toast "Logout berhasil" → Redirect ke `/login`

#### ✅ Scenario 6: Session Check
1. Login as admin
2. Check sidebar footer → Should show:
   - Avatar with initials
   - User name
   - User role badge
3. Dropdown menu should show email

---

## 🔧 API Endpoints

### 1. POST `/api/auth/login`

**Request:**
```json
{
  "identifier": "admin",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "username": "admin",
    "email": "admin@stai-ali.ac.id",
    "role": "ADMIN",
    "name": "Administrator"
  },
  "message": "Login berhasil"
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": "Password salah"
}
```

---

### 2. POST `/api/auth/logout`

**Request:** Empty body

**Response (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### 3. GET `/api/auth/session`

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "username": "admin",
    "email": "admin@stai-ali.ac.id",
    "role": "ADMIN",
    "name": "Administrator"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": "Tidak ada session aktif"
}
```

---

### 4. POST `/api/auth/change-password`

**Request:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Password lama salah"
}
```

---

## 🔒 Security Features

1. **Password Hashing**
   - Menggunakan bcryptjs dengan 10 salt rounds
   - Password tidak pernah disimpan dalam plaintext

2. **HTTP-only Cookies**
   - JWT token disimpan di HTTP-only cookie
   - Tidak bisa diakses via JavaScript
   - Protection dari XSS attacks

3. **Secure Cookie Settings**
   ```javascript
   {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production', // HTTPS only di production
     expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
     sameSite: 'lax',
     path: '/',
   }
   ```

4. **JWT Encryption**
   - Algorithm: HS256
   - Secret key dari environment variable
   - Token expiration: 2 hours

5. **Middleware Protection**
   - Auto redirect unauthorized users
   - Route protection for `/dashboard/*`

---

## 🛠️ Authentication Functions

### `lib/auth.ts`

```typescript
// Login user
login(identifier: string, password: string)
  → Returns: { success, user?, error? }

// Logout user
logout()
  → Clears session cookie

// Get current session
getSession()
  → Returns: SessionData | null

// Change password
changePassword(userId, oldPassword, newPassword)
  → Returns: { success, error? }

// Require authentication
requireAuth()
  → Throws error if not authenticated

// Require specific role
requireRole(allowedRoles: UserRole[])
  → Throws error if role not allowed
```

---

## 📁 File Structure

```
lib/
  ├── auth.ts              # Authentication functions
  └── prisma.ts            # Prisma client singleton

app/
  └── api/
      └── auth/
          ├── login/
          │   └── route.ts       # POST /api/auth/login
          ├── logout/
          │   └── route.ts       # POST /api/auth/logout
          ├── session/
          │   └── route.ts       # GET /api/auth/session
          └── change-password/
              └── route.ts       # POST /api/auth/change-password

middleware.ts              # Route protection middleware
```

---

## 🐛 Troubleshooting

### Error: "Unauthorized"
- **Cause:** No session cookie atau token expired
- **Solution:** Login ulang

### Error: "Module '@prisma/client' has no exported member 'UserRole'"
- **Cause:** Prisma Client belum di-generate
- **Solution:** Run `npx prisma generate`

### Error: "Can't connect to MySQL"
- **Cause:** MySQL service not running
- **Solution:** Start MySQL service

### Session tidak tersimpan
- **Cause:** Cookie settings salah
- **Solution:** Check browser cookies, ensure `httpOnly: true`

### Auto redirect loop
- **Cause:** Middleware configuration issue
- **Solution:** Check `middleware.ts` matcher config

---

## 🚀 Next Steps

Setelah authentication berhasil, lanjut ke:

1. ✅ Authentication System (DONE)
2. 🔜 User Management API
3. 🔜 Data Master API (Dosen, Mahasiswa, Reviewer)
4. 🔜 Proposal Management API
5. 🔜 Review & Penilaian API
6. 🔜 File Upload System
7. 🔜 Notification System

---

## 📚 References

- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Jose JWT Library](https://github.com/panva/jose)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

---

**Author:** LPPM Development Team  
**Last Updated:** October 16, 2025  
**Version:** 1.0.0

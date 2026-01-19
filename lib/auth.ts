import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Define UserRole type manually to match Prisma schema
type UserRole = 'ADMIN' | 'DOSEN' | 'MAHASISWA' | 'REVIEWER'

// Types
export interface SessionUser {
  id: string
  username: string
  email: string
  role: UserRole
  name?: string
  nidn?: string
  nim?: string
}

export interface SessionData {
  user: SessionUser
  expires: string
}

// Configuration
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
)
const SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

// ==========================================
// JWT Functions
// ==========================================

export async function encrypt(payload: SessionData): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret)
}

export async function decrypt(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionData
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// ==========================================
// Session Management
// ==========================================

export async function createSession(user: SessionUser): Promise<string> {
  const expires = new Date(Date.now() + SESSION_DURATION)
  const session: SessionData = {
    user,
    expires: expires.toISOString(),
  }

  const token = await encrypt(session)

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  })

  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  return await decrypt(token)
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function updateSession(): Promise<void> {
  const session = await getSession()
  
  if (!session) return

  const expires = new Date(Date.now() + SESSION_DURATION)
  session.expires = expires.toISOString()

  const token = await encrypt(session)
  const cookieStore = await cookies()
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

// ==========================================
// Authentication Functions
// ==========================================

export async function login(
  identifier: string, // username, email, NIDN, or NIM
  password: string
): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    console.log('🔍 Login attempt:', { identifier })
    
    // Find user by username or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      include: {
        dosen: true,
        mahasiswa: true,
        reviewer: true,
      },
    })

    // If not found, try to find by NIDN in dosen table
    if (!user) {
      const dosen = await prisma.dosen.findFirst({
        where: { nidn: identifier },
        include: { user: true }
      })
      
      if (dosen?.user) {
        user = await prisma.user.findUnique({
          where: { id: dosen.userId },
          include: {
            dosen: true,
            mahasiswa: true,
            reviewer: true,
          }
        })
      }
    }

    // If not found, try to find by NIM in mahasiswa table
    if (!user) {
      const mahasiswa = await prisma.mahasiswa.findFirst({
        where: { nim: identifier },
        include: { user: true }
      })
      
      if (mahasiswa?.user) {
        user = await prisma.user.findUnique({
          where: { id: mahasiswa.userId },
          include: {
            dosen: true,
            mahasiswa: true,
            reviewer: true,
          }
        })
      }
    }

    if (!user) {
      console.log('❌ User not found:', identifier)
      return { success: false, error: 'Username, email, NIDN, atau NIM tidak ditemukan' }
    }

    console.log('✅ User found:', { id: user.id, username: user.username, role: user.role, status: user.status })
    
    // Check if user is active
    if (user.status !== 'AKTIF') {
      console.log('❌ User inactive:', user.status)
      return { success: false, error: 'Akun Anda tidak aktif' }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log('❌ Password invalid')
      return { success: false, error: 'Password salah' }
    }
    
    console.log('✅ Password valid, creating session...')

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Get name based on role
    let name = ''
    let nidn: string | undefined
    let nim: string | undefined

    if (user.role === 'DOSEN' && user.dosen) {
      name = user.dosen.nama
      nidn = user.dosen.nidn
    } else if (user.role === 'MAHASISWA' && user.mahasiswa) {
      name = user.mahasiswa.nama
      nim = user.mahasiswa.nim
    } else if (user.role === 'REVIEWER' && user.reviewer) {
      name = user.reviewer.nama
    } else if (user.role === 'ADMIN') {
      name = 'Administrator'
    }

    // Create session user
    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name,
      nidn,
      nim,
    }

    // Create session
    await createSession(sessionUser)

    return {
      success: true,
      user: sessionUser,
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Terjadi kesalahan saat login' }
  }
}

export async function logout(): Promise<void> {
  await deleteSession()
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: 'User tidak ditemukan' }
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid) {
      return { success: false, error: 'Password lama salah' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'Terjadi kesalahan saat mengubah password' }
  }
}

// ==========================================
// Authorization Functions
// ==========================================

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session.user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }

  return user
}

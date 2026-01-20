import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { identifier, password } = body

    // Trim identifier to remove whitespace
    identifier = identifier?.trim()

    console.log('🔐 Login API called with identifier:', JSON.stringify(identifier))

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Attempt login
    const result = await login(identifier, password)

    console.log('🔐 Login result:', { 
      success: result.success, 
      userId: result.user?.id,
      username: result.user?.username,
      email: result.user?.email,
      role: result.user?.role,
      error: result.error
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Verify session was created
    const { cookies: cookiesAPI } = await import('next/headers')
    const cookieStore = await cookiesAPI()
    const sessionCookie = cookieStore.get('session')
    console.log('🍪 Session cookie created:', sessionCookie ? 'YES' : 'NO')

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login berhasil',
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Attempt login
    const result = await login(identifier, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

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

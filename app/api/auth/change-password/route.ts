import { NextRequest, NextResponse } from 'next/server'
import { changePassword, getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { oldPassword, newPassword, confirmPassword } = body

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password baru tidak cocok' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Change password
    const result = await changePassword(
      session.user.id,
      oldPassword,
      newPassword
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Change password API error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

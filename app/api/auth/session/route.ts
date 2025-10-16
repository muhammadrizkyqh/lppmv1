import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada session aktif' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: session.user,
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔍 GET /api/auth/session called')
    
    const { cookies: cookiesAPI } = await import('next/headers')
    const cookieStore = await cookiesAPI()
    const sessionCookie = cookieStore.get('session')
    console.log('🍪 Session cookie exists:', sessionCookie ? 'YES' : 'NO')
    
    const session = await getSession()

    if (!session) {
      console.log('❌ No active session')
      return NextResponse.json(
        { success: false, error: 'Tidak ada session aktif' },
        { status: 401 }
      )
    }

    console.log('✅ Session found:', {
      userId: session.user.id,
      username: session.user.username,
      role: session.user.role
    })

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

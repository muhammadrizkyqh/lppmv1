import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

// Routes yang butuh authentication
const protectedRoutes = ['/dashboard', '/admin', '/dosen', '/reviewer', '/mahasiswa']

// Routes yang hanya boleh diakses kalau belum login
const authRoutes = ['/login']

// Role-based route access
const roleRoutes = {
  '/admin': ['ADMIN'],
  '/dosen': ['DOSEN'],
  '/reviewer': ['REVIEWER'],
  '/mahasiswa': ['MAHASISWA'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Get session from cookie
  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  if (session && session.user) {
    const userRole = session.user.role as string
    
    // Check if user is accessing a role-specific route
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard for their role
          switch (userRole) {
            case 'ADMIN':
              return NextResponse.redirect(new URL('/admin/proposals', request.url))
            case 'DOSEN':
              return NextResponse.redirect(new URL('/dosen/proposals', request.url))
            case 'REVIEWER':
              return NextResponse.redirect(new URL('/reviewer/assignments', request.url))
            case 'MAHASISWA':
              return NextResponse.redirect(new URL('/mahasiswa/proposals', request.url))
            default:
              return NextResponse.redirect(new URL('/login', request.url))
          }
        }
      }
    }
  }

  // Redirect to dashboard if accessing auth route with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Get all dosen
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const bidangKeahlianId = searchParams.get('bidangKeahlianId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nidn: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (bidangKeahlianId) {
      where.bidangKeahlianId = bidangKeahlianId
    }

    // Get total count
    const total = await prisma.dosen.count({ where })

    // Get dosen with pagination
    const dosen = await prisma.dosen.findMany({
      where,
      include: {
        bidangkeahlian: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            lastLogin: true,
          },
        },
      },
      orderBy: { nama: 'asc' },
      skip,
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: dosen,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get dosen error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Create new dosen
export async function POST(request: NextRequest) {
  try {
    // Only admin can create dosen
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { nidn, nama, email, noHp, bidangKeahlianId, password } = body

    // Validation
    if (!nidn || !nama || !email) {
      return NextResponse.json(
        { success: false, error: 'NIDN, nama, dan email harus diisi' },
        { status: 400 }
      )
    }

    // Check if NIDN already exists
    const existingNidn = await prisma.dosen.findUnique({
      where: { nidn },
    })

    if (existingNidn) {
      return NextResponse.json(
        { success: false, error: 'NIDN sudah terdaftar' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Generate username from NIDN
    const username = `dosen_${nidn}`

    // Hash password (default: password123)
    const hashedPassword = await bcrypt.hash(password || 'password123', 10)

    // Create user and dosen in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'DOSEN',
          status: 'AKTIF',
        },
      })

      // Create dosen
      const dosen = await tx.dosen.create({
        data: {
          userId: user.id,
          nidn,
          nama,
          email,
          noHp,
          bidangKeahlianId,
          status: 'AKTIF',
        },
        include: {
          bidangkeahlian: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
            },
          },
        },
      })

      return dosen
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Dosen berhasil ditambahkan',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create dosen error:', error)

    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

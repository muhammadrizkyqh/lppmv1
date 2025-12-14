import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Get all reviewers
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const tipe = searchParams.get('tipe') || ''
    const bidangKeahlianId = searchParams.get('bidangKeahlianId') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { institusi: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tipe) {
      where.tipe = tipe
    }

    if (bidangKeahlianId) {
      where.bidangKeahlianId = bidangKeahlianId
    }

    if (status) {
      where.status = status
    }

    // Get total count
    const total = await prisma.reviewer.count({ where })

    // Get reviewers with pagination
    const reviewers = await prisma.reviewer.findMany({
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
      data: reviewers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get reviewers error:', error)
    
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

// POST - Create new reviewer
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { nama, email, institusi, bidangKeahlianId, tipe, password } = body

    // Validation
    if (!nama || !email || !institusi || !tipe) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, institusi, dan tipe harus diisi' },
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

    // Generate username
    const username = `reviewer_${email.split('@')[0]}`

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'password123', 10)

    // Create user and reviewer in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'REVIEWER',
          status: 'AKTIF',
        },
      })

      const reviewer = await tx.reviewer.create({
        data: {
          userId: user.id,
          nama,
          email,
          institusi,
          bidangKeahlianId,
          tipe,
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

      return reviewer
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Reviewer berhasil ditambahkan',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create reviewer error:', error)

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

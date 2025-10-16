import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Get all mahasiswa
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const prodi = searchParams.get('prodi') || ''
    const angkatan = searchParams.get('angkatan') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nim: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (prodi) {
      where.prodi = prodi
    }

    if (angkatan) {
      where.angkatan = angkatan
    }

    if (status) {
      where.status = status
    }

    // Get total count
    const total = await prisma.mahasiswa.count({ where })

    // Get mahasiswa with pagination
    const mahasiswa = await prisma.mahasiswa.findMany({
      where,
      include: {
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
      data: mahasiswa,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get mahasiswa error:', error)
    
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

// POST - Create new mahasiswa
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { nim, nama, email, prodi, angkatan, password } = body

    // Validation
    if (!nim || !nama || !email || !prodi || !angkatan) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if NIM already exists
    const existingNim = await prisma.mahasiswa.findUnique({
      where: { nim },
    })

    if (existingNim) {
      return NextResponse.json(
        { success: false, error: 'NIM sudah terdaftar' },
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

    // Generate username from NIM
    const username = `mhs_${nim}`

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'password123', 10)

    // Create user and mahasiswa in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'MAHASISWA',
          status: 'AKTIF',
        },
      })

      const mahasiswa = await tx.mahasiswa.create({
        data: {
          userId: user.id,
          nim,
          nama,
          email,
          prodi,
          angkatan,
          status: 'AKTIF',
        },
        include: {
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

      return mahasiswa
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Mahasiswa berhasil ditambahkan',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create mahasiswa error:', error)

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

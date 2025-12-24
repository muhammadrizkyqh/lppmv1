import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all skema
export async function GET() {
  try {
    await requireAuth()

    const skema = await prisma.skema.findMany({
      // No status filter - show all (AKTIF and NONAKTIF)
      orderBy: { tipe: 'asc' },
      include: {
        _count: {
          select: {
            proposal: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: skema,
    })
  } catch (error: any) {
    console.error('Get skema error:', error)

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

// POST - Create skema
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { nama, tipe, deskripsi } = body

    if (!nama || !tipe) {
      return NextResponse.json(
        { success: false, error: 'Nama dan tipe harus diisi' },
        { status: 400 }
      )
    }

    const skema = await prisma.skema.create({
      data: {
        nama,
        tipe,
        deskripsi,
        status: 'AKTIF',
      },
    })

    return NextResponse.json({
      success: true,
      data: skema,
      message: 'Skema berhasil ditambahkan',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create skema error:', error)

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

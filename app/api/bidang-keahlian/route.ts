import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all bidang keahlian
export async function GET() {
  try {
    await requireAuth()

    const bidangKeahlian = await prisma.bidangKeahlian.findMany({
      // No status filter - show all (AKTIF and NONAKTIF)
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: {
            dosens: true,
            reviewers: true,
            proposals: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: bidangKeahlian,
    })
  } catch (error: any) {
    console.error('Get bidang keahlian error:', error)

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

// POST - Create bidang keahlian
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { nama, deskripsi } = body

    if (!nama) {
      return NextResponse.json(
        { success: false, error: 'Nama harus diisi' },
        { status: 400 }
      )
    }

    const bidangKeahlian = await prisma.bidangKeahlian.create({
      data: {
        nama,
        deskripsi,
        status: 'AKTIF',
      },
    })

    return NextResponse.json({
      success: true,
      data: bidangKeahlian,
      message: 'Bidang keahlian berhasil ditambahkan',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create bidang keahlian error:', error)

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

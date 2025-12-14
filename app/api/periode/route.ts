import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all periode
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (status) {
      where.status = status
    }

    const periode = await prisma.periode.findMany({
      where,
      orderBy: { tahun: 'desc' },
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
      data: periode,
    })
  } catch (error: any) {
    console.error('Get periode error:', error)

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

// POST - Create periode
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { tahun, nama, tanggalBuka, tanggalTutup, kuota, status } = body

    if (!tahun || !nama || !tanggalBuka || !tanggalTutup) {
      return NextResponse.json(
        { success: false, error: 'Tahun, nama, tanggal buka, dan tanggal tutup harus diisi' },
        { status: 400 }
      )
    }

    // Validate dates
    const buka = new Date(tanggalBuka)
    const tutup = new Date(tanggalTutup)
    if (tutup <= buka) {
      return NextResponse.json(
        { success: false, error: 'Tanggal tutup harus setelah tanggal buka' },
        { status: 400 }
      )
    }

    // If creating periode with status AKTIF, deactivate all other active periodes
    if (status === 'AKTIF') {
      await prisma.periode.updateMany({
        where: { status: 'AKTIF' },
        data: { status: 'NONAKTIF' },
      })
    }

    const periode = await prisma.periode.create({
      data: {
        id: crypto.randomUUID(),
        tahun,
        nama,
        tanggalBuka: new Date(tanggalBuka),
        tanggalTutup: new Date(tanggalTutup),
        kuota: kuota || 0,
        status: status || 'NONAKTIF',
      },
    })

    return NextResponse.json({
      success: true,
      data: periode,
      message: 'Periode berhasil ditambahkan',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create periode error:', error)

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

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

    // Map to match TypeScript interface (_count.proposals instead of _count.proposal)
    const mappedPeriode = periode.map(p => ({
      ...p,
      _count: p._count ? { proposals: p._count.proposal } : undefined
    }))

    return NextResponse.json({
      success: true,
      data: mappedPeriode,
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

    // Check for overlapping active periods (for warning only)
    let overlapWarning = null
    if (status === 'AKTIF') {
      const overlappingPeriodes = await prisma.periode.findMany({
        where: {
          status: 'AKTIF',
          OR: [
            {
              AND: [
                { tanggalBuka: { lte: tutup } },
                { tanggalTutup: { gte: buka } }
              ]
            }
          ]
        },
        select: {
          nama: true,
          tanggalBuka: true,
          tanggalTutup: true
        }
      })

      if (overlappingPeriodes.length > 0) {
        const overlapList = overlappingPeriodes.map(p => 
          `${p.nama} (${new Date(p.tanggalBuka).toLocaleDateString('id-ID')} - ${new Date(p.tanggalTutup).toLocaleDateString('id-ID')})`
        ).join(', ')
        overlapWarning = `Overlap dengan periode aktif: ${overlapList}`
      }
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
      warning: overlapWarning
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

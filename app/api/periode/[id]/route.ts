import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

// GET /api/periode/:id - Get periode by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const periode = await prisma.periode.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            proposal: true,
          },
        },
      },
    })

    if (!periode) {
      return NextResponse.json(
        { success: false, error: 'Periode tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: periode,
    })
  } catch (error) {
    console.error('Error fetching periode:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT /api/periode/:id - Update periode
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    // Only ADMIN can update periode
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can update periode' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tahun, nama, tanggalBuka, tanggalTutup, kuota, status } = body

    // Check if periode exists
    const existingPeriode = await prisma.periode.findUnique({
      where: { id },
    })

    if (!existingPeriode) {
      return NextResponse.json(
        { success: false, error: 'Periode tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate dates if provided
    if (tanggalBuka && tanggalTutup) {
      const buka = new Date(tanggalBuka)
      const tutup = new Date(tanggalTutup)
      if (tutup <= buka) {
        return NextResponse.json(
          { success: false, error: 'Tanggal tutup harus setelah tanggal buka' },
          { status: 400 }
        )
      }
    }

    // Check for overlapping active periods (for warning only)
    let overlapWarning = null
    if (status === 'AKTIF') {
      const buka = tanggalBuka ? new Date(tanggalBuka) : existingPeriode.tanggalBuka
      const tutup = tanggalTutup ? new Date(tanggalTutup) : existingPeriode.tanggalTutup

      const overlappingPeriodes = await prisma.periode.findMany({
        where: {
          id: { not: id },
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

    const updatedPeriode = await prisma.periode.update({
      where: { id },
      data: {
        ...(tahun && { tahun }),
        ...(nama && { nama }),
        ...(tanggalBuka && { tanggalBuka: new Date(tanggalBuka) }),
        ...(tanggalTutup && { tanggalTutup: new Date(tanggalTutup) }),
        ...(kuota !== undefined && { kuota }),
        ...(status && { status }),
      },
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
      data: updatedPeriode,
      message: 'Periode berhasil diupdate',
      warning: overlapWarning
    })
  } catch (error) {
    console.error('Error updating periode:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE /api/periode/:id - Delete periode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    // Only ADMIN can delete periode
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can delete periode' },
        { status: 403 }
      )
    }

    // Check if periode exists
    const periode = await prisma.periode.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            proposal: true,
          },
        },
      },
    })

    if (!periode) {
      return NextResponse.json(
        { success: false, error: 'Periode tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if periode has proposals
    if (periode._count.proposal > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Periode memiliki ${periode._count.proposal} proposal. Hapus proposal terlebih dahulu atau nonaktifkan periode ini.`,
        },
        { status: 400 }
      )
    }

    // Delete periode
    await prisma.periode.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Periode berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting periode:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

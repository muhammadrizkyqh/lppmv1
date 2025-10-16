import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

// GET /api/periode/:id - Get periode by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const periode = await prisma.periode.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            proposals: true,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      where: { id: params.id },
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

    // If setting this periode to AKTIF, deactivate all others
    if (status === 'AKTIF' && existingPeriode.status !== 'AKTIF') {
      await prisma.periode.updateMany({
        where: { 
          status: 'AKTIF',
          NOT: { id: params.id }
        },
        data: { status: 'NONAKTIF' },
      })
    }

    const updatedPeriode = await prisma.periode.update({
      where: { id: params.id },
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
            proposals: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPeriode,
      message: 'Periode berhasil diupdate',
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only ADMIN can delete periode
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can delete periode' },
        { status: 403 }
      )
    }

    // Check if periode exists
    const periode = await prisma.periode.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            proposals: true,
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
    if (periode._count.proposals > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Periode memiliki ${periode._count.proposals} proposal. Hapus proposal terlebih dahulu atau nonaktifkan periode ini.`,
        },
        { status: 400 }
      )
    }

    // Delete periode
    await prisma.periode.delete({
      where: { id: params.id },
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

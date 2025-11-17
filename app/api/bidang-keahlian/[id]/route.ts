import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/bidang-keahlian/:id - Get bidang keahlian by ID
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
    const bidangKeahlian = await prisma.bidangKeahlian.findUnique({
      where: { id },
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

    if (!bidangKeahlian) {
      return NextResponse.json(
        { success: false, error: 'Bidang keahlian tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: bidangKeahlian,
    })
  } catch (error) {
    console.error('Error fetching bidang keahlian:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT /api/bidang-keahlian/:id - Update bidang keahlian
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

    // Only ADMIN can update bidang keahlian
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can update bidang keahlian' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nama, deskripsi, status } = body

    const { id } = await params
    // Check if bidang keahlian exists
    const existingBidang = await prisma.bidangKeahlian.findUnique({
      where: { id },
    })

    if (!existingBidang) {
      return NextResponse.json(
        { success: false, error: 'Bidang keahlian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if nama is unique (if changing)
    if (nama && nama !== existingBidang.nama) {
      const duplicate = await prisma.bidangKeahlian.findUnique({
        where: { nama },
      })
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Nama bidang keahlian sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updatedBidang = await prisma.bidangKeahlian.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(status && { status }),
      },
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
      data: updatedBidang,
      message: 'Bidang keahlian berhasil diupdate',
    })
  } catch (error) {
    console.error('Error updating bidang keahlian:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE /api/bidang-keahlian/:id - Delete bidang keahlian
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
    // Only ADMIN can delete bidang keahlian
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can delete bidang keahlian' },
        { status: 403 }
      )
    }

    // Check if bidang keahlian exists
    const bidangKeahlian = await prisma.bidangKeahlian.findUnique({
      where: { id },
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

    if (!bidangKeahlian) {
      return NextResponse.json(
        { success: false, error: 'Bidang keahlian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if bidang keahlian is used
    const totalUsage = bidangKeahlian._count.dosens + bidangKeahlian._count.reviewers + bidangKeahlian._count.proposals
    if (totalUsage > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Bidang keahlian digunakan oleh ${bidangKeahlian._count.dosens} dosen, ${bidangKeahlian._count.reviewers} reviewer, dan ${bidangKeahlian._count.proposals} proposal. Nonaktifkan bidang keahlian ini daripada menghapusnya.`,
        },
        { status: 400 }
      )
    }

    // Delete bidang keahlian
    await prisma.bidangKeahlian.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Bidang keahlian berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting bidang keahlian:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

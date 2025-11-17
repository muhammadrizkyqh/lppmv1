import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/skema/:id - Get skema by ID
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

    const skema = await prisma.skema.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    })

    if (!skema) {
      return NextResponse.json(
        { success: false, error: 'Skema tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: skema,
    })
  } catch (error) {
    console.error('Error fetching skema:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT /api/skema/:id - Update skema
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

    // Only ADMIN can update skema
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can update skema' },
        { status: 403 }
      )
    }

    const { id } = await params

    const body = await request.json()
    const { nama, tipe, dana, deskripsi, status } = body

    // Check if skema exists
    const existingSkema = await prisma.skema.findUnique({
      where: { id },
    })

    if (!existingSkema) {
      return NextResponse.json(
        { success: false, error: 'Skema tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if nama is unique (if changing)
    if (nama && nama !== existingSkema.nama) {
      const duplicate = await prisma.skema.findUnique({
        where: { nama },
      })
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Nama skema sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updatedSkema = await prisma.skema.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(tipe && { tipe }),
        ...(dana !== undefined && { dana }),
        ...(deskripsi !== undefined && { deskripsi }),
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
      data: updatedSkema,
      message: 'Skema berhasil diupdate',
    })
  } catch (error) {
    console.error('Error updating skema:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE /api/skema/:id - Delete skema
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

    // Only ADMIN can delete skema
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can delete skema' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if skema exists
    const skema = await prisma.skema.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    })

    if (!skema) {
      return NextResponse.json(
        { success: false, error: 'Skema tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if skema has proposals
    if (skema._count.proposals > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Skema memiliki ${skema._count.proposals} proposal. Nonaktifkan skema ini daripada menghapusnya.`,
        },
        { status: 400 }
      )
    }

    // Delete skema
    await prisma.skema.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Skema berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting skema:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

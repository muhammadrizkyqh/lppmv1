import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

// GET /api/reviewer/:id - Get reviewer by ID
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

    const reviewer = await prisma.reviewer.findUnique({
      where: { id: params.id },
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
        bidangKeahlian: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Reviewer tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reviewer,
    })
  } catch (error) {
    console.error('Error fetching reviewer:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT /api/reviewer/:id - Update reviewer
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

    // Only ADMIN can update reviewer data
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can update reviewer' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nama, email, institusi, tipe, bidangKeahlianId, noHp, status } = body

    // Check if reviewer exists
    const existingReviewer = await prisma.reviewer.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!existingReviewer) {
      return NextResponse.json(
        { success: false, error: 'Reviewer tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already used
    if (email && email !== existingReviewer.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists && emailExists.id !== existingReviewer.userId) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update reviewer and user in a transaction
    const updatedReviewer = await prisma.$transaction(async (tx: any) => {
      // Update user data
      if (email || nama || status) {
        await tx.user.update({
          where: { id: existingReviewer.userId },
          data: {
            ...(email && { email, username: email }),
            ...(status && { status }),
          },
        })
      }

      // Update reviewer data
      return await tx.reviewer.update({
        where: { id: params.id },
        data: {
          ...(nama && { nama }),
          ...(email && { email }),
          ...(institusi && { institusi }),
          ...(tipe && { tipe }),
          ...(bidangKeahlianId && { bidangKeahlianId: parseInt(bidangKeahlianId) }),
          ...(noHp !== undefined && { noHp }),
          ...(status && { status }),
        },
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
          bidangKeahlian: {
            select: {
              id: true,
              nama: true,
              deskripsi: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: updatedReviewer,
      message: 'Reviewer berhasil diupdate',
    })
  } catch (error) {
    console.error('Error updating reviewer:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviewer/:id - Delete reviewer
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

    // Only ADMIN can delete reviewer
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can delete reviewer' },
        { status: 403 }
      )
    }

    // Check if reviewer exists
    const reviewer = await prisma.reviewer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Reviewer tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if reviewer has reviews
    if (reviewer._count.reviews > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Reviewer memiliki ${reviewer._count.reviews} review. Hapus review terlebih dahulu.`,
        },
        { status: 400 }
      )
    }

    // Delete reviewer and user in transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete reviewer first
      await tx.reviewer.delete({
        where: { id: params.id },
      })

      // Then delete the associated user
      await tx.user.delete({
        where: { id: reviewer.userId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Reviewer berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting reviewer:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

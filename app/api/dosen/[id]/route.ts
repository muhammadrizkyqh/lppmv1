import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET - Get single dosen by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const dosen = await prisma.dosen.findUnique({
      where: { id: params.id },
      include: {
        bidangKeahlian: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            lastLogin: true,
          },
        },
        proposals: {
          include: {
            periode: true,
            skema: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!dosen) {
      return NextResponse.json(
        { success: false, error: 'Dosen tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dosen,
    })
  } catch (error: any) {
    console.error('Get dosen detail error:', error)

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

// PUT - Update dosen
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['ADMIN'])

    const body = await request.json()
    const { nama, email, noHp, bidangKeahlianId, status } = body

    // Check if dosen exists
    const existingDosen = await prisma.dosen.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!existingDosen) {
      return NextResponse.json(
        { success: false, error: 'Dosen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update dosen and user in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update user email if changed
      if (email && email !== existingDosen.email) {
        await tx.user.update({
          where: { id: existingDosen.userId },
          data: { email },
        })
      }

      // Update user status if changed
      if (status && status !== existingDosen.status) {
        await tx.user.update({
          where: { id: existingDosen.userId },
          data: { status },
        })
      }

      // Update dosen
      const dosen = await tx.dosen.update({
        where: { id: params.id },
        data: {
          nama,
          email,
          noHp,
          bidangKeahlianId,
          status,
        },
        include: {
          bidangKeahlian: true,
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

      return dosen
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Dosen berhasil diupdate',
    })
  } catch (error: any) {
    console.error('Update dosen error:', error)

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

// DELETE - Delete dosen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['ADMIN'])

    // Check if dosen exists
    const existingDosen = await prisma.dosen.findUnique({
      where: { id: params.id },
      include: {
        proposals: true,
      },
    })

    if (!existingDosen) {
      return NextResponse.json(
        { success: false, error: 'Dosen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if dosen has proposals
    if (existingDosen.proposals.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tidak dapat menghapus dosen yang memiliki proposal. Nonaktifkan saja.' 
        },
        { status: 400 }
      )
    }

    // Delete dosen and user in transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete dosen first
      await tx.dosen.delete({
        where: { id: params.id },
      })

      // Then delete the associated user
      await tx.user.delete({
        where: { id: existingDosen.userId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Dosen berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Delete dosen error:', error)

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

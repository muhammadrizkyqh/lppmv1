import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/pencairan/[id] - Get pencairan detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    const { id } = params

    const pencairan = await prisma.pencairan_dana.findUnique({
      where: { id },
      include: {
        proposal: {
          include: {
            periode: true,
            skema: true,
            dosen: true,
          }
        },
        user: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    })

    if (!pencairan) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Authorization: admin or proposal owner
    if (
      session.role !== 'ADMIN' &&
      pencairan.proposal.ketuaId !== session.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pencairan,
    })
  } catch (error) {
    console.error('Get pencairan detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/pencairan/[id] - Update pencairan status & upload bukti (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { status, fileBukti, keterangan, tanggalPencairan } = body

    const pencairan = await prisma.pencairan_dana.findUnique({
      where: { id },
      include: {
        proposal: true,
      }
    })

    if (!pencairan) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (fileBukti) {
      updateData.fileBukti = fileBukti
    }

    if (keterangan !== undefined) {
      updateData.keterangan = keterangan
    }

    if (tanggalPencairan) {
      updateData.tanggalPencairan = new Date(tanggalPencairan)
    }

    // If status changed to DICAIRKAN, set tanggalPencairan if not provided
    if (status === 'DICAIRKAN' && !tanggalPencairan && !pencairan.tanggalPencairan) {
      updateData.tanggalPencairan = new Date()
    }

    const updated = await prisma.pencairan_dana.update({
      where: { id },
      data: updateData,
      include: {
        proposal: {
          select: {
            judul: true,
            dosen: {
              select: {
                nama: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Pencairan berhasil diupdate'
    })
  } catch (error) {
    console.error('Update pencairan error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

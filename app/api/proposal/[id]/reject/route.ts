import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal/:id/reject - Reject proposal (Admin only)
export async function POST(
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

    // Check if user is admin
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat menolak proposal' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { catatan } = body

    if (!catatan || !catatan.trim()) {
      return NextResponse.json(
        { success: false, error: 'Alasan penolakan harus diisi' },
        { status: 400 }
      )
    }

    // Get proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if proposal is in review status
    if (proposal.status !== 'DIREVIEW') {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak dalam status review' },
        { status: 400 }
      )
    }

    // Update proposal status to DITOLAK
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'DITOLAK',
        rejectedAt: new Date(),
        catatan: catatan,
      }
    })

    // TODO: Create notification for dosen
    // await prisma.notification.create({
    //   data: {
    //     userId: proposal.creatorId,
    //     title: 'Proposal Ditolak',
    //     message: `Proposal "${proposal.judul}" ditolak`,
    //     type: 'ERROR',
    //     link: `/dashboard/proposals/${id}`
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: updatedProposal,
      message: 'Proposal berhasil ditolak'
    })
  } catch (error: any) {
    console.error('Reject proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

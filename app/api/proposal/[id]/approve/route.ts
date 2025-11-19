import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal/:id/approve - Approve proposal (Admin only)
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
        { success: false, error: 'Hanya admin yang dapat approve proposal' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { catatan } = body

    // Get proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        reviewers: {
          include: {
            review: true
          }
        }
      }
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

    // Check if all reviews are complete
    const allReviewsComplete = proposal.reviewers.every(r => r.status === 'SELESAI')
    if (!allReviewsComplete) {
      return NextResponse.json(
        { success: false, error: 'Belum semua reviewer menyelesaikan review' },
        { status: 400 }
      )
    }

    // Calculate average score
    const reviews = proposal.reviewers.map(r => r.review).filter(Boolean)
    const averageScore = reviews.reduce((sum, r) => sum + Number(r!.nilaiTotal), 0) / reviews.length

    // Update proposal status to DITERIMA
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'DITERIMA',
        approvedAt: new Date(),
        nilaiTotal: averageScore,
        catatan: catatan || null,
      }
    })

    // TODO: Create notification for dosen
    // await prisma.notification.create({
    //   data: {
    //     userId: proposal.creatorId,
    //     title: 'Proposal Diterima',
    //     message: `Selamat! Proposal "${proposal.judul}" telah diterima`,
    //     type: 'SUCCESS',
    //     link: `/dashboard/proposals/${id}`
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: updatedProposal,
      message: 'Proposal berhasil diterima'
    })
  } catch (error: any) {
    console.error('Approve proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

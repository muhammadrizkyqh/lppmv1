import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Upload Revisi Proposal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { proposalId } = await params
    const body = await request.json()
    const { filePath, catatanRevisi } = body

    // Validation
    if (!filePath || filePath.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'File revisi harus diupload' },
        { status: 400 }
      )
    }

    // Check proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        judul: true,
        status: true,
        creatorId: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Authorization check - only proposal creator can upload revision
    if (session.role === 'DOSEN' && proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Anda tidak memiliki akses' },
        { status: 403 }
      )
    }

    // Check proposal status - must be REVISI
    if (proposal.status !== 'REVISI') {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak dalam status revisi' },
        { status: 400 }
      )
    }

    // Update proposal with revision file and change status back to DIREVIEW
    // Also reset reviewer assignments so they can review again
    const updatedProposal = await prisma.$transaction(async (tx) => {
      // Reset all reviewer assignments for this proposal to PENDING
      await tx.proposalReviewer.updateMany({
        where: { proposalId },
        data: {
          status: 'PENDING',
        },
      })

      // Delete old reviews to allow fresh review (optional - comment out if you want to keep history)
      await tx.review.deleteMany({
        where: {
          proposalReviewer: {
            proposalId,
          },
        },
      })

      // Update proposal with new revision file
      return await tx.proposal.update({
        where: { id: proposalId },
        data: {
          filePath, // Update with new revision file
          catatanRevisi, // Save revision notes from dosen
          status: 'DIREVIEW', // Back to review status
          revisiCount: { increment: 1 }, // Track revision count
          nilaiTotal: null, // Reset total score
          updatedAt: new Date(),
        },
      })
    })

    // TODO: Create notification for reviewers
    // await createNotification({
    //   reviewers: [reviewer1, reviewer2],
    //   title: 'Revisi Proposal Telah Diupload',
    //   message: `Dosen telah mengupload revisi untuk proposal "${proposal.judul}"`,
    //   type: 'INFO',
    //   link: `/reviewer/proposals/${proposalId}`
    // })

    return NextResponse.json({
      success: true,
      message: 'Revisi berhasil diupload. Proposal akan direview kembali oleh reviewer.',
      data: updatedProposal,
    })
  } catch (error) {
    console.error('Upload revisi error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

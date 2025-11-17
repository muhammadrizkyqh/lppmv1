import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal/:id/assign-reviewers - Assign reviewers to proposal (Admin only)
export async function POST(
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

    // Only admin can assign reviewers
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can assign reviewers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { reviewerIds } = body

    // Validate input
    if (!Array.isArray(reviewerIds) || reviewerIds.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Harus memilih 2 reviewer' },
        { status: 400 }
      )
    }

    // Check if proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: {
        ketua: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate proposal status
    if (proposal.status !== 'DIAJUKAN') {
      return NextResponse.json(
        { success: false, error: 'Hanya proposal dengan status DIAJUKAN yang dapat direview' },
        { status: 400 }
      )
    }

    // Validate reviewers are not the ketua
    if (reviewerIds.includes(proposal.ketuaId)) {
      return NextResponse.json(
        { success: false, error: 'Ketua proposal tidak boleh menjadi reviewer' },
        { status: 400 }
      )
    }

    // Check if reviewers exist
    const reviewers = await prisma.reviewer.findMany({
      where: {
        id: {
          in: reviewerIds,
        },
      },
    })

    if (reviewers.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Reviewer tidak valid' },
        { status: 400 }
      )
    }

    // Calculate deadline (7 days from now)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 7)

    // Create proposal reviewers in transaction
    await prisma.$transaction([
      // Update proposal status
      prisma.proposal.update({
        where: { id: params.id },
        data: {
          status: 'DIREVIEW',
        },
      }),
      // Create reviewer assignments
      ...reviewerIds.map((reviewerId: string) =>
        prisma.proposalReviewer.create({
          data: {
            proposalId: params.id,
            reviewerId,
            deadline,
          },
        })
      ),
    ])

    return NextResponse.json({
      success: true,
      message: 'Reviewer berhasil ditugaskan',
    })
  } catch (error: any) {
    console.error('Assign reviewers error:', error)

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

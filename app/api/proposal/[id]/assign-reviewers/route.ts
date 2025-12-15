import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal/:id/assign-reviewers - Assign reviewers to proposal (Admin only)
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

    // Only admin can assign reviewers
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can assign reviewers' },
        { status: 403 }
      )
    }

    const { id } = await params

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
      where: { id },
      include: {
        dosen: true,
        proposalmember: {
          include: {
            dosen: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate proposal status - must be DIREVIEW (after seminar proposal)
    if (proposal.status !== 'DIREVIEW') {
      return NextResponse.json(
        { success: false, error: 'Hanya proposal dengan status DIREVIEW yang dapat di-assign reviewer. Status saat ini: ' + proposal.status },
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

    // Check for duplicate reviewers
    if (reviewerIds[0] === reviewerIds[1]) {
      return NextResponse.json(
        { success: false, error: 'Tidak boleh memilih reviewer yang sama dua kali' },
        { status: 400 }
      )
    }

    // Get reviewer userIds for validation
    const reviewerUserIds = reviewers.map(r => r.userId)

    // Validate reviewers are not the ketua (compare userId, not dosenId!)
    if (reviewerUserIds.includes(proposal.dosen.userId)) {
      return NextResponse.json(
        { success: false, error: 'Ketua proposal tidak boleh menjadi reviewer' },
        { status: 400 }
      )
    }

    // Validate reviewers are not team members
    const teamMemberUserIds = proposal.proposalmember
      .filter(member => member.dosen) // Only check dosen members
      .map(member => member.dosen!.userId)
    const hasTeamMemberAsReviewer = reviewerUserIds.some(userId => 
      teamMemberUserIds.includes(userId)
    )
    
    if (hasTeamMemberAsReviewer) {
      return NextResponse.json(
        { success: false, error: 'Anggota tim proposal tidak boleh menjadi reviewer' },
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
        where: { id },
        data: {
          status: 'DIREVIEW',
        },
      }),
      // Create reviewer assignments
      ...reviewerIds.map((reviewerId: string) =>
        prisma.proposal_reviewer.create({
          data: {
            id: crypto.randomUUID(),
            proposalId: id,
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

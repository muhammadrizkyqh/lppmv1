import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/proposals-reviewed - Get proposals that have been reviewed (Admin only)
export async function GET(request: NextRequest) {
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
        { success: false, error: 'Hanya admin yang dapat mengakses halaman ini' },
        { status: 403 }
      )
    }

    // Get all proposals with status DIREVIEW
    const proposals = await prisma.proposal.findMany({
      where: {
        status: 'DIREVIEW'
      },
      include: {
        periode: {
          select: {
            id: true,
            tahun: true,
            nama: true,
          }
        },
        skema: {
          select: {
            id: true,
            nama: true,
            tipe: true,
            dana: true,
          }
        },
        dosen: {
          select: {
            id: true,
            nidn: true,
            nama: true,
            email: true,
          }
        },
        bidangkeahlian: {
          select: {
            id: true,
            nama: true,
          }
        },
        proposal_reviewer: {
          include: {
            reviewer: {
              select: {
                id: true,
                nama: true,
                email: true,
              }
            },
            review: true,
          }
        },
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Add review completion info
    const proposalsWithReviewStatus = proposals.map(proposal => {
      const totalReviewers = proposal.proposal_reviewer.length
      const completedReviews = proposal.proposal_reviewer.filter(r => r.status === 'SELESAI').length
      const allReviewsComplete = totalReviewers > 0 && completedReviews === totalReviewers

      return {
        ...proposal,
        reviewStatus: {
          total: totalReviewers,
          completed: completedReviews,
          allComplete: allReviewsComplete,
          label: `${completedReviews}/${totalReviewers} Review`
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: proposalsWithReviewStatus
    })
  } catch (error: any) {
    console.error('Get proposals reviewed error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

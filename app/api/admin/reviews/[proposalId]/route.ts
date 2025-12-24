import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/reviews/:proposalId - Get proposal review comparison (Admin only)
export async function GET(
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

    // Check if user is admin
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat mengakses halaman ini' },
        { status: 403 }
      )
    }

    const { proposalId } = await params

    // Get proposal with all reviews
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
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
        proposalmember: {
          include: {
            dosen: {
              select: {
                id: true,
                nama: true,
                email: true,
              }
            },
            mahasiswa: {
              select: {
                id: true,
                nama: true,
                nim: true,
              }
            }
          }
        },
        proposal_reviewer: {
          include: {
            reviewer: {
              select: {
                id: true,
                nama: true,
                email: true,
                institusi: true,
                tipe: true,
              }
            },
            review: true,
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

    // Calculate average scores if all reviews are complete
    const completedReviews = proposal.proposal_reviewer.filter(r => r.review)
    let averageScores = null
    
    if (completedReviews.length > 0) {
      const sum = completedReviews.reduce((acc, r) => ({
        kriteria1: acc.kriteria1 + (r.review?.nilaiKriteria1 || 0),
        kriteria2: acc.kriteria2 + (r.review?.nilaiKriteria2 || 0),
        kriteria3: acc.kriteria3 + (r.review?.nilaiKriteria3 || 0),
        kriteria4: acc.kriteria4 + (r.review?.nilaiKriteria4 || 0),
        total: acc.total + (Number(r.review?.nilaiTotal) || 0),
      }), { kriteria1: 0, kriteria2: 0, kriteria3: 0, kriteria4: 0, total: 0 })

      const count = completedReviews.length
      averageScores = {
        kriteria1: sum.kriteria1 / count,
        kriteria2: sum.kriteria2 / count,
        kriteria3: sum.kriteria3 / count,
        kriteria4: sum.kriteria4 / count,
        total: sum.total / count,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        proposal,
        reviewStatus: {
          total: proposal.proposal_reviewer.length,
          completed: completedReviews.length,
          allComplete: proposal.proposal_reviewer.length > 0 && 
                       completedReviews.length === proposal.proposal_reviewer.length
        },
        averageScores
      }
    })
  } catch (error: any) {
    console.error('Get proposal reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reviews/:proposalReviewerId - Get review assignment detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proposalReviewerId: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { proposalReviewerId } = await params

    // Get reviewer data for this user
    const reviewer = await prisma.reviewer.findUnique({
      where: { userId: session.id }
    })

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Anda bukan reviewer' },
        { status: 403 }
      )
    }

    // Get proposal reviewer assignment with full details
    const assignment = await prisma.proposal_reviewer.findUnique({
      where: { id: proposalReviewerId },
      include: {
        proposal: {
          include: {
            dosen: {
              select: {
                id: true,
                nidn: true,
                nama: true,
                email: true,
              }
            },
            skema: {
              select: {
                id: true,
                nama: true,
                tipe: true,
              }
            },
            periode: {
              select: {
                id: true,
                tahun: true,
                nama: true,
                tanggalBuka: true,
                tanggalTutup: true,
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
                    email: true,
                    nim: true,
                  }
                }
              }
            }
          }
        },
        review: true, // Include review if already submitted
        reviewer: {
          select: {
            id: true,
            nama: true,
            email: true,
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify this assignment belongs to the current reviewer
    if (assignment.reviewerId !== reviewer.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses ke assignment ini' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: assignment
    })
  } catch (error: any) {
    console.error('Get review assignment error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

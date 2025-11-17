import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get review assignments for logged-in reviewer
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get reviewer data for this user
    const reviewer = await prisma.reviewer.findUnique({
      where: { userId: session.id }
    })

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Reviewer tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get all review assignments for this reviewer
    const assignments = await prisma.proposalReviewer.findMany({
      where: {
        reviewerId: reviewer.id
      },
      include: {
        proposal: {
          include: {
            ketua: {
              select: {
                id: true,
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
              }
            },
            bidangKeahlian: {
              select: {
                id: true,
                nama: true,
              }
            },
          }
        },
        review: true, // Include review if already submitted
      },
      orderBy: {
        deadline: 'asc' // Urgent first
      }
    })

    // Separate into pending and completed
    const pending = assignments.filter(a => a.status === 'PENDING')
    const completed = assignments.filter(a => a.status === 'SELESAI')

    return NextResponse.json({
      success: true,
      data: {
        pending,
        completed,
        total: assignments.length,
        pendingCount: pending.length,
        completedCount: completed.length,
      }
    })
  } catch (error: any) {
    console.error('Get my assignments error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

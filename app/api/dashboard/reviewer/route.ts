import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireAuth()

    // Get reviewer data
    const reviewer = await prisma.reviewer.findUnique({
      where: { userId: session.id },
      select: { id: true, nama: true }
    })

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Reviewer not found' },
        { status: 404 }
      )
    }

    // Get all assignments for this reviewer
    const assignments = await prisma.proposal_reviewer.findMany({
      where: { reviewerId: reviewer.id },
      include: {
        proposal: {
          include: {
            skema: true,
            periode: true,
            dosen: true,
          }
        },
        review: true,
      },
      orderBy: { deadline: 'asc' }
    })

    // Calculate stats
    const totalAssignments = assignments.length
    const pending = assignments.filter(a => !a.review).length
    const completed = assignments.filter(a => a.review).length

    // Calculate average score from completed reviews
    const completedReviews = assignments.filter(a => a.review)
    const avgScore = completedReviews.length > 0
      ? completedReviews.reduce((sum, a) => sum + Number(a.review!.nilaiTotal), 0) / completedReviews.length
      : 0

    // Get pending tasks (top 5, sorted by deadline)
    const pendingTasks = assignments
      .filter(a => !a.review)
      .slice(0, 5)
      .map(a => {
        const daysUntilDeadline = Math.ceil(
          (new Date(a.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        
        return {
          id: a.id,
          proposalId: a.proposalId,
          judul: a.proposal.judul,
          deadline: a.deadline,
          daysUntilDeadline,
          urgency: daysUntilDeadline <= 3 ? 'urgent' : 'normal',
          skema: a.proposal.skema.nama,
          periode: `${a.proposal.periode.nama} ${a.proposal.periode.tahun}`,
          dosen: a.proposal.dosen.nama,
        }
      })

    // Get recent reviews (last 3 completed)
    const recentReviews = assignments
      .filter(a => a.review)
      .sort((a, b) => new Date(b.review!.submittedAt).getTime() - new Date(a.review!.submittedAt).getTime())
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        proposalId: a.proposalId,
        judul: a.proposal.judul,
        nilaiTotal: Number(a.review!.nilaiTotal),
        submittedAt: a.review!.submittedAt,
      }))

    // Find nearest deadline from pending tasks
    const nearestDeadline = pendingTasks.length > 0 
      ? pendingTasks[0].daysUntilDeadline
      : null

    // Calculate completion rate
    const completionRate = totalAssignments > 0
      ? Math.round((completed / totalAssignments) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        reviewerName: reviewer.nama,
        stats: {
          totalAssignments,
          pending,
          completed,
          avgScore: Math.round(avgScore),
          totalReviews: completed,
          completionRate,
          nearestDeadline,
        },
        pendingTasks,
        recentReviews,
      }
    })

  } catch (error) {
    console.error('Dashboard reviewer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

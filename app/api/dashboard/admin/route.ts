import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Admin Dashboard Stats
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and role (throws error if unauthorized)
    await requireRole(['ADMIN'])

    // 1. Count proposals by status
    const [
      totalProposals,
      draftCount,
      diajukanCount,
      direviewCount,
      revisiCount,
      diterimaCount,
      ditolakCount,
      berjalanCount,
      selesaiCount,
    ] = await Promise.all([
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: 'DRAFT' } }),
      prisma.proposal.count({ where: { status: 'DIAJUKAN' } }),
      prisma.proposal.count({ where: { status: 'DIREVIEW' } }),
      prisma.proposal.count({ where: { status: 'REVISI' } }),
      prisma.proposal.count({ where: { status: 'DITERIMA' } }),
      prisma.proposal.count({ where: { status: 'DITOLAK' } }),
      prisma.proposal.count({ where: { status: 'BERJALAN' } }),
      prisma.proposal.count({ where: { status: 'SELESAI' } }),
    ])

    // 2. Count proposals in review (DIREVIEW status)
    const inReview = direviewCount

    // 3. Count proposals that need action (REVISI + pending reviews)
    const needsAction = revisiCount + diajukanCount

    // 4. Count reviewers
    const totalReviewers = await prisma.reviewer.count()

    // 5. Count dosen
    const totalDosen = await prisma.dosen.count()

    // 6. Monitoring stats
    const [
      totalMonitoring,
      monitoringBerjalan,
      monitoringSelesai,
      pendingKemajuanVerification,
      pendingAkhirVerification,
    ] = await Promise.all([
      prisma.monitoring.count(),
      prisma.monitoring.count({ where: { status: 'BERJALAN' } }),
      prisma.monitoring.count({ where: { status: 'SELESAI' } }),
      prisma.monitoring.count({
        where: {
          fileKemajuan: { not: null },
          verifikasiKemajuanAt: null,
        },
      }),
      prisma.monitoring.count({
        where: {
          fileAkhir: { not: null },
          verifikasiAkhirAt: null,
        },
      }),
    ])

    // 7. Get recent proposals (latest 10)
    const recentProposals = await prisma.proposal.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        judul: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        dosen: {
          select: {
            nama: true,
          },
        },
        skema: {
          select: {
            nama: true,
          },
        },
      },
    })

    // 8. Get recent reviews (latest 10)
    const recentReviews = await prisma.review.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        nilaiTotal: true,
        rekomendasi: true,
        submittedAt: true,
        proposal_reviewer: {
          select: {
            proposal: {
              select: {
                judul: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            nama: true,
          },
        },
      },
    })

    // 9. Proposals by status for chart
    const proposalsByStatus = [
      { status: 'DRAFT', count: draftCount, label: 'Draft' },
      { status: 'DIAJUKAN', count: diajukanCount, label: 'Diajukan' },
      { status: 'DIREVIEW', count: direviewCount, label: 'Direview' },
      { status: 'REVISI', count: revisiCount, label: 'Revisi' },
      { status: 'DITERIMA', count: diterimaCount, label: 'Diterima' },
      { status: 'DITOLAK', count: ditolakCount, label: 'Ditolak' },
      { status: 'BERJALAN', count: berjalanCount, label: 'Berjalan' },
      { status: 'SELESAI', count: selesaiCount, label: 'Selesai' },
    ].filter(item => item.count > 0) // Only include statuses with data

    // 10. Calculate percentage changes (mock for now, need historical data)
    const proposalChange = '+12%' // TODO: Calculate from last month
    const reviewChange = '+3'
    const approvedChange = '+5'

    return NextResponse.json({
      success: true,
      data: {
        // Main stats
        stats: {
          totalProposals,
          inReview,
          approved: diterimaCount,
          needsAction,
          totalReviewers,
          totalDosen,
        },
        
        // Changes (for stat cards)
        changes: {
          proposals: proposalChange,
          reviews: reviewChange,
          approved: approvedChange,
        },

        // Proposals by status
        proposalsByStatus,

        // Monitoring stats
        monitoring: {
          total: totalMonitoring,
          berjalan: monitoringBerjalan,
          selesai: monitoringSelesai,
          pendingKemajuanVerification,
          pendingAkhirVerification,
        },

        // Recent activities
        recentProposals,
        recentReviews,

        // Breakdown by status
        statusBreakdown: {
          draft: draftCount,
          diajukan: diajukanCount,
          direview: direviewCount,
          revisi: revisiCount,
          diterima: diterimaCount,
          ditolak: ditolakCount,
          berjalan: berjalanCount,
          selesai: selesaiCount,
        },
      },
    })
  } catch (error: any) {
    console.error('Get admin dashboard stats error:', error)
    
    // Handle auth errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.message === 'Unauthorized' ? 401 : 403 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

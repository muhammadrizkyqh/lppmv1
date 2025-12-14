import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and role (throws error if unauthorized)
    const session = await requireRole(["DOSEN"]);
    const userId = session.id;

    // Get Dosen record to get dosenId
    const dosen = await prisma.dosen.findUnique({
      where: { userId },
      select: { id: true, nama: true }
    });

    if (!dosen) {
      return NextResponse.json(
        { success: false, error: "Dosen not found" },
        { status: 404 }
      );
    }

    const dosenId = dosen.id;

    // Parallel queries for performance
    const [
      // Count proposals by status
      totalProposals,
      draftProposals,
      inReviewProposals,
      approvedProposals,
      needsRevisionProposals,
      runningProposals,
      completedProposals,
      
      // Get my proposals with details
      myProposals,
      
      // Get monitoring data for running proposals
      monitoringData,
    ] = await Promise.all([
      // Count by status
      prisma.proposal.count({ where: { creatorId: userId } }),
      prisma.proposal.count({ where: { creatorId: userId, status: "DRAFT" } }),
      prisma.proposal.count({ where: { creatorId: userId, status: { in: ["DIAJUKAN", "DIREVIEW"] } } }),
      prisma.proposal.count({ where: { creatorId: userId, status: "DITERIMA" } }),
      prisma.proposal.count({ where: { creatorId: userId, status: "REVISI" } }),
      prisma.proposal.count({ where: { creatorId: userId, status: "BERJALAN" } }),
      prisma.proposal.count({ where: { creatorId: userId, status: "SELESAI" } }),
      
      // Get my proposals with full details
      prisma.proposal.findMany({
        where: { creatorId: userId },
        include: {
          skema: { select: { nama: true } },
          periode: { select: { nama: true, tahun: true } },
          monitoring: {
            select: {
              persentaseKemajuan: true,
              status: true,
              verifikasiKemajuanStatus: true,
              verifikasiAkhirStatus: true,
              verifikasiKemajuanAt: true,
              verifikasiAkhirAt: true,
              fileKemajuan: true,
              fileAkhir: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      
      // Get monitoring for running proposals
      prisma.monitoring.findMany({
        where: {
          proposal: { creatorId: userId, status: "BERJALAN" }
        },
        include: {
          proposal: {
            select: {
              id: true,
              judul: true,
              status: true,
              submittedAt: true,
              approvedAt: true,
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      }),
    ]);

    // Calculate upcoming deadlines (estimate: 1 year from approval)
    const now = new Date();
    const runningProposalsWithDeadlines = myProposals
      .filter(p => p.status === "BERJALAN" && p.approvedAt)
      .map(p => {
        // Estimate deadline: 1 year from approved date
        const approvedDate = new Date(p.approvedAt!);
        const estimatedDeadline = new Date(approvedDate);
        estimatedDeadline.setFullYear(estimatedDeadline.getFullYear() + 1);
        
        const daysLeft = Math.ceil((estimatedDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          proposalId: p.id,
          judul: p.judul,
          deadline: estimatedDeadline.toISOString(),
          daysLeft,
          isUrgent: daysLeft <= 30 && daysLeft >= 0,
          skema: p.skema.nama,
        };
      })
      .filter(d => d.daysLeft >= -30 && d.daysLeft <= 365) // Show 30 days past to 1 year future
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    // Calculate monitoring deadlines
    const monitoringDeadlines = monitoringData
      .filter(m => {
        const proposal = m.proposal;
        if (!proposal.approvedAt) return false;
        
        // Estimate midpoint (kemajuan deadline) and end point (akhir deadline)
        const approvedDate = new Date(proposal.approvedAt);
        const estimatedEnd = new Date(approvedDate);
        estimatedEnd.setFullYear(estimatedEnd.getFullYear() + 1);
        const estimatedMid = new Date((approvedDate.getTime() + estimatedEnd.getTime()) / 2);
        
        // Check if kemajuan not uploaded yet
        if (!m.fileKemajuan) {
          const daysToMidpoint = Math.ceil((estimatedMid.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysToMidpoint <= 60 && daysToMidpoint >= -7) { // Show 60 days before to 7 days after
            return true;
          }
        }
        
        // Check if akhir not uploaded yet
        if (!m.fileAkhir && m.fileKemajuan) { // Only show akhir deadline if kemajuan done
          const daysToEnd = Math.ceil((estimatedEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysToEnd <= 60 && daysToEnd >= -7) {
            return true;
          }
        }
        
        return false;
      })
      .map(m => {
        const proposal = m.proposal;
        const approvedDate = new Date(proposal.approvedAt!);
        const estimatedEnd = new Date(approvedDate);
        estimatedEnd.setFullYear(estimatedEnd.getFullYear() + 1);
        const estimatedMid = new Date((approvedDate.getTime() + estimatedEnd.getTime()) / 2);
        
        let type: "kemajuan" | "akhir" = "akhir";
        let deadline = estimatedEnd;
        let daysLeft = 0;
        
        if (!m.fileKemajuan) {
          type = "kemajuan";
          deadline = estimatedMid;
          daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if (!m.fileAkhir) {
          daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        return {
          proposalId: m.proposalId,
          judul: proposal.judul,
          type,
          deadline: deadline.toISOString(),
          daysLeft,
          isUrgent: daysLeft <= 7,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // Get pending verifications (waiting for admin)
    const pendingVerifications = monitoringData
      .filter(m => 
        (m.fileKemajuan && !m.verifikasiKemajuanAt) ||
        (m.fileAkhir && !m.verifikasiAkhirAt)
      )
      .map(m => ({
        proposalId: m.proposalId,
        judul: m.proposal.judul,
        type: (m.fileKemajuan && !m.verifikasiKemajuanAt) ? "kemajuan" : "akhir" as "kemajuan" | "akhir",
        uploadAt: (m.fileKemajuan && !m.verifikasiKemajuanAt) ? m.updatedAt : m.updatedAt,
      }))
      .sort((a, b) => new Date(b.uploadAt).getTime() - new Date(a.uploadAt).getTime());

    // Calculate changes (mock for now - TODO: calculate from historical data)
    const changes = {
      proposals: totalProposals > 0 ? "+1" : "0",
      running: runningProposals > 0 ? `${runningProposals}` : "0",
      completed: completedProposals > 0 ? `${completedProposals}` : "0",
    };

    // Map proposals by status for chart
    const proposalsByStatus = [
      { status: "DRAFT", count: draftProposals, label: "Draft" },
      { status: "DIAJUKAN", count: inReviewProposals, label: "Dalam Review" },
      { status: "DITERIMA", count: approvedProposals, label: "Disetujui" },
      { status: "REVISI", count: needsRevisionProposals, label: "Perlu Revisi" },
      { status: "BERJALAN", count: runningProposals, label: "Berjalan" },
      { status: "SELESAI", count: completedProposals, label: "Selesai" },
    ].filter(item => item.count > 0); // Only include non-zero counts

    // Prepare response
    const response = {
      dosenName: dosen.nama,
      stats: {
        totalProposals,
        draft: draftProposals,
        inReview: inReviewProposals,
        approved: approvedProposals,
        needsRevision: needsRevisionProposals,
        running: runningProposals,
        completed: completedProposals,
      },
      changes,
      proposalsByStatus,
      myProposals: myProposals.map(p => ({
        id: p.id,
        judul: p.judul,
        status: p.status,
        skema: p.skema.nama,
        periode: `${p.periode.nama} ${p.periode.tahun}`,
        createdAt: p.createdAt,
        submittedAt: p.submittedAt,
        approvedAt: p.approvedAt,
        monitoring: p.monitorings && p.monitorings.length > 0 ? {
          progress: p.monitorings[0].persentaseKemajuan,
          status: p.monitorings[0].status,
          verifikasiKemajuanStatus: p.monitorings[0].verifikasiKemajuanStatus,
          verifikasiAkhirStatus: p.monitorings[0].verifikasiAkhirStatus,
        } : null,
      })),
      upcomingDeadlines: runningProposalsWithDeadlines,
      monitoringDeadlines,
      pendingVerifications,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error("Error fetching dosen dashboard:", error);
    
    // Handle auth errors
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.message === 'Unauthorized' ? 401 : 403 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get monitoring data for a proposal
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

    const { proposalId } = await params

    // Get proposal with monitoring data
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        periode: {
          select: {
            id: true,
            tahun: true,
            nama: true,
            tanggalBuka: true,
            tanggalTutup: true,
          },
        },
        skema: {
          select: {
            id: true,
            nama: true,
            tipe: true,
          },
        },
        dosen: {
          select: {
            id: true,
            nama: true,
            nidn: true,
            email: true,
          },
        },
        bidangkeahlian: {
          select: {
            id: true,
            nama: true,
          },
        },
        monitoring: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Authorization check
    if (session.role === 'DOSEN' && proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Only allow monitoring for DITERIMA or BERJALAN proposals
    if (!['DITERIMA', 'BERJALAN', 'SELESAI'].includes(proposal.status)) {
      return NextResponse.json(
        { success: false, error: 'Proposal belum diterima atau belum bisa dimonitor' },
        { status: 400 }
      )
    }

    const monitoring = proposal.monitoring[0] || null

    return NextResponse.json({
      success: true,
      data: {
        proposal: {
          id: proposal.id,
          judul: proposal.judul,
          abstrak: proposal.abstrak,
          status: proposal.status,
          submittedAt: proposal.submittedAt,
          approvedAt: proposal.approvedAt,
        },
        periode: proposal.periode,
        skema: proposal.skema,
        dosen: proposal.dosen,
        bidangkeahlian: proposal.bidangkeahlian,
        monitoring,
      },
    })
  } catch (error) {
    console.error('Get monitoring error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

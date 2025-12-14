import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/luaran/proposal/[proposalId] - Get all luaran for a proposal
export async function GET(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const session = await requireAuth()

    // Check proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.proposalId }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check permission (Admin or ketua)
    if (session.role !== 'ADMIN') {
      const dosen = await prisma.dosen.findFirst({
        where: { userId: session.id }
      })
      if (!dosen || proposal.ketuaId !== dosen.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Get all luaran for this proposal
    const luaran = await prisma.luaran.findMany({
      where: {
        proposalId: params.proposalId
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    })

    // Calculate totals by status
    const totals = {
      total: luaran.length,
      pending: luaran.filter((l: any) => l.statusVerifikasi === 'PENDING').length,
      diverifikasi: luaran.filter((l: any) => l.statusVerifikasi === 'DIVERIFIKASI').length,
      ditolak: luaran.filter((l: any) => l.statusVerifikasi === 'DITOLAK').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        data: luaran,
        totals
      }
    })
  } catch (error) {
    console.error('Get proposal luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/pencairan/proposal/[proposalId] - Get all pencairan by proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await requireAuth()

    const { proposalId } = await params

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        ketuaId: true,
        dosen: {
          select: {
            userId: true
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

    // Authorization: admin or proposal owner (compare userId, not dosenId)
    if (
      session.role !== 'ADMIN' &&
      proposal.dosen.userId !== session.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const pencairan = await prisma.pencairan_dana.findMany({
      where: { proposalId },
      orderBy: { termin: 'asc' },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    })

    // Calculate total
    const total = {
      dicairkan: pencairan
        .filter((p: any) => p.status === 'DICAIRKAN')
        .reduce((sum: number, p: any) => sum + Number(p.nominal), 0),
      pending: pencairan
        .filter((p: any) => p.status === 'PENDING')
        .reduce((sum: number, p: any) => sum + Number(p.nominal), 0),
    }

    return NextResponse.json({
      success: true,
      data: pencairan,
      total,
    })
  } catch (error) {
    console.error('Get pencairan by proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

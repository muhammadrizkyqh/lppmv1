import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/kontrak/proposal/:proposalId - Get kontrak by proposal ID
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

    // Get kontrak by proposalId
    const kontrak = await prisma.kontrak.findUnique({
      where: { proposalId },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            status: true,
          }
        }
      }
    })

    if (!kontrak) {
      return NextResponse.json(
        { success: false, error: 'Kontrak belum dibuat untuk proposal ini' },
        { status: 404 }
      )
    }

    // Authorization check (admin or dosen ketua)
    if (session.role !== 'ADMIN') {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          dosen: {
            select: {
              userId: true
            }
          }
        }
      })

      if (!proposal || proposal.dosen.userId !== session.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: kontrak
    })
  } catch (error: any) {
    console.error('Get kontrak by proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

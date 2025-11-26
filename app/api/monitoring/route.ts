import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all monitoring (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admin can see all monitoring
    const roleCheck = await requireRole(['ADMIN'])
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const periodeId = searchParams.get('periodeId') || ''
    const search = searchParams.get('search') || ''

    const where: any = {
      status: {
        in: ['DITERIMA', 'BERJALAN', 'SELESAI'],
      },
    }

    // Filter by search (judul or ketua name)
    if (search) {
      where.OR = [
        { judul: { contains: search } },
        { ketua: { nama: { contains: search } } },
      ]
    }

    // Filter by periode
    if (periodeId) {
      where.periodeId = periodeId
    }

    // Get proposals with monitoring data
    const proposals = await prisma.proposal.findMany({
      where,
      orderBy: { approvedAt: 'desc' },
      include: {
        periode: {
          select: {
            id: true,
            tahun: true,
            nama: true,
          },
        },
        skema: {
          select: {
            id: true,
            nama: true,
            tipe: true,
          },
        },
        ketua: {
          select: {
            id: true,
            nama: true,
            nidn: true,
          },
        },
        monitorings: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    })

    // Filter by monitoring status if specified
    let filteredProposals = proposals
    if (status) {
      filteredProposals = proposals.filter((p) => {
        const monitoring = p.monitorings[0]
        if (!monitoring) {
          return status === 'BELUM_MONITORING'
        }
        return monitoring.status === status
      })
    }

    // Transform data
    const data = filteredProposals.map((proposal) => {
      const monitoring = proposal.monitorings[0] || null
      return {
        id: proposal.id,
        judul: proposal.judul,
        status: proposal.status,
        approvedAt: proposal.approvedAt,
        periode: proposal.periode,
        skema: proposal.skema,
        ketua: proposal.ketua,
        monitoring: monitoring
          ? {
              id: monitoring.id,
              persentaseKemajuan: monitoring.persentaseKemajuan,
              status: monitoring.status,
              hasLaporanKemajuan: !!monitoring.laporanKemajuan,
              hasLaporanAkhir: !!monitoring.laporanAkhir,
              updatedAt: monitoring.updatedAt,
            }
          : null,
      }
    })

    // Calculate statistics
    const stats = {
      total: data.length,
      berjalan: data.filter((d) => d.monitoring?.status === 'BERJALAN').length,
      selesai: data.filter((d) => d.monitoring?.status === 'SELESAI').length,
      belumMonitoring: data.filter((d) => !d.monitoring).length,
    }

    return NextResponse.json({
      success: true,
      data,
      stats,
    })
  } catch (error) {
    console.error('Get monitoring list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

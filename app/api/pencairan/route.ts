import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'

// GET /api/pencairan - List all pencairan (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const termin = searchParams.get('termin')
    const periodeId = searchParams.get('periodeId')
    const search = searchParams.get('search')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (termin) {
      where.termin = termin
    }

    if (periodeId) {
      where.proposal = {
        periodeId: periodeId
      }
    }

    if (search) {
      where.proposal = {
        ...where.proposal,
        judul: { contains: search }
      }
    }

    const pencairan = await prisma.pencairan_dana.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            status: true,
            periode: {
              select: {
                id: true,
                nama: true,
                tahun: true,
              }
            },
            skema: {
              select: {
                id: true,
                nama: true,
                dana: true,
              }
            },
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })

    // Calculate stats
    const stats = {
      total: pencairan.length,
      pending: pencairan.filter((p: any) => p.status === 'PENDING').length,
      dicairkan: pencairan.filter((p: any) => p.status === 'DICAIRKAN').length,
      ditolak: pencairan.filter((p: any) => p.status === 'DITOLAK').length,
      totalNominal: pencairan
        .filter((p: any) => p.status === 'DICAIRKAN')
        .reduce((sum: number, p: any) => sum + Number(p.nominal), 0),
    }

    return NextResponse.json({
      success: true,
      data: pencairan,
      stats,
    })
  } catch (error) {
    console.error('Get pencairan list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pencairan - Create new pencairan (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { proposalId, termin, keterangan } = body

    // Validate required fields
    if (!proposalId || !termin) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID dan termin wajib diisi' },
        { status: 400 }
      )
    }

    // Get proposal with skema for dana calculation
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        skema: true,
        kontrak: true,
        monitoring: {
          where: {
            verifikasiKemajuanStatus: 'APPROVED'
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

    // Validate proposal status
    if (!['DITERIMA', 'BERJALAN', 'SELESAI'].includes(proposal.status)) {
      return NextResponse.json(
        { success: false, error: 'Proposal belum disetujui' },
        { status: 400 }
      )
    }

    // Business logic validation
    if (termin === 'TERMIN_1') {
      // Termin 1: Requires signed kontrak
      if (!proposal.kontrak || proposal.kontrak.status !== 'SIGNED') {
        return NextResponse.json(
          { success: false, error: 'Kontrak belum ditandatangani' },
          { status: 400 }
        )
      }
    } else if (termin === 'TERMIN_2') {
      // Termin 2: Requires 2 verified monitoring
      if (proposal.monitoring.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Minimal 2 monitoring kemajuan harus diverifikasi' },
          { status: 400 }
        )
      }
      
      // Check termin 1 already dicairkan
      const termin1 = await prisma.pencairan_dana.findFirst({
        where: { proposalId, termin: 'TERMIN_1', status: 'DICAIRKAN' }
      })
      if (!termin1) {
        return NextResponse.json(
          { success: false, error: 'Termin 1 harus dicairkan terlebih dahulu' },
          { status: 400 }
        )
      }
    } else if (termin === 'TERMIN_3') {
      // Termin 3: Requires verified luaran + termin 2 dicairkan
      const termin2 = await prisma.pencairan_dana.findFirst({
        where: { proposalId, termin: 'TERMIN_2', status: 'DICAIRKAN' }
      })
      if (!termin2) {
        return NextResponse.json(
          { success: false, error: 'Termin 2 harus dicairkan terlebih dahulu' },
          { status: 400 }
        )
      }

      // Check verified luaran exists
      const verifiedLuaran = await prisma.luaran.findFirst({
        where: {
          proposalId,
          statusVerifikasi: 'DIVERIFIKASI'
        }
      })
      if (!verifiedLuaran) {
        return NextResponse.json(
          { success: false, error: 'Minimal 1 luaran harus diverifikasi terlebih dahulu' },
          { status: 400 }
        )
      }
    }

    // Check if termin already exists
    const existing = await prisma.pencairan_dana.findFirst({
      where: { proposalId, termin }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Pencairan termin ini sudah dibuat' },
        { status: 400 }
      )
    }

    // Calculate nominal based on termin
    const danaHibah = Number(proposal.skema.dana)
    let persentase: number
    let nominal: number

    switch (termin) {
      case 'TERMIN_1':
        persentase = 50
        nominal = danaHibah * 0.5
        break
      case 'TERMIN_2':
        persentase = 25
        nominal = danaHibah * 0.25
        break
      case 'TERMIN_3':
        persentase = 25
        nominal = danaHibah * 0.25
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Termin tidak valid' },
          { status: 400 }
        )
    }

    // Create pencairan
    const pencairan = await prisma.pencairan_dana.create({
      data: {
        proposalId,
        termin,
        nominal,
        persentase,
        keterangan,
        status: 'PENDING',
        createdBy: session.id,
      },
      include: {
        proposal: {
          select: {
            judul: true,
            dosen: {
              select: {
                nama: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: pencairan,
      message: `Pencairan ${termin.replace('_', ' ')} berhasil dibuat`
    })
  } catch (error) {
    console.error('Create pencairan error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

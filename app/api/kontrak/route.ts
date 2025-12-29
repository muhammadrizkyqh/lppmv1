import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNomorKontrakDanSK } from '@/lib/kontrak-generator'

// GET /api/kontrak - Get all kontrak (Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN'])

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { nomorKontrak: { contains: search } },
        { nomorSK: { contains: search } },
        { proposal: { judul: { contains: search } } },
        { proposal: { dosen: { nama: { contains: search } } } }
      ]
    }

    const kontrakList = await prisma.kontrak.findMany({
      where,
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            status: true,
            danaDisetujui: true,
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true
              }
            },
            skema: {
              select: {
                id: true,
                nama: true
              }
            },
            periode: {
              select: {
                id: true,
                nama: true,
                tahun: true
              }
            }
          }
        },
        user_kontrak_createdByTouser: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        user_kontrak_uploadedByTouser: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: kontrakList
    })
  } catch (error: any) {
    console.error('Get kontrak list error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST /api/kontrak - Create new kontrak (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN'])

    const body = await request.json()
    const { proposalId } = body

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID harus diisi' },
        { status: 400 }
      )
    }

    // Check if proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        dosen: true,
        skema: true
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if proposal is approved
    if (proposal.status !== 'DITERIMA') {
      return NextResponse.json(
        { success: false, error: 'Hanya proposal yang diterima dapat dibuatkan kontrak' },
        { status: 400 }
      )
    }

    // Check if kontrak already exists
    const existingKontrak = await prisma.kontrak.findUnique({
      where: { proposalId }
    })

    if (existingKontrak) {
      return NextResponse.json(
        { success: false, error: 'Kontrak sudah pernah dibuat untuk proposal ini' },
        { status: 400 }
      )
    }

    // Generate nomor kontrak and SK
    const { nomorKontrak, nomorSK } = await generateNomorKontrakDanSK()

    // Create kontrak
    const kontrak = await prisma.kontrak.create({
      data: {
        proposalId,
        nomorKontrak,
        nomorSK,
        danaDisetujui: proposal.danaDisetujui || 0,
        createdBy: session.id,
        status: 'DRAFT'
      },
      include: {
        proposal: {
          include: {
            dosen: true,
            skema: true,
            periode: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: kontrak,
      message: 'Kontrak berhasil dibuat'
    })
  } catch (error: any) {
    console.error('Create kontrak error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

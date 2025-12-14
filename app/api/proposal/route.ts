import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all proposals (with access control)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const periodeId = searchParams.get('periodeId') || ''

    const where: any = {}

    // Filter by status if provided (supports multiple comma-separated values)
    if (status) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean)
      if (statuses.length > 1) {
        where.status = { in: statuses }
      } else if (statuses.length === 1) {
        where.status = statuses[0]
      }
    }

    // Filter by periode if provided
    if (periodeId) {
      where.periodeId = periodeId
    }

    // Access control based on role
    if (session.role === 'DOSEN') {
      // Dosen can only see their own proposals
      where.creatorId = session.id
    }
    // ADMIN can see all proposals

    const proposals = await prisma.proposal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        periode: {
          select: {
            id: true,
            tahun: true,
            nama: true,
            status: true,
          },
        },
        skema: {
          select: {
            id: true,
            nama: true,
            tipe: true,
            dana: true,
          },
        },
        dosen: {
          select: {
            id: true,
            nidn: true,
            nama: true,
            email: true,
          },
        },
        bidangkeahlian: {
          select: {
            id: true,
            nama: true,
          },
        },
        _count: {
          select: {
            proposalmember: true,
            proposal_reviewer: true,
          },
        },
        kontrak: {
          select: {
            id: true,
            nomorKontrak: true,
            nomorSK: true,
            tanggalKontrak: true,
            status: true,
            fileKontrak: true,
            fileSK: true,
            uploadedAt: true,
          },
        },
        monitoring: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: proposals,
    })
  } catch (error: any) {
    console.error('Get proposals error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Create proposal
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is registered as Dosen (regardless of role)
    // ADMIN can create proposals if they have Dosen record
    const dosen = await prisma.dosen.findUnique({
      where: { userId: session.id }
    })

    if (!dosen) {
      return NextResponse.json(
        { success: false, error: 'Hanya dosen yang dapat membuat proposal. Anda belum terdaftar sebagai dosen.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      periodeId,
      skemaId,
      bidangKeahlianId,
      judul,
      abstrak,
      filePath,
      fileName,
      fileSize,
    } = body

    // Validate required fields
    if (!periodeId || !skemaId || !judul || !abstrak) {
      return NextResponse.json(
        { success: false, error: 'Periode, skema, judul, dan abstrak harus diisi' },
        { status: 400 }
      )
    }

    // Validate abstrak length (max 500 characters)
    if (abstrak.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Abstrak maksimal 500 karakter' },
        { status: 400 }
      )
    }

    // Check if periode is active
    const periode = await prisma.periode.findUnique({
      where: { id: periodeId },
    })

    if (!periode) {
      return NextResponse.json(
        { success: false, error: 'Periode tidak ditemukan' },
        { status: 404 }
      )
    }

    if (periode.status !== 'AKTIF') {
      return NextResponse.json(
        { success: false, error: 'Hanya periode aktif yang dapat diajukan' },
        { status: 400 }
      )
    }

    // Check periode date range
    const now = new Date()
    const tglBuka = new Date(periode.tanggalBuka)
    const tglTutup = new Date(periode.tanggalTutup)

    if (now < tglBuka) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Periode belum dibuka. Periode dibuka pada ${tglBuka.toLocaleDateString('id-ID')}` 
        },
        { status: 400 }
      )
    }

    if (now > tglTutup) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Periode sudah ditutup. Periode ditutup pada ${tglTutup.toLocaleDateString('id-ID')}` 
        },
        { status: 400 }
      )
    }

    // Check if dosen already has proposal as ketua in this periode
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        periodeId,
        ketuaId: dosen.id,
      },
    })

    if (existingProposal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Anda sudah memiliki proposal sebagai ketua di periode ini',
        },
        { status: 400 }
      )
    }

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        periodeId,
        skemaId,
        ketuaId: dosen.id,
        creatorId: session.id,
        bidangKeahlianId: bidangKeahlianId || dosen.bidangKeahlianId,
        judul,
        abstrak,
        filePath,
        fileName,
        fileSize,
        status: 'DRAFT',
      },
      include: {
        periode: true,
        skema: true,
        dosen: true,
        bidangkeahlian: true,
      },
    })

    // Create proposal member (ketua)
    await prisma.proposalmember.create({
      data: {
        proposalId: proposal.id,
        dosenId: dosen.id,
        role: 'Ketua',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: proposal,
        message: 'Proposal berhasil dibuat',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create proposal error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

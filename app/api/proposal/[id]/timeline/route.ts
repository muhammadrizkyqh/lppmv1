import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/proposal/:id/timeline - Get all feedback/catatan for proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // First, check if proposal exists and user has access
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        catatan: true,
        catatanRevisi: true,
        catatanAdministrasi: true,
        statusAdministrasi: true,
        checkedAdminAt: true,
        dosen: {
          select: {
            id: true,
            nama: true,
            nidn: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Access control: DOSEN can only access their own proposals
    if (session.role === 'DOSEN' && proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get all revisions
    const revisions = await prisma.proposalrevision.findMany({
      where: { proposalId: id },
      select: {
        id: true,
        catatan: true,
        filePath: true,
        fileName: true,
      },
    })

    // Get all reviews
    const reviews = await prisma.proposal_reviewer.findMany({
      where: { proposalId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        review: {
          select: {
            id: true,
            catatan: true,
            nilaiTotal: true,
            filePenilaian: true,
            rekomendasi: true,
            submittedAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    })

    // Get seminar (if exists)
    const seminar = await prisma.seminar.findFirst({
      where: { proposalId: id },
      select: {
        id: true,
        tanggal: true,
        notulensi: true,
        hasilKeputusan: true,
        keterangan: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Get monitoring (if exists)
    const monitoring = await prisma.monitoring.findFirst({
      where: { proposalId: id },
      select: {
        id: true,
        status: true,
        catatanKemajuan: true,
        catatanAkhir: true,
        catatanFinal: true,
        persentaseKemajuan: true,
        plagiarismeStatus: true,
        plagiarismePercentage: true,
        verifikasiKemajuanAt: true,
        verifikasiAkhirAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Get luaran (multiple)
    const luaranList = await prisma.luaran.findMany({
      where: { proposalId: id },
      select: {
        id: true,
        jenis: true,
        judul: true,
        keterangan: true,
        catatanVerifikasi: true,
        statusVerifikasi: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Get pencairan dana (multiple termins)
    const pencairanList = await prisma.pencairan_dana.findMany({
      where: { proposalId: id },
      select: {
        id: true,
        termin: true,
        nominal: true,
        persentase: true,
        tanggalPencairan: true,
        keterangan: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { termin: 'asc' },
    })

    // Build timeline data
    const timelineData = {
      proposal: {
        id: proposal.id,
        status: proposal.status,
        createdAt: proposal.createdAt,
        submittedAt: proposal.submittedAt,
        catatan: proposal.catatan,
        catatanRevisi: proposal.catatanRevisi,
        catatanAdministrasi: proposal.catatanAdministrasi,
        statusAdministrasi: proposal.statusAdministrasi,
        checkedAdminAt: proposal.checkedAdminAt,
        dosen: proposal.dosen,
      },
      revisions,
      reviews,
      seminar,
      monitoring,
      luaran: luaranList,
      pencairan: pencairanList,
    }

    return NextResponse.json({
      success: true,
      data: timelineData,
    })
  } catch (error: any) {
    console.error('Get proposal timeline error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

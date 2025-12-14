import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal/:id/submit - Submit proposal (change status from DRAFT to DIAJUKAN)
export async function POST(
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

    // Check if proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        periode: true,
        _count: {
          select: {
            proposalmember: true,
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

    // Access control: Only creator can submit
    if (proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Anda tidak dapat submit proposal ini' },
        { status: 403 }
      )
    }

    // Validate proposal status (allow DRAFT or REVISI)
    if (!['DRAFT', 'REVISI'].includes(proposal.status)) {
      return NextResponse.json(
        { success: false, error: 'Hanya proposal dengan status DRAFT atau REVISI yang dapat disubmit' },
        { status: 400 }
      )
    }

    // Validate required data
    if (!proposal.judul || !proposal.abstrak) {
      return NextResponse.json(
        { success: false, error: 'Judul dan abstrak harus diisi' },
        { status: 400 }
      )
    }

    // Validate file upload
    if (!proposal.filePath) {
      return NextResponse.json(
        { success: false, error: 'File proposal harus diupload' },
        { status: 400 }
      )
    }

    // Validate periode is still active
    if (proposal.periode.status !== 'AKTIF') {
      return NextResponse.json(
        { success: false, error: 'Periode sudah tidak aktif' },
        { status: 400 }
      )
    }

    // Validate submission deadline
    const now = new Date()
    const tglTutup = new Date(proposal.periode.tanggalTutup)
    
    if (now > tglTutup) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Periode pengajuan sudah ditutup pada ${tglTutup.toLocaleDateString('id-ID')}` 
        },
        { status: 400 }
      )
    }

    // Validate team members
    // Note: Ketua proposal is included in proposalmember table
    // So minimum is 1 member (the ketua itself)
    if (proposal._count.proposalmember < 1) {
      return NextResponse.json(
        { success: false, error: 'Proposal harus memiliki anggota tim (minimal ketua)' },
        { status: 400 }
      )
    }

    // Update proposal status to DIAJUKAN
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'DIAJUKAN',
        submittedAt: new Date(),
      },
      include: {
        periode: true,
        skema: true,
        dosen: true,
        bidangkeahlian: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProposal,
      message: 'Proposal berhasil disubmit',
    })
  } catch (error: any) {
    console.error('Submit proposal error:', error)

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

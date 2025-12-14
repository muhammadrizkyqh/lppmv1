import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/proposal/:id - Get proposal by ID
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

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        periode: true,
        skema: true,
        dosen: true,
        bidangkeahlian: true,
        proposalmember: {
          include: {
            dosen: {
              select: {
                id: true,
                nidn: true,
                nama: true,
                email: true,
              },
            },
            mahasiswa: {
              select: {
                id: true,
                nim: true,
                nama: true,
                email: true,
              },
            },
          },
        },
        proposal_reviewer: {
          include: {
            reviewer: {
              select: {
                id: true,
                nama: true,
                email: true,
                bidangKeahlianId: true,
              },
            },
            review: true,
          },
        },
        _count: {
          select: {
            proposalmember: true,
            proposal_reviewer: true,
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

    return NextResponse.json({
      success: true,
      data: proposal,
    })
  } catch (error: any) {
    console.error('Get proposal error:', error)

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

// PUT /api/proposal/:id - Update proposal
export async function PUT(
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

    // Check if proposal exists
    const existingProposal = await prisma.proposal.findUnique({
      where: { id },
    })

    if (!existingProposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Access control: Only creator can edit
    if (existingProposal.creatorId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Anda tidak dapat mengedit proposal ini' },
        { status: 403 }
      )
    }

    // Can only edit DRAFT or REVISI proposals
    if (!['DRAFT', 'REVISI'].includes(existingProposal.status)) {
      return NextResponse.json(
        { success: false, error: 'Hanya proposal dengan status DRAFT atau REVISI yang dapat diedit' },
        { status: 400 }
      )
    }

    // Validate abstrak length if provided
    if (abstrak && abstrak.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Abstrak maksimal 500 karakter' },
        { status: 400 }
      )
    }

    // Update proposal
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        ...(periodeId && { periodeId }),
        ...(skemaId && { skemaId }),
        ...(bidangKeahlianId !== undefined && { bidangKeahlianId }),
        ...(judul && { judul }),
        ...(abstrak !== undefined && { abstrak }),
        ...(filePath && { filePath }),
        ...(fileName && { fileName }),
        ...(fileSize !== undefined && { fileSize }),
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
      message: 'Proposal berhasil diupdate',
    })
  } catch (error: any) {
    console.error('Update proposal error:', error)

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

// DELETE /api/proposal/:id - Delete proposal
export async function DELETE(
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
        _count: {
          select: {
            proposal_reviewer: true,
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

    // Access control: Only creator or ADMIN can delete
    if (proposal.creatorId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Anda tidak dapat menghapus proposal ini' },
        { status: 403 }
      )
    }

    // Cannot delete if has reviewers assigned
    if (proposal._count.proposal_reviewer > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proposal yang sudah memiliki reviewer tidak dapat dihapus',
        },
        { status: 400 }
      )
    }

    // Can only delete DRAFT proposals
    if (proposal.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Hanya proposal dengan status DRAFT yang dapat dihapus' },
        { status: 400 }
      )
    }

    // Delete proposal (members will be deleted automatically due to Cascade)
    await prisma.proposal.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Proposal berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Delete proposal error:', error)

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

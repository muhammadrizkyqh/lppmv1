import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/proposal/:id/members/:memberId - Remove member from proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if member exists
    const member = await prisma.proposalMember.findUnique({
      where: { id: params.memberId },
      include: {
        proposal: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Anggota tidak ditemukan' },
        { status: 404 }
      )
    }

    // Access control: Only creator can remove members
    if (member.proposal.creatorId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Anda tidak dapat menghapus anggota' },
        { status: 403 }
      )
    }

    // Cannot remove members if proposal already submitted
    if (member.proposal.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus anggota pada proposal yang sudah disubmit' },
        { status: 400 }
      )
    }

    // Cannot remove ketua
    if (member.role === 'Ketua') {
      return NextResponse.json(
        { success: false, error: 'Ketua tidak dapat dihapus dari tim' },
        { status: 400 }
      )
    }

    // Delete member
    await prisma.proposalMember.delete({
      where: { id: params.memberId },
    })

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Delete member error:', error)

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

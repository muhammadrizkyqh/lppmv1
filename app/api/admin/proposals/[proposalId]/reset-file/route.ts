import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST - Reset proposal file and change status back to DRAFT
 * Admin only - used when uploaded files are lost/corrupted
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const session = await requireAuth()
    
    // Authorization - Admin only
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { proposalId } = await params

    // Check proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        judul: true,
        status: true,
        filePath: true,
        fileName: true,
        creatorId: true,
        dosen: {
          select: {
            nama: true,
            email: true,
          }
        }
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Safety check - prevent reset if already in certain statuses
    const protectedStatuses = ['DITERIMA', 'BERJALAN', 'SELESAI']
    if (protectedStatuses.includes(proposal.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Proposal dengan status ${proposal.status} tidak dapat direset. Hubungi developer untuk handling khusus.` 
        },
        { status: 400 }
      )
    }

    // Reset file fields and change status to DRAFT
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        filePath: null,
        fileName: null,
        fileSize: null,
        status: 'DRAFT',
        statusAdministrasi: 'BELUM_DICEK',
        submittedAt: null,
        // Reset admin check fields
        checkKesesuaianTeknikPenulisan: false,
        catatanKesesuaianTeknikPenulisan: null,
        checkKelengkapanKomponen: false,
        catatanKelengkapanKomponen: null,
        checkedAdminAt: null,
        checkedAdminBy: null,
        catatanAdministrasi: 'File proposal hilang/corrupt. Silakan upload ulang file proposal.',
        updatedAt: new Date(),
      },
    })

    // Log the reset action for audit trail
    console.log(`[ADMIN ACTION] File reset by ${session.email}:`, {
      proposalId: proposal.id,
      proposalTitle: proposal.judul,
      previousStatus: proposal.status,
      previousFile: proposal.fileName,
      dosenEmail: proposal.dosen.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'File proposal berhasil direset. Status diubah ke DRAFT. Dosen dapat upload ulang file proposal.',
      data: {
        id: updatedProposal.id,
        status: updatedProposal.status,
        dosenEmail: proposal.dosen.email,
        dosenNama: proposal.dosen.nama,
      }
    })

  } catch (error) {
    console.error('Error resetting proposal file:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mereset file proposal' 
      },
      { status: 500 }
    )
  }
}

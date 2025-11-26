import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Upload laporan akhir
export async function POST(
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
    const body = await request.json()
    const { laporanAkhir, fileAkhir } = body

    // Validation
    if (!laporanAkhir) {
      return NextResponse.json(
        { success: false, error: 'Laporan akhir harus diisi' },
        { status: 400 }
      )
    }

    if (!fileAkhir || fileAkhir.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'File laporan akhir harus diupload' },
        { status: 400 }
      )
    }

    // Check proposal exists and user authorization
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
        judul: true,
        creatorId: true,
        status: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Authorization check
    if (session.role === 'DOSEN' && proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if monitoring record exists with laporan kemajuan
    const existingMonitoring = await prisma.monitoring.findFirst({
      where: { proposalId },
    })

    if (!existingMonitoring || !existingMonitoring.laporanKemajuan) {
      return NextResponse.json(
        { success: false, error: 'Laporan kemajuan harus diupload terlebih dahulu' },
        { status: 400 }
      )
    }

    // Update monitoring with laporan akhir
    const monitoring = await prisma.monitoring.update({
      where: { id: existingMonitoring.id },
      data: {
        laporanAkhir,
        fileAkhir,
        // Keep persentaseKemajuan as is, don't change to 100%
        // Status stays BERJALAN until admin approves
        // Reset verification when re-uploading
        verifikasiAkhirStatus: null,
        verifikasiAkhirAt: null,
        catatanAkhir: null,
        updatedAt: new Date(),
      },
    })

    // Don't update proposal status yet, wait for admin verification
    // await prisma.proposal.update({
    //   where: { id: proposalId },
    //   data: { status: 'SELESAI' },
    // })

    // TODO: Create notification for admin
    // await createNotification({
    //   userId: adminId,
    //   title: 'Laporan Akhir Baru',
    //   message: `Laporan akhir telah diupload untuk proposal "${proposal.judul}"`,
    //   type: 'INFO',
    //   link: `/admin/monitoring/${proposalId}`
    // })

    return NextResponse.json({
      success: true,
      message: 'Laporan akhir berhasil diupload',
      data: monitoring,
    })
  } catch (error) {
    console.error('Upload akhir error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

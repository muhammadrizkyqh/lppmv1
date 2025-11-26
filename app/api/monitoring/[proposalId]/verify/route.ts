import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Verify monitoring laporan (Admin only)
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

    // Only admin can verify
    const roleCheck = await requireRole(['ADMIN'])
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const { proposalId } = await params
    const body = await request.json()
    const { approved, catatan, type } = body // type: 'kemajuan' | 'akhir'

    // Validation
    if (approved === undefined || !type) {
      return NextResponse.json(
        { success: false, error: 'Status verifikasi dan tipe laporan harus diisi' },
        { status: 400 }
      )
    }

    if (!['kemajuan', 'akhir'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe laporan tidak valid' },
        { status: 400 }
      )
    }

    // Check monitoring exists
    const monitoring = await prisma.monitoring.findFirst({
      where: { proposalId },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            creatorId: true,
          },
        },
      },
    })

    if (!monitoring) {
      return NextResponse.json(
        { success: false, error: 'Data monitoring tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify appropriate laporan exists
    if (type === 'kemajuan' && !monitoring.laporanKemajuan) {
      return NextResponse.json(
        { success: false, error: 'Laporan kemajuan belum diupload' },
        { status: 400 }
      )
    }

    if (type === 'akhir' && !monitoring.laporanAkhir) {
      return NextResponse.json(
        { success: false, error: 'Laporan akhir belum diupload' },
        { status: 400 }
      )
    }

    // Update monitoring with verification info
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (type === 'kemajuan') {
      updateData.verifikasiKemajuanStatus = approved ? 'APPROVED' : 'REJECTED'
      updateData.verifikasiKemajuanAt = new Date()
      updateData.catatanKemajuan = catatan || null
    } else {
      updateData.verifikasiAkhirStatus = approved ? 'APPROVED' : 'REJECTED'
      updateData.verifikasiAkhirAt = new Date()
      updateData.catatanAkhir = catatan || null
      // If approved, set status to SELESAI and progress to 100%
      if (approved) {
        updateData.status = 'SELESAI'
        updateData.persentaseKemajuan = 100
      }
    }

    const updatedMonitoring = await prisma.monitoring.update({
      where: { id: monitoring.id },
      data: updateData,
    })

    // Update proposal status based on verification result
    if (type === 'akhir' && approved) {
      // If laporan akhir approved, set proposal to SELESAI
      await prisma.proposal.update({
        where: { id: monitoring.proposalId },
        data: { status: 'SELESAI' },
      })
    }
    // If rejected, proposal stays BERJALAN (no update needed)

    // TODO: Create notification for dosen
    // const notifTitle = approved
    //   ? `Laporan ${type === 'kemajuan' ? 'Kemajuan' : 'Akhir'} Disetujui`
    //   : `Laporan ${type === 'kemajuan' ? 'Kemajuan' : 'Akhir'} Perlu Perbaikan`
    // const notifMessage = catatan || 'Verifikasi telah dilakukan oleh admin'
    // await createNotification({
    //   userId: monitoring.proposal.creatorId,
    //   title: notifTitle,
    //   message: notifMessage,
    //   type: approved ? 'SUCCESS' : 'WARNING',
    //   link: `/dosen/monitoring/${proposalId}`
    // })

    return NextResponse.json({
      success: true,
      message: `Verifikasi laporan ${type} berhasil`,
      data: {
        approved,
        catatan,
        type,
        verifiedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Verify monitoring error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

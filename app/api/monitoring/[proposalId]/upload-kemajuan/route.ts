import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Upload laporan kemajuan
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
    const { laporanKemajuan, fileKemajuan, persentaseKemajuan } = body

    // Validation
    if (!laporanKemajuan || persentaseKemajuan === undefined) {
      return NextResponse.json(
        { success: false, error: 'Laporan dan persentase kemajuan harus diisi' },
        { status: 400 }
      )
    }

    if (!fileKemajuan || fileKemajuan.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'File laporan kemajuan harus diupload' },
        { status: 400 }
      )
    }

    if (persentaseKemajuan < 0 || persentaseKemajuan > 100) {
      return NextResponse.json(
        { success: false, error: 'Persentase kemajuan harus antara 0-100' },
        { status: 400 }
      )
    }

    // Check proposal exists and user authorization
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true,
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

    // Authorization check - only proposal creator can upload
    if (session.role === 'DOSEN' && proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check proposal status - must be BERJALAN (after kontrak signed)
    if (proposal.status !== 'BERJALAN') {
      return NextResponse.json(
        { success: false, error: 'Monitoring hanya untuk proposal yang sudah BERJALAN (kontrak sudah ditandatangani)' },
        { status: 400 }
      )
    }

    // Check if monitoring exists
    const existingMonitoring = await prisma.monitoring.findFirst({
      where: { proposalId },
    })

    // Create or update monitoring record
    let monitoring
    if (existingMonitoring) {
      monitoring = await prisma.monitoring.update({
        where: { id: existingMonitoring.id },
        data: {
          laporanKemajuan,
          fileKemajuan,
          persentaseKemajuan,
          // Reset verification when re-uploading
          verifikasiKemajuanStatus: null,
          verifikasiKemajuanAt: null,
          catatanKemajuan: null,
          updatedAt: new Date(),
        },
      })
    } else {
      monitoring = await prisma.monitoring.create({
        data: {
          proposalId,
          laporanKemajuan,
          fileKemajuan,
          persentaseKemajuan,
          status: 'BERJALAN',
        },
      })
    }

    // TODO: Create notification for admin
    // await createNotification({
    //   userId: adminId,
    //   title: 'Laporan Kemajuan Baru',
    //   message: `Laporan kemajuan telah diupload untuk proposal "${proposal.judul}"`,
    //   type: 'INFO',
    //   link: `/admin/monitoring/${proposalId}`
    // })

    return NextResponse.json({
      success: true,
      message: 'Laporan kemajuan berhasil diupload',
      data: monitoring,
    })
  } catch (error) {
    console.error('Upload kemajuan error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Reset verification (Admin only) - untuk development/testing
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

    // Only admin can reset
    const roleCheck = await requireRole(['ADMIN'])
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const { proposalId } = await params
    const body = await request.json()
    const { type } = body // type: 'kemajuan' | 'akhir'

    if (!type || !['kemajuan', 'akhir'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe laporan harus diisi (kemajuan/akhir)' },
        { status: 400 }
      )
    }

    // Check monitoring exists
    const monitoring = await prisma.monitoring.findFirst({
      where: { proposalId },
    })

    if (!monitoring) {
      return NextResponse.json(
        { success: false, error: 'Data monitoring tidak ditemukan' },
        { status: 404 }
      )
    }

    // Reset verification data
    const updateData: any = {}

    if (type === 'kemajuan') {
      updateData.verifikasiKemajuanStatus = null
      updateData.verifikasiKemajuanAt = null
      updateData.catatanKemajuan = null
      // Also delete laporan kemajuan data
      updateData.laporanKemajuan = null
      updateData.fileKemajuan = null
      updateData.persentaseKemajuan = 0
    } else {
      updateData.verifikasiAkhirStatus = null
      updateData.verifikasiAkhirAt = null
      updateData.catatanAkhir = null
      // Also delete laporan akhir data and reset to kemajuan percentage
      updateData.laporanAkhir = null
      updateData.fileAkhir = null
      updateData.status = 'BERJALAN' // Reset monitoring status
      // Keep persentaseKemajuan as is (don't reset to 0, keep the kemajuan value)
    }

    await prisma.monitoring.update({
      where: { id: monitoring.id },
      data: updateData,
    })

    // If resetting akhir, also reset proposal status to BERJALAN
    if (type === 'akhir') {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'BERJALAN' },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Verifikasi ${type} berhasil direset`,
    })
  } catch (error) {
    console.error('Reset verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

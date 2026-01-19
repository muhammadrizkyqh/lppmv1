import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat menghapus data dosen' },
        { status: 403 }
      )
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data yang dipilih' },
        { status: 400 }
      )
    }

    // Check if any dosen has proposals
    const dosensWithProposals = await prisma.dosen.findMany({
      where: {
        id: { in: ids },
        proposal: { some: {} }
      },
      select: {
        id: true,
        nama: true
      }
    })

    if (dosensWithProposals.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${dosensWithProposals.length} dosen memiliki proposal dan tidak dapat dihapus. Hapus proposal terlebih dahulu.` 
        },
        { status: 400 }
      )
    }

    // Delete dosen
    const result = await prisma.dosen.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} dosen berhasil dihapus`,
      data: { count: result.count }
    })
  } catch (error: any) {
    console.error('Bulk delete dosen error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

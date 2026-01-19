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
        { success: false, error: 'Hanya admin yang dapat menghapus data reviewer' },
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

    // Check if any reviewer has reviews
    const reviewersWithReviews = await prisma.reviewer.findMany({
      where: {
        id: { in: ids },
        proposal_reviewer: { some: {} }
      },
      select: {
        id: true,
        nama: true
      }
    })

    if (reviewersWithReviews.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${reviewersWithReviews.length} reviewer telah ditugaskan dan tidak dapat dihapus. Hapus penugasan terlebih dahulu.` 
        },
        { status: 400 }
      )
    }

    // Delete reviewer
    const result = await prisma.reviewer.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} reviewer berhasil dihapus`,
      data: { count: result.count }
    })
  } catch (error: any) {
    console.error('Bulk delete reviewer error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

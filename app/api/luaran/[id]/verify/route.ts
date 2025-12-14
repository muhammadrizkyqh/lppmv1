import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// POST /api/luaran/[id]/verify - Verify/Reject luaran (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa verifikasi luaran' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { statusVerifikasi, catatanVerifikasi } = body

    // Validate status
    if (!['DIVERIFIKASI', 'DITOLAK'].includes(statusVerifikasi)) {
      return NextResponse.json(
        { success: false, error: 'Status verifikasi tidak valid' },
        { status: 400 }
      )
    }

    // Get luaran
    const luaran = await prisma.luaran.findUnique({
      where: { id },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            dosen: {
              select: {
                nama: true,
                email: true,
              }
            }
          }
        }
      }
    })

    if (!luaran) {
      return NextResponse.json(
        { success: false, error: 'Luaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update luaran verification status
    const updated = await prisma.luaran.update({
      where: { id },
      data: {
        statusVerifikasi,
        catatanVerifikasi,
        verifiedBy: session.id,
        verifiedAt: new Date(),
      },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            dosen: {
              select: {
                nama: true,
              }
            }
          }
        },
        user: {
          select: {
            username: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Luaran berhasil ${statusVerifikasi === 'DIVERIFIKASI' ? 'diverifikasi' : 'ditolak'}`
    })
  } catch (error) {
    console.error('Verify luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

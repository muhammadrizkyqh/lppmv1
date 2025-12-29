import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/luaran/[id] - Get luaran detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const luaran = await prisma.luaran.findUnique({
      where: { id },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            status: true,
            ketuaId: true,
            periode: {
              select: {
                id: true,
                nama: true,
                tahun: true,
              }
            },
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
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

    // Check permission: Admin or ketua proposal
    if (session.role !== 'ADMIN') {
      const dosen = await prisma.dosen.findFirst({
        where: { userId: session.id }
      })
      if (!dosen || luaran.proposal.ketuaId !== dosen.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: luaran,
    })
  } catch (error) {
    console.error('Get luaran detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/luaran/[id] - Update luaran (Dosen only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'DOSEN') {
      return NextResponse.json(
        { success: false, error: 'Hanya dosen yang bisa update luaran' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jenis, judul, penerbit, tahunTerbit, url, keterangan } = body
    const { id } = await params

    // Get luaran
    const luaran = await prisma.luaran.findUnique({
      where: { id },
      include: {
        proposal: true
      }
    })

    if (!luaran) {
      return NextResponse.json(
        { success: false, error: 'Luaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check permission
    const dosen = await prisma.dosen.findFirst({
      where: { userId: session.id }
    })
    if (!dosen || luaran.proposal.ketuaId !== dosen.id) {
      return NextResponse.json(
        { success: false, error: 'Hanya ketua penelitian yang bisa update luaran' },
        { status: 403 }
      )
    }

    // Cannot update if already verified
    if (luaran.statusVerifikasi === 'DIVERIFIKASI') {
      return NextResponse.json(
        { success: false, error: 'Luaran yang sudah diverifikasi tidak bisa diubah' },
        { status: 400 }
      )
    }

    // Update luaran
    const updated = await prisma.luaran.update({
      where: { id },
      data: {
        jenis,
        judul,
        penerbit,
        tahunTerbit,
        url,
        keterangan,
      },
      include: {
        proposal: {
          select: {
            judul: true,
            dosen: {
              select: {
                nama: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Luaran berhasil diupdate'
    })
  } catch (error) {
    console.error('Update luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/luaran/[id] - Delete luaran (Dosen only, PENDING/DITOLAK only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'DOSEN') {
      return NextResponse.json(
        { success: false, error: 'Hanya dosen yang bisa hapus luaran' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Get luaran
    const luaran = await prisma.luaran.findUnique({
      where: { id },
      include: {
        proposal: true
      }
    })

    if (!luaran) {
      return NextResponse.json(
        { success: false, error: 'Luaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check permission
    const dosen = await prisma.dosen.findFirst({
      where: { userId: session.id }
    })
    if (!dosen || luaran.proposal.ketuaId !== dosen.id) {
      return NextResponse.json(
        { success: false, error: 'Hanya ketua penelitian yang bisa hapus luaran' },
        { status: 403 }
      )
    }

    // Only PENDING or DITOLAK can be deleted
    if (luaran.statusVerifikasi !== 'PENDING' && luaran.statusVerifikasi !== 'DITOLAK') {
      return NextResponse.json(
        { success: false, error: 'Hanya luaran PENDING atau DITOLAK yang bisa dihapus' },
        { status: 400 }
      )
    }

    // ========== CASCADE DELETE TERMIN_3 ==========
    // If deleting luaran, also delete TERMIN_3 for this proposal
    const termin3 = await prisma.pencairan_dana.findFirst({
      where: {
        proposalId: luaran.proposalId,
        termin: 'TERMIN_3'
      }
    })

    if (termin3) {
      await prisma.pencairan_dana.delete({
        where: { id: termin3.id }
      })
      console.log(`✅ Cascade deleted TERMIN_3 for proposal ${luaran.proposalId}`)
    }

    // Delete luaran
    await prisma.luaran.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Luaran berhasil dihapus' + (termin3 ? '. TERMIN_3 ikut dihapus.' : '')
    })
  } catch (error) {
    console.error('Delete luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

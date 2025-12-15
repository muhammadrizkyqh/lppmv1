import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/seminar/:id - Get seminar detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const seminar = await prisma.seminar.findUnique({
      where: { id },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            abstrak: true,
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true,
                email: true,
              }
            },
            skema: {
              select: {
                nama: true,
                tipe: true,
              }
            },
            periode: {
              select: {
                tahun: true,
                nama: true,
              }
            }
          }
        },
        seminar_peserta: {
          orderBy: { nama: 'asc' }
        }
      }
    })

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: 'Seminar tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: seminar,
    })

  } catch (error) {
    console.error('Get seminar detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/seminar/:id - Update seminar (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const roleCheck = await requireRole(['ADMIN'])
    
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat update seminar' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      judul,
      tanggal,
      waktu,
      tempat,
      moderator,
      status,
      notulensi,
      hasilKeputusan,
    } = body

    const seminar = await prisma.seminar.findUnique({
      where: { id },
      include: { proposal: true }
    })

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: 'Seminar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validasi: jika mau mark SELESAI, cek apakah materi sudah diupload (untuk seminar PROPOSAL)
    if (status === 'SELESAI' && seminar.jenis === 'PROPOSAL' && !seminar.fileMateri) {
      return NextResponse.json(
        { success: false, error: 'Dosen harus upload materi presentasi terlebih dahulu sebelum seminar bisa ditandai selesai' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (judul !== undefined) updateData.judul = judul
    if (tanggal !== undefined) updateData.tanggal = new Date(tanggal)
    if (waktu !== undefined) updateData.waktu = waktu
    if (tempat !== undefined) updateData.tempat = tempat
    if (moderator !== undefined) updateData.moderator = moderator
    if (status !== undefined) updateData.status = status
    if (notulensi !== undefined) updateData.notulensi = notulensi
    if (hasilKeputusan !== undefined) updateData.hasilKeputusan = hasilKeputusan

    const updated = await prisma.seminar.update({
      where: { id },
      data: updateData,
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

    // If seminar proposal selesai → update proposal status to DIREVIEW (siap assign reviewer)
    if (status === 'SELESAI' && seminar.jenis === 'PROPOSAL') {
      await prisma.proposal.update({
        where: { id: seminar.proposalId },
        data: {
          status: 'DIREVIEW', // Siap di-assign reviewer
        }
      })
    }

    // If seminar internal selesai → allow Termin 2
    if (status === 'SELESAI' && seminar.jenis === 'INTERNAL') {
      // Update monitoring status final
      await prisma.monitoring.updateMany({
        where: {
          proposalId: seminar.proposalId,
        },
        data: {
          verifikasiAkhirStatus: 'APPROVED',
          verifikasiAkhirAt: new Date(),
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Seminar berhasil diupdate',
      data: updated,
    })

  } catch (error) {
    console.error('Update seminar error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/seminar/:id - Cancel/delete seminar (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const roleCheck = await requireRole(['ADMIN'])
    
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat cancel seminar' },
        { status: 403 }
      )
    }

    const { id } = await params

    const seminar = await prisma.seminar.findUnique({
      where: { id }
    })

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: 'Seminar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Soft delete: set status to DIBATALKAN
    await prisma.seminar.update({
      where: { id },
      data: {
        status: 'DIBATALKAN',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Seminar dibatalkan',
    })

  } catch (error) {
    console.error('Delete seminar error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

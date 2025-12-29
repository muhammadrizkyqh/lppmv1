import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/pencairan/[id] - Get pencairan detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()

    const { id } = await params

    const pencairan = await prisma.pencairan_dana.findUnique({
      where: { id },
      include: {
        proposal: {
          include: {
            periode: true,
            skema: true,
            dosen: true,
          }
        },
        user: {
          select: {
            username: true,
            email: true,
          }
        }
      }
    })

    if (!pencairan) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Authorization: admin or proposal owner
    if (
      session.role !== 'ADMIN' &&
      pencairan.proposal.ketuaId !== session.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pencairan,
    })
  } catch (error) {
    console.error('Get pencairan detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/pencairan/[id] - Update pencairan status & upload bukti (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, fileBukti, keterangan, tanggalPencairan } = body

    const pencairan = await prisma.pencairan_dana.findUnique({
      where: { id },
      include: {
        proposal: true,
      }
    })

    if (!pencairan) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak ditemukan' },
        { status: 404 }
      )
    }

    // SECURITY: Status DICAIRKAN tidak bisa diubah lagi (immutable)
    if (pencairan.status === 'DICAIRKAN') {
      return NextResponse.json(
        { success: false, error: 'Pencairan yang sudah dicairkan tidak dapat diubah' },
        { status: 400 }
      )
    }

    // SECURITY: Tidak bisa ubah status ke DICAIRKAN tanpa bukti transfer
    if (status === 'DICAIRKAN') {
      const hasBukti = fileBukti || pencairan.fileBukti
      if (!hasBukti) {
        return NextResponse.json(
          { success: false, error: 'Harus upload bukti transfer terlebih dahulu' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (fileBukti) {
      updateData.fileBukti = fileBukti
    }

    if (keterangan !== undefined) {
      updateData.keterangan = keterangan
    }

    if (tanggalPencairan) {
      updateData.tanggalPencairan = new Date(tanggalPencairan)
    }

    // If status changed to DICAIRKAN, set tanggalPencairan if not provided
    if (status === 'DICAIRKAN' && !tanggalPencairan && !pencairan.tanggalPencairan) {
      updateData.tanggalPencairan = new Date()
    }

    const updated = await prisma.pencairan_dana.update({
      where: { id },
      data: updateData,
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            danaDisetujui: true,
            dosen: {
              select: {
                nama: true,
              }
            }
          }
        }
      }
    })

    // ========== AUTO-CREATE TERMIN_2 WHEN TERMIN_1 DICAIRKAN (RE-CHECK) ==========
    if (status === 'DICAIRKAN' && pencairan.termin === 'TERMIN_1') {
      // Check if laporan akhir sudah approved
      const monitoring = await prisma.monitoring.findFirst({
        where: { 
          proposalId: pencairan.proposalId,
          verifikasiAkhirStatus: 'APPROVED'
        }
      })

      if (monitoring) {
        // Check if TERMIN_2 doesn't exist yet
        const existingTermin2 = await prisma.pencairan_dana.findFirst({
          where: {
            proposalId: pencairan.proposalId,
            termin: 'TERMIN_2'
          }
        })

        if (!existingTermin2) {
          const totalDana = updated.proposal.danaDisetujui || 0
          const termin2Amount = Number(totalDana) * 0.25

          await prisma.pencairan_dana.create({
            data: {
              proposalId: pencairan.proposalId,
              termin: 'TERMIN_2',
              nominal: termin2Amount,
              persentase: 25,
              status: 'PENDING',
              keterangan: 'Pencairan otomatis setelah TERMIN_1 dicairkan dan laporan akhir disetujui',
              createdBy: session.id,
            }
          })

          console.log(`✅ Auto-created TERMIN_2 (25%) for proposal ${pencairan.proposalId} - triggered by TERMIN_1 update`)
        }
      }
    }

    // ========== RE-CHECK TERMIN_3 WHEN TERMIN_2 DICAIRKAN ==========
    // When TERMIN_2 is approved (DICAIRKAN), check if luaran is already DIVERIFIKASI
    // If yes, auto-create TERMIN_3 (handles case where admin forgot to pay TERMIN_2 first)
    if (status === 'DICAIRKAN' && pencairan.termin === 'TERMIN_2') {
      // Check if luaran already DIVERIFIKASI
      const luaranVerified = await prisma.luaran.findFirst({
        where: {
          proposalId: pencairan.proposalId,
          statusVerifikasi: 'DIVERIFIKASI'
        }
      })

      if (luaranVerified) {
        // Check if TERMIN_3 already exists
        const existingTermin3 = await prisma.pencairan_dana.findFirst({
          where: {
            proposalId: pencairan.proposalId,
            termin: 'TERMIN_3'
          }
        })

        if (!existingTermin3) {
          const totalDana = updated.proposal.danaDisetujui || 0
          const termin3Amount = Number(totalDana) * 0.25

          await prisma.pencairan_dana.create({
            data: {
              proposalId: pencairan.proposalId,
              termin: 'TERMIN_3',
              nominal: termin3Amount,
              persentase: 25,
              status: 'PENDING',
              keterangan: 'Pencairan otomatis setelah luaran diverifikasi (re-check dari TERMIN_2)',
              createdBy: session.id,
            }
          })

          console.log(`✅ Re-check: Created TERMIN_3 for proposal ${pencairan.proposalId} - luaran already verified`)
        }
      }
    }

    let successMessage = 'Pencairan berhasil diupdate'
    
    if (status === 'DICAIRKAN') {
      if (pencairan.termin === 'TERMIN_1') {
        const hasTermin2 = await prisma.pencairan_dana.findFirst({
          where: { proposalId: pencairan.proposalId, termin: 'TERMIN_2' }
        })
        if (hasTermin2) {
          successMessage += '. TERMIN_2 telah dibuat otomatis karena laporan akhir sudah disetujui.'
        }
      } else if (pencairan.termin === 'TERMIN_2') {
        successMessage += '. TERMIN_3 telah dibuat otomatis.'
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: successMessage
    })
  } catch (error) {
    console.error('Update pencairan error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

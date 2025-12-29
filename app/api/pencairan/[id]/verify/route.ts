import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// POST /api/pencairan/[id]/verify - Verify/Approve pencairan (Admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat verifikasi pencairan' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { status, keterangan, tanggalPencairan } = body

    // Validate required fields
    if (!status || !['DICAIRKAN', 'DITOLAK'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status harus DICAIRKAN atau DITOLAK' },
        { status: 400 }
      )
    }

    // Get pencairan with proposal
    const pencairan = await prisma.pencairan_dana.findUnique({
      where: { id },
      include: {
        proposal: {
          select: {
            id: true,
            danaDisetujui: true,
            skema: true
          }
        }
      }
    })

    if (!pencairan) {
      return NextResponse.json(
        { success: false, error: 'Data pencairan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (pencairan.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Pencairan sudah diverifikasi sebelumnya' },
        { status: 400 }
      )
    }

    // Update pencairan status
    await prisma.pencairan_dana.update({
      where: { id },
      data: {
        status,
        keterangan,
        tanggalPencairan: status === 'DICAIRKAN' ? tanggalPencairan || new Date() : null,
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
          const totalDana = pencairan.proposal.danaDisetujui || 0
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

          console.log(`✅ Auto-created TERMIN_2 (25%) for proposal ${pencairan.proposalId} - triggered by TERMIN_1 verification`)
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
          // Calculate TERMIN_3 amount (25% of total dana - use danaDisetujui from proposal)
          const totalDana = pencairan.proposal.danaDisetujui || 0
          const termin3Amount = Number(totalDana) * 0.25

          // Create TERMIN_3
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

    let successMessage = `Pencairan berhasil ${status === 'DICAIRKAN' ? 'disetujui' : 'ditolak'}`
    
    if (status === 'DICAIRKAN') {
      if (pencairan.termin === 'TERMIN_1') {
        const hasTermin2 = await prisma.pencairan_dana.findFirst({
          where: { proposalId: pencairan.proposalId, termin: 'TERMIN_2' }
        })
        if (hasTermin2) {
          successMessage += '. TERMIN_2 telah dibuat otomatis karena laporan akhir sudah disetujui.'
        }
      } else if (pencairan.termin === 'TERMIN_2') {
        const hasTermin3 = await prisma.pencairan_dana.findFirst({
          where: { proposalId: pencairan.proposalId, termin: 'TERMIN_3' }
        })
        if (hasTermin3) {
          successMessage += '. TERMIN_3 telah dibuat otomatis karena luaran sudah diverifikasi.'
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: successMessage
    })
  } catch (error) {
    console.error('Verify pencairan error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

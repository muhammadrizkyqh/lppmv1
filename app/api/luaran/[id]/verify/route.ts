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
            danaDisetujui: true,
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

    // ========== AUTO-CREATE TERMIN_3 ==========
    // When luaran is DIVERIFIKASI, check if TERMIN_2 is DICAIRKAN
    // If yes, automatically create TERMIN_3 (25%)
    let termin3Created = false
    if (statusVerifikasi === 'DIVERIFIKASI') {
      // Check if TERMIN_2 exists and is DICAIRKAN
      const termin2 = await prisma.pencairan_dana.findFirst({
        where: {
          proposalId: luaran.proposalId,
          termin: 'TERMIN_2',
          status: 'DICAIRKAN'
        }
      })

      if (termin2) {
        // Check if TERMIN_3 already exists
        const existingTermin3 = await prisma.pencairan_dana.findFirst({
          where: {
            proposalId: luaran.proposalId,
            termin: 'TERMIN_3'
          }
        })

        if (!existingTermin3 && updated.proposal.danaDisetujui) {
          // Create TERMIN_3 automatically
          const termin3Amount = Number(updated.proposal.danaDisetujui) * 0.25
          
          await prisma.pencairan_dana.create({
            data: {
              proposalId: luaran.proposalId,
              termin: 'TERMIN_3',
              nominal: termin3Amount,
              persentase: 25,
              status: 'PENDING',
              keterangan: 'Pencairan otomatis setelah luaran diverifikasi',
              createdBy: session.id,
            }
          })
          termin3Created = true
          console.log(`✅ TERMIN_3 created for proposal ${luaran.proposalId} after luaran verification`)
        }
      }
    }

    const message = statusVerifikasi === 'DIVERIFIKASI' 
      ? 'Luaran berhasil diverifikasi' + (termin3Created ? '. TERMIN_3 otomatis dibuat.' : '')
      : 'Luaran berhasil ditolak'

    return NextResponse.json({
      success: true,
      data: updated,
      message
    })
  } catch (error) {
    console.error('Verify luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

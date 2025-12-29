import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNomorKontrakDanSK } from '@/lib/kontrak-generator'

// POST /api/proposal/:id/approve - Approve proposal (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: 'Hanya admin yang dapat approve proposal' },
        { status: 403 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan di database' },
        { status: 404 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { catatan, danaDisetujui } = body

    // Validate dana
    if (!danaDisetujui || danaDisetujui <= 0) {
      return NextResponse.json(
        { success: false, error: 'Dana yang disetujui wajib diisi dan harus lebih dari 0' },
        { status: 400 }
      )
    }

    // Get proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        proposal_reviewer: {
          include: {
            review: true
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if proposal is in review status
    if (proposal.status !== 'DIREVIEW') {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak dalam status review' },
        { status: 400 }
      )
    }

    // Validate minimal 1 reviewer assigned
    if (proposal.proposal_reviewer.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Proposal harus direview oleh minimal 1 reviewer' },
        { status: 400 }
      )
    }

    // Validate all assigned reviewers have completed their reviews
    const reviews = proposal.proposal_reviewer.map(r => r.review).filter(Boolean)
    if (reviews.length !== proposal.proposal_reviewer.length) {
      return NextResponse.json(
        { success: false, error: 'Belum semua reviewer menyelesaikan review' },
        { status: 400 }
      )
    }

    // Calculate average score
    // If 1 reviewer: use that score
    // If 2 reviewers: use average
    const averageScore = reviews.reduce((sum, r) => sum + parseFloat(r!.nilaiTotal.toString()), 0) / reviews.length

    // Generate nomor kontrak and SK
    const { nomorKontrak, nomorSK } = await generateNomorKontrakDanSK()

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update proposal status to DITERIMA first
      const updatedProposal = await tx.proposal.update({
        where: { id },
        data: {
          status: 'DITERIMA',
          approvedAt: new Date(),
          nilaiTotal: averageScore,
          danaDisetujui: danaDisetujui,
          catatan: catatan || null,
        }
      })

      // 2. Create kontrak and SK automatically
      const kontrak = await tx.kontrak.create({
        data: {
          id: crypto.randomUUID(),
          proposalId: id,
          nomorKontrak,
          nomorSK,
          danaDisetujui: danaDisetujui,
          createdBy: session.id,
          status: 'DRAFT', // Admin perlu upload file TTD dulu
          updatedAt: new Date()
        }
      })

      // 3. Auto-create monitoring record (initial state)
      const monitoring = await tx.monitoring.create({
        data: {
          proposalId: id,
          persentaseKemajuan: 0,
          status: 'BERJALAN',
          catatanKemajuan: 'Monitoring dimulai setelah proposal diterima',
        }
      })

      return { proposal: updatedProposal, kontrak, monitoring }
    })

    // TODO: Create notification for dosen
    // await prisma.notification.create({
    //   data: {
    //     userId: proposal.creatorId,
    //     title: 'Proposal Diterima',
    //     message: `Selamat! Proposal "${proposal.judul}" telah diterima. Kontrak sedang diproses.`,
    //     type: 'SUCCESS',
    //     link: `/dosen/proposals/${id}`
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: result.proposal,
      kontrak: result.kontrak,
      message: `Proposal berhasil diterima. Kontrak ${nomorKontrak} dan SK ${nomorSK} telah dibuat. TERMIN_1 akan dibuat saat kontrak ditandatangani.`
    })
  } catch (error: any) {
    console.error('Approve proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

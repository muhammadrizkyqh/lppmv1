import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/reviews/:proposalReviewerId/submit - Submit review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proposalReviewerId: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { proposalReviewerId } = await params

    // Get reviewer data for this user
    const reviewer = await prisma.reviewer.findUnique({
      where: { userId: session.id }
    })

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Anda bukan reviewer' },
        { status: 403 }
      )
    }

    // Get proposal reviewer assignment
    const proposalReviewer = await prisma.proposal_reviewer.findUnique({
      where: { id: proposalReviewerId },
      include: {
        proposal: true,
      }
    })

    if (!proposalReviewer) {
      return NextResponse.json(
        { success: false, error: 'Assignment tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify this assignment belongs to the current reviewer
    if (proposalReviewer.reviewerId !== reviewer.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses ke assignment ini' },
        { status: 403 }
      )
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: { proposalReviewerId }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review sudah pernah disubmit' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      nilaiKriteria1,
      nilaiKriteria2,
      nilaiKriteria3,
      nilaiKriteria4,
      rekomendasi,
      catatan,
    } = body

    // Validate all criteria are provided
    if (!nilaiKriteria1 || !nilaiKriteria2 || !nilaiKriteria3 || !nilaiKriteria4) {
      return NextResponse.json(
        { success: false, error: 'Semua kriteria penilaian harus diisi' },
        { status: 400 }
      )
    }

    // Validate score range (1-100)
    const scores = [nilaiKriteria1, nilaiKriteria2, nilaiKriteria3, nilaiKriteria4]
    for (const score of scores) {
      if (score < 1 || score > 100) {
        return NextResponse.json(
          { success: false, error: 'Nilai harus antara 1-100' },
          { status: 400 }
        )
      }
    }

    // Validate recommendation
    if (!['DITERIMA', 'REVISI', 'DITOLAK'].includes(rekomendasi)) {
      return NextResponse.json(
        { success: false, error: 'Rekomendasi tidak valid' },
        { status: 400 }
      )
    }

    // Calculate total score (weighted sum: each criteria 25%)
    // Formula: K1*25% + K2*25% + K3*25% + K4*25% = Total (max 100)
    const nilaiTotal = (
      parseInt(nilaiKriteria1) * 0.25 + 
      parseInt(nilaiKriteria2) * 0.25 + 
      parseInt(nilaiKriteria3) * 0.25 + 
      parseInt(nilaiKriteria4) * 0.25
    )

    // Create review
    const review = await prisma.review.create({
      data: {
        proposalReviewerId,
        reviewerId: reviewer.id,
        nilaiKriteria1: parseInt(nilaiKriteria1),
        nilaiKriteria2: parseInt(nilaiKriteria2),
        nilaiKriteria3: parseInt(nilaiKriteria3),
        nilaiKriteria4: parseInt(nilaiKriteria4),
        nilaiTotal,
        rekomendasi,
        catatan: catatan || null,
      }
    })

    // Update proposal reviewer status to SELESAI
    await prisma.proposal_reviewer.update({
      where: { id: proposalReviewerId },
      data: { status: 'SELESAI' }
    })

    // TODO: Create notification for admin
    // await prisma.notification.create({
    //   data: {
    //     userId: 'admin-user-id',
    //     title: 'Review Baru',
    //     message: `Review untuk proposal "${proposalReviewer.proposal.judul}" telah selesai`,
    //     type: 'INFO',
    //     link: `/dashboard/proposals/${proposalReviewer.proposalId}`
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review berhasil disubmit'
    })
  } catch (error: any) {
    console.error('Submit review error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const nilaiTotal = formData.get('nilaiTotal') as string
    const rekomendasi = formData.get('rekomendasi') as string
    const catatan = formData.get('catatan') as string | null

    // Validate file upload
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File penilaian wajib diupload' },
        { status: 400 }
      )
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File harus berformat PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      )
    }

    // Validate nilaiTotal
    if (!nilaiTotal || isNaN(parseInt(nilaiTotal))) {
      return NextResponse.json(
        { success: false, error: 'Nilai total harus diisi' },
        { status: 400 }
      )
    }

    const score = parseInt(nilaiTotal)
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, error: 'Nilai harus antara 0-100' },
        { status: 400 }
      )
    }

    // Validate recommendation
    if (!['DITERIMA', 'REVISI', 'DITOLAK'].includes(rekomendasi)) {
      return NextResponse.json(
        { success: false, error: 'Rekomendasi tidak valid' },
        { status: 400 }
      )
    }

    // Save file
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const timestamp = Date.now()
    const fileName = `review-${proposalReviewerId}-${timestamp}.pdf`
    const filePath = join(uploadDir, fileName)
    const publicPath = `/uploads/reviews/${fileName}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create review
    const review = await prisma.review.create({
      data: {
        proposalReviewerId,
        reviewerId: reviewer.id,
        filePenilaian: publicPath,
        nilaiTotal: score,
        rekomendasi: rekomendasi as 'DITERIMA' | 'REVISI' | 'DITOLAK',
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

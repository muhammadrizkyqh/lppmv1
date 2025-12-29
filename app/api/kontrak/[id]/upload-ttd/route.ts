import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// PATCH /api/kontrak/:id/upload-ttd - Upload signed kontrak & SK (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(['ADMIN'])
    const { id } = await params

    const formData = await request.formData()
    const fileKontrak = formData.get('fileKontrak') as File | null
    const fileSK = formData.get('fileSK') as File | null

    if (!fileKontrak || !fileSK) {
      return NextResponse.json(
        { success: false, error: 'File kontrak dan SK yang sudah TTD harus diupload' },
        { status: 400 }
      )
    }

    // Validate file types
    if (fileKontrak.type !== 'application/pdf' || fileSK.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File harus berformat PDF' },
        { status: 400 }
      )
    }

    // Get kontrak
    const kontrak = await prisma.kontrak.findUnique({
      where: { id },
      include: {
        proposal: true
      }
    })

    if (!kontrak) {
      return NextResponse.json(
        { success: false, error: 'Kontrak tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kontrak')
    await mkdir(uploadDir, { recursive: true })

    // Save files
    const kontrakFileName = `kontrak-${id}-${Date.now()}.pdf`
    const skFileName = `sk-${id}-${Date.now()}.pdf`
    
    const kontrakPath = path.join(uploadDir, kontrakFileName)
    const skPath = path.join(uploadDir, skFileName)

    const kontrakBuffer = Buffer.from(await fileKontrak.arrayBuffer())
    const skBuffer = Buffer.from(await fileSK.arrayBuffer())

    await writeFile(kontrakPath, kontrakBuffer)
    await writeFile(skPath, skBuffer)

    const fileKontrakUrl = `/uploads/kontrak/${kontrakFileName}`
    const fileSKUrl = `/uploads/kontrak/${skFileName}`

    // Update kontrak with files and status
    const updatedKontrak = await prisma.$transaction(async (tx) => {
      // 1. Update kontrak
      const updated = await tx.kontrak.update({
        where: { id },
        data: {
          fileKontrak: fileKontrakUrl,
          fileSK: fileSKUrl,
          uploadedBy: session.id,
          uploadedAt: new Date(),
          status: 'SIGNED'
        },
        include: {
          proposal: true
        }
      })

      // 2. Update proposal status to BERJALAN (from DITERIMA)
      if (kontrak.proposal.status === 'DITERIMA') {
        await tx.proposal.update({
          where: { id: kontrak.proposalId },
          data: {
            status: 'BERJALAN'
          }
        })
      }

      // 3. Auto-create Termin 1 (50%) after kontrak signed (if not exists)
      const existingTermin1 = await tx.pencairan_dana.findFirst({
        where: {
          proposalId: kontrak.proposalId,
          termin: 'TERMIN_1'
        }
      })

      if (!existingTermin1) {
        const danaHibah = Number((updated.proposal as any).danaDisetujui || 0)
        const nominalTermin1 = danaHibah * 0.5

        await tx.pencairan_dana.create({
          data: {
            proposalId: kontrak.proposalId,
            termin: 'TERMIN_1',
            nominal: nominalTermin1,
            persentase: 50,
            status: 'PENDING',
            keterangan: 'Pencairan otomatis setelah kontrak ditandatangani',
            createdBy: session.id,
          }
        })
      }

      return updated
    })

    // TODO: Create notification for dosen
    // await prisma.notification.create({
    //   data: {
    //     userId: kontrak.proposal.creatorId,
    //     title: 'Kontrak Penelitian Tersedia',
    //     message: `Kontrak penelitian untuk "${kontrak.proposal.judul}" sudah dapat diunduh`,
    //     type: 'SUCCESS',
    //     link: `/dosen/kontrak/${id}`
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: updatedKontrak,
      message: 'Kontrak dan SK berhasil diupload. Proposal status diubah ke BERJALAN'
    })
  } catch (error: any) {
    console.error('Upload TTD error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

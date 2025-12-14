import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// POST /api/luaran/[id]/upload - Upload bukti luaran
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    // Get luaran
    const luaran = await prisma.luaran.findUnique({
      where: { id: params.id },
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

    // Check permission (Admin or ketua)
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

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('fileBukti') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File bukti wajib diupload' },
        { status: 400 }
      )
    }

    // Validate file type (PDF or images)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File harus berformat PDF atau gambar (JPEG/PNG)' },
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

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'luaran')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const fileName = `${params.id}_${Date.now()}.${ext}`
    const filePath = join(uploadDir, fileName)

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Update luaran with file path
    const fileUrl = `/uploads/luaran/${fileName}`
    const updated = await prisma.luaran.update({
      where: { id: params.id },
      data: {
        fileBukti: fileUrl,
      },
      include: {
        proposal: {
          select: {
            judul: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Bukti luaran berhasil diupload'
    })
  } catch (error) {
    console.error('Upload bukti luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

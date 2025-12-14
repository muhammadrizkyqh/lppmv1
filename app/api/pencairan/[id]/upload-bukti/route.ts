import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST /api/pencairan/[id]/upload-bukti - Upload bukti transfer (Admin only)
export async function POST(
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
    const formData = await request.formData()
    const file = formData.get('fileBukti') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File bukti wajib diupload' },
        { status: 400 }
      )
    }

    // Validate file type (PDF or images)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa PDF atau gambar (JPG/PNG)' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    const pencairan = await prisma.pencairan_dana.findUnique({
      where: { id }
    })

    if (!pencairan) {
      return NextResponse.json(
        { success: false, error: 'Pencairan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pencairan')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const fileExt = path.extname(file.name)
    const fileName = `bukti-${id}-${Date.now()}${fileExt}`
    const filePath = path.join(uploadDir, fileName)

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Update pencairan with file URL
    const fileUrl = `/uploads/pencairan/${fileName}`
    
    const updated = await prisma.pencairan_dana.update({
      where: { id },
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
      message: 'Bukti transfer berhasil diupload'
    })
  } catch (error) {
    console.error('Upload bukti transfer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

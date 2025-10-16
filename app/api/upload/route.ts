import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// POST - Upload file (PDF proposal)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const periodeId = formData.get('periodeId') as string
    const proposalId = formData.get('proposalId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate file type (must be PDF)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File harus berformat PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      )
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'proposals', periodeId || 'temp')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${proposalId || timestamp}_${sanitizedName}`
    const filePath = path.join(uploadDir, fileName)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const fileUrl = `/uploads/proposals/${periodeId || 'temp'}/${fileName}`

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        filePath: fileUrl,
        fileSize: file.size,
      },
      message: 'File berhasil diupload',
    })
  } catch (error: any) {
    console.error('Upload error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mengupload file' },
      { status: 500 }
    )
  }
}

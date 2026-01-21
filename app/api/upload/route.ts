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
    const type = formData.get('type') as string // 'proposal', 'luaran', 'monitoring', etc
    const periodeId = formData.get('periodeId') as string
    const proposalId = formData.get('proposalId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate file type based on upload type
    const allowedTypes: Record<string, string[]> = {
      proposal: ['application/pdf'],
      luaran: ['application/pdf', 'image/jpeg', 'image/png'],
      monitoring: ['application/pdf'],
      default: ['application/pdf']
    }

    const validTypes = allowedTypes[type || 'default'] || allowedTypes.default
    if (!validTypes.includes(file.type)) {
      const typeNames = validTypes.map(t => {
        if (t === 'application/pdf') return 'PDF'
        if (t === 'image/jpeg') return 'JPG'
        if (t === 'image/png') return 'PNG'
        return t
      }).join(', ')
      
      return NextResponse.json(
        { success: false, error: `File harus berformat ${typeNames}` },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const formatFileSize = (bytes: number) => {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File terlalu besar (${formatFileSize(file.size)}). Maksimal ${formatFileSize(maxSize)}. Silakan kompres file Anda terlebih dahulu.` 
        },
        { status: 400 }
      )
    }

    // Determine upload directory based on type
    let uploadDir: string
    let fileUrl: string
    
    if (type === 'luaran') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'luaran')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileExt = path.extname(file.name)
      const sanitizedName = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${proposalId || timestamp}_${sanitizedName}${fileExt}`
      const filePath = path.join(uploadDir, fileName)

      // Write file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      fileUrl = `/uploads/luaran/${fileName}`
      
      return NextResponse.json({
        success: true,
        fileName: fileName,
        filePath: fileUrl,
        fileSize: file.size,
        message: 'File berhasil diupload',
      })
    } else {
      // Default: proposal upload
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'proposals', periodeId || 'temp')
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

      fileUrl = `/uploads/proposals/${periodeId || 'temp'}/${fileName}`
      
      return NextResponse.json({
        success: true,
        data: {
          fileName: file.name,
          filePath: fileUrl,
          fileSize: file.size,
        },
        message: 'File berhasil diupload',
      })
    }
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

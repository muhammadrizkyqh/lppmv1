import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// POST /api/reviewer/bulk - Bulk import reviewer from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat import data reviewer' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rows } = body

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data rows tidak valid' },
        { status: 400 }
      )
    }

    const results = {
      total: rows.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; data: any; error: string }>
    }

    // Get all bidang keahlian untuk mapping
    const bidangKeahlianList = await prisma.bidangkeahlian.findMany({
      where: { status: 'AKTIF' }
    })
    const bidangKeahlianMap = new Map(
      bidangKeahlianList.map(bk => [bk.nama.toLowerCase(), bk.id])
    )

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        // Validasi field wajib
        if (!row.nama || !row.email || !row.institusi) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Nama, Email, dan Institusi wajib diisi'
          })
          continue
        }

        // Validasi tipe (INTERNAL/EKSTERNAL)
        const tipe = row.tipe?.toUpperCase()
        if (!tipe || !['INTERNAL', 'EKSTERNAL'].includes(tipe)) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Tipe harus INTERNAL atau EKSTERNAL'
          })
          continue
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.email)) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Format email tidak valid'
          })
          continue
        }

        // Check if email already exists
        const existingReviewer = await prisma.reviewer.findFirst({
          where: { email: row.email }
        })

        if (existingReviewer) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Email sudah terdaftar'
          })
          continue
        }

        // Generate username from email (before @)
        const username = row.email.split('@')[0]

        // Check if username already exists
        const existingUser = await prisma.user.findFirst({
          where: { username }
        })

        if (existingUser) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: `Username (${username}) sudah terdaftar`
          })
          continue
        }

        // Find bidang keahlian ID if specified
        let bidangKeahlianId: string | null = null
        if (row.bidangKeahlian && typeof row.bidangKeahlian === 'string') {
          bidangKeahlianId = bidangKeahlianMap.get(row.bidangKeahlian.toLowerCase()) || null
        }

        // Create user and reviewer in transaction
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              username,
              email: row.email,
              password: hashedPassword,
              role: 'REVIEWER'
            }
          })

          await tx.reviewer.create({
            data: {
              userId: user.id,
              nama: row.nama,
              email: row.email,
              institusi: row.institusi,
              bidangKeahlianId: bidangKeahlianId,
              tipe: tipe as 'INTERNAL' | 'EKSTERNAL',
              status: row.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF'
            }
          })
        })

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          row: i + 1,
          data: row,
          error: error.message || 'Gagal menyimpan data'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import selesai. Berhasil: ${results.success}, Gagal: ${results.failed}`,
      data: results
    })
  } catch (error: any) {
    console.error('Bulk import reviewer error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// POST /api/mahasiswa/bulk - Bulk import mahasiswa from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat import data mahasiswa' },
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

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        // Validasi field wajib
        if (!row.nim || !row.nama || !row.email) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'NIM, Nama, dan Email wajib diisi'
          })
          continue
        }

        // Validasi prodi wajib
        if (!row.prodi) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Program Studi wajib diisi'
          })
          continue
        }

        // Validasi angkatan wajib
        if (!row.angkatan) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Angkatan wajib diisi'
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

        // Check if NIM or email already exists
        const existingMahasiswa = await prisma.mahasiswa.findFirst({
          where: {
            OR: [
              { nim: row.nim },
              { email: row.email }
            ]
          }
        })

        if (existingMahasiswa) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: `NIM atau Email sudah terdaftar (${existingMahasiswa.nim === row.nim ? 'NIM' : 'Email'} duplikat)`
          })
          continue
        }

        // Check if username already exists
        const existingUser = await prisma.user.findFirst({
          where: { username: row.nim }
        })

        if (existingUser) {
          results.failed++
          results.errors.push({
            row: i + 1,
            data: row,
            error: 'Username (NIM) sudah terdaftar'
          })
          continue
        }

        // Create user and mahasiswa in transaction
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              username: row.nim,
              email: row.email,
              password: hashedPassword,
              role: 'MAHASISWA'
            }
          })

          await tx.mahasiswa.create({
            data: {
              userId: user.id,
              nim: row.nim,
              nama: row.nama,
              email: row.email,
              prodi: row.prodi,
              angkatan: row.angkatan,
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
    console.error('Bulk import mahasiswa error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

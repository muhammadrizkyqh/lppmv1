import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'

// GET /api/mahasiswa/:id - Get mahasiswa by ID
export async function GET(
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

    const { id } = await params
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            lastLogin: true,
          },
        },
      },
    })

    if (!mahasiswa) {
      return NextResponse.json(
        { success: false, error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mahasiswa,
    })
  } catch (error) {
    console.error('Error fetching mahasiswa:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT /api/mahasiswa/:id - Update mahasiswa
export async function PUT(
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

    const { id } = await params
    // Only ADMIN can update mahasiswa data
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can update mahasiswa' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nim, nama, email, prodi, angkatan, status, password } = body

    // Check if mahasiswa exists
    const existingMahasiswa = await prisma.mahasiswa.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingMahasiswa) {
      return NextResponse.json(
        { success: false, error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already used
    if (email && email !== existingMahasiswa.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists && emailExists.id !== existingMahasiswa.userId) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Check if NIM is being changed and if it's already used
    if (nim && nim !== existingMahasiswa.nim) {
      const nimExists = await prisma.mahasiswa.findUnique({
        where: { nim },
      })

      if (nimExists && nimExists.id !== id) {
        return NextResponse.json(
          { success: false, error: 'NIM sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update mahasiswa and user in a transaction
    const updatedMahasiswa = await prisma.$transaction(async (tx: any) => {
      // Prepare user update data
      const userUpdateData: any = {}
      
      if (email) {
        userUpdateData.email = email
        userUpdateData.username = email
      }
      if (status) userUpdateData.status = status
      
      // Hash password if provided
      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10)
        userUpdateData.password = hashedPassword
      }
      
      // Update user data if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingMahasiswa.userId },
          data: userUpdateData,
        })
      }

      // Update mahasiswa data
      return await tx.mahasiswa.update({
        where: { id },
        data: {
          ...(nim && { nim }),
          ...(nama && { nama }),
          ...(email && { email }),
          ...(prodi && { prodi }),
          ...(angkatan && { angkatan }),
          ...(status && { status }),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
              lastLogin: true,
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: updatedMahasiswa,
      message: 'Mahasiswa berhasil diupdate',
    })
  } catch (error) {
    console.error('Error updating mahasiswa:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE /api/mahasiswa/:id - Delete mahasiswa
export async function DELETE(
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

    const { id } = await params
    // Only ADMIN can delete mahasiswa
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can delete mahasiswa' },
        { status: 403 }
      )
    }

    // Check if mahasiswa exists
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            proposalmember: true,
          },
        },
      },
    })

    if (!mahasiswa) {
      return NextResponse.json(
        { success: false, error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if mahasiswa has proposal members
    if (mahasiswa._count.proposalmember > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Mahasiswa terdaftar di ${mahasiswa._count.proposalmember} proposal. Hapus dari proposal terlebih dahulu.`,
        },
        { status: 400 }
      )
    }

    // Delete mahasiswa and user in transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete mahasiswa first
      await tx.mahasiswa.delete({
        where: { id },
      })

      // Then delete the associated user
      await tx.user.delete({
        where: { id: mahasiswa.userId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Mahasiswa berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting mahasiswa:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

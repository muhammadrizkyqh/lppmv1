import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/kontrak/:id - Get kontrak detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const kontrak = await prisma.kontrak.findUnique({
      where: { id },
      include: {
        proposal: {
          include: {
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true,
                email: true
              }
            },
            skema: {
              select: {
                id: true,
                nama: true,
                tipe: true,
                dana: true
              }
            },
            periode: {
              select: {
                id: true,
                nama: true,
                tahun: true,
                tanggalBuka: true,
                tanggalTutup: true
              }
            },
            members: {
              include: {
                dosen: {
                  select: {
                    id: true,
                    nama: true,
                    nidn: true,
                    email: true
                  }
                },
                mahasiswa: {
                  select: {
                    id: true,
                    nama: true,
                    nim: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        uploader: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    if (!kontrak) {
      return NextResponse.json(
        { success: false, error: 'Kontrak tidak ditemukan' },
        { status: 404 }
      )
    }

    // Authorization: Admin can see all, Dosen can only see their own
    if (session.role === 'DOSEN' && kontrak.proposal.creatorId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: kontrak
    })
  } catch (error: any) {
    console.error('Get kontrak detail error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PATCH /api/kontrak/:id - Update kontrak status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status harus diisi' },
        { status: 400 }
      )
    }

    const validStatuses = ['DRAFT', 'SIGNED', 'AKTIF', 'SELESAI']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    const kontrak = await prisma.kontrak.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      data: kontrak,
      message: 'Status kontrak berhasil diupdate'
    })
  } catch (error: any) {
    console.error('Update kontrak error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/proposal/:id/members - Get proposal members
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

    const members = await prisma.proposalmember.findMany({
      where: { proposalId: id },
      include: {
        dosen: {
          select: {
            id: true,
            nidn: true,
            nama: true,
            email: true,
            bidangKeahlianId: true,
            bidangkeahlian: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        mahasiswa: {
          select: {
            id: true,
            nim: true,
            nama: true,
            email: true,
            prodi: true,
            angkatan: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error: any) {
    console.error('Get members error:', error)

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

// POST /api/proposal/:id/members - Add member to proposal
export async function POST(
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

    const body = await request.json()
    const { dosenId, mahasiswaId, role } = body

    // Must provide either dosenId or mahasiswaId
    if (!dosenId && !mahasiswaId) {
      return NextResponse.json(
        { success: false, error: 'Dosen atau mahasiswa harus dipilih' },
        { status: 400 }
      )
    }

    // Check if proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            proposalmember: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Access control: Only creator can add members
    if (proposal.creatorId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Anda tidak dapat menambah anggota' },
        { status: 403 }
      )
    }

    // Cannot add members if proposal already submitted
    if (proposal.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menambah anggota pada proposal yang sudah disubmit' },
        { status: 400 }
      )
    }

    // Validate maximum members (4 including ketua)
    if (proposal._count.proposalmember >= 4) {
      return NextResponse.json(
        { success: false, error: 'Maksimal 4 anggota tim (termasuk ketua)' },
        { status: 400 }
      )
    }

    // Check if member already exists in this proposal
    const existingMember = await prisma.proposalmember.findFirst({
      where: {
        proposalId: id,
        OR: [
          { dosenId: dosenId || undefined },
          { mahasiswaId: mahasiswaId || undefined },
        ],
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Anggota sudah terdaftar dalam proposal ini' },
        { status: 400 }
      )
    }

    // Create member
    const member = await prisma.proposalmember.create({
      data: {
        id: crypto.randomUUID(),
        proposalId: id,
        dosenId,
        mahasiswaId,
        role: role || 'Anggota',
      },
      include: {
        dosen: {
          select: {
            id: true,
            nidn: true,
            nama: true,
            email: true,
          },
        },
        mahasiswa: {
          select: {
            id: true,
            nim: true,
            nama: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: member,
        message: 'Anggota berhasil ditambahkan',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Add member error:', error)

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

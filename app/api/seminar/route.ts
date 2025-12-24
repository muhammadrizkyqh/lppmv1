import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/seminar - List all seminars (Admin/Dosen)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis') || '' // PROPOSAL, INTERNAL, PUBLIK
    const status = searchParams.get('status') || ''
    const proposalId = searchParams.get('proposalId') || ''

    const where: any = {}

    if (jenis) {
      where.jenis = jenis
    }

    if (status) {
      where.status = status
    }

    if (proposalId) {
      where.proposalId = proposalId
    }

    // Dosen only see their own proposals' seminars
    if (session.role === 'DOSEN') {
      const dosen = await prisma.dosen.findFirst({
        where: { userId: session.id }
      })
      
      if (dosen) {
        where.proposal = {
          ketuaId: dosen.id
        }
      }
    }

    const seminars = await prisma.seminar.findMany({
      where,
      orderBy: { tanggal: 'desc' },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true,
              }
            },
            skema: {
              select: {
                nama: true,
                tipe: true,
              }
            },
            periode: {
              select: {
                tahun: true,
                nama: true,
              }
            }
          }
        },
        seminar_peserta: {
          select: {
            id: true,
            nama: true,
            institusi: true,
            hadir: true,
          }
        },
      }
    })

    // Calculate stats
    const stats = {
      total: seminars.length,
      scheduled: seminars.filter(s => s.status === 'SCHEDULED').length,
      selesai: seminars.filter(s => s.status === 'SELESAI').length,
      dibatalkan: seminars.filter(s => s.status === 'DIBATALKAN').length,
    }

    return NextResponse.json({
      success: true,
      data: seminars,
      // Stats available but not in main data
    })

  } catch (error) {
    console.error('Get seminar list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/seminar - Jadwalkan seminar (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const roleCheck = await requireRole(['ADMIN'])
    
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat menjadwalkan seminar' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      proposalId,
      jenis, // Only PROPOSAL allowed now
      tanggal,
      waktu,
      tempat,
      moderator,
      linkOnline,
      keterangan,
    } = body

    // Validate required fields only
    if (!proposalId || !jenis || !tanggal || !waktu) {
      return NextResponse.json(
        { success: false, error: 'Proposal, jenis, tanggal, dan waktu wajib diisi' },
        { status: 400 }
      )
    }

    // Validate jenis - only PROPOSAL allowed
    if (jenis !== 'PROPOSAL') {
      return NextResponse.json(
        { success: false, error: 'Hanya seminar proposal yang diperbolehkan' },
        { status: 400 }
      )
    }

    // Validate proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        dosen: true,
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // Business logic validation: harus sudah LOLOS penilaian administratif
    if (proposal.statusAdministrasi !== 'LOLOS') {
      return NextResponse.json({
        success: false,
        error: 'Seminar proposal hanya bisa dijadwalkan setelah lolos penilaian administratif'
      }, { status: 400 })
    }

    // Create seminar - hanya field yang pasti ada untuk compatibility VPS
    const seminar = await prisma.seminar.create({
      data: {
        proposalId,
        jenis,
        judul: proposal.judul,
        tanggal: new Date(tanggal),
        waktu,
        tempat: tempat || '',
        status: 'SCHEDULED',
      },
      include: {
        proposal: {
          select: {
            judul: true,
            dosen: {
              select: {
                nama: true,
                email: true,
              }
            }
          }
        }
      }
    })

    // Update proposal deadline if seminar proposal
    if (jenis === 'PROPOSAL') {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          deadlineSeminarProposal: new Date(tanggal),
        }
      })
    }

    // TODO: Send notification to dosen
    // await prisma.notification.create({
    //   data: {
    //     userId: proposal.ketua.userId,
    //     title: `Seminar ${jenis} Dijadwalkan`,
    //     message: `Seminar ${jenis.toLowerCase()} untuk proposal "${proposal.judul}" dijadwalkan pada ${tanggal} di ${tempat}`,
    //     type: 'INFO',
    //     link: `/dosen/proposals/${proposalId}`,
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Seminar berhasil dijadwalkan',
      data: seminar,
    })

  } catch (error: any) {
    console.error('Create seminar error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

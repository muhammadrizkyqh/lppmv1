import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/luaran - List all luaran (Admin) or by proposal (Dosen)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jenis = searchParams.get('jenis')
    const periodeId = searchParams.get('periodeId')
    const search = searchParams.get('search')

    const where: any = {}

    // Admin bisa lihat semua, Dosen hanya luaran proposalnya
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

    if (status) {
      where.statusVerifikasi = status
    }

    if (jenis) {
      where.jenis = jenis
    }

    if (periodeId) {
      where.proposal = {
        ...where.proposal,
        periodeId: periodeId
      }
    }

    if (search) {
      where.OR = [
        { judul: { contains: search } },
        { penerbit: { contains: search } }
      ]
    }

    const luaran = await prisma.luaran.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            status: true,
            periode: {
              select: {
                id: true,
                nama: true,
                tahun: true,
              }
            },
            dosen: {
              select: {
                id: true,
                nama: true,
                nidn: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })

    // Calculate stats
    const stats = {
      total: luaran.length,
      pending: luaran.filter((l: any) => l.statusVerifikasi === 'PENDING').length,
      diverifikasi: luaran.filter((l: any) => l.statusVerifikasi === 'DIVERIFIKASI').length,
      ditolak: luaran.filter((l: any) => l.statusVerifikasi === 'DITOLAK').length,
    }

    return NextResponse.json({
      success: true,
      data: luaran,
      stats,
    })
  } catch (error) {
    console.error('Get luaran list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/luaran - Submit luaran (Dosen only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'DOSEN') {
      return NextResponse.json(
        { success: false, error: 'Hanya dosen yang bisa submit luaran' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { proposalId, jenis, judul, penerbit, tahunTerbit, url, keterangan } = body

    // Validate required fields
    if (!proposalId || !jenis || !judul) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID, jenis, dan judul wajib diisi' },
        { status: 400 }
      )
    }

    // Validate proposal exists and user is the ketua
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        skema: true,  // Include skema to check type
        monitoring: {
          where: {
            verifikasiAkhirStatus: 'APPROVED'
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    // ========== VALIDASI JENIS LUARAN SESUAI TIPE PENELITIAN (SESUAI BUKU PANDUAN) ==========
    // Penelitian DASAR atau TERAPAN: Hanya boleh JURNAL, BUKU, HAKI (paten)
    // Penelitian PENGEMBANGAN: Semua boleh (termasuk PRODUK)
    if (proposal.skema.tipe === 'DASAR' || proposal.skema.tipe === 'TERAPAN') {
      if (jenis === 'PRODUK') {
        return NextResponse.json({
          success: false,
          error: 'Penelitian Dasar/Terapan hanya boleh luaran: Jurnal, Buku, atau HAKI (Paten). Produk hanya untuk penelitian Pengembangan.'
        }, { status: 400 })
      }
      
      // MEDIA_MASSA dan LAINNYA tidak sesuai standar buku panduan
      if (jenis === 'MEDIA_MASSA' || jenis === 'LAINNYA') {
        return NextResponse.json({
          success: false,
          error: 'Luaran penelitian Dasar/Terapan harus sesuai standar: Jurnal SINTA 1-6, Buku ber-ISBN, atau HAKI/Paten.'
        }, { status: 400 })
      }
    }
    
    if (proposal.skema.tipe === 'PENGEMBANGAN') {
      // PENGEMBANGAN: Produk adalah salah satu luaran utama (sesuai panduan)
      // Boleh juga JURNAL, BUKU, HAKI
      // MEDIA_MASSA dan LAINNYA tetap tidak sesuai standar
      if (jenis === 'MEDIA_MASSA' || jenis === 'LAINNYA') {
        return NextResponse.json({
          success: false,
          error: 'Luaran penelitian Pengembangan harus: Produk/Aplikasi, Jurnal SINTA, Buku ber-ISBN, atau HAKI/Paten.'
        }, { status: 400 })
      }
    }

    // Check if user is ketua
    const dosen = await prisma.dosen.findFirst({
      where: { userId: session.id }
    })
    if (!dosen || proposal.ketuaId !== dosen.id) {
      return NextResponse.json(
        { success: false, error: 'Hanya ketua penelitian yang bisa submit luaran' },
        { status: 403 }
      )
    }

    // Check proposal status (must be BERJALAN or SELESAI)
    if (!['BERJALAN', 'SELESAI'].includes(proposal.status)) {
      return NextResponse.json(
        { success: false, error: 'Proposal belum dalam tahap berjalan' },
        { status: 400 }
      )
    }

    // Check if laporan akhir is approved
    if (proposal.monitoring.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Laporan akhir harus diverifikasi terlebih dahulu' },
        { status: 400 }
      )
    }

    // Create luaran
    const luaran = await prisma.luaran.create({
      data: {
        proposalId,
        jenis,
        judul,
        penerbit,
        tahunTerbit,
        url,
        keterangan,
        statusVerifikasi: 'PENDING',
      },
      include: {
        proposal: {
          select: {
            judul: true,
            dosen: {
              select: {
                nama: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: luaran,
      message: 'Luaran berhasil disubmit'
    })
  } catch (error) {
    console.error('Create luaran error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

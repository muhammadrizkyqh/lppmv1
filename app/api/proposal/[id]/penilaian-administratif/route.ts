import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/proposal/:id/penilaian-administratif - Admin check kelengkapan proposal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const roleCheck = await requireRole(['ADMIN'])
    
    if (!roleCheck) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat melakukan penilaian administratif' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      statusAdministrasi, // LOLOS | TIDAK_LOLOS
      catatanAdministrasi,
      checklist, // Object berisi 14 checkbox
    } = body

    // Validate required
    if (!statusAdministrasi) {
      return NextResponse.json(
        { success: false, error: 'Status administratif harus dipilih' },
        { status: 400 }
      )
    }

    if (statusAdministrasi === 'TIDAK_LOLOS' && !catatanAdministrasi) {
      return NextResponse.json(
        { success: false, error: 'Catatan revisi wajib diisi jika tidak lolos' },
        { status: 400 }
      )
    }

    // Get proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id },
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

    // Only allow for DIAJUKAN status
    if (proposal.status !== 'DIAJUKAN') {
      return NextResponse.json(
        { success: false, error: 'Penilaian administratif hanya untuk proposal yang sudah diajukan' },
        { status: 400 }
      )
    }

    // Update proposal with administratif check
    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        statusAdministrasi,
        catatanAdministrasi,
        checkedAdminBy: session.id,
        checkedAdminAt: new Date(),
        
        // Update checklist (14 komponen sesuai buku panduan)
        checkJudul: checklist?.checkJudul || false,
        checkLatarBelakang: checklist?.checkLatarBelakang || false,
        checkRumusanMasalah: checklist?.checkRumusanMasalah || false,
        checkTujuan: checklist?.checkTujuan || false,
        checkManfaat: checklist?.checkManfaat || false,
        checkKajianTerdahulu: checklist?.checkKajianTerdahulu || false,
        checkTinjauanPustaka: checklist?.checkTinjauanPustaka || false,
        checkKonsepTeori: checklist?.checkKonsepTeori || false,
        checkMetodologi: checklist?.checkMetodologi || false,
        checkRencanaPembahasan: checklist?.checkRencanaPembahasan || false,
        checkWaktuPelaksanaan: checklist?.checkWaktuPelaksanaan || false,
        checkRencanaPublikasi: checklist?.checkRencanaPublikasi || false,
        checkDaftarPustaka: checklist?.checkDaftarPustaka || false,
        checkLampiran: checklist?.checkLampiran || false,
        
        // Jika LOLOS, tetap DIAJUKAN (admin lanjut jadwalkan seminar proposal)
        // Jika TIDAK_LOLOS, status berubah ke REVISI (dosen harus revisi)
        status: statusAdministrasi === 'LOLOS' ? 'DIAJUKAN' : 'REVISI',
      },
      include: {
        dosen: {
          select: {
            nama: true,
            email: true,
          }
        }
      }
    })

    // TODO: Send notification to dosen
    // if (statusAdministrasi === 'TIDAK_LOLOS') {
    //   await prisma.notification.create({
    //     data: {
    //       userId: proposal.ketua.userId,
    //       title: 'Proposal Perlu Revisi Administratif',
    //       message: `Proposal "${proposal.judul}" perlu perbaikan administratif. ${catatanAdministrasi}`,
    //       type: 'WARNING',
    //       link: `/dosen/proposals/${id}`,
    //     }
    //   })
    // }

    return NextResponse.json({
      success: true,
      message: statusAdministrasi === 'LOLOS' 
        ? 'Penilaian administratif LOLOS. Silakan jadwalkan seminar proposal untuk proposal ini.'
        : 'Proposal dikembalikan untuk revisi administratif. Dosen harus upload file revisi.',
      data: updated,
    })

  } catch (error) {
    console.error('Penilaian administratif error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/proposal/:id/penilaian-administratif - Get status penilaian
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: {
        id: true,
        judul: true,
        statusAdministrasi: true,
        catatanAdministrasi: true,
        checkedAdminBy: true,
        checkedAdminAt: true,
        checkJudul: true,
        checkLatarBelakang: true,
        checkRumusanMasalah: true,
        checkTujuan: true,
        checkManfaat: true,
        checkKajianTerdahulu: true,
        checkTinjauanPustaka: true,
        checkKonsepTeori: true,
        checkMetodologi: true,
        checkRencanaPembahasan: true,
        checkWaktuPelaksanaan: true,
        checkRencanaPublikasi: true,
        checkDaftarPustaka: true,
        checkLampiran: true,
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: proposal,
    })

  } catch (error) {
    console.error('Get penilaian administratif error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

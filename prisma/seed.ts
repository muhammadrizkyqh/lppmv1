import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Clear existing data (optional - hati-hati di production!)
  console.log('🗑️  Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.monitoring.deleteMany()
  await prisma.review.deleteMany()
  await prisma.proposalRevision.deleteMany()
  await prisma.proposalMember.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.dosen.deleteMany()
  await prisma.mahasiswa.deleteMany()
  await prisma.reviewer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.periode.deleteMany()
  await prisma.skema.deleteMany()
  await prisma.bidangKeahlian.deleteMany()

  // Hash password default
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1. Bidang Keahlian
  console.log('📚 Creating Bidang Keahlian...')
  const bidangPBA = await prisma.bidangKeahlian.create({
    data: {
      nama: 'Pendidikan Bahasa Arab',
      deskripsi: 'Bidang keahlian pendidikan bahasa Arab',
    },
  })

  const bidangPI = await prisma.bidangKeahlian.create({
    data: {
      nama: 'Pendidikan Islam',
      deskripsi: 'Bidang keahlian pendidikan Islam',
    },
  })

  const bidangHES = await prisma.bidangKeahlian.create({
    data: {
      nama: 'Hukum Ekonomi Syariah',
      deskripsi: 'Bidang keahlian hukum ekonomi syariah',
    },
  })

  // 2. Skema Penelitian
  console.log('💰 Creating Skema...')
  await prisma.skema.createMany({
    data: [
      {
        nama: 'Penelitian Dasar',
        tipe: 'DASAR',
        dana: 5000000,
        deskripsi: 'Penelitian dasar dengan dana Rp 5.000.000',
      },
      {
        nama: 'Penelitian Terapan',
        tipe: 'TERAPAN',
        dana: 5000000,
        deskripsi: 'Penelitian terapan dengan dana Rp 5.000.000',
      },
      {
        nama: 'Penelitian Pengembangan',
        tipe: 'PENGEMBANGAN',
        dana: 7000000,
        deskripsi: 'Penelitian pengembangan dengan dana Rp 7.000.000',
      },
      {
        nama: 'Penelitian Mandiri',
        tipe: 'MANDIRI',
        dana: 0,
        deskripsi: 'Penelitian mandiri tanpa dana',
      },
    ],
  })

  // 3. Periode
  console.log('📅 Creating Periode...')
  const periode2025 = await prisma.periode.create({
    data: {
      tahun: '2025',
      nama: 'Periode Penelitian 2025',
      tanggalBuka: new Date('2025-01-01'),
      tanggalTutup: new Date('2025-03-31'),
      kuota: 50,
      status: 'AKTIF',
    },
  })

  await prisma.periode.create({
    data: {
      tahun: '2024',
      nama: 'Periode Penelitian 2024',
      tanggalBuka: new Date('2024-01-01'),
      tanggalTutup: new Date('2024-12-31'),
      kuota: 40,
      status: 'SELESAI',
    },
  })

  // 4. Admin User
  console.log('👤 Creating Admin...')
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@stai-ali.ac.id',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'AKTIF',
      mustChangePassword: false,
    },
  })

  // 5. Dosen Users
  console.log('👨‍🏫 Creating Dosen...')
  const dosen1User = await prisma.user.create({
    data: {
      username: 'dosen1',
      email: 'ahmad.dosen@stai-ali.ac.id',
      password: hashedPassword,
      role: 'DOSEN',
      status: 'AKTIF',
    },
  })

  const dosen1 = await prisma.dosen.create({
    data: {
      userId: dosen1User.id,
      nidn: '0101018901',
      nama: 'Dr. Ahmad Fauzi, M.Pd.I',
      email: 'ahmad.dosen@stai-ali.ac.id',
      noHp: '081234567890',
      bidangKeahlianId: bidangPBA.id,
    },
  })

  const dosen2User = await prisma.user.create({
    data: {
      username: 'dosen2',
      email: 'siti.dosen@stai-ali.ac.id',
      password: hashedPassword,
      role: 'DOSEN',
      status: 'AKTIF',
    },
  })

  const dosen2 = await prisma.dosen.create({
    data: {
      userId: dosen2User.id,
      nidn: '0202029002',
      nama: 'Dr. Siti Aminah, M.Pd',
      email: 'siti.dosen@stai-ali.ac.id',
      noHp: '081234567891',
      bidangKeahlianId: bidangPI.id,
    },
  })

  const dosen3User = await prisma.user.create({
    data: {
      username: 'dosen3',
      email: 'muhammad.dosen@stai-ali.ac.id',
      password: hashedPassword,
      role: 'DOSEN',
      status: 'AKTIF',
    },
  })

  const dosen3 = await prisma.dosen.create({
    data: {
      userId: dosen3User.id,
      nidn: '0303039103',
      nama: 'Muhammad Rizki, M.E.I',
      email: 'muhammad.dosen@stai-ali.ac.id',
      noHp: '081234567892',
      bidangKeahlianId: bidangHES.id,
    },
  })

  // 6. Mahasiswa Users
  console.log('👨‍🎓 Creating Mahasiswa...')
  const mhs1User = await prisma.user.create({
    data: {
      username: 'mhs1',
      email: 'ali.mahasiswa@student.stai-ali.ac.id',
      password: hashedPassword,
      role: 'MAHASISWA',
      status: 'AKTIF',
    },
  })

  const mhs1 = await prisma.mahasiswa.create({
    data: {
      userId: mhs1User.id,
      nim: '2021010001',
      nama: 'Ali Akbar',
      email: 'ali.mahasiswa@student.stai-ali.ac.id',
      prodi: 'Pendidikan Bahasa Arab',
      angkatan: '2021',
    },
  })

  const mhs2User = await prisma.user.create({
    data: {
      username: 'mhs2',
      email: 'fatimah.mahasiswa@student.stai-ali.ac.id',
      password: hashedPassword,
      role: 'MAHASISWA',
      status: 'AKTIF',
    },
  })

  const mhs2 = await prisma.mahasiswa.create({
    data: {
      userId: mhs2User.id,
      nim: '2021010002',
      nama: 'Fatimah Zahra',
      email: 'fatimah.mahasiswa@student.stai-ali.ac.id',
      prodi: 'Pendidikan Islam',
      angkatan: '2021',
    },
  })

  // 7. Reviewer Users
  console.log('🔍 Creating Reviewers...')
  const reviewer1User = await prisma.user.create({
    data: {
      username: 'reviewer1',
      email: 'reviewer1@stai-ali.ac.id',
      password: hashedPassword,
      role: 'REVIEWER',
      status: 'AKTIF',
    },
  })

  await prisma.reviewer.create({
    data: {
      userId: reviewer1User.id,
      nama: 'Prof. Dr. Abdul Rahman',
      email: 'reviewer1@stai-ali.ac.id',
      institusi: 'STAI Ali',
      bidangKeahlianId: bidangPBA.id,
      tipe: 'INTERNAL',
    },
  })

  const reviewer2User = await prisma.user.create({
    data: {
      username: 'reviewer2',
      email: 'reviewer2@external.ac.id',
      password: hashedPassword,
      role: 'REVIEWER',
      status: 'AKTIF',
    },
  })

  await prisma.reviewer.create({
    data: {
      userId: reviewer2User.id,
      nama: 'Dr. Hasan Basri',
      email: 'reviewer2@external.ac.id',
      institusi: 'UIN Jakarta',
      bidangKeahlianId: bidangPI.id,
      tipe: 'EKSTERNAL',
    },
  })

  // 8. Sample Proposals
  console.log('📄 Creating Sample Proposals...')
  const skemaDasar = await prisma.skema.findFirst({ where: { tipe: 'DASAR' } })
  const skemaTerapan = await prisma.skema.findFirst({ where: { tipe: 'TERAPAN' } })

  if (skemaDasar && skemaTerapan) {
    // Proposal 1 - Disetujui
    const proposal1 = await prisma.proposal.create({
      data: {
        periodeId: periode2025.id,
        skemaId: skemaDasar.id,
        ketuaId: dosen1.id,
        creatorId: dosen1User.id,
        bidangKeahlianId: bidangPBA.id,
        judul: 'Pengembangan Media Pembelajaran Bahasa Arab Berbasis Teknologi Digital',
        abstrak: 'Penelitian ini bertujuan untuk mengembangkan media pembelajaran bahasa Arab berbasis teknologi digital yang interaktif dan menarik untuk meningkatkan motivasi dan hasil belajar siswa.',
        status: 'DISETUJUI',
        submittedAt: new Date('2025-02-01'),
        approvedAt: new Date('2025-02-15'),
        nilaiTotal: 85.5,
      },
    })

    await prisma.proposalMember.createMany({
      data: [
        { proposalId: proposal1.id, dosenId: dosen1.id, role: 'Ketua' },
        { proposalId: proposal1.id, mahasiswaId: mhs1.id, role: 'Mahasiswa' },
      ],
    })

    // Proposal 2 - Review
    const proposal2 = await prisma.proposal.create({
      data: {
        periodeId: periode2025.id,
        skemaId: skemaTerapan.id,
        ketuaId: dosen2.id,
        creatorId: dosen2User.id,
        bidangKeahlianId: bidangPI.id,
        judul: 'Implementasi Pembelajaran Berbasis Karakter di Madrasah Ibtidaiyah',
        abstrak: 'Penelitian ini mengkaji implementasi pembelajaran berbasis karakter di Madrasah Ibtidaiyah untuk membentuk generasi yang berakhlak mulia.',
        status: 'REVIEW',
        submittedAt: new Date('2025-02-10'),
      },
    })

    await prisma.proposalMember.createMany({
      data: [
        { proposalId: proposal2.id, dosenId: dosen2.id, role: 'Ketua' },
        { proposalId: proposal2.id, dosenId: dosen3.id, role: 'Anggota' },
        { proposalId: proposal2.id, mahasiswaId: mhs2.id, role: 'Mahasiswa' },
      ],
    })

    // Proposal 3 - Draft
    await prisma.proposal.create({
      data: {
        periodeId: periode2025.id,
        skemaId: skemaDasar.id,
        ketuaId: dosen3.id,
        creatorId: dosen3User.id,
        bidangKeahlianId: bidangHES.id,
        judul: 'Analisis Penerapan Ekonomi Syariah di Lembaga Keuangan Mikro',
        abstrak: 'Penelitian ini menganalisis penerapan prinsip ekonomi syariah di lembaga keuangan mikro dan dampaknya terhadap kesejahteraan masyarakat.',
        status: 'DRAFT',
      },
    })
  }

  console.log('✅ Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Bidang Keahlian: 3`)
  console.log(`- Skema: 4`)
  console.log(`- Periode: 2`)
  console.log(`- Users: 9 (1 Admin, 3 Dosen, 2 Mahasiswa, 2 Reviewer, 1 Super Admin)`)
  console.log(`- Proposals: 3`)
  console.log('\n🔑 Login Credentials (username/password):')
  console.log('- Admin: admin / password123')
  console.log('- Dosen 1: dosen1 / password123')
  console.log('- Dosen 2: dosen2 / password123')
  console.log('- Dosen 3: dosen3 / password123')
  console.log('- Mahasiswa 1: mhs1 / password123')
  console.log('- Mahasiswa 2: mhs2 / password123')
  console.log('- Reviewer 1: reviewer1 / password123')
  console.log('- Reviewer 2: reviewer2 / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

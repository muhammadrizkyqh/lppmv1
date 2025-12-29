import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createMissingMonitoring() {
  try {
    console.log('🔍 Mencari proposal yang belum punya monitoring...')

    // Find proposals dengan status DITERIMA, BERJALAN, atau SELESAI yang belum punya monitoring
    const proposals = await prisma.proposal.findMany({
      where: {
        status: {
          in: ['DITERIMA', 'BERJALAN', 'SELESAI']
        }
      },
      include: {
        monitoring: true
      }
    })

    console.log(`✅ Ditemukan ${proposals.length} proposal dengan status DITERIMA/BERJALAN/SELESAI`)

    const proposalsWithoutMonitoring = proposals.filter(p => p.monitoring.length === 0)
    console.log(`⚠️  ${proposalsWithoutMonitoring.length} proposal belum punya monitoring record`)

    if (proposalsWithoutMonitoring.length === 0) {
      console.log('✨ Semua proposal sudah punya monitoring!')
      return
    }

    // Create monitoring for each proposal
    for (const proposal of proposalsWithoutMonitoring) {
      console.log(`📝 Creating monitoring for proposal: ${proposal.judul}`)
      
      await prisma.monitoring.create({
        data: {
          proposalId: proposal.id,
          persentaseKemajuan: 0,
          status: 'BERJALAN',
          catatanKemajuan: 'Monitoring dimulai setelah proposal diterima (auto-created)',
        }
      })
    }

    console.log(`✅ Berhasil membuat ${proposalsWithoutMonitoring.length} monitoring record!`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createMissingMonitoring()
  .then(() => {
    console.log('✨ Selesai!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })

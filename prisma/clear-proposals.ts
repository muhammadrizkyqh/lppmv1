import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearProposals() {
  console.log('🗑️  Clearing proposal data...')

  try {
    // Delete in correct order (child tables first)
    await prisma.notification.deleteMany()
    await prisma.luaran.deleteMany()
    await prisma.monitoring.deleteMany()
    await prisma.kontrak.deleteMany()
    await prisma.review.deleteMany()
    await prisma.proposal_reviewer.deleteMany()
    await prisma.proposalrevision.deleteMany()
    await prisma.proposalmember.deleteMany()
    await prisma.proposal.deleteMany()
    await prisma.pencairan_dana.deleteMany()
    await prisma.seminar_peserta.deleteMany()
    await prisma.seminar.deleteMany()

    // Reset sequence numbers
    await prisma.sequence.deleteMany()

    console.log('✅ All proposal data cleared successfully!')
    console.log('✅ Sequence numbers reset!')
    console.log('')
    console.log('Master data (User, Dosen, Mahasiswa, Reviewer, Skema, Periode, Bidang Keahlian) tetap ada.')
  } catch (error) {
    console.error('❌ Error clearing proposals:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearProposals()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

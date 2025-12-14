import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearProposals() {
  console.log('🗑️  Clearing proposal data...')

  try {
    // Delete in correct order (child tables first)
    console.log('Deleting notifications...')
    await prisma.notification.deleteMany()
    
    console.log('Deleting luaran...')
    await prisma.luaran.deleteMany()
    
    console.log('Deleting monitoring...')
    await prisma.monitoring.deleteMany()
    
    console.log('Deleting seminar_peserta...')
    await prisma.seminar_peserta.deleteMany()
    
    console.log('Deleting seminar...')
    await prisma.seminar.deleteMany()
    
    console.log('Deleting pencairan_dana...')
    await prisma.pencairan_dana.deleteMany()
    
    console.log('Deleting kontrak...')
    await prisma.kontrak.deleteMany()
    
    console.log('Deleting review...')
    await prisma.review.deleteMany()
    
    console.log('Deleting proposal_reviewer...')
    await prisma.proposal_reviewer.deleteMany()
    
    console.log('Deleting proposalrevision...')
    await prisma.proposalrevision.deleteMany()
    
    console.log('Deleting proposalmember...')
    await prisma.proposalmember.deleteMany()
    
    console.log('Deleting proposal...')
    await prisma.proposal.deleteMany()

    // Reset sequence numbers
    console.log('Resetting sequence...')
    await prisma.sequence.deleteMany()

    console.log('')
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

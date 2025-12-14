import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanProposals() {
  console.log('🧹 Cleaning proposal data...\n')

  try {
    // Delete in order (child tables first due to foreign keys)
    
    console.log('1. Deleting monitoring data...')
    const monitoring = await prisma.monitoring.deleteMany({})
    console.log(`   ✓ Deleted ${monitoring.count} monitoring records`)

    console.log('2. Deleting kontrak data...')
    const kontrak = await prisma.kontrak.deleteMany({})
    console.log(`   ✓ Deleted ${kontrak.count} kontrak records`)

    console.log('3. Deleting reviews...')
    const reviews = await prisma.review.deleteMany({})
    console.log(`   ✓ Deleted ${reviews.count} reviews`)

    console.log('4. Deleting proposal reviewers...')
    const proposalReviewers = await prisma.proposalReviewer.deleteMany({})
    console.log(`   ✓ Deleted ${proposalReviewers.count} reviewer assignments`)

    console.log('5. Deleting proposal team members...')
    const teamMembers = await prisma.proposalMember.deleteMany({})
    console.log(`   ✓ Deleted ${teamMembers.count} team members`)

    console.log('6. Deleting proposals...')
    const proposals = await prisma.proposal.deleteMany({})
    console.log(`   ✓ Deleted ${proposals.count} proposals`)

    console.log('\n✅ Clean complete! All proposal data deleted.')
    console.log('🔒 Admin, Dosen, Reviewer, and Master Data are SAFE')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanProposals()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

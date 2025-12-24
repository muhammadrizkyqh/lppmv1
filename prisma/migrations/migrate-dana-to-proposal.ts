import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting migration: dana from skema to proposal.danaDiajukan...')

  try {
    // Get all proposals with their skema
    const proposals = await prisma.proposal.findMany({
      include: {
        skema: true,
      },
    })

    console.log(`📊 Found ${proposals.length} proposals to migrate`)

    let migratedCount = 0
    let skippedCount = 0

    for (const proposal of proposals) {
      // Check if proposal already has danaDiajukan
      if (proposal.danaDiajukan) {
        console.log(`⏭️  Proposal ${proposal.id} already has danaDiajukan, skipping...`)
        skippedCount++
        continue
      }

      // Get dana from skema (before we remove the field)
      // @ts-ignore - field will be removed after migration
      const danaFromSkema = proposal.skema.dana

      if (danaFromSkema) {
        await prisma.proposal.update({
          where: { id: proposal.id },
          data: {
            danaDiajukan: danaFromSkema,
          },
        })
        console.log(`✅ Migrated proposal ${proposal.id}: Rp ${danaFromSkema}`)
        migratedCount++
      } else {
        // Default to 5000000 if skema has no dana
        await prisma.proposal.update({
          where: { id: proposal.id },
          data: {
            danaDiajukan: 5000000,
          },
        })
        console.log(`✅ Migrated proposal ${proposal.id}: Rp 5000000 (default)`)
        migratedCount++
      }
    }

    console.log('\n📈 Migration Summary:')
    console.log(`   ✅ Migrated: ${migratedCount}`)
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
    console.log(`   📊 Total: ${proposals.length}`)
    console.log('\n✨ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

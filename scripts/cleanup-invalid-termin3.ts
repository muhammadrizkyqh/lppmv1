import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupInvalidTermin3() {
  try {
    console.log('🔍 Mengecek TERMIN_3 yang tidak valid...\n')

    // Get all TERMIN_3
    const allTermin3 = await prisma.pencairan_dana.findMany({
      where: {
        termin: 'TERMIN_3'
      },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            luaran: {
              where: {
                statusVerifikasi: 'DIVERIFIKASI'
              }
            }
          }
        }
      }
    })

    console.log(`📊 Total TERMIN_3 ditemukan: ${allTermin3.length}\n`)

    if (allTermin3.length === 0) {
      console.log('✅ Tidak ada TERMIN_3 di database')
      return
    }

    let deletedCount = 0
    let keptCount = 0

    for (const termin3 of allTermin3) {
      const hasVerifiedLuaran = termin3.proposal.luaran.length > 0

      if (!hasVerifiedLuaran) {
        // Delete TERMIN_3 if no verified luaran
        await prisma.pencairan_dana.delete({
          where: { id: termin3.id }
        })
        deletedCount++
        console.log(`❌ DIHAPUS - Proposal: "${termin3.proposal.judul}"`)
        console.log(`   Alasan: Tidak ada luaran DIVERIFIKASI\n`)
      } else {
        keptCount++
        console.log(`✅ DIPERTAHANKAN - Proposal: "${termin3.proposal.judul}"`)
        console.log(`   Alasan: Luaran sudah DIVERIFIKASI (${termin3.proposal.luaran.length} luaran)\n`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 HASIL CLEANUP:')
    console.log('='.repeat(60))
    console.log(`✅ TERMIN_3 dipertahankan: ${keptCount}`)
    console.log(`❌ TERMIN_3 dihapus: ${deletedCount}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupInvalidTermin3()

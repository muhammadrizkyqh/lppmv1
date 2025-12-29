import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDuplicatePencairan() {
  try {
    console.log('🔍 Mencari duplikasi pencairan...')

    // Find all proposals with duplicate TERMIN_1
    const duplicates = await prisma.$queryRaw<Array<{ proposalId: string; termin: string; count: bigint }>>`
      SELECT proposalId, termin, COUNT(*) as count
      FROM pencairan_dana
      GROUP BY proposalId, termin
      HAVING COUNT(*) > 1
    `

    if (duplicates.length === 0) {
      console.log('✅ Tidak ada duplikasi ditemukan')
      return
    }

    console.log(`📊 Ditemukan ${duplicates.length} duplikasi:`)
    duplicates.forEach(d => {
      console.log(`   - Proposal ${d.proposalId}, Termin: ${d.termin}, Jumlah: ${d.count}`)
    })

    let totalDeleted = 0

    for (const dup of duplicates) {
      const { proposalId, termin } = dup

      // Get all records for this proposal+termin, ordered by createdAt
      const records = await prisma.pencairan_dana.findMany({
        where: {
          proposalId: proposalId,
          termin: termin as any,
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      console.log(`\n🔧 Processing ${termin} untuk proposal ${proposalId}:`)
      console.log(`   Total records: ${records.length}`)

      if (records.length <= 1) continue

      // Strategy: Keep the one with "Pencairan otomatis setelah kontrak ditandatangani"
      // If none found, keep the oldest one
      let keepRecord = records.find(r => r.keterangan?.includes('kontrak ditandatangani'))
      
      if (!keepRecord) {
        // Keep the oldest if no "kontrak" record found
        keepRecord = records[0]
        console.log(`   ⚠️  Tidak ada record "kontrak ditandatangani", simpan yang tertua`)
      } else {
        console.log(`   ✓ Simpan record dengan keterangan "kontrak ditandatangani"`)
      }

      // Delete all except the one we want to keep
      const toDelete = records.filter(r => r.id !== keepRecord!.id)
      
      for (const record of toDelete) {
        console.log(`   🗑️  Hapus: ${record.id} - ${record.keterangan?.substring(0, 50)}...`)
        await prisma.pencairan_dana.delete({
          where: { id: record.id }
        })
        totalDeleted++
      }
    }

    console.log(`\n✅ Berhasil menghapus ${totalDeleted} duplikasi pencairan`)
    console.log('✓ Database sudah dibersihkan dari duplikasi')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanDuplicatePencairan()

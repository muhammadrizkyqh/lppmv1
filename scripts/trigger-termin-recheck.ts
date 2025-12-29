import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function triggerTerminRecheck() {
  try {
    console.log('🔄 Mencari TERMIN yang perlu di-recheck...\n')

    // 1. Find all TERMIN_1 yang sudah DICAIRKAN
    const dicairkanTermin1 = await prisma.pencairan_dana.findMany({
      where: {
        termin: 'TERMIN_1',
        status: 'DICAIRKAN'
      },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            danaDisetujui: true
          }
        }
      }
    })

    console.log(`📊 Ditemukan ${dicairkanTermin1.length} TERMIN_1 yang sudah dicairkan\n`)

    let termin2Created = 0
    let termin3Created = 0

    // 2. For each TERMIN_1, check if need to create TERMIN_2
    for (const termin1 of dicairkanTermin1) {
      console.log(`\n🔍 Checking proposal: ${termin1.proposal.judul}`)

      // Check if TERMIN_2 already exists
      const existingTermin2 = await prisma.pencairan_dana.findFirst({
        where: {
          proposalId: termin1.proposalId,
          termin: 'TERMIN_2'
        }
      })

      if (existingTermin2) {
        console.log('   ✓ TERMIN_2 sudah ada')
        
        // If TERMIN_2 exists and DICAIRKAN, check TERMIN_3
        if (existingTermin2.status === 'DICAIRKAN') {
          const existingTermin3 = await prisma.pencairan_dana.findFirst({
            where: {
              proposalId: termin1.proposalId,
              termin: 'TERMIN_3'
            }
          })

          if (!existingTermin3) {
            // Create TERMIN_3
            const totalDana = Number(termin1.proposal.danaDisetujui || 0)
            const termin3Amount = totalDana * 0.25

            await prisma.pencairan_dana.create({
              data: {
                proposalId: termin1.proposalId,
                termin: 'TERMIN_3',
                nominal: termin3Amount,
                persentase: 25,
                status: 'PENDING',
                keterangan: 'Pencairan otomatis setelah TERMIN_2 dicairkan (dibuat oleh script re-check)',
                createdBy: termin1.createdBy, // Use same creator
              }
            })

            console.log('   ✅ TERMIN_3 berhasil dibuat!')
            termin3Created++
          } else {
            console.log('   ✓ TERMIN_3 sudah ada')
          }
        }
        
        continue
      }

      // Check if laporan akhir approved
      const monitoring = await prisma.monitoring.findFirst({
        where: {
          proposalId: termin1.proposalId,
          verifikasiAkhirStatus: 'APPROVED'
        }
      })

      if (monitoring) {
        // Create TERMIN_2
        const totalDana = Number(termin1.proposal.danaDisetujui || 0)
        const termin2Amount = totalDana * 0.25

        await prisma.pencairan_dana.create({
          data: {
            proposalId: termin1.proposalId,
            termin: 'TERMIN_2',
            nominal: termin2Amount,
            persentase: 25,
            status: 'PENDING',
            keterangan: 'Pencairan otomatis setelah TERMIN_1 dicairkan dan laporan akhir disetujui (dibuat oleh script re-check)',
            createdBy: termin1.createdBy, // Use same creator
          }
        })

        console.log('   ✅ TERMIN_2 berhasil dibuat!')
        termin2Created++
      } else {
        console.log('   ⚠️  Laporan akhir belum disetujui, skip')
      }
    }

    // 3. Also check TERMIN_2 yang sudah DICAIRKAN tapi belum ada TERMIN_3
    const dicairkanTermin2 = await prisma.pencairan_dana.findMany({
      where: {
        termin: 'TERMIN_2',
        status: 'DICAIRKAN'
      },
      include: {
        proposal: {
          select: {
            id: true,
            judul: true,
            danaDisetujui: true
          }
        }
      }
    })

    console.log(`\n\n📊 Ditemukan ${dicairkanTermin2.length} TERMIN_2 yang sudah dicairkan\n`)

    for (const termin2 of dicairkanTermin2) {
      console.log(`\n🔍 Checking proposal: ${termin2.proposal.judul}`)

      const existingTermin3 = await prisma.pencairan_dana.findFirst({
        where: {
          proposalId: termin2.proposalId,
          termin: 'TERMIN_3'
        }
      })

      if (existingTermin3) {
        console.log('   ✓ TERMIN_3 sudah ada')
        continue
      }

      // Create TERMIN_3
      const totalDana = Number(termin2.proposal.danaDisetujui || 0)
      const termin3Amount = totalDana * 0.25

      await prisma.pencairan_dana.create({
        data: {
          proposalId: termin2.proposalId,
          termin: 'TERMIN_3',
          nominal: termin3Amount,
          persentase: 25,
          status: 'PENDING',
          keterangan: 'Pencairan otomatis setelah TERMIN_2 dicairkan (dibuat oleh script re-check)',
          createdBy: termin2.createdBy,
        }
      })

      console.log('   ✅ TERMIN_3 berhasil dibuat!')
      termin3Created++
    }

    console.log('\n\n' + '='.repeat(60))
    console.log('✅ Re-check selesai!')
    console.log('='.repeat(60))
    console.log(`📝 TERMIN_2 dibuat: ${termin2Created}`)
    console.log(`📝 TERMIN_3 dibuat: ${termin3Created}`)
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

triggerTerminRecheck()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserDosen() {
  try {
    console.log('🔍 Checking User and Dosen relationship...\n')

    // Get all dosen
    const allDosen = await prisma.dosen.findMany({
      include: {
        user: true
      }
    })

    console.log(`📊 Total Dosen: ${allDosen.length}\n`)

    for (const dosen of allDosen) {
      console.log('─'.repeat(60))
      console.log(`NIDN: ${dosen.nidn}`)
      console.log(`Nama: ${dosen.nama}`)
      console.log(`Email: ${dosen.email}`)
      console.log(`Status: ${dosen.status}`)
      console.log(`User ID: ${dosen.userId}`)
      
      if (dosen.user) {
        console.log(`✅ User Found:`)
        console.log(`   - Username: ${dosen.user.username}`)
        console.log(`   - Email: ${dosen.user.email}`)
        console.log(`   - Role: ${dosen.user.role}`)
        console.log(`   - Status: ${dosen.user.status}`)
        
        if (dosen.user.username !== dosen.nidn) {
          console.log(`⚠️  WARNING: Username (${dosen.user.username}) ≠ NIDN (${dosen.nidn})`)
        }
      } else {
        console.log(`❌ No User linked!`)
      }
      console.log()
    }

    // Check for orphaned users with DOSEN role
    const dosenUsers = await prisma.user.findMany({
      where: { role: 'DOSEN' },
      include: { dosen: true }
    })

    const orphanedUsers = dosenUsers.filter(u => !u.dosen)
    
    if (orphanedUsers.length > 0) {
      console.log('\n' + '='.repeat(60))
      console.log('⚠️  ORPHANED DOSEN USERS (tidak ada relasi ke table dosen):')
      console.log('='.repeat(60))
      orphanedUsers.forEach(user => {
        console.log(`Username: ${user.username}, Email: ${user.email}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserDosen()

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAndSeedAdmin() {
  try {
    console.log('🔥 Resetting database...')
    
    // This will drop all tables and recreate them
    console.log('⚠️  WARNING: This will delete ALL data!')
    console.log('Waiting 3 seconds... Press Ctrl+C to cancel\n')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('🗑️  Dropping and recreating database...')
    
    // Delete all data in correct order (respecting foreign keys)
    await prisma.pencairan_dana.deleteMany()
    await prisma.luaran.deleteMany()
    await prisma.seminar.deleteMany()
    await prisma.kontrak.deleteMany()
    await prisma.monitoring.deleteMany()
    await prisma.review.deleteMany()
    await prisma.proposal_reviewer.deleteMany()
    await prisma.proposalrevision.deleteMany()
    await prisma.proposalmember.deleteMany()
    await prisma.proposal.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.dosen.deleteMany()
    await prisma.mahasiswa.deleteMany()
    await prisma.reviewer.deleteMany()
    await prisma.user.deleteMany()
    await prisma.periode.deleteMany()
    await prisma.skema.deleteMany()
    await prisma.bidangkeahlian.deleteMany()
    
    console.log('✅ All data deleted\n')
    
    // Create admin only
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@stai-ali.ac.id',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'AKTIF',
        mustChangePassword: false,
      },
    })
    
    console.log('✅ Admin created successfully!')
    console.log('\n' + '='.repeat(50))
    console.log('📋 Admin Credentials:')
    console.log('='.repeat(50))
    console.log('Username: admin')
    console.log('Email: admin@stai-ali.ac.id')
    console.log('Password: password123')
    console.log('='.repeat(50))
    console.log('\n✅ Database reset complete!')
    console.log('💡 You can now bulk import dosen/mahasiswa/reviewer')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetAndSeedAdmin()

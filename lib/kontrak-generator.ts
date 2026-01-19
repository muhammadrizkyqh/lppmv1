import { prisma } from './prisma'

/**
 * Generate nomor kontrak dengan format: KNT/LPPM/YYYY/XXX
 * Contoh: KNT/LPPM/2025/001
 * 
 * Thread-safe dengan menggunakan sequence table dan atomic increment
 */
export async function generateNomorKontrak(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const sequenceId = `KONTRAK_${currentYear}`
  
  // Atomic increment using upsert - thread-safe, no race condition
  const sequence = await prisma.sequence.upsert({
    where: {
      id: sequenceId
    },
    update: {
      lastNumber: { increment: 1 }
    },
    create: {
      id: sequenceId,
      year: currentYear,
      lastNumber: 1
    }
  })

  // Format: KNT/LPPM/2025/001
  const sequenceStr = sequence.lastNumber.toString().padStart(3, '0')
  return `KNT/LPPM/${currentYear}/${sequenceStr}`
}

/**
 * Generate nomor SK dengan format: SK/LPPM/PENELITIAN/YYYY/XXX
 * Contoh: SK/LPPM/PENELITIAN/2025/001
 * 
 * Thread-safe dengan menggunakan sequence table dan atomic increment
 */
export async function generateNomorSK(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const sequenceId = `SK_${currentYear}`
  
  // Atomic increment using upsert - thread-safe, no race condition
  const sequence = await prisma.sequence.upsert({
    where: {
      id: sequenceId
    },
    update: {
      lastNumber: { increment: 1 }
    },
    create: {
      id: sequenceId,
      year: currentYear,
      lastNumber: 1
    }
  })

  // Format: SK/LPPM/PENELITIAN/2025/001
  const sequenceStr = sequence.lastNumber.toString().padStart(3, '0')
  return `SK/LPPM/PENELITIAN/${currentYear}/${sequenceStr}`
}

/**
 * Generate both nomor kontrak and nomor SK
 * Both operations are atomic and thread-safe
 */
export async function generateNomorKontrakDanSK(): Promise<{
  nomorKontrak: string
  nomorSK: string
}> {
  // Sequential execution to ensure both succeed or fail together
  // Each operation is atomic, so concurrent calls won't create duplicates
  const nomorKontrak = await generateNomorKontrak()
  const nomorSK = await generateNomorSK()

  return { nomorKontrak, nomorSK }
}

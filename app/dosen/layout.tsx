import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function DosenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  // Only DOSEN can access
  if (session.role !== 'DOSEN') {
    redirect('/dashboard')
  }

  return <>{children}</>
}

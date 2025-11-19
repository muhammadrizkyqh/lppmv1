import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  // Only ADMIN can access
  if (session.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <>{children}</>
}

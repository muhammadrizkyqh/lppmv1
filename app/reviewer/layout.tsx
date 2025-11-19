import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  // Only REVIEWER can access
  if (session.role !== 'REVIEWER') {
    redirect('/dashboard')
  }

  return <>{children}</>
}

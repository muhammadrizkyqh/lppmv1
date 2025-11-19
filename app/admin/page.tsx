import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Redirect to proposals as default admin landing
  redirect('/admin/proposals')
}

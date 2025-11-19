import { redirect } from 'next/navigation'

export default function DosenPage() {
  // Redirect to proposals as default dosen landing
  redirect('/dosen/proposals')
}

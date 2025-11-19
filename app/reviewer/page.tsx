import { redirect } from 'next/navigation'

export default function ReviewerPage() {
  // Redirect to assignments as default reviewer landing
  redirect('/reviewer/assignments')
}

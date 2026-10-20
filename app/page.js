import { redirect } from 'next/navigation'

// Halaman awal REQFLOW adalah Login (SRS UC-01); login.js meneruskan ke /dashboard bila sesi sudah ada.
export default function Home() {
  redirect('/login')
}

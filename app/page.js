import { redirect } from 'next/navigation'

// Halaman awal REQFLOW adalah Login (SRS UC-01); LoginForm meneruskan ke /dashboard bila sesi sudah ada.
export default function Home() {
  redirect('/login')
}

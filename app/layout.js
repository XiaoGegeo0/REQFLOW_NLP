import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'REQFLOW',
  description: 'Ubah feedback stakeholder menjadi user story yang terstruktur, terverifikasi, dan siap didokumentasikan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}

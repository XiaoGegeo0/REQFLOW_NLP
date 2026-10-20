'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FileText,
  Files,
  ListChecks,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  SquarePen,
  UserRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import styles from './app.module.css'

// href kosong = use case belum dibangun.
const NAV_ITEMS = [
  { label: 'Input Feedback', icon: MessageSquare, href: '/input-feedback' },
  { label: 'Generate User Story', icon: Sparkles, href: '/generate-user-story' },
  { label: 'Review & Verifikasi', icon: ListChecks },
  { label: 'Revisi User Story', icon: SquarePen },
  { label: 'Dokumen User Story', icon: FileText },
  { label: 'Finalisasi User Story', icon: ShieldCheck },
  { label: 'Dokumen Final', icon: Files },
]

const CurrentAnalystContext = createContext(null)

// { id, nama, email } milik Software Analyst yang sedang login.
export function useCurrentAnalyst() {
  return useContext(CurrentAnalystContext)
}

export default function AppShell({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [analyst, setAnalyst] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        router.replace('/login')
        return
      }

      const { data } = await supabase
        .from('software_analyst')
        .select('nama')
        .eq('id_analyst', user.id)
        .maybeSingle()

      if (!cancelled) {
        setAnalyst({
          id: user.id,
          email: user.email,
          nama: data?.nama || user.user_metadata?.full_name || user.email,
        })
      }
    }

    load()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login')
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [router])

  if (!analyst) return <div className={styles.loading}>Memuat...</div>

  return (
    <CurrentAnalystContext.Provider value={analyst}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/dashboard" className={styles.logo}>
            REQFLOW
          </Link>
          <div className={styles.account}>
            <span className={styles.roleLabel}>Software Analyst</span>
            <span className={styles.avatar} title={analyst.nama}>
              <UserRound size={16} aria-hidden="true" />
            </span>
            <button type="button" className={styles.logout} onClick={() => supabase.auth.signOut()}>
              <LogOut size={14} aria-hidden="true" />
              Keluar
            </button>
          </div>
        </header>

        <div className={styles.workspace}>
          <nav className={styles.sidebar} aria-label="Navigasi utama">
            {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
              const content = (
                <>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </>
              )
              if (!href) {
                return (
                  <span
                    key={label}
                    className={`${styles.navItem} ${styles.navItemDisabled}`}
                    aria-disabled="true"
                    title="Belum tersedia"
                  >
                    {content}
                  </span>
                )
              }
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={label}
                  href={href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {content}
                </Link>
              )
            })}
          </nav>
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </CurrentAnalystContext.Provider>
  )
}

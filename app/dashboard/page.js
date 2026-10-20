'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, UserRound } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import styles from './dashboard.module.css'

const ROLE_LABELS = { software_analyst: 'Software Analyst' }

// Placeholder dashboard: hanya membuktikan sesi + tabel profiles bekerja.
// Sidebar & fitur lain (Input Feedback, dst.) dibangun di use case berikutnya.
export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)

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
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle()

      if (!cancelled) {
        setProfile({
          name: data?.full_name || user.user_metadata?.full_name || user.email,
          role: ROLE_LABELS[data?.role] ?? 'Software Analyst',
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

  if (!profile) return <div className={styles.loading}>Memuat...</div>

  return (
    <>
      <header className={styles.topbar}>
        <span className={styles.logo}>REQFLOW</span>
        <div className={styles.account}>
          <span>{profile.role}</span>
          <span className={styles.avatar}>
            <UserRound size={16} aria-hidden="true" />
          </span>
          <button type="button" className={styles.logout} onClick={() => supabase.auth.signOut()}>
            <LogOut size={14} aria-hidden="true" />
            Keluar
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.card}>
          <h1>Halo, {profile.name}</h1>
          <p>Login berhasil. Dashboard REQFLOW akan dilengkapi pada use case berikutnya.</p>
        </section>
      </main>
    </>
  )
}

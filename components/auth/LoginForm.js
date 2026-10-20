'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, LogIn } from 'lucide-react'
import { setRememberMe, supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'
import { PasswordField, StatusBanner, TextField } from '../ui/FormControls'
import ui from '../ui/form.module.css'
import styles from './auth.module.css'

const REDIRECT_DELAY_MS = 900

// Supabase sengaja mengembalikan error yang sama untuk "email tidak ada" dan
// "password salah" (mencegah enumerasi akun), jadi keduanya memakai pesan yang sama.
function loginErrorMessage(error) {
  if (error.code === 'invalid_credentials') return 'Email atau password yang Anda masukkan salah.'
  if (error.code === 'email_not_confirmed') return 'Email belum diverifikasi. Periksa kotak masuk Anda.'
  return 'Terjadi kesalahan saat login. Silakan coba lagi.'
}

export default function LoginForm() {
  const router = useRouter()
  const redirectTimer = useRef(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [invalid, setInvalid] = useState({})
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  // Pengguna yang sudah punya sesi langsung diarahkan ke dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
    return () => clearTimeout(redirectTimer.current)
  }, [router])

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const missing = { email: !email.trim(), password: !password }
    if (missing.email || missing.password) {
      setInvalid(missing)
      setStatus({ type: 'error', messages: ['Email dan password harus diisi.'] })
      return
    }

    setInvalid({})
    setStatus(null)
    setLoading(true)
    setRememberMe(remember)

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (error) {
      setStatus({ type: 'error', messages: [loginErrorMessage(error)] })
      setLoading(false)
      return
    }

    setStatus({ type: 'success', messages: ['Login berhasil.'] })
    redirectTimer.current = setTimeout(() => router.replace('/dashboard'), REDIRECT_DELAY_MS)
  }

  return (
    <AuthLayout
      headline="Selamat datang kembali di REQFLOW"
      title="Masuk ke Akun Anda"
      subtitle="Gunakan akun Software Analyst Anda untuk melanjutkan."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="Email *"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nama@perusahaan.com"
          value={email}
          invalid={invalid.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          id="password"
          label="Password *"
          name="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          value={password}
          invalid={invalid.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.prefs}>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span className={styles.checkboxBox}>
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
            Ingat saya
          </label>
          {/* Ada di desain Figma, tetapi belum ada use case-nya di SRS. */}
          <button type="button" className={styles.textLink} aria-disabled="true" title="Belum tersedia">
            Lupa kata sandi?
          </button>
        </div>

        <StatusBanner status={status} />

        <button type="submit" className={`${ui.button} ${ui.buttonBlock}`} disabled={loading}>
          <LogIn size={16} aria-hidden="true" />
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>

      <div className={styles.separator}>atau</div>
      <p className={styles.switch}>
        Belum punya akun? <Link href="/signup">Daftar</Link>
      </p>
    </AuthLayout>
  )
}

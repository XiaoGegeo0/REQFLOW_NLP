'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'
import { PasswordField, StatusBanner, TextField } from './FormControls'
import styles from './auth.module.css'

const MIN_PASSWORD_LENGTH = 8
const REDIRECT_DELAY_MS = 1500
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMAIL_TAKEN = 'Email sudah terdaftar. Gunakan email lain atau masuk.'

function validate({ name, email, password, confirmPassword }) {
  const invalid = {
    name: !name.trim(),
    email: !email.trim(),
    password: !password,
    confirmPassword: !confirmPassword,
  }
  if (Object.values(invalid).some(Boolean)) {
    return { invalid, messages: ['Lengkapi seluruh data pendaftaran.'] }
  }

  const messages = []
  if (!EMAIL_PATTERN.test(email.trim())) {
    invalid.email = true
    messages.push('Format email tidak valid.')
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    invalid.password = true
    messages.push(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`)
  }
  if (password !== confirmPassword) {
    invalid.confirmPassword = true
    messages.push('Konfirmasi password tidak sesuai.')
  }
  return { invalid, messages }
}

function signUpErrorMessage(error) {
  if (error.code === 'user_already_exists' || error.code === 'email_exists') return EMAIL_TAKEN
  if (error.code === 'weak_password') return `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
    return 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.'
  }
  return 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
}

export default function SignUpForm() {
  const router = useRouter()
  const redirectTimer = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [invalid, setInvalid] = useState({})
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => () => clearTimeout(redirectTimer.current), [])

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const result = validate(form)
    setInvalid(result.invalid)
    if (result.messages.length > 0) {
      setStatus({ type: 'error', messages: result.messages })
      return
    }

    setStatus(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim() } },
    })

    // Bila email sudah dipakai dan konfirmasi email aktif, Supabase mengembalikan
    // user "palsu" tanpa identities alih-alih error.
    const emailTaken = !error && data.user?.identities?.length === 0
    if (error || emailTaken) {
      setInvalid({ email: error ? error.code === 'user_already_exists' || error.code === 'email_exists' : true })
      setStatus({ type: 'error', messages: [emailTaken ? EMAIL_TAKEN : signUpErrorMessage(error)] })
      setLoading(false)
      return
    }

    // SRS FR-02-10: pendaftaran tidak boleh membuat sesi login otomatis.
    if (data.session) await supabase.auth.signOut()

    setInvalid({})
    setStatus({ type: 'success', messages: ['Akun berhasil dibuat.'] })
    redirectTimer.current = setTimeout(() => router.replace('/login'), REDIRECT_DELAY_MS)
  }

  return (
    <AuthLayout
      headline="Mulai kelola requirement Anda"
      title="Buat Akun Baru"
      subtitle="Lengkapi data berikut untuk mulai menggunakan REQFLOW."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="name"
          label="Nama Lengkap *"
          name="name"
          autoComplete="name"
          placeholder="Contoh: Nathanael Kevin"
          value={form.name}
          invalid={invalid.name}
          onChange={update('name')}
        />
        <TextField
          id="email"
          label="Email *"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nama@perusahaan.com"
          value={form.email}
          invalid={invalid.email}
          onChange={update('email')}
        />
        <PasswordField
          id="password"
          label="Password *"
          name="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          hint="Gunakan kombinasi huruf dan angka."
          value={form.password}
          invalid={invalid.password}
          onChange={update('password')}
        />
        <PasswordField
          id="confirmPassword"
          label="Konfirmasi Password *"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          value={form.confirmPassword}
          invalid={invalid.confirmPassword}
          onChange={update('confirmPassword')}
        />

        <StatusBanner status={status} />

        <button type="submit" className={styles.submit} disabled={loading || status?.type === 'success'}>
          <UserPlus size={16} aria-hidden="true" />
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <p className={styles.switch}>
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </AuthLayout>
  )
}

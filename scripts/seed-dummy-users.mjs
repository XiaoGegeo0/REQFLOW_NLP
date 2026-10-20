// Membuat akun dummy untuk testing Login/Sign Up.
// Jalankan: npm run seed   (membaca .env.local, lihat .env.example)
//
// Memakai service role key (hanya di server/lokal — JANGAN diberi prefix NEXT_PUBLIC_).
// Idempotent: akun yang sudah ada dilewati.

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diisi di .env.local')
  process.exit(1)
}

const DUMMY_USERS = [
  { full_name: 'Andi Pratama', email: 'andi.analyst@example.com', password: 'Reqflow123' },
  { full_name: 'Siti Rahma', email: 'siti.analyst@example.com', password: 'Reqflow123' },
  { full_name: 'Budi Santoso', email: 'budi.analyst@example.com', password: 'Reqflow123' },
]

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let failed = false

for (const { full_name, email, password } of DUMMY_USERS) {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // langsung aktif tanpa verifikasi email
    user_metadata: { full_name },
  })

  if (!error) {
    console.log(`dibuat    ${email}  (password: ${password})`)
  } else if (error.code === 'email_exists') {
    console.log(`dilewati  ${email}  (sudah ada)`)
  } else {
    failed = true
    console.error(`gagal     ${email}  → ${error.message}`)
  }
}

process.exit(failed ? 1 : 0)

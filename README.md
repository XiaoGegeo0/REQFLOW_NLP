# REQFLOW

Aplikasi web untuk mengubah feedback stakeholder menjadi user story (Next.js + Supabase).
Saat ini tersedia: **Login** (UC-01) dan **Sign Up** (UC-02).

## Setup

1. Install dependensi:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari Supabase Dashboard → Project Settings → API Keys.
3. Buka Supabase Dashboard → SQL Editor, jalankan isi
   [`supabase/migrations/001_profiles.sql`](supabase/migrations/001_profiles.sql)
   (tabel `profiles`, RLS, dan trigger pembuat profil otomatis). Aman dijalankan ulang.
4. Supabase Dashboard → Authentication → Sign In / Providers → Email → matikan **Confirm email**
   (SRS tidak memiliki alur verifikasi email).
5. (Opsional) Buat akun dummy: isi `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`, lalu:
   ```bash
   npm run seed
   ```
   Akun yang dibuat: `andi.analyst@example.com`, `siti.analyst@example.com`,
   `budi.analyst@example.com` — password `Reqflow123`.
6. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   Buka <http://localhost:3000> (otomatis ke `/login`).

## Struktur singkat

- `app/login`, `app/signup`, `app/dashboard` — halaman
- `components/auth` — form Login/Sign Up dan komponen bersama
- `lib/supabaseClient.js` — klien Supabase (+ penyimpanan sesi "Ingat saya")
- `supabase/migrations` — skema database
- `scripts/seed-dummy-users.mjs` — seed akun dummy

# REQFLOW

Aplikasi web untuk mengubah feedback stakeholder menjadi user story (Next.js + Supabase).
Saat ini tersedia: **Login** (UC-01), **Sign Up** (UC-02), dan **Input Feedback Stakeholder** (UC-03).

## Setup

1. Install dependensi:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari Supabase Dashboard → Project Settings → API Keys.
3. Buka Supabase Dashboard → SQL Editor, jalankan berurutan. Semua aman dijalankan ulang dan
   aman untuk tabel yang sudah dibuat manual (tabel & data tidak dihapus):
   1. [`supabase/migrations/001_software_analyst.sql`](supabase/migrations/001_software_analyst.sql) —
      tabel `software_analyst`, RLS, trigger pembuat data analyst saat sign up.
   2. [`supabase/migrations/002_feedback_stakeholder.sql`](supabase/migrations/002_feedback_stakeholder.sql) —
      tabel `feedback_stakeholder` (UC-03): RLS, default, dan validasi data.
4. Supabase Dashboard → Authentication → Sign In / Providers → Email → matikan **Confirm email**
   (SRS tidak memiliki alur verifikasi email).
5. (Opsional) Data dummy: jalankan isi [`supabase/seed.sql`](supabase/seed.sql) di SQL Editor.
   Membuat akun `andi.analyst@example.com`, `siti.analyst@example.com`, `budi.analyst@example.com`
   (password `Reqflow123`) beserta beberapa feedback stakeholder.
   Alternatif khusus akun (tanpa feedback): isi `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`, lalu `npm run seed`.
6. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   Buka <http://localhost:3000> (otomatis ke `/login`).

## Struktur singkat

- `app/login`, `app/signup` — halaman autentikasi
- `app/(app)/…` — halaman setelah login (topbar + sidebar): `dashboard`, `input-feedback`, `generate-user-story`
- `components/auth` — form Login/Sign Up
- `components/app` — app shell, header halaman
- `components/feedback` — form Input Feedback, tampilan feedback tersimpan
- `components/ui` — field, tombol, dan banner bersama
- `lib/` — klien Supabase, aturan data feedback
- `supabase/migrations` — skema database; `supabase/seed.sql` — data dummy

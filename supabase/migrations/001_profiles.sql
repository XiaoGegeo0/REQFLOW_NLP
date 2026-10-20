-- REQFLOW — Autentikasi (UC-01 Login, UC-02 Sign Up)
-- Jalankan sekali di Supabase Dashboard → SQL Editor. Aman dijalankan ulang.
--
-- Akun & password dikelola Supabase Auth (auth.users, password di-hash oleh Supabase).
-- Tabel public.profiles menyimpan data aplikasi per pengguna dan dibuat otomatis
-- oleh trigger setiap kali ada akun baru.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  email      text not null,
  role       text not null default 'software_analyst',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Pengguna hanya boleh membaca profilnya sendiri.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Pengguna hanya boleh mengubah profilnya sendiri, dan hanya kolom full_name
-- (supaya tidak bisa mengubah role sendiri).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Hak akses tabel dibuat eksplisit karena project baru Supabase tidak lagi
-- memberi grant otomatis ke role Data API.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Buat profil otomatis saat akun baru terdaftar (nama dari metadata sign up).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

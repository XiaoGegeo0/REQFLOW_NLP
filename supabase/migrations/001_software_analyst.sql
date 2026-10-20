-- REQFLOW — Autentikasi (UC-01 Login, UC-02 Sign Up) — tabel software_analyst
-- Jalankan di Supabase Dashboard → SQL Editor. Aman dijalankan ulang, dan aman untuk tabel
-- software_analyst yang sudah dibuat manual (tabel & datanya tidak dihapus).
--
-- Akun & password dikelola Supabase Auth (auth.users, password di-hash oleh Supabase), jadi
-- tidak ada kolom password_hash. id_analyst = id akun Supabase Auth (uuid).

create table if not exists public.software_analyst (
  id_analyst uuid primary key references auth.users (id) on delete cascade,
  nama       varchar not null default '',
  email      varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.software_analyst enable row level security;

-- Pengguna hanya boleh membaca datanya sendiri.
drop policy if exists "software_analyst_select_own" on public.software_analyst;
create policy "software_analyst_select_own"
  on public.software_analyst for select
  to authenticated
  using (auth.uid() = id_analyst);

-- Pengguna hanya boleh mengubah nama miliknya sendiri.
drop policy if exists "software_analyst_update_own" on public.software_analyst;
create policy "software_analyst_update_own"
  on public.software_analyst for update
  to authenticated
  using (auth.uid() = id_analyst)
  with check (auth.uid() = id_analyst);

-- Hak akses tabel dibuat eksplisit karena project baru Supabase tidak lagi
-- memberi grant otomatis ke role Data API.
revoke all on public.software_analyst from anon, authenticated;
grant select on public.software_analyst to authenticated;
grant update (nama) on public.software_analyst to authenticated;

-- Buat data analyst otomatis saat akun baru terdaftar (nama dari metadata sign up).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.software_analyst (id_analyst, nama, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id_analyst) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lengkapi data analyst untuk akun yang dibuat sebelum trigger ada (mis. lewat dashboard),
-- supaya nama analyst tetap tersedia di aplikasi.
insert into public.software_analyst (id_analyst, nama, email)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', ''), u.email
from auth.users u
where not exists (select 1 from public.software_analyst a where a.id_analyst = u.id);

-- Minta Data API (PostgREST) memuat ulang struktur tabel agar perubahan langsung terbaca.
notify pgrst, 'reload schema';

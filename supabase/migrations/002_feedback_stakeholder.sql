-- REQFLOW — UC-03 Menginput Feedback Stakeholder — tabel feedback_stakeholder
-- Jalankan setelah 001_software_analyst.sql. Aman dijalankan ulang, dan aman untuk tabel
-- feedback_stakeholder yang sudah dibuat manual (tabel & datanya tidak dihapus).
--
-- Kolom (SRS FR-03-01): title = Judul Feedback, source = Sumber Feedback,
-- feedback_date = Tanggal Perolehan, content = Isi Feedback Stakeholder.

create table if not exists public.feedback_stakeholder (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  title         text not null,
  source        text not null,
  feedback_date date not null,
  content       text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Default untuk tabel yang dibuat manual (bila belum ada).
alter table public.feedback_stakeholder alter column id set default gen_random_uuid();
alter table public.feedback_stakeholder alter column user_id set default auth.uid();
alter table public.feedback_stakeholder alter column created_at set default now();
alter table public.feedback_stakeholder alter column updated_at set default now();

-- Validasi data (SRS business rule 2). NOT VALID: hanya berlaku untuk data baru,
-- jadi tidak gagal bila tabel sudah berisi data lama.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'feedback_title_required') then
    alter table public.feedback_stakeholder add constraint feedback_title_required
      check (title is not null and length(btrim(title)) between 1 and 255) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'feedback_source_valid') then
    alter table public.feedback_stakeholder add constraint feedback_source_valid
      check (source in ('Wawancara', 'Rapat', 'Email', 'Lainnya')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'feedback_date_required') then
    alter table public.feedback_stakeholder add constraint feedback_date_required
      check (feedback_date is not null) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'feedback_content_required') then
    alter table public.feedback_stakeholder add constraint feedback_content_required
      check (content is not null and length(btrim(content)) between 1 and 500) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'feedback_user_required') then
    alter table public.feedback_stakeholder add constraint feedback_user_required
      check (user_id is not null) not valid;
  end if;
end $$;

create index if not exists feedback_stakeholder_user_id_idx
  on public.feedback_stakeholder (user_id);

-- updated_at otomatis diperbarui setiap kali baris diubah.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists feedback_stakeholder_set_updated_at on public.feedback_stakeholder;
create trigger feedback_stakeholder_set_updated_at
  before update on public.feedback_stakeholder
  for each row execute function public.set_updated_at();

alter table public.feedback_stakeholder enable row level security;

-- Setiap Software Analyst hanya bisa melihat dan mengelola feedback miliknya sendiri.
drop policy if exists "feedback_select_own" on public.feedback_stakeholder;
create policy "feedback_select_own"
  on public.feedback_stakeholder for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "feedback_insert_own" on public.feedback_stakeholder;
create policy "feedback_insert_own"
  on public.feedback_stakeholder for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Update dipakai UC-04 ("Ubah Feedback") untuk memperbaiki feedback sebelum generate ulang.
drop policy if exists "feedback_update_own" on public.feedback_stakeholder;
create policy "feedback_update_own"
  on public.feedback_stakeholder for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.feedback_stakeholder from anon, authenticated;
grant select, insert on public.feedback_stakeholder to authenticated;
grant update (title, source, feedback_date, content) on public.feedback_stakeholder to authenticated;

-- Minta Data API (PostgREST) memuat ulang struktur tabel agar perubahan langsung terbaca.
notify pgrst, 'reload schema';

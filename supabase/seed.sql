-- REQFLOW — Data dummy untuk testing (akun Software Analyst + feedback stakeholder)
-- Jalankan di Supabase Dashboard → SQL Editor setelah seluruh file di migrations/.
-- Aman dijalankan ulang: akun yang emailnya sudah ada dan analyst yang sudah punya feedback dilewati.
--
-- Membuat akun langsung di auth.users (password di-hash bcrypt, email langsung terverifikasi).
-- Baris di public.software_analyst dibuat otomatis oleh trigger on_auth_user_created.
-- Alternatif tanpa SQL: `npm run seed` (lihat README).

do $$
declare
  u record;
  new_id uuid;
begin
  for u in
    select * from (values
      ('Andi Pratama', 'andi.analyst@example.com',  'Reqflow123'),
      ('Siti Rahma',   'siti.analyst@example.com',  'Reqflow123'),
      ('Budi Santoso', 'budi.analyst@example.com',  'Reqflow123')
    ) as t (full_name, email, password)
  loop
    continue when exists (select 1 from auth.users where email = u.email);

    new_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      -- GoTrue membaca kolom token ini sebagai string; NULL membuat login error.
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
      u.email, extensions.crypt(u.password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', u.full_name),
      now(), now(),
      '', '', '', ''
    );

    -- Identity email diperlukan agar login email+password berfungsi.
    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), new_id, u.email, 'email',
      jsonb_build_object('sub', new_id::text, 'email', u.email, 'email_verified', true),
      now(), now(), now()
    );
  end loop;
end $$;

-- Feedback stakeholder dummy (UC-03). Hanya ditambahkan untuk analyst yang belum punya feedback.
insert into public.feedback_stakeholder
  (user_id, title, source, feedback_date, content)
select u.id, f.judul, f.sumber, current_date - f.hari_lalu, f.isi
from (values
  ('andi.analyst@example.com', 'Wawancara manajer penjualan — Modul Laporan', 'Wawancara', 7,
   'Saya sebagai manajer penjualan ingin dapat mengunduh laporan penjualan bulanan dalam format PDF, '
   || 'supaya laporan tersebut mudah dibagikan kepada direksi pada saat rapat evaluasi bulanan. '
   || 'Saya juga ingin laporan tersusun otomatis dari data transaksi agar tidak perlu disalin manual ke Excel.'),
  ('andi.analyst@example.com', 'Rapat koordinasi tim gudang — Stok Barang', 'Rapat', 3,
   'Tim gudang ingin mendapat notifikasi ketika stok barang di bawah batas minimum, '
   || 'agar pemesanan ulang bisa dilakukan sebelum barang habis. Kepala gudang juga ingin '
   || 'melihat riwayat keluar masuk barang per minggu.'),
  ('siti.analyst@example.com', 'Email keluhan pelanggan — Status Pesanan', 'Email', 1,
   'Pelanggan mengeluhkan tidak bisa melihat status pesanan setelah pembayaran. Mereka ingin '
   || 'melacak posisi pesanan secara langsung supaya tidak perlu menghubungi customer service.')
) as f (email, judul, sumber, hari_lalu, isi)
join auth.users u on u.email = f.email
where not exists (
  select 1 from public.feedback_stakeholder fs where fs.user_id = u.id
);

-- Cek hasilnya:
select a.nama, a.email, count(fs.id) as jumlah_feedback
from public.software_analyst a
left join public.feedback_stakeholder fs on fs.user_id = a.id_analyst
group by a.id_analyst, a.nama, a.email
order by a.created_at desc;

-- BAYLOS: pemeriksaan aman untuk skema proyek baylos-s yang sudah dibuat.
-- Jalankan di Supabase SQL Editor hanya untuk memeriksa kolom/default; ini tidak mengubah data.
select table_name, column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles','products','product_prices','reseller_applications','orders','order_items')
order by table_name, ordinal_position;

-- CATATAN:
-- Ini sengaja berupa query audit SELECT, bukan seed INSERT.
-- Jangan impor produk sampai default UUID/timestamp, struktur varian, dan RLS dipastikan.
-- Proyek pengguna sudah memiliki skema sendiri; jangan menggantinya dengan skema starter yang berbeda.

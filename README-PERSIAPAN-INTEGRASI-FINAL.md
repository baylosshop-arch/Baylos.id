# Baylos.id — paket persiapan sebelum menghubungkan layanan

Paket ini disiapkan agar pekerjaan UI dan struktur proyek dapat diteruskan sekarang, sementara kredensial layanan eksternal disambungkan belakangan.

## Yang sudah ada dalam paket
- Etalase produk, detail dan galeri foto.
- Keranjang dan halaman persiapan checkout.
- UI chat pelanggan ke admin dan halaman admin chat.
- Migrasi SQL untuk chat.
- Draft Supabase Edge Functions untuk checkout dan ongkir.

## Penting: checkout belum produksi
Checkout tetap dinonaktifkan dengan sengaja sampai fungsi server selesai diimplementasikan, ditinjau, dikonfigurasi dan diuji. Jangan mengaktifkan tombol checkout hanya dengan mengubah UI.

## Tahap integrasi nanti
1. Pastikan `web/baylos-supabase-config.js` berisi URL proyek dan publishable/anon key yang benar. Jangan pernah taruh service-role key di file web.
2. Jalankan migrasi chat `supabase/migrations/20261025_customer_admin_chat.sql` sekali setelah memeriksa skema/RLS proyek yang sebenarnya.
3. Siapkan Biteship API key dan area asal Yogyakarta; simpan key sebagai Supabase Edge Function secret, bukan di GitHub atau JavaScript browser.
4. Lengkapi fungsi `supabase/functions/shipping-rates` dan `supabase/functions/create-order` agar memvalidasi identitas pengguna, harga, varian, stok, biaya kirim, idempotensi dan pencatatan pesanan di server.
5. Pastikan pesanan dan item ditulis dalam transaksi atomik. Jangan mengurangi stok jika pembuatan pesanan gagal.
6. Isi detail rekening transfer melalui pengaturan aman/admin; admin menandai pembayaran lunas hanya setelah memeriksa bukti dan mutasi rekening.
7. Uji dengan akun pelanggan dan admin serta data uji; jangan gunakan transaksi nyata sampai semua tes lulus.

## Upload ke GitHub
- Unggah isi folder proyek ke branch `supabase-integration`.
- Jangan hapus file lama secara massal; ganti file bernama sama dan tambahkan file baru.
- Jangan commit API keys, kata sandi, service-role key, atau data pelanggan.
- Jangan merge ke `main` sebelum tes selesai.

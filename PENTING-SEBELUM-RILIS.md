# Baylos — kandidat rilis, BELUM versi produksi final

## Perbaikan dalam paket ini
- Konfirmasi email Supabase diarahkan eksplisit ke `index.html` pada direktori GitHub Pages saat pendaftaran baru.
- Pengajuan reseller otomatis lama dinonaktifkan: calon reseller harus login dan mengisi formulir alamat lengkap, agar proses tidak melewati validasi alamat.
- Tidak ada perubahan langsung pada data Supabase, akun, atau branch GitHub.

## Fitur yang BELUM boleh dinyatakan siap produksi
- Checkout tanpa login: Edge Function `create-order` masih sengaja menolak transaksi sampai audit skema, idempotensi, dan transaksi stok aman selesai.
- Ongkir Biteship, payment gateway, dan webhook memerlukan kredensial rahasia, konfigurasi server, dan uji nyata.
- Pesan pelanggan-admin belum diverifikasi sebagai layanan end-to-end.
- Harga reseller dan kebijakan RLS perlu audit sebelum rilis.

## Pemasangan dan pengujian
1. Simpan cadangan branch `supabase-integration` sebelum mengganti file.
2. Unggah isi ZIP (bukan folder pembungkus) ke branch uji, lalu deploy GitHub Pages dari branch tersebut.
3. Supabase Authentication > URL Configuration: Site URL dan Redirect URLs harus memuat `https://baylosshop-arch.github.io/Baylos.id/`.
4. Uji daftar akun baru, tautan konfirmasi, login, formulir pengajuan reseller, admin review, dan katalog publik.
5. Jangan menerima pembayaran atau pesanan checkout pengunjung dari paket ini.

Catatan: pengujian statis lokal tidak menggantikan uji end-to-end dengan Supabase dan provider nyata.
